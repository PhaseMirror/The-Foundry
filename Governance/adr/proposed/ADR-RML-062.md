# ADR-RML-062: document `Governance/adr/accepted/adr_production_deployment.md` has 5 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/adr_production_deployment.md` (mtime 2026-06-26 14:22:00Z)
- 5 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `35ba860df131b464`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `scratch` | theorem | L43 | DOC_STALE | update the document | (none) |
| `blue` | theorem | L53 | DOC_STALE | update the document | (none) |
| `green` | theorem | L53 | DOC_STALE | update the document | (none) |
| `opentelemetry` | theorem | L62 | DOC_STALE | update the document | (none) |
| `log_preservation_event` | theorem | L98 | DOC_STALE | update the document | (none) |

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
