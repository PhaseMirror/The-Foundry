# ADR-RML-027: document `Governance/adr/accepted/ADR-002-sovereign-local-first-trajectory.md` has 13 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-002-sovereign-local-first-trajectory.md` (mtime 2026-07-20 18:23:52Z)
- 13 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `bc030b3364a7af00`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `no_std` | theorem | L19 | DOC_STALE | update the document | (none) |
| `no_std` | theorem | L48 | DOC_STALE | update the document | (none) |
| `no_std` | theorem | L50 | DOC_STALE | update the document | (none) |
| `espflash` | theorem | L55 | DOC_STALE | update the document | (none) |
| `no_std` | theorem | L73 | DOC_STALE | update the document | (none) |
| `contractive_successor_one` | theorem | L86 | DOC_STALE | update the document | (none) |
| `espflash` | theorem | L99 | DOC_STALE | update the document | (none) |
| `phase_mirror_wasm` | theorem | L121 | DOC_STALE | update the document | (none) |
| `no_std` | theorem | L123 | DOC_STALE | update the document | (none) |
| `espflash` | theorem | L123 | DOC_STALE | update the document | (none) |
| `esp32` | theorem | L123 | DOC_STALE | update the document | (none) |
| `esp32s2` | theorem | L123 | DOC_STALE | update the document | (none) |
| `esp32s3` | theorem | L123 | DOC_STALE | update the document | (none) |

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
