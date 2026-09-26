# ADR-RML-023: document `Governance/adr/accepted/ADR-DEPLOY-Deployment-Readiness-Plan.md` has 14 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-DEPLOY-Deployment-Readiness-Plan.md` (mtime 2026-06-29 21:32:23Z)
- 14 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `5635d32c5426fbb4`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `alp` | theorem | L18 | DOC_STALE | update the document | (none) |
| `mcp` | theorem | L18 | DOC_STALE | update the document | (none) |
| `alp` | theorem | L34 | DOC_STALE | update the document | (none) |
| `mcp` | theorem | L34 | DOC_STALE | update the document | (none) |
| `native_decide` | theorem | L121 | DOC_STALE | update the document | (none) |
| `appuser` | theorem | L223 | DOC_STALE | update the document | (none) |
| `alp` | theorem | L242 | DOC_STALE | update the document | (none) |
| `mcp` | theorem | L244 | DOC_STALE | update the document | (none) |
| `members` | theorem | L255 | DOC_STALE | update the document | (none) |
| `server_binding` | theorem | L298 | DOC_STALE | update the document | (none) |
| `server_binding` | theorem | L298 | DOC_STALE | update the document | (none) |
| `quorum_threshold` | theorem | L335 | DOC_STALE | update the document | (none) |
| `review_cadence_days` | theorem | L335 | DOC_STALE | update the document | (none) |
| `audit_trigger` | theorem | L335 | DOC_STALE | update the document | (none) |

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
