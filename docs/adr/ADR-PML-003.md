# ADR-PML-003: Formal-verification purity claims: 2 source doc(s) with residual historical/aspirational claims

## Status
Proposed

## Axis (Phase Mirror tension class)
intent vs operating incentives

## Owner (multi-agent lever)
`the-guardian`

## Dissonance Score
- Impact = severity (2) x blast radius (2) = **4**
- Tractability = **4.0**
- **Score = 16.0**  (cluster rank 3 of 5)

## Context (stated intent vs implementation)
The documented intent below is not reflected by the current mathematical Lean 4
implementation. This is a measured gap produced by the Phase Mirror operational
loop.

### Stated intent (documents)
  - docs/artifacts/status.md:14 — claims [zero sorry] “| **S0** | Lake Tree Build | Standalone build in `Foundry/lean` + zero axioms/sorry | **PASSED (10/10 jobs; `bose_test` ”
  - docs/gnaf_integration_653.md:20 — claims [no sorry / sorry-free] “45 claims: 28 `formalProof` (kernel-checked, sorry-free, axiom closure”

### Implementation reality (lean/)
  - 43 `sorry` blocks across 43 lean file(s): lean/Core/Axioms.lean (1), lean/Core/phase_mirror_loop_scaffolds/adr0037.lean (1), lean/Core/phase_mirror_loop_scaffolds/adr0037_consequence_valid.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlasCompressedStage.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlasCompressedTrace_eq_realifiedGram.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlasCoupledDim.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlasCoupledEmbedding.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_arch_dominates_prime.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_closedWeil_nonneg.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_coupled_factorization.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_coupled_nonneg.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_derived_dominance.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_derived_dominance_stage.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_derived_dominance_stage_expanded.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_dominance_refines.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_explicit_formula.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_genuineLi_nonneg.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_genuine_coupled_factorization.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_genuine_coupled_operator_nonneg.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_genuine_coupled_psd.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_genuine_coupled_self_adjoint.lean (1), lean/Core/phase_mirror_loop_scaffolds/atlas_positivity.lean (1), lean/Core/phase_mirror_loop_scaffolds/closedW_nonneg.lean (1), lean/Core/phase_mirror_loop_scaffolds/closed_explicit_formula.lean (1), lean/Core/phase_mirror_loop_scaffolds/coupledWeil.lean (1), lean/Core/phase_mirror_loop_scaffolds/coupledWeil_psd_iff_dominates.lean (1), lean/Core/phase_mirror_loop_scaffolds/genuineArchStage.lean (1), lean/Core/phase_mirror_loop_scaffolds/genuineCoupledStage.lean (1), lean/Core/phase_mirror_loop_scaffolds/genuineCoupledStage_diag_readback.lean (1), lean/Core/phase_mirror_loop_scaffolds/genuineCoupledStage_eq_atlasCompressedTrace.lean (1), lean/Core/phase_mirror_loop_scaffolds/genuineLi_nonneg.lean (1), lean/Core/phase_mirror_loop_scaffolds/genuinePlaceStage.lean (1), lean/Core/phase_mirror_loop_scaffolds/genuinePrimeCutoff.lean (1), lean/Core/phase_mirror_loop_scaffolds/genuinePrimeCutoff_complete.lean (1), lean/Core/phase_mirror_loop_scaffolds/genuinePrimeWeight.lean (1), lean/Core/phase_mirror_loop_scaffolds/normAutocorr_in_atlas_sonine.lean (1), lean/Core/phase_mirror_loop_scaffolds/normAutocorr_positivity_iff_RH.lean (1), lean/Core/phase_mirror_loop_scaffolds/normWeight.lean (1), lean/Core/phase_mirror_loop_scaffolds/riemann_hypothesis.lean (1), lean/Core/phase_mirror_loop_scaffolds/sampleRegistry.lean (1), lean/Core/phase_mirror_loop_scaffolds/sample_registry_acyclic.lean (1), lean/Core/phase_mirror_loop_scaffolds/sample_registry_unique_ids.lean (1), lean/Core/phase_mirror_loop_scaffolds/viable_circle_prevents_burnout.lean (1)

### Manifested boundary
Leaked (unmanifested): no

## Decision (the lever)
Resolve the dissonance by manifesting the gap and closing it with a verified
artifact rather than letting the claimed guarantee stand unbacked. Treat the
unproven claim as `Proposed` until a Lean proof (or a manifested `sorry` + Rust
stub, per `alp_sorry_manifest.json`) backs it.

## Consequences
- **Positive**: claimed guarantees become auditable; silent leaks into policy
  decisions are eliminated; the UAC-ALP boundary stays honest on every CI run.
- **Negative / Constraints**: temporary downgrade of the marketing-grade claim
  until the proof lands; added CI surface for the manifested stub.
- **Verification Strategy**: re-run `scripts/phase_mirror_loop.py`; the tension
  must drop out of the ranked list (score -> 0) once the backing proof exists
  and the manifest is reconciled.

## Metrics (resolution is confirmed when)
- The cited theorem/invariant exists in `lean/` and compiles free of unmanifested `sorry`.
- OR the gap is explicitly listed in `alp_sorry_manifest.json` with a paired Rust stub + governance test.
- Dissonance score for this axis trends to 0 on subsequent loop runs.

## Actionable Levers
1. Update the purity ADR (e.g. ADR-Prime-Move-Deployment-Readiness.md) to segregate the verified UAC math cores from the transitional `ALP` agentic contracts.
2. Run `scripts/honesty_audit.sh`; enforce that every `sorry` is in the manifest and every manifest entry resolves to a real declaration (no stale permits).
3. Downgrade absolute '100% verified / zero sorry' wording to scoped, accurate claims until the proof budget is spent.
4. Re-run `scripts/phase_mirror_loop.py` and confirm this tension's score decreases.

## Links
- Loop index: `docs/adr/ADR-Plan-Phase-Mirror-Dissonance-Loop.md`
- Sorry boundary: `alp_sorry_manifest.json`
- Goal: `Phase_Mirror_Loop_Goal.md`
