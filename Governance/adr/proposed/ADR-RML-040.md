# ADR-RML-040: document `Governance/verification/verification-status.md` has 10 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/verification/verification-status.md` (mtime 2026-07-23 20:14:57Z)
- 1 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 9 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `e3d8f0ef6a1344a5`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `completion_adjunction_lift` | theorem | L47 | DOC_STALE | update the document | (none) |
| `verify_adjunction_lift_property` | theorem | L47 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_associator_bounded` | theorem | L49 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_adjunction_lift_property` | theorem | L65 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_no_panic_termination` | theorem | L66 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_blockade_enforced` | theorem | L67 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_associator_bounded` | theorem | L68 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_ffi_proof_export` | theorem | L69 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_union_find_no_panic` | theorem | L70 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |
| `verify_no_index_out_of_bounds` | theorem | L71 | CODE_STALE | update the math/code | `rust/src/verification/kani_proofs.rs` |

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
