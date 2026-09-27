# ADR-RML-061: document `Governance/EU_AI_Act_Article_11_Technical_Documentation.md` has 5 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/EU_AI_Act_Article_11_Technical_Documentation.md` (mtime 2026-06-29 21:32:24Z)
- 0 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 5 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `4e8ff946bc16f77f`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `none` | theorem | L31 | CODE_STALE | update the math/code | `rust/uor/matmul/crates/uor-matmul-gemm/src/collapse.rs` |
| `valid` | theorem | L51 | CODE_STALE | update the math/code | `rust/uor/r4/crates/uor-r4-graph-format/tests/stage2.rs` |
| `none` | theorem | L54 | CODE_STALE | update the math/code | `rust/uor/matmul/crates/uor-matmul-gemm/src/collapse.rs` |
| `none` | theorem | L71 | CODE_STALE | update the math/code | `rust/uor/matmul/crates/uor-matmul-gemm/src/collapse.rs` |
| `valid` | theorem | L80 | CODE_STALE | update the math/code | `rust/uor/r4/crates/uor-r4-graph-format/tests/stage2.rs` |

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
