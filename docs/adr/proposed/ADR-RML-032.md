# ADR-RML-032: document `Governance/Archive_and_Drafts/f1_square_intersection_theory.md` has 11 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/f1_square_intersection_theory.md` (mtime 2026-06-23 18:21:51Z)
- 2 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 9 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `e6122def6a55a88a`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `n` | theorem | L78 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `n` | theorem | L360 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `none` | theorem | L368 | CODE_STALE | update the math/code | `rust/uor/matmul/crates/uor-matmul-gemm/src/collapse.rs` |
| `gen2_injective` | theorem | L424 | CODE_STALE | update the math/code | `lean/F1/Square/Tensor.lean` |
| `proj1_inl` | theorem | L425 | CODE_STALE | update the math/code | `lean/F1/Square/Tensor.lean` |
| `proj_faithful` | theorem | L426 | CODE_STALE | update the math/code | `lean/F1/Square/Tensor.lean` |
| `a` | theorem | L434 | CODE_STALE | update the math/code | `rust/uor/matmul/crates/uor-matmul-core/src/layout.rs` |
| `a` | theorem | L435 | CODE_STALE | update the math/code | `rust/uor/matmul/crates/uor-matmul-core/src/layout.rs` |
| `a` | theorem | L454 | CODE_STALE | update the math/code | `rust/uor/matmul/crates/uor-matmul-core/src/layout.rs` |
| `ring` | theorem | L539 | DOC_STALE | update the document | (none) |
| `ring_uor` | theorem | L539 | DOC_STALE | update the document | (none) |

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
