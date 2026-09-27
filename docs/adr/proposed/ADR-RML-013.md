# ADR-RML-013: document `Governance/architecture/CompleteFormalizationPlan.md` has 22 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/architecture/CompleteFormalizationPlan.md` (mtime 2026-06-23 18:21:51Z)
- 19 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 3 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `34b41cbed1342664`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `mtpi_core_lawfulness` | theorem | L9 | DOC_STALE | update the document | (none) |
| `supermodule_stability_lemma` | theorem | L10 | DOC_STALE | update the document | (none) |
| `rg_flow_monotonic` | theorem | L11 | DOC_STALE | update the document | (none) |
| `resonance_global_stability` | theorem | L14 | DOC_STALE | update the document | (none) |
| `pack_unpack_id` | theorem | L15 | DOC_STALE | update the document | (none) |
| `ftsa_kernel_injectivity` | theorem | L17 | DOC_STALE | update the document | (none) |
| `gossip_convergence_lemma` | theorem | L20 | DOC_STALE | update the document | (none) |
| `lambda_m_global_stability` | theorem | L21 | DOC_STALE | update the document | (none) |
| `betti_zero_simulability` | theorem | L23 | DOC_STALE | update the document | (none) |
| `born_rule_ostrowski` | theorem | L24 | DOC_STALE | update the document | (none) |
| `ethical_fixed_point_existence` | theorem | L25 | DOC_STALE | update the document | (none) |
| `order_divergence_invariant` | theorem | L26 | DOC_STALE | update the document | (none) |
| `partial_decoupling_halt` | theorem | L27 | DOC_STALE | update the document | (none) |
| `pack` | theorem | L56 | CODE_STALE | update the math/code | `rust/atlas/sigmatics-core/src/matrix_runtime.rs` |
| `unpack` | theorem | L56 | CODE_STALE | update the math/code | `rust/apex/apex-goldilocks-core/src/lib.rs` |
| `partial_decoupling_halt` | theorem | L61 | DOC_STALE | update the document | (none) |
| `order_divergence_invariant` | theorem | L61 | DOC_STALE | update the document | (none) |
| `pi_native_binding` | theorem | L77 | DOC_STALE | update the document | (none) |
| `lambda_m_global_stability` | theorem | L82 | DOC_STALE | update the document | (none) |
| `governor_attenuation_correct` | theorem | L83 | DOC_STALE | update the document | (none) |
| `dissonance_reduction` | theorem | L84 | DOC_STALE | update the document | (none) |
| `is_flat` | theorem | L88 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/user/type_.rs` |

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
