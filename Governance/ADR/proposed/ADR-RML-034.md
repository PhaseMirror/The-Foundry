# ADR-RML-034: document `Governance/docs/docs/PIRTM_SPEC.md` has 11 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/docs/docs/PIRTM_SPEC.md` (mtime 2026-07-13 01:11:25Z)
- 6 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 5 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `25cfca5bac005e09`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `n` | theorem | L103 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `body` | theorem | L141 | DOC_STALE | update the document | (none) |
| `x` | theorem | L141 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/bridge/proof.rs` |
| `numeric_invariant` | invariant | L166 | DOC_STALE | update the document | (none) |
| `m` | theorem | L177 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `n` | theorem | L181 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `e1` | theorem | L185 | DOC_STALE | update the document | (none) |
| `e2` | theorem | L185 | DOC_STALE | update the document | (none) |
| `k_bound` | theorem | L195 | DOC_STALE | update the document | (none) |
| `emit_receipt` | theorem | L196 | DOC_STALE | update the document | (none) |
| `record_event` | theorem | L196 | CODE_STALE | update the math/code | `rust/monitor/src/lib.rs` |

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
