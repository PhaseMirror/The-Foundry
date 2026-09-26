/**
 * Governance context for the research routes.
 *
 * The research routes tell a model which Architecture Decision Records govern
 * the system. That sentence is a claim about the repository, so it is only made
 * from a registry read that came from the engine. `readEngineRegistry` falls
 * back to a hand-maintained array when the engine is unreachable, and those
 * records are not the persisted governance record; presenting them as governing
 * would assert thirteen decisions nobody ratified under the id they are shown
 * under. ADR-0131 and ADR-0138 both require the absence to be stated instead.
 */

import type { ADR } from './adr-types';

export type RegistrySource = 'engine' | 'fallback';

export interface GovernanceContext {
  /** The prose placed in the system instruction. Never contains a record the source cannot back. */
  text: string;
  /** True only when at least one Accepted record from an engine read is asserted. */
  asserted: boolean;
  /** The Accepted record ids asserted, empty when nothing is asserted. */
  assertedIds: string[];
}

const NO_ENGINE =
  'The ADR registry is not available from the engine, so no governance context is asserted here. Do not represent any decision as governing.';
const NO_ACCEPTED =
  'The engine registry holds no Accepted Architecture Decision Records, so no governance context is asserted here.';

/**
 * Builds the governance sentence for a registry read.
 *
 * @param adrs   the records the read returned, whatever its source
 * @param source which read produced them
 */
export function buildGovernanceContext(adrs: readonly ADR[], source: RegistrySource): GovernanceContext {
  if (source !== 'engine') {
    return { text: NO_ENGINE, asserted: false, assertedIds: [] };
  }
  const accepted = adrs.filter((a) => a.status === 'Accepted');
  if (accepted.length === 0) {
    return { text: NO_ACCEPTED, asserted: false, assertedIds: [] };
  }
  return {
    text: accepted.map((a) => `[ADR ${a.id}] ${a.title}: ${a.decision}`).join('\n'),
    asserted: true,
    assertedIds: accepted.map((a) => a.id),
  };
}
