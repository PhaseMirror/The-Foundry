# ADR-RML-114: document `Governance/docs/docs/semantic_trace_unique.tex` has 2 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/docs/docs/semantic_trace_unique.tex` (mtime 2026-07-26 21:13:15Z)
- 2 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `9f176084e29e7bc0`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `product_unique_perm` | theorem | L58 | DOC_STALE | update the document | (none) |
| `mathlib` | theorem | L58 | DOC_STALE | update the document | (none) |

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
