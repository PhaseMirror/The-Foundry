# ADR-RML-019: document `Governance/adr/accepted/ADR-ALP-003-lean4-formalization-plan.md` has 18 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-ALP-003-lean4-formalization-plan.md` (mtime 2026-06-29 21:32:23Z)
- 17 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `a0869014f193014e`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `proof_anchor_recognized` | theorem | L224 | DOC_STALE | update the document | (none) |
| `active_anchors` | theorem | L224 | DOC_STALE | update the document | (none) |
| `execute_action` | theorem | L307 | DOC_STALE | update the document | (none) |
| `alp_gate` | theorem | L308 | DOC_STALE | update the document | (none) |
| `witness_id` | theorem | L394 | DOC_STALE | update the document | (none) |
| `action_id` | theorem | L395 | DOC_STALE | update the document | (none) |
| `timestamp` | theorem | L396 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/bridge/cert.rs` |
| `veto_status` | theorem | L397 | DOC_STALE | update the document | (none) |
| `execution_receipt` | theorem | L398 | DOC_STALE | update the document | (none) |
| `witness_after_decision` | theorem | L402 | DOC_STALE | update the document | (none) |
| `l0_1` | theorem | L466 | DOC_STALE | update the document | (none) |
| `l0_2` | theorem | L467 | DOC_STALE | update the document | (none) |
| `l0_3` | theorem | L468 | DOC_STALE | update the document | (none) |
| `l0_4` | theorem | L469 | DOC_STALE | update the document | (none) |
| `l0_5` | theorem | L470 | DOC_STALE | update the document | (none) |
| `l0_6` | theorem | L471 | DOC_STALE | update the document | (none) |
| `l0_7` | theorem | L472 | DOC_STALE | update the document | (none) |
| `l0_9` | theorem | L473 | DOC_STALE | update the document | (none) |

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
