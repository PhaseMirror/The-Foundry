# ADR-RML-085: document `Governance/docs/docs/The_Foundry_Whitepaper.md` has 3 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/docs/docs/The_Foundry_Whitepaper.md` (mtime 2026-07-17 14:42:28Z)
- 3 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `eb487319451942eb`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `clamp_feedback` | theorem | L171 | DOC_STALE | update the document | (none) |
| `snarkjs` | theorem | L177 | DOC_STALE | update the document | (none) |
| `uac_simulator` | theorem | L185 | DOC_STALE | update the document | (none) |

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
