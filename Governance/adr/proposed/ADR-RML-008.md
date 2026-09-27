# ADR-RML-008: document `Governance/Archive_and_Drafts/PHASE-MIRROR-KILO-INTEGRATION-PRODUCTION-PLAN.md` has 32 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/PHASE-MIRROR-KILO-INTEGRATION-PRODUCTION-PLAN.md` (mtime 2026-06-29 21:32:24Z)
- 32 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `e1a8e525d7e7a4e6`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `process_request` | theorem | L5 | DOC_STALE | update the document | (none) |
| `try_` | theorem | L7 | DOC_STALE | update the document | (none) |
| `verify_ledger` | theorem | L24 | DOC_STALE | update the document | (none) |
| `evaluate_esi_risk` | theorem | L25 | DOC_STALE | update the document | (none) |
| `check_governed_bridge` | theorem | L26 | DOC_STALE | update the document | (none) |
| `scan_litigation_hold` | theorem | L27 | DOC_STALE | update the document | (none) |
| `scan_spoliation_risk` | theorem | L28 | DOC_STALE | update the document | (none) |
| `get_stability_metric` | theorem | L29 | DOC_STALE | update the document | (none) |
| `attest_cross_domain_mission` | theorem | L30 | DOC_STALE | update the document | (none) |
| `health_check` | theorem | L31 | DOC_STALE | update the document | (none) |
| `sovereign_posture` | theorem | L32 | DOC_STALE | update the document | (none) |
| `run_command` | theorem | L33 | DOC_STALE | update the document | (none) |
| `get_metrics` | theorem | L34 | DOC_STALE | update the document | (none) |
| `try_` | theorem | L60 | DOC_STALE | update the document | (none) |
| `signature` | theorem | L140 | DOC_STALE | update the document | (none) |
| `tool_policies` | theorem | L154 | DOC_STALE | update the document | (none) |
| `try_` | theorem | L256 | DOC_STALE | update the document | (none) |
| `verify_ledger` | theorem | L259 | DOC_STALE | update the document | (none) |
| `evaluate_esi_risk` | theorem | L260 | DOC_STALE | update the document | (none) |
| `check_governed_bridge` | theorem | L261 | DOC_STALE | update the document | (none) |
| `attest_cross_domain_mission` | theorem | L262 | DOC_STALE | update the document | (none) |
| `try_` | theorem | L344 | DOC_STALE | update the document | (none) |
| `try_` | theorem | L413 | DOC_STALE | update the document | (none) |
| `try_get_stability_metric` | theorem | L438 | DOC_STALE | update the document | (none) |
| `get_stability_metric` | theorem | L438 | DOC_STALE | update the document | (none) |
| `zero_spacings` | theorem | L498 | DOC_STALE | update the document | (none) |
| `proof_hash` | theorem | L499 | DOC_STALE | update the document | (none) |
| `try_` | theorem | L505 | DOC_STALE | update the document | (none) |
| `try_` | theorem | L506 | DOC_STALE | update the document | (none) |
| `try_` | theorem | L507 | DOC_STALE | update the document | (none) |
| `zero_spacings` | theorem | L508 | DOC_STALE | update the document | (none) |
| `zero_spacings` | theorem | L514 | DOC_STALE | update the document | (none) |

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
