# ADR-RML-084: document `Governance/architecture/MTPIFormalizationPlan.md` has 3 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/architecture/MTPIFormalizationPlan.md` (mtime 2026-06-23 18:21:51Z)
- 3 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `113936c8af39f790`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `pirtm_evolution_stable` | theorem | L9 | DOC_STALE | update the document | (none) |
| `operator_dynamics_lawful` | theorem | L11 | DOC_STALE | update the document | (none) |
| `csl_commutation_admissibility` | theorem | L12 | DOC_STALE | update the document | (none) |

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
