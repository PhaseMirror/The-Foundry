# ADR-RML-050: document `Governance/Archive_and_Drafts/CRITICAL-PATH-GOVERNANCE-IMPLEMENTATION.md` has 7 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/CRITICAL-PATH-GOVERNANCE-IMPLEMENTATION.md` (mtime 2026-06-29 21:32:24Z)
- 6 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `e2594e5c8f5ceb5a`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `valid` | theorem | L46 | CODE_STALE | update the math/code | `rust/uor/r4/crates/uor-r4-graph-format/tests/stage2.rs` |
| `google_cloud_run_v2_service` | theorem | L61 | DOC_STALE | update the document | (none) |
| `google_firestore_database` | theorem | L62 | DOC_STALE | update the document | (none) |
| `google_secret_manager_secret` | theorem | L63 | DOC_STALE | update the document | (none) |
| `google_storage_bucket` | theorem | L64 | DOC_STALE | update the document | (none) |
| `google_artifact_registry_repository` | theorem | L65 | DOC_STALE | update the document | (none) |
| `google_vertex_ai_endpoint` | theorem | L66 | DOC_STALE | update the document | (none) |

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
