# ADR-RML-026: document `Governance/Archive_and_Drafts/kubernetes_manual_setup.md` has 13 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/kubernetes_manual_setup.md` (mtime 2026-07-01 19:18:52Z)
- 12 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `44597708018789e6`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `kubectl` | theorem | L6 | DOC_STALE | update the document | (none) |
| `helm` | theorem | L6 | DOC_STALE | update the document | (none) |
| `containerd` | theorem | L35 | DOC_STALE | update the document | (none) |
| `containerd` | theorem | L35 | DOC_STALE | update the document | (none) |
| `echobraid` | theorem | L130 | DOC_STALE | update the document | (none) |
| `alp` | theorem | L130 | DOC_STALE | update the document | (none) |
| `governance` | theorem | L130 | DOC_STALE | update the document | (none) |
| `governance_status` | theorem | L139 | DOC_STALE | update the document | (none) |
| `witness_id` | theorem | L147 | DOC_STALE | update the document | (none) |
| `action_id` | theorem | L147 | DOC_STALE | update the document | (none) |
| `timestamp` | theorem | L147 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/bridge/cert.rs` |
| `veto_status` | theorem | L147 | DOC_STALE | update the document | (none) |
| `ro` | theorem | L168 | DOC_STALE | update the document | (none) |

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
