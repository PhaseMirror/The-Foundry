# ADR-RML-152: document `Governance/multiplicity/Multiplicity_Knot_Theory.tex` has 1 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/multiplicity/Multiplicity_Knot_Theory.tex` (mtime 2026-05-17 00:23:40Z)
- 0 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `df85353588b63d3e`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `state` | theorem | L551 | CODE_STALE | update the math/code | `rust/governance/src/self_modification/kill_switch.rs` |

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
