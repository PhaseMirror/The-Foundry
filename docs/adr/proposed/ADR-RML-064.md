# ADR-RML-064: document `Governance/audit/MAINTENANCE-SCHEDULE.md` has 5 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/audit/MAINTENANCE-SCHEDULE.md` (mtime 2026-06-30 05:02:02Z)
- 5 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `922a365631e4f92b`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `is_sealed` | theorem | L8 | DOC_STALE | update the document | (none) |
| `numeric_invariant` | invariant | L15 | DOC_STALE | update the document | (none) |
| `drift_certificates` | theorem | L16 | DOC_STALE | update the document | (none) |
| `governance_archives` | theorem | L16 | DOC_STALE | update the document | (none) |
| `is_sealed` | theorem | L17 | DOC_STALE | update the document | (none) |

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
