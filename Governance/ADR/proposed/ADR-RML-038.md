# ADR-RML-038: document `Governance/docs/docs/UAC-ANOM-2026-07-12-001.md` has 10 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/docs/docs/UAC-ANOM-2026-07-12-001.md` (mtime 2026-07-12 16:39:47Z)
- 10 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `425f1e7367e75981`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `unstable_rate` | theorem | L13 | DOC_STALE | update the document | (none) |
| `utilization` | theorem | L13 | DOC_STALE | update the document | (none) |
| `d16_frac` | theorem | L13 | DOC_STALE | update the document | (none) |
| `thermal_slope` | theorem | L13 | DOC_STALE | update the document | (none) |
| `unstable_rate` | theorem | L43 | DOC_STALE | update the document | (none) |
| `utilization` | theorem | L44 | DOC_STALE | update the document | (none) |
| `d16_frac` | theorem | L45 | DOC_STALE | update the document | (none) |
| `thermal_slope` | theorem | L46 | DOC_STALE | update the document | (none) |
| `utilization` | theorem | L46 | DOC_STALE | update the document | (none) |
| `d75d7919966a3abe8c7d9f873714263822466d997365938d06ee6f18afc0a4b4` | theorem | L97 | DOC_STALE | update the document | (none) |

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
