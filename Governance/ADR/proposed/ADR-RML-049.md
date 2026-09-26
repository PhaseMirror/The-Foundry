# ADR-RML-049: document `README.md` has 8 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `README.md` (mtime 2026-07-26 22:05:39Z)
- 7 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `666a68e0e5240b89`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `numeric_invariant` | invariant | L80 | DOC_STALE | update the document | (none) |
| `none` | theorem | L153 | CODE_STALE | update the math/code | `rust/uor/matmul/crates/uor-matmul-gemm/src/collapse.rs` |
| `native` | theorem | L156 | DOC_STALE | update the document | (none) |
| `std4` | theorem | L159 | DOC_STALE | update the document | (none) |
| `numeric_invariant` | invariant | L172 | DOC_STALE | update the document | (none) |
| `no_circular_supersession` | theorem | L199 | DOC_STALE | update the document | (none) |
| `traceability` | theorem | L199 | DOC_STALE | update the document | (none) |
| `adr001` | theorem | L200 | DOC_STALE | update the document | (none) |

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
