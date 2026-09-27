# ADR-RML-056: document `AGENTS.md` has 6 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `AGENTS.md` (mtime 2026-07-03 23:37:05Z)
- 3 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 3 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `486fa9e8361c5321`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `title` | theorem | L26 | DOC_STALE | update the document | (none) |
| `status` | theorem | L26 | CODE_STALE | update the math/code | `rust/atlas/atlas_utqc/crates/tqc-model/src/lib.rs` |
| `context` | theorem | L26 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/user/state.rs` |
| `decision` | theorem | L26 | CODE_STALE | update the math/code | `rust/governance/src/phase_mirror/report.rs` |
| `rintro` | theorem | L29 | DOC_STALE | update the document | (none) |
| `mathlib` | theorem | L35 | DOC_STALE | update the document | (none) |

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
