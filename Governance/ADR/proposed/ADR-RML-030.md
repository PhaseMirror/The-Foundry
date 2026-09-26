# ADR-RML-030: document `Governance/Archive_and_Drafts/DRMM_PARITY_PLAN.md` has 11 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/DRMM_PARITY_PLAN.md` (mtime 2026-06-29 21:32:24Z)
- 10 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `c85cd298d11f9f89`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `drmm` | theorem | L3 | DOC_STALE | update the document | (none) |
| `drmm` | theorem | L7 | DOC_STALE | update the document | (none) |
| `drmm_rs` | theorem | L7 | DOC_STALE | update the document | (none) |
| `sympy` | theorem | L9 | DOC_STALE | update the document | (none) |
| `prime_indexed_tensor` | theorem | L27 | CODE_STALE | update the math/code | `rust/drmm/src/tensor_core.rs` |
| `ndarray` | theorem | L27 | DOC_STALE | update the document | (none) |
| `statrs` | theorem | L52 | DOC_STALE | update the document | (none) |
| `gsl` | theorem | L52 | DOC_STALE | update the document | (none) |
| `ndarray` | theorem | L70 | DOC_STALE | update the document | (none) |
| `thiserror` | theorem | L71 | DOC_STALE | update the document | (none) |
| `serde` | theorem | L72 | DOC_STALE | update the document | (none) |

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
