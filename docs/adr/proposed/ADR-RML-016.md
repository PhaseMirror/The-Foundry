# ADR-RML-016: document `Governance/docs/docs/MSP_1.md` has 20 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/docs/docs/MSP_1.md` (mtime 2026-07-08 14:50:52Z)
- 20 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `538df683328a1271`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `native_decide` | theorem | L3455 | DOC_STALE | update the document | (none) |
| `mqem_simp` | theorem | L3835 | DOC_STALE | update the document | (none) |
| `mqem_bound` | theorem | L3852 | DOC_STALE | update the document | (none) |
| `hundian_solve` | theorem | L3867 | DOC_STALE | update the document | (none) |
| `allowed_axioms` | theorem | L3947 | DOC_STALE | update the document | (none) |
| `mqem_equation` | theorem | L4061 | DOC_STALE | update the document | (none) |
| `prime_recursive_step` | theorem | L4062 | DOC_STALE | update the document | (none) |
| `fractal_dim` | theorem | L4063 | DOC_STALE | update the document | (none) |
| `entanglement_term` | theorem | L4064 | DOC_STALE | update the document | (none) |
| `gibbs_free_energy` | theorem | L4065 | DOC_STALE | update the document | (none) |
| `qaoa_optimization` | theorem | L4066 | DOC_STALE | update the document | (none) |
| `cat_map_contribution` | theorem | L4067 | DOC_STALE | update the document | (none) |
| `convergence_theorem` | theorem | L4068 | DOC_STALE | update the document | (none) |
| `noise_resilience_threshold` | theorem | L4069 | DOC_STALE | update the document | (none) |
| `embodied_viability` | theorem | L4070 | DOC_STALE | update the document | (none) |
| `triadic_scaling` | theorem | L4071 | DOC_STALE | update the document | (none) |
| `recursive_termination` | theorem | L4072 | DOC_STALE | update the document | (none) |
| `hundian_rules` | theorem | L4073 | DOC_STALE | update the document | (none) |
| `msc_valuation` | theorem | L4074 | DOC_STALE | update the document | (none) |
| `valuation_convergence` | theorem | L4075 | DOC_STALE | update the document | (none) |

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
