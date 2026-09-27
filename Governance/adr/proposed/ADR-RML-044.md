# ADR-RML-044: document `Governance/Archive_and_Drafts/missing_object_over_Q.md` has 8 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/missing_object_over_Q.md` (mtime 2026-06-23 18:21:51Z)
- 3 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 5 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `6fa76eb40233d3a6`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `n` | theorem | L99 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `f` | theorem | L139 | DOC_STALE | update the document | (none) |
| `f` | theorem | L140 | DOC_STALE | update the document | (none) |
| `n` | theorem | L153 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `f` | theorem | L201 | DOC_STALE | update the document | (none) |
| `n` | theorem | L203 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `n` | theorem | L204 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `n` | theorem | L224 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |

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
