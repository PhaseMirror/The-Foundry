# ADR-RML-041: document `Governance/Archive_and_Drafts/substrate-requirements.md` has 9 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/substrate-requirements.md` (mtime 2026-06-29 21:32:24Z)
- 9 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `87798603b9cb313c`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `tick` | theorem | L19 | DOC_STALE | update the document | (none) |
| `claimed_thickness` | theorem | L20 | DOC_STALE | update the document | (none) |
| `post_thickness` | theorem | L88 | DOC_STALE | update the document | (none) |
| `evaluate_governed_bridge` | theorem | L94 | DOC_STALE | update the document | (none) |
| `avp_to_prime_sound` | theorem | L96 | DOC_STALE | update the document | (none) |
| `ere_preserves_jubilee` | theorem | L96 | DOC_STALE | update the document | (none) |
| `test_treasury_to_clinical_governed_bridge` | theorem | L100 | DOC_STALE | update the document | (none) |
| `post_transition_thickness` | theorem | L102 | DOC_STALE | update the document | (none) |
| `surviving_structure` | theorem | L102 | DOC_STALE | update the document | (none) |

## Decision (the lever)
Apply each row's lever in the direction given by its triage class. A claim is
resolved when a re-run flips it to GOLDEN (it resolves to a `sorry`-free
declaration).

## Consequences
- **Positive**: the drift between stated intent and developed reality is
  surfaced with a single deterministic direction per claim.
- **Negative / Constraints**: triage is timestamp-based; a `touch` without a
  content change may mis-classify (mitigated: sorry-free resolutions are always
  GOLDEN).
- **Verification Strategy**: re-run `scripts/recursive_phase_mirror.py --once`;
  resolved claims must exit this document's cluster.

## Links
- Master index: `Governance/adr/proposed/ADR-Plan-Recursive-Phase-Mirror-Loop.md`
- State ledger: `state/recursive_phase_mirror.json`
- ADR: `Governance/adr/accepted/ADR-232-Recursive-Phase-Mirror-Loop-on-Prime.md`
