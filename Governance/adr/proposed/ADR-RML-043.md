# ADR-RML-043: document `Governance/Archive_and_Drafts/INTEGRATION-PLAN-PHASE-MIRROR-KILO.md` has 8 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/INTEGRATION-PLAN-PHASE-MIRROR-KILO.md` (mtime 2026-06-29 21:32:24Z)
- 6 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 2 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `ded7d65c4441905d`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `posix_spawn` | theorem | L84 | DOC_STALE | update the document | (none) |
| `pm_bridge` | theorem | L87 | DOC_STALE | update the document | (none) |
| `make` | theorem | L88 | DOC_STALE | update the document | (none) |
| `kilo` | theorem | L89 | DOC_STALE | update the document | (none) |
| `pm_bridge` | theorem | L105 | DOC_STALE | update the document | (none) |
| `expect` | theorem | L108 | CODE_STALE | update the math/code | `rust/uor/r4/uor_standards/uor-addr/crates/uor-addr/src/json/value.rs` |
| `strip` | theorem | L170 | CODE_STALE | update the math/code | `rust/uor/r4/uor_standards/prism/tools/wiki-link-check/src/scan.rs` |
| `enable_ai` | theorem | L171 | DOC_STALE | update the document | (none) |

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
