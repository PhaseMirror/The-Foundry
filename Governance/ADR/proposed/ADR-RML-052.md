# ADR-RML-052: document `Governance/adr/ADR-MC-001-Manifest.md` has 7 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/ADR-MC-001-Manifest.md` (mtime 2026-06-29 21:32:24Z)
- 6 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `f6845dd4e4f54ee9`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `pirtm_version` | theorem | L15 | DOC_STALE | update the document | (none) |
| `prime_set` | theorem | L16 | DOC_STALE | update the document | (none) |
| `stability_constants` | theorem | L17 | DOC_STALE | update the document | (none) |
| `constitution_anchor` | theorem | L19 | DOC_STALE | update the document | (none) |
| `veto_predicates` | theorem | L20 | DOC_STALE | update the document | (none) |
| `class` | theorem | L22 | CODE_STALE | update the math/code | `rust/goldilocks/src/lib.rs` |
| `seal_hash` | theorem | L24 | DOC_STALE | update the document | (none) |

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
