# ADR-RML-018: document `Governance/research/Some of your claims are still purely metaphorical,.md` has 19 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/research/Some of your claims are still purely metaphorical,.md` (mtime 2026-06-29 21:32:23Z)
- 18 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `6c96b946a81ccf18`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `state_in` | theorem | L328 | DOC_STALE | update the document | (none) |
| `trigger` | theorem | L329 | DOC_STALE | update the document | (none) |
| `computation` | theorem | L330 | DOC_STALE | update the document | (none) |
| `pm_004_entropy_regularization` | theorem | L330 | DOC_STALE | update the document | (none) |
| `state_out` | theorem | L331 | DOC_STALE | update the document | (none) |
| `delta` | theorem | L332 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `state_in` | theorem | L375 | DOC_STALE | update the document | (none) |
| `reflection_event` | theorem | L378 | DOC_STALE | update the document | (none) |
| `pm_004_entropy_regularization` | theorem | L383 | DOC_STALE | update the document | (none) |
| `reflection_event` | theorem | L404 | DOC_STALE | update the document | (none) |
| `pm_004` | theorem | L410 | DOC_STALE | update the document | (none) |
| `reflection_event` | theorem | L595 | DOC_STALE | update the document | (none) |
| `reflection_event` | theorem | L750 | DOC_STALE | update the document | (none) |
| `fta_operator_ring_unique` | theorem | L878 | DOC_STALE | update the document | (none) |
| `reflection_event` | theorem | L1162 | DOC_STALE | update the document | (none) |
| `reflection_event` | theorem | L1352 | DOC_STALE | update the document | (none) |
| `unlawful_attempt` | theorem | L1362 | DOC_STALE | update the document | (none) |
| `rule_registry` | theorem | L1362 | DOC_STALE | update the document | (none) |
| `evidence_link` | theorem | L1362 | DOC_STALE | update the document | (none) |

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
