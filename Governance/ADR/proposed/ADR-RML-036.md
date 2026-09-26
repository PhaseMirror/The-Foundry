# ADR-RML-036: document `Governance/roadmaps/Replace ring and field_simp.md` has 11 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/roadmaps/Replace ring and field_simp.md` (mtime 2026-06-23 18:21:51Z)
- 11 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `f409d31febef0640`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `rw` | theorem | L33 | DOC_STALE | update the document | (none) |
| `add_mul` | theorem | L33 | DOC_STALE | update the document | (none) |
| `rw` | theorem | L89 | DOC_STALE | update the document | (none) |
| `rw` | theorem | L91 | DOC_STALE | update the document | (none) |
| `mul_left_comm` | theorem | L91 | DOC_STALE | update the document | (none) |
| `h_term1` | theorem | L109 | DOC_STALE | update the document | (none) |
| `hlam_norm` | theorem | L109 | DOC_STALE | update the document | (none) |
| `hlam_norm` | theorem | L114 | DOC_STALE | update the document | (none) |
| `ring` | theorem | L122 | DOC_STALE | update the document | (none) |
| `h_term1` | theorem | L127 | DOC_STALE | update the document | (none) |
| `joint_contraction` | theorem | L331 | DOC_STALE | update the document | (none) |

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
