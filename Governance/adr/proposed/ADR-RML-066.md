# ADR-RML-066: document `Governance/Archive_and_Drafts/RH_STATUS_LEDGER.md` has 4 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/RH_STATUS_LEDGER.md` (mtime 2026-06-29 21:32:24Z)
- 4 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `02d19c95be6ceaba`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `d9b4d94345cfefdc7178d0f0d6c0a3ebce90732358765f7d93fa8f86d0a5ca37` | theorem | L20 | DOC_STALE | update the document | (none) |
| `a93c033c799bfd3e312b5e01a5951192749dd0e5fd08ff407a0d7b86b34e0eba` | theorem | L21 | DOC_STALE | update the document | (none) |
| `d645e8f164b2eb658634defabf67ff2bc285bf67d44cf9c87e0474f266c7b51d` | theorem | L64 | DOC_STALE | update the document | (none) |
| `b8a9c2e4f5a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7` | theorem | L93 | DOC_STALE | update the document | (none) |

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
