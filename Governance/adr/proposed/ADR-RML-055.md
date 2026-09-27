# ADR-RML-055: document `Governance/verification/kani-coverage-report.md` has 7 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/verification/kani-coverage-report.md` (mtime 2026-07-21 15:42:05Z)
- 3 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 4 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `389fbed189198850`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `verify_composition_preserved` | theorem | L7 | DOC_STALE | update the document | (none) |
| `verify_congruence_closure` | theorem | L8 | DOC_STALE | update the document | (none) |
| `verify_termination` | theorem | L9 | DOC_STALE | update the document | (none) |
| `verify_associator_bounded` | theorem | L10 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_blockade_enforced` | theorem | L11 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_union_find_no_panic` | theorem | L12 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_no_index_out_of_bounds` | theorem | L13 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |

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
