# ADR-RML-037: document `Governance/CHANGELOG.md` has 10 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/CHANGELOG.md` (mtime 2026-06-29 21:32:24Z)
- 7 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 3 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `7e03252d9ececfb5`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `jest` | theorem | L23 | DOC_STALE | update the document | (none) |
| `describe` | theorem | L24 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/codegen/src/sdk_macros.rs` |
| `it` | theorem | L24 | DOC_STALE | update the document | (none) |
| `expect` | theorem | L24 | CODE_STALE | update the math/code | `rust/uor/r4/uor_standards/uor-addr/crates/uor-addr/src/json/value.rs` |
| `marshall` | theorem | L27 | DOC_STALE | update the document | (none) |
| `unmarshall` | theorem | L27 | DOC_STALE | update the document | (none) |
| `any` | theorem | L51 | DOC_STALE | update the document | (none) |
| `pull_request` | theorem | L119 | DOC_STALE | update the document | (none) |
| `merge_group` | theorem | L119 | DOC_STALE | update the document | (none) |
| `local` | theorem | L119 | CODE_STALE | update the math/code | `rust/uor/r4/crates/uor-r4-graph-runtime/src/runtime_state.rs` |

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
