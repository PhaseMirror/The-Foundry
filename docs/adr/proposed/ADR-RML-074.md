# ADR-RML-074: document `Governance/zeta-schrodinger/README.md` has 4 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/zeta-schrodinger/README.md` (mtime 2026-06-29 21:32:24Z)
- 4 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `475124cf8ef56880`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `ring` | theorem | L6 | DOC_STALE | update the document | (none) |
| `field_simp` | theorem | L6 | DOC_STALE | update the document | (none) |
| `rw` | theorem | L6 | DOC_STALE | update the document | (none) |
| `elan` | theorem | L16 | DOC_STALE | update the document | (none) |

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
