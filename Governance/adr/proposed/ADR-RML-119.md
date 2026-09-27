# ADR-RML-119: document `Governance/publications/Sovereign-Stack-Synthesis/SOVEREIGN_STACK_DEFENSIVE_PUBLICATION.md` has 2 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/publications/Sovereign-Stack-Synthesis/SOVEREIGN_STACK_DEFENSIVE_PUBLICATION.md` (mtime 2026-07-15 13:18:29Z)
- 1 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `7069e006fda9a0a3`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `q` | theorem | L24 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `eeg_coherence_score` | theorem | L24 | DOC_STALE | update the document | (none) |

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
