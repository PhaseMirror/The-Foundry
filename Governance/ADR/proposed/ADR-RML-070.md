# ADR-RML-070: document `Governance/Archive_and_Drafts/folder-loop-design.md` has 3 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/folder-loop-design.md` (mtime 2026-07-19 10:57:06Z)
- 3 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `d4d7550538f6b778`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `run_loop` | theorem | L40 | DOC_STALE | update the document | (none) |
| `run_loop` | theorem | L42 | DOC_STALE | update the document | (none) |
| `input_manifest_hash` | theorem | L47 | DOC_STALE | update the document | (none) |

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
