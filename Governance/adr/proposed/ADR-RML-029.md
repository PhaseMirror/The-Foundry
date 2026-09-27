# ADR-RML-029: document `Governance/engines/crmf/CRMF_dev_blueprint.md` has 11 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/engines/crmf/CRMF_dev_blueprint.md` (mtime 2026-05-22 14:46:46Z)
- 11 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `f91427dafab8a707`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `crmf` | theorem | L18 | DOC_STALE | update the document | (none) |
| `acfl` | theorem | L18 | DOC_STALE | update the document | (none) |
| `ccre` | theorem | L18 | DOC_STALE | update the document | (none) |
| `dht` | theorem | L18 | DOC_STALE | update the document | (none) |
| `integration` | theorem | L18 | DOC_STALE | update the document | (none) |
| `pwcfl` | theorem | L18 | DOC_STALE | update the document | (none) |
| `wkd` | theorem | L18 | DOC_STALE | update the document | (none) |
| `crfm` | theorem | L20 | DOC_STALE | update the document | (none) |
| `crmf` | theorem | L20 | DOC_STALE | update the document | (none) |
| `crmf` | theorem | L26 | DOC_STALE | update the document | (none) |
| `pytest` | theorem | L827 | DOC_STALE | update the document | (none) |

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
