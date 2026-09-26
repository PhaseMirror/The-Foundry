/**
 * Terminal command allowlist.
 *
 * `app/api/terminal` previously passed the request body's `command` string
 * straight to `exec`, so any client that could reach the route could run an
 * arbitrary shell command in the server's working directory. The route now
 * resolves the request against this closed set and refuses everything else.
 *
 * Two properties make the refusal sound:
 *
 *   1. Resolution is exact-match over a declared argv. There is no prefix
 *      match, no glob, and no "first token is trusted" rule, so an appended
 *      argument or a `;`/`&&` cannot ride along with an allowed command.
 *   2. Execution receives the argv array and never a string, so there is no
 *      shell to interpret metacharacters even if resolution were bypassed.
 *
 * `help` is answered from `ALLOWED_COMMANDS` rather than executed, so what the
 * terminal advertises cannot drift from what it will accept. Entries are drawn
 * from what this package actually declares: the `Justfile` recipes, and the
 * verbs the terminal view names in its prompt and placeholder.
 */

import { execFile } from 'child_process';

export interface AllowedCommand {
  /** Exact argv. Whitespace-free tokens; no entry contains a space. */
  readonly argv: readonly string[];
  /** Shown by `help`. Describes the entry, never asserts a result. */
  readonly description: string;
}

export const ALLOWED_COMMANDS: readonly AllowedCommand[] = [
  { argv: ['prismpm', 'model', 'check'], description: 'Validate the canonical model contract' },
  { argv: ['prismpm', 'template', 'check'], description: 'Read-only template policy check' },
  { argv: ['prismpm', 'lock', 'check'], description: 'Verify prismpm.lock and template.lock' },
  { argv: ['prismpm', 'profile', 'resolve'], description: 'Resolve the active PrismPM profile' },
  { argv: ['prismpm', 'chain', 'show'], description: 'Show the resolved trust chain' },
  { argv: ['just', 'vv'], description: 'The normative acceptance gate' },
  { argv: ['just', 'template-check'], description: 'Trust root and lock recipes' },
  { argv: ['just', 'model'], description: 'Run the xtask model validator' },
  { argv: ['just', 'model-write'], description: 'Regenerate CONFORMANCE.md from the register' },
  { argv: ['just', 'fmt-check'], description: 'Check Rust formatting' },
  { argv: ['just', 'lint'], description: 'Clippy with warnings denied' },
  { argv: ['just', 'test'], description: 'cargo test --workspace' },
  { argv: ['just', 'features'], description: 'Every optional feature compiles, with its tests' },
  { argv: ['just', 'bdd'], description: 'Conformance scenarios and their tests' },
  { argv: ['just', 'deny'], description: 'Advisories, bans, licences, and sources' },
  { argv: ['npm', 'run', 'build'], description: 'Next.js production build' },
];

/** `help` and `clear` are answered, never executed. */
export const HELP_ARGV: readonly string[] = ['help'];

export type ParseResult =
  | { readonly ok: true; readonly command: AllowedCommand }
  | { readonly ok: false; readonly reason: 'empty' | 'not-allowlisted'; readonly requested: string };

function sameArgv(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((tok, i) => tok === b[i]);
}

/**
 * Resolve a raw request string to an allowlisted argv, or refuse it.
 *
 * Tokenising is a plain whitespace split. No entry contains a space, so
 * quoting cannot smuggle an argument past the comparison: a quoted argument
 * arrives as one token that still has to equal a declared one.
 */
export function parseCommand(input: unknown): ParseResult {
  if (typeof input !== 'string') {
    return { ok: false, reason: 'not-allowlisted', requested: String(input) };
  }
  const tokens = input.trim().split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) {
    return { ok: false, reason: 'empty', requested: input };
  }
  const match = ALLOWED_COMMANDS.find((c) => sameArgv(c.argv, tokens));
  if (match) {
    return { ok: true, command: match };
  }
  return { ok: false, reason: 'not-allowlisted', requested: input };
}

export function isHelpRequest(input: unknown): boolean {
  return typeof input === 'string' && sameArgv(input.trim().split(/\s+/).filter(Boolean), HELP_ARGV);
}

export interface CommandOutcome {
  /** The argv actually executed. */
  readonly argv: readonly string[];
  /** Real child exit code. `null` when the process was killed by a signal. */
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdout: string;
  readonly stderr: string;
  /** Set when the process could not be spawned or exceeded its bounds. */
  readonly spawnError: string | null;
}

const EXEC_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_BUFFER_BYTES = 8 * 1024 * 1024;

/**
 * Execute an already-resolved allowlisted command with no shell.
 *
 * Takes the `AllowedCommand` returned by `parseCommand`, not a bare argv, so
 * calling it with an unadmitted argv is a type error rather than a convention
 * someone has to remember. The argv is handed to `execFile` and no string is
 * ever parsed by a shell.
 *
 * A non-zero exit is a completed command, not a thrown error: the outcome
 * carries the real code so a failing gate reads as a red result rather than a
 * transport fault.
 */
export function runCommand(command: AllowedCommand): Promise<CommandOutcome> {
  const argv = command.argv;
  const [file, ...args] = argv;
  return new Promise((resolve) => {
    execFile(
      file as string,
      args as string[],
      { cwd: process.cwd(), timeout: EXEC_TIMEOUT_MS, maxBuffer: MAX_BUFFER_BYTES, shell: false },
      (error, stdout, stderr) => {
        if (!error) {
          resolve({ argv, exitCode: 0, signal: null, stdout, stderr, spawnError: null });
          return;
        }
        const killed = (error as NodeJS.ErrnoException & { code?: number | string }).code;
        if (typeof killed === 'number') {
          resolve({ argv, exitCode: killed, signal: error.signal ?? null, stdout, stderr, spawnError: null });
          return;
        }
        // ENOENT and friends: the process never ran. The message is a spawn
        // failure of ours, not a command result, so it is reported separately
        // rather than dressed up as output.
        resolve({ argv, exitCode: null, signal: null, stdout, stderr, spawnError: error.message });
      },
    );
  });
}
