# ADR-RML-014: document `Governance/research/jointsystem.md` has 21 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/research/jointsystem.md` (mtime 2026-06-23 18:21:51Z)
- 19 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 2 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `25da6b4bc737eeb9`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `joint_contraction` | theorem | L128 | DOC_STALE | update the document | (none) |
| `lipschitz_nonneg` | theorem | L355 | DOC_STALE | update the document | (none) |
| `hbzero` | theorem | L355 | DOC_STALE | update the document | (none) |
| `Coupling.lipschitzConstant_nonneg` | theorem | L358 | DOC_STALE | update the document | (none) |
| `add_sub_add_comm` | theorem | L362 | DOC_STALE | update the document | (none) |
| `norm_add_le` | theorem | L362 | DOC_STALE | update the document | (none) |
| `positivity` | theorem | L364 | DOC_STALE | update the document | (none) |
| `positivity` | theorem | L364 | DOC_STALE | update the document | (none) |
| `mul_nonneg` | theorem | L364 | CODE_STALE | update the math/code | `rust/kani-verification/src/interval_arithmetic.rs` |
| `add_nonneg` | theorem | L364 | DOC_STALE | update the document | (none) |
| `positivity` | theorem | L364 | DOC_STALE | update the document | (none) |
| `positivity` | theorem | L364 | DOC_STALE | update the document | (none) |
| `positivity` | theorem | L366 | DOC_STALE | update the document | (none) |
| `positivity` | theorem | L366 | DOC_STALE | update the document | (none) |
| `positivity` | theorem | L366 | DOC_STALE | update the document | (none) |
| `nlinarith` | theorem | L366 | DOC_STALE | update the document | (none) |
| `mul_nonneg` | theorem | L366 | CODE_STALE | update the math/code | `rust/kani-verification/src/interval_arithmetic.rs` |
| `Coupling.lipschitzConstant_nonneg` | theorem | L377 | DOC_STALE | update the document | (none) |
| `positivity` | theorem | L413 | DOC_STALE | update the document | (none) |
| `nlinarith` | theorem | L413 | DOC_STALE | update the document | (none) |
| `joint_contraction` | theorem | L451 | DOC_STALE | update the document | (none) |

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
