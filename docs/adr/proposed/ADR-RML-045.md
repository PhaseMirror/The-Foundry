# ADR-RML-045: document `Governance/adr/accepted/ADR-0xx-lean-formalization-mandate.md` has 8 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-0xx-lean-formalization-mandate.md` (mtime 2026-06-27 19:46:20Z)
- 3 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 5 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `6e617ad5adf2f2e1`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `try_successor` | theorem | L14 | CODE_STALE | update the math/code | `rust/pirtm-parser/src/ast.rs` |
| `try_stratum_boundary` | theorem | L14 | CODE_STALE | update the math/code | `rust/pirtm-parser/src/ast.rs` |
| `inductive` | theorem | L15 | DOC_STALE | update the document | (none) |
| `try_successor` | theorem | L28 | CODE_STALE | update the math/code | `rust/pirtm-parser/src/ast.rs` |
| `try_stratum_boundary` | theorem | L29 | CODE_STALE | update the math/code | `rust/pirtm-parser/src/ast.rs` |
| `scale_residual` | theorem | L33 | CODE_STALE | update the math/code | `rust/pirtm-candle/src/contractivity.rs` |
| `contractive_successor_one` | theorem | L38 | DOC_STALE | update the document | (none) |
| `contractive_successor_one` | theorem | L55 | DOC_STALE | update the document | (none) |

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
