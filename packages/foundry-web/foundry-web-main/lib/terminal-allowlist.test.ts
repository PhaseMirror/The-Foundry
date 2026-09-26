import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALLOWED_COMMANDS, isHelpRequest, parseCommand, runCommand, type AllowedCommand } from './terminal-allowlist';

/**
 * Focused checks for the terminal allowlist.
 *
 * Admission and execution are tested separately. `parseCommand` decides what may
 * run; `runCommand` decides how it runs. The execution probes below pass a
 * synthetic `AllowedCommand` built on `node` so the real `execFile` path, the
 * real exit code, and the absence of a shell are exercised without depending on
 * `just`, `prismpm`, or `npm` being installed. That is deliberate: a test that
 * could only pass when the heavy binaries exist would be a test that reports
 * UNAVAILABLE exactly when the gate is broken.
 */

/** A synthetic entry for the execution probes. Not in the shipped allowlist. */
function probe(source: string): AllowedCommand {
  return { argv: ['node', '-e', source], description: 'test probe' };
}

test('every declared entry resolves to itself', () => {
  for (const entry of ALLOWED_COMMANDS) {
    const parsed = parseCommand(entry.argv.join(' '));
    assert.equal(parsed.ok, true, `${entry.argv.join(' ')} should be admitted`);
    assert.deepEqual(parsed.ok && parsed.command.argv, entry.argv);
  }
});

test('surrounding and repeated whitespace does not change admission', () => {
  const parsed = parseCommand('   just    vv  ');
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.ok && parsed.command.argv, ['just', 'vv']);
});

test('an appended argument is refused', () => {
  // Exact argv match, so a trailing token cannot ride along.
  assert.deepEqual(parseCommand('just vv --release'), { ok: false, reason: 'not-allowlisted', requested: 'just vv --release' });
  assert.equal(parseCommand('just vv').ok, true);
});

test('command chaining and metacharacters are refused', () => {
  const attempts = [
    'just vv; rm -rf /',
    'just vv && curl http://example.invalid',
    'just vv | tee /tmp/out',
    'just vv $(whoami)',
    'just `whoami`',
    'prismpm model check; cat /etc/passwd',
    'npm run build && npm publish',
  ];
  for (const attempt of attempts) {
    const parsed = parseCommand(attempt);
    assert.equal(parsed.ok, false, `${attempt} must not be admitted`);
  }
});

test('a trusted first token does not admit an unknown subcommand', () => {
  for (const attempt of ['just deploy', 'just', 'prismpm model push', 'npm publish', 'prismpm']) {
    assert.equal(parseCommand(attempt).ok, false, `${attempt} must not be admitted`);
  }
});

test('quoting cannot smuggle an argument past the comparison', () => {
  assert.equal(parseCommand('"just" "vv"').ok, false);
  assert.equal(parseCommand('just "vv" ').ok, false);
});

test('empty and non-string input is refused without throwing', () => {
  assert.deepEqual(parseCommand('   '), { ok: false, reason: 'empty', requested: '   ' });
  assert.equal(parseCommand('').ok, false);
  assert.equal(parseCommand(undefined).ok, false);
  assert.equal(parseCommand(null).ok, false);
  assert.equal(parseCommand(42).ok, false);
  assert.equal(parseCommand({ command: 'just vv' }).ok, false);
});

test('help is answered rather than executed', () => {
  assert.equal(isHelpRequest('help'), true);
  assert.equal(isHelpRequest('  help '), true);
  assert.equal(isHelpRequest('just vv'), false);
  // `help` is not an executable entry, so it can never reach a shell.
  assert.equal(parseCommand('help').ok, false);
});

test('a successful command reports exit code 0 and its real stdout', async () => {
  const outcome = await runCommand(probe('process.stdout.write("gate cleared")'));
  assert.equal(outcome.spawnError, null);
  assert.equal(outcome.exitCode, 0);
  assert.equal(outcome.signal, null);
  assert.equal(outcome.stdout, 'gate cleared');
});

test('a failing command reports its real non-zero exit code, not a throw', async () => {
  const outcome = await runCommand(probe('process.stderr.write("boom"); process.exit(3)'));
  assert.equal(outcome.spawnError, null);
  assert.equal(outcome.exitCode, 3);
  assert.equal(outcome.stderr, 'boom');
});

test('a process that never started is distinguished from a command result', async () => {
  const outcome = await runCommand({ argv: ['definitely-not-a-real-binary-xyz'], description: 'test probe' });
  assert.equal(outcome.exitCode, null);
  assert.notEqual(outcome.spawnError, null);
});

test('arguments reach the child verbatim because no shell parses them', async () => {
  const payload = '; echo pwned && rm -rf /';
  const outcome = await runCommand({
    argv: ['node', '-e', 'process.stdout.write(process.argv[1])', payload],
    description: 'test probe',
  });
  assert.equal(outcome.spawnError, null);
  assert.equal(outcome.exitCode, 0);
  // The dangerous string arrived as one inert argument. A shell would have run it.
  assert.equal(outcome.stdout, payload);
});
