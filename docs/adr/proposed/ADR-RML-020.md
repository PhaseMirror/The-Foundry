# ADR-RML-020: document `Governance/adr/accepted/ADR-0xx-pirtm-candle-full-wiring.md` has 16 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-0xx-pirtm-candle-full-wiring.md` (mtime 2026-06-27 22:08:39Z)
- 11 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 5 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `ea21b75db4937dcd`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `generate_governed` | theorem | L23 | CODE_STALE | update the math/code | `rust/pirtm-candle/src/model.rs` |
| `validate_trace` | theorem | L23 | DOC_STALE | update the document | (none) |
| `zero_spacings` | theorem | L30 | DOC_STALE | update the document | (none) |
| `llm_generate` | theorem | L55 | DOC_STALE | update the document | (none) |
| `generate_governed` | theorem | L55 | CODE_STALE | update the math/code | `rust/pirtm-candle/src/model.rs` |
| `nalgebra` | theorem | L67 | DOC_STALE | update the document | (none) |
| `ndarray` | theorem | L67 | DOC_STALE | update the document | (none) |
| `forward_step` | theorem | L72 | CODE_STALE | update the math/code | `rust/pirtm-candle/src/model.rs` |
| `tokenizers` | theorem | L78 | DOC_STALE | update the document | (none) |
| `max_tokens` | theorem | L79 | CODE_STALE | update the math/code | `rust/uor/r4/src/chat.rs` |
| `temperature` | theorem | L82 | DOC_STALE | update the document | (none) |
| `top_p` | theorem | L82 | DOC_STALE | update the document | (none) |
| `witness_hash` | theorem | L86 | CODE_STALE | update the math/code | `rust/pirtm-candle/src/lib.rs` |
| `nalgebra` | theorem | L107 | DOC_STALE | update the document | (none) |
| `contractive_successor_one` | theorem | L108 | DOC_STALE | update the document | (none) |
| `tokenizers` | theorem | L125 | DOC_STALE | update the document | (none) |

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
