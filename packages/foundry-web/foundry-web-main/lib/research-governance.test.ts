import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGovernanceContext } from './research-governance';
import type { ADR } from './adr-types';

/**
 * Checks for the research governance gate.
 *
 * The failure this guards is the one the routes existed to prevent: a
 * hand-maintained fallback array reaching a model prompt under the authority of
 * the persisted registry. Every fallback case below must therefore assert
 * nothing and disclose the absence.
 */

const record = (id: string, status: ADR['status']): ADR => ({
  id,
  title: `Title ${id}`,
  status,
  context: 'Context',
  decision: `Decision ${id}`,
  consequences: ['Consequence'],
  supersedes: null,
  links: [],
});

const FALLBACK_SET: ADR[] = [
  record('ADR-FALLBACK-1', 'Accepted'),
  record('ADR-FALLBACK-2', 'Accepted'),
];

test('an engine read asserts its Accepted records', () => {
  const result = buildGovernanceContext([record('ADR-0131', 'Accepted'), record('ADR-0168', 'Proposed')], 'engine');
  assert.equal(result.asserted, true);
  assert.deepEqual(result.assertedIds, ['ADR-0131']);
  assert.match(result.text, /\[ADR ADR-0131\]/);
  assert.match(result.text, /Decision ADR-0131/);
});

test('a fallback read asserts nothing and names no record', () => {
  // The decisive case. These records are Accepted and would pass an
  // unconditional filter; only the source distinguishes them from governance.
  const result = buildGovernanceContext(FALLBACK_SET, 'fallback');
  assert.equal(result.asserted, false);
  assert.deepEqual(result.assertedIds, []);
  assert.doesNotMatch(result.text, /ADR-FALLBACK/);
  assert.doesNotMatch(result.text, /Decision ADR/);
  assert.match(result.text, /not available from the engine/);
});

test('no fallback record id or decision can appear in a fallback prompt', () => {
  const result = buildGovernanceContext(FALLBACK_SET, 'fallback');
  for (const adr of FALLBACK_SET) {
    assert.ok(!result.text.includes(adr.id), `${adr.id} leaked into the prompt`);
    assert.ok(!result.text.includes(adr.decision), `${adr.id} decision leaked into the prompt`);
  }
});

test('an engine read with no Accepted records states the absence', () => {
  const result = buildGovernanceContext([record('ADR-0168', 'Proposed'), record('ADR-0169', 'Deprecated')], 'engine');
  assert.equal(result.asserted, false);
  assert.deepEqual(result.assertedIds, []);
  assert.doesNotMatch(result.text, /ADR-0168/);
  assert.match(result.text, /no Accepted Architecture Decision Records/);
});

test('only Accepted records are asserted from an engine read', () => {
  const result = buildGovernanceContext(
    [record('ADR-A', 'Accepted'), record('ADR-B', 'Proposed'), record('ADR-C', 'Superseded'), record('ADR-D', 'Accepted')],
    'engine',
  );
  assert.deepEqual(result.assertedIds, ['ADR-A', 'ADR-D']);
  assert.doesNotMatch(result.text, /ADR-B/);
  assert.doesNotMatch(result.text, /ADR-C/);
});

test('an empty engine read is reported as empty, not as a failure', () => {
  const result = buildGovernanceContext([], 'engine');
  assert.equal(result.asserted, false);
  assert.equal(result.assertedIds.length, 0);
});
