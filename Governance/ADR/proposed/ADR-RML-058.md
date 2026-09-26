# ADR-RML-058: document `Governance/Archive_and_Drafts/USERGUIDE.md` has 6 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/USERGUIDE.md` (mtime 2026-06-29 21:32:24Z)
- 5 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `53e1643585b58bee`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `rustc` | theorem | L6 | DOC_STALE | update the document | (none) |
| `cargo` | theorem | L6 | DOC_STALE | update the document | (none) |
| `gcc` | theorem | L7 | DOC_STALE | update the document | (none) |
| `make` | theorem | L7 | DOC_STALE | update the document | (none) |
| `cmake` | theorem | L7 | DOC_STALE | update the document | (none) |
| `check_drift` | theorem | L79 | CODE_STALE | update the math/code | `rust/pirtm-compiler/ward-monitor/src/lib.rs` |

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
