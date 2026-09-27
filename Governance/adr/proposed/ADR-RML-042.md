# ADR-RML-042: document `Governance/adr/accepted/ADR-0xx-candle-integration.md` has 9 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-0xx-candle-integration.md` (mtime 2026-06-27 19:46:02Z)
- 7 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 2 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `24098dbbfd44fe61`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `zero_spacings` | theorem | L14 | DOC_STALE | update the document | (none) |
| `lambda_p` | theorem | L14 | DOC_STALE | update the document | (none) |
| `zero_spacings` | theorem | L15 | DOC_STALE | update the document | (none) |
| `zero_spacings` | theorem | L16 | DOC_STALE | update the document | (none) |
| `generate_governed` | theorem | L25 | CODE_STALE | update the math/code | `rust/pirtm-candle/src/model.rs` |
| `proof_hash` | theorem | L30 | DOC_STALE | update the document | (none) |
| `dist_successor` | theorem | L31 | DOC_STALE | update the document | (none) |
| `generate_governed` | theorem | L48 | CODE_STALE | update the math/code | `rust/pirtm-candle/src/model.rs` |
| `contractive_successor_one` | theorem | L50 | DOC_STALE | update the document | (none) |

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
