# ADR-RML-022: document `Governance/AGENTS.md` has 14 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/AGENTS.md` (mtime 2026-06-29 21:32:24Z)
- 14 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `1fd32ddd6aeb83c5`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `pirtm` | theorem | L12 | DOC_STALE | update the document | (none) |
| `prime_index` | theorem | L73 | DOC_STALE | update the document | (none) |
| `epsilon_map` | theorem | L74 | DOC_STALE | update the document | (none) |
| `prime_index` | theorem | L87 | DOC_STALE | update the document | (none) |
| `prime_index` | theorem | L92 | DOC_STALE | update the document | (none) |
| `prime_index` | theorem | L109 | DOC_STALE | update the document | (none) |
| `quorum_threshold` | theorem | L126 | DOC_STALE | update the document | (none) |
| `review_cadence_days` | theorem | L127 | DOC_STALE | update the document | (none) |
| `audit_trigger` | theorem | L127 | DOC_STALE | update the document | (none) |
| `quorum_threshold` | theorem | L131 | DOC_STALE | update the document | (none) |
| `prime_index` | theorem | L135 | DOC_STALE | update the document | (none) |
| `kill_switch` | theorem | L176 | DOC_STALE | update the document | (none) |
| `prime_index` | theorem | L198 | DOC_STALE | update the document | (none) |
| `proof_hash` | theorem | L199 | DOC_STALE | update the document | (none) |

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
