# ADR-RML-035: document `Governance/engines/ADR-005 HITL-PMD.md` has 11 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/engines/ADR-005 HITL-PMD.md` (mtime 2026-05-22 14:46:46Z)
- 11 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `a023cb3da87a004e`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `hamed_rao_modification_test` | theorem | L691 | DOC_STALE | update the document | (none) |
| `lag` | theorem | L693 | DOC_STALE | update the document | (none) |
| `hamed_rao_modification_test` | theorem | L693 | DOC_STALE | update the document | (none) |
| `hamed_rao_modification_test` | theorem | L816 | DOC_STALE | update the document | (none) |
| `continue` | theorem | L819 | DOC_STALE | update the document | (none) |
| `escalate_axiom` | theorem | L819 | DOC_STALE | update the document | (none) |
| `reject_candidate` | theorem | L819 | DOC_STALE | update the document | (none) |
| `reject_candidate` | theorem | L828 | DOC_STALE | update the document | (none) |
| `n_windows` | theorem | L842 | DOC_STALE | update the document | (none) |
| `n_candidates` | theorem | L842 | DOC_STALE | update the document | (none) |
| `seed` | theorem | L842 | DOC_STALE | update the document | (none) |

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
