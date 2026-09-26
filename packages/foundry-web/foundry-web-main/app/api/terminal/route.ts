import { NextRequest, NextResponse } from 'next/server';
import { ALLOWED_COMMANDS, isHelpRequest, parseCommand, runCommand } from '@/lib/terminal-allowlist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Terminal execution, restricted to a closed allowlist.
 *
 * The request body's `command` is resolved against `ALLOWED_COMMANDS` by
 * exact argv match before anything runs. An unrecognised command is refused
 * with a typed error and no process is spawned. The resolved argv is executed
 * with `execFile` and no shell, so arguments are never re-parsed.
 *
 * A command that runs and fails is a completed command: its real exit code is
 * returned with HTTP 200. Only a request that cannot be resolved, or a process
 * that never started, produces an error status. No response synthesizes a
 * pass, a pass-shaped string, or an exit code.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-body', detail: 'Request body must be JSON.' }, { status: 400 });
  }

  const command = (body as { command?: unknown } | null)?.command;

  // `help` is answered from the allowlist so the advertised verbs and the
  // enforced verbs cannot drift apart. It is never handed to a shell.
  if (isHelpRequest(command)) {
    return NextResponse.json({
      ok: true,
      exitCode: 0,
      help: ALLOWED_COMMANDS.map((c) => ({ command: c.argv.join(' '), description: c.description })),
    });
  }

  const parsed = parseCommand(command);
  if (!parsed.ok) {
    if (parsed.reason === 'empty') {
      return NextResponse.json({ error: 'empty-command', detail: 'Provide a command to run.' }, { status: 400 });
    }
    return NextResponse.json(
      {
        error: 'command-not-allowlisted',
        detail: 'This terminal runs only the commands it declares. Nothing was executed.',
        requested: parsed.requested,
        allowed: ALLOWED_COMMANDS.map((c) => c.argv.join(' ')),
      },
      { status: 403 },
    );
  }

  const outcome = await runCommand(parsed.command);

  if (outcome.spawnError !== null) {
    return NextResponse.json(
      {
        error: 'spawn-failed',
        detail: 'The process could not be started.',
        command: outcome.argv.join(' '),
        spawnError: outcome.spawnError,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: outcome.exitCode === 0,
    command: outcome.argv.join(' '),
    exitCode: outcome.exitCode,
    signal: outcome.signal,
    stdout: outcome.stdout,
    stderr: outcome.stderr,
  });
}
