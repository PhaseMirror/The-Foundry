# ADR-RML-025: document `Governance/Archive_and_Drafts/AGENTS_recovered_ext.md` has 13 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/AGENTS_recovered_ext.md` (mtime 2026-06-29 21:32:24Z)
- 12 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `48a51387ce4a8ea0`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `pscmd` | theorem | L5 | DOC_STALE | update the document | (none) |
| `pscmd` | theorem | L18 | DOC_STALE | update the document | (none) |
| `witness_id` | theorem | L44 | DOC_STALE | update the document | (none) |
| `action_id` | theorem | L44 | DOC_STALE | update the document | (none) |
| `timestamp` | theorem | L44 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/bridge/cert.rs` |
| `veto_status` | theorem | L44 | DOC_STALE | update the document | (none) |
| `execution_receipt` | theorem | L45 | DOC_STALE | update the document | (none) |
| `workflows` | theorem | L84 | DOC_STALE | update the document | (none) |
| `governance` | theorem | L84 | DOC_STALE | update the document | (none) |
| `mcp` | theorem | L84 | DOC_STALE | update the document | (none) |
| `archivum` | theorem | L84 | DOC_STALE | update the document | (none) |
| `governance` | theorem | L87 | DOC_STALE | update the document | (none) |
| `stdio` | theorem | L96 | DOC_STALE | update the document | (none) |

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
