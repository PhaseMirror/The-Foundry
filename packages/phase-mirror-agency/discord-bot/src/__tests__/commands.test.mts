import test from 'node:test';
import assert from 'node:assert/strict';
import * as dissonance from '../commands/dissonance.js';
import * as l0check from '../commands/l0-check.js';
import * as adrStatus from '../commands/adr-status.js';
import * as consentCheck from '../commands/consent-check.js';

test('exports a dissonance command', () => {
  assert.strictEqual(dissonance.data?.name, 'dissonance');
});

test('exports an l0-check command', () => {
  assert.strictEqual(l0check.data?.name, 'l0-check');
});

test('exports an adr-status command', () => {
  assert.strictEqual(adrStatus.data?.name, 'adr-status');
});

test('exports a consent-check command', () => {
  assert.strictEqual(consentCheck.data?.name, 'consent-check');
});
