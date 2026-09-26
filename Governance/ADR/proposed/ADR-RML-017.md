# ADR-RML-017: document `Governance/PHASE_MIRROR_DISSONANCE_REPORT_2026-07-22.md` has 19 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/PHASE_MIRROR_DISSONANCE_REPORT_2026-07-22.md` (mtime 2026-07-22 18:07:33Z)
- 6 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 13 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `9333503d6bf85b49`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `native_decide` | theorem | L41 | DOC_STALE | update the document | (none) |
| `native_decide` | theorem | L45 | DOC_STALE | update the document | (none) |
| `native_decide` | theorem | L46 | DOC_STALE | update the document | (none) |
| `native_decide` | theorem | L47 | DOC_STALE | update the document | (none) |
| `native_decide` | theorem | L48 | DOC_STALE | update the document | (none) |
| `native_decide` | theorem | L49 | DOC_STALE | update the document | (none) |
| `unit` | theorem | L63 | CODE_STALE | update the math/code | `lean/phase_mirror_loop_scaffolds/ghost_theorems_general.lean` |
| `associator` | theorem | L63 | CODE_STALE | update the math/code | `lean/phase_mirror_loop_scaffolds/ghost_theorems_general.lean` |
| `completion_adjunction` | theorem | L63 | CODE_STALE | update the math/code | `lean/phase_mirror_loop_scaffolds/ghost_theorems_general.lean` |
| `free_one_generator_is_nno` | theorem | L64 | CODE_STALE | update the math/code | `lean/phase_mirror_loop_scaffolds/ghost_theorems_general.lean` |
| `compositional_defect` | theorem | L64 | CODE_STALE | update the math/code | `lean/phase_mirror_loop_scaffolds/ghost_theorems_general.lean` |
| `morphism_soundness` | theorem | L64 | CODE_STALE | update the math/code | `lean/phase_mirror_loop_scaffolds/ghost_theorems_general.lean` |
| `ward_identity_implies_bianchi` | theorem | L65 | CODE_STALE | update the math/code | `lean/phase_mirror_loop_scaffolds/ghost_theorems_general.lean` |
| `complex_kappa_part_i` | theorem | L66 | CODE_STALE | update the math/code | `lean/phase_mirror_loop_scaffolds/ghost_theorems_general.lean` |
| `gue_deviation_bounded` | theorem | L66 | CODE_STALE | update the math/code | `lean/phase_mirror_loop_scaffolds/ghost_theorems_general.lean` |
| `baire_category` | theorem | L75 | CODE_STALE | update the math/code | `lean/cultural_math/src/Theorems/BasicTheorems.lean` |
| `spectral_theorem_symmetric` | theorem | L75 | CODE_STALE | update the math/code | `lean/cultural_math/src/Theorems/BasicTheorems.lean` |
| `hahn_banach` | theorem | L76 | CODE_STALE | update the math/code | `lean/cultural_math/src/Theorems/BasicTheorems.lean` |
| `stone_weierstrass` | theorem | L76 | CODE_STALE | update the math/code | `lean/cultural_math/src/Theorems/BasicTheorems.lean` |

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
