# ADR-RML-012: document `Governance/adr/accepted/ADR-121-Spectroscopy to J-Multiplicity.md` has 23 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-121-Spectroscopy to J-Multiplicity.md` (mtime 2026-07-25 21:40:02Z)
- 22 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `866d6731f46ca8d8`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `spectroscopic_multiplicity` | theorem | L146 | DOC_STALE | update the document | (none) |
| `multiplicity_label` | theorem | L152 | DOC_STALE | update the document | (none) |
| `allowed_j_values` | theorem | L163 | DOC_STALE | update the document | (none) |
| `term_label` | theorem | L192 | DOC_STALE | update the document | (none) |
| `term_symbols_for` | theorem | L199 | DOC_STALE | update the document | (none) |
| `projection_map` | theorem | L228 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/bridge/query.rs` |
| `j_multiplicity` | theorem | L234 | DOC_STALE | update the document | (none) |
| `prime_invariant` | theorem | L239 | DOC_STALE | update the document | (none) |
| `weighted_trace` | theorem | L266 | DOC_STALE | update the document | (none) |
| `j_multiplicity_as_fiber` | theorem | L271 | DOC_STALE | update the document | (none) |
| `j_multiplicity_refines_spectroscopic` | theorem | L294 | DOC_STALE | update the document | (none) |
| `j_multiplicity_fiber_cardinality` | theorem | L305 | DOC_STALE | update the document | (none) |
| `energy_functional` | theorem | L325 | DOC_STALE | update the document | (none) |
| `hund_stability` | theorem | L329 | DOC_STALE | update the document | (none) |
| `projection_surjective` | theorem | L362 | DOC_STALE | update the document | (none) |
| `fiber_partition` | theorem | L369 | DOC_STALE | update the document | (none) |
| `ADR_001` | theorem | L396 | DOC_STALE | update the document | (none) |
| `ADR_002` | theorem | L403 | DOC_STALE | update the document | (none) |
| `ADR_003` | theorem | L410 | DOC_STALE | update the document | (none) |
| `ADR_004` | theorem | L417 | DOC_STALE | update the document | (none) |
| `assert_true` | theorem | L441 | DOC_STALE | update the document | (none) |
| `test_p2_configuration` | theorem | L448 | DOC_STALE | update the document | (none) |
| `test_p3_configuration` | theorem | L459 | DOC_STALE | update the document | (none) |

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
