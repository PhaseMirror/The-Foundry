# ADR-RML-046: document `Governance/docs/docs/Ξ(t+1) Receives The Aperture.md` has 7 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/docs/docs/Ξ(t+1) Receives The Aperture.md` (mtime 2026-05-29 01:06:14Z)
- 6 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `51eb9076facc8644`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `member` | theorem | L2383 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/enforcement.rs` |
| `evidence_for` | theorem | L2383 | DOC_STALE | update the document | (none) |
| `summarizes` | theorem | L2383 | DOC_STALE | update the document | (none) |
| `governs` | theorem | L2383 | DOC_STALE | update the document | (none) |
| `xtask` | theorem | L3129 | DOC_STALE | update the document | (none) |
| `summarizes` | theorem | L3139 | DOC_STALE | update the document | (none) |
| `grounds` | theorem | L3139 | DOC_STALE | update the document | (none) |

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
