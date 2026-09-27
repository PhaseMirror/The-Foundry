# ADR-RML-067: document `Governance/Archive_and_Drafts/SOP-001-L0-Ratification-Window.md` has 4 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/SOP-001-L0-Ratification-Window.md` (mtime 2026-06-29 21:32:24Z)
- 4 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `cba2019e07d9e96d`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `surviving_structure` | theorem | L4 | DOC_STALE | update the document | (none) |
| `evaluate_governed_bridge` | theorem | L12 | DOC_STALE | update the document | (none) |
| `test_treasury_to_clinical_governed_bridge_strict` | theorem | L16 | DOC_STALE | update the document | (none) |
| `post_transition_thickness` | theorem | L18 | DOC_STALE | update the document | (none) |

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
