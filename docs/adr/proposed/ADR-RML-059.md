# ADR-RML-059: document `Governance/adr/accepted/ADR-232-Recursive-Phase-Mirror-Loop-on-Prime.md` has 5 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-232-Recursive-Phase-Mirror-Loop-on-Prime.md` (mtime 2026-08-02 12:26:57Z)
- 4 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `2307fa354bfe254b`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `node_modules` | theorem | L68 | DOC_STALE | update the document | (none) |
| `target` | theorem | L68 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/blanket_impls.rs` |
| `abbrev` | theorem | L74 | DOC_STALE | update the document | (none) |
| `touch` | theorem | L160 | DOC_STALE | update the document | (none) |
| `touch` | theorem | L201 | DOC_STALE | update the document | (none) |

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
