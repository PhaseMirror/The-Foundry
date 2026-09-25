# ADR-PML-002: Documented Lean theorems missing in the `general` subsystem (33 gaps)

## Status
Proposed

## Axis (Phase Mirror tension class)
urgency vs capacity

## Owner (multi-agent lever)
`the-examiner`

## Dissonance Score
- Impact = severity (4) x blast radius (33) = **40**
- Tractability = **1.0**
- **Score = 40.0**  (cluster rank 1 of 5)

## Context (stated intent vs implementation)
The documented intent below is not reflected by the current mathematical Lean 4
implementation. This is a measured gap produced by the Phase Mirror operational
loop.

### Stated intent (documents)
  - docs/ATLAS_DERIVED_DOMINANCE_THEOREM.md:15 — asserts `coupledWeil` as verified
  - docs/ATLAS_DERIVED_DOMINANCE_THEOREM.md:31 — asserts `coupledWeil_psd_iff_dominates` as verified
  - docs/ATLAS_DERIVED_DOMINANCE_THEOREM.md:59 — asserts `genuinePrimeWeight` as verified
  - docs/ATLAS_DERIVED_DOMINANCE_THEOREM.md:63 — asserts `genuinePrimeCutoff` as verified
  - docs/ATLAS_DERIVED_DOMINANCE_THEOREM.md:71 — asserts `genuineArchStage` as verified
  - docs/ATLAS_DERIVED_DOMINANCE_THEOREM.md:84 — asserts `genuinePlaceStage` as verified
  - docs/ATLAS_DERIVED_DOMINANCE_THEOREM.md:91 — asserts `genuineCoupledStage` as verified
  - docs/ATLAS_DERIVED_DOMINANCE_THEOREM.md:102 — asserts `genuinePrimeCutoff_complete` as verified

### Implementation reality (lean/)
  - lean/Core/phase_mirror_loop_scaffolds/coupledWeil.lean:4 — declaration contains `sorry`
  - lean/Core/phase_mirror_loop_scaffolds/coupledWeil_psd_iff_dominates.lean:4 — declaration contains `sorry`
  - lean/Core/phase_mirror_loop_scaffolds/genuinePrimeWeight.lean:4 — declaration contains `sorry`
  - lean/Core/phase_mirror_loop_scaffolds/genuinePrimeCutoff.lean:4 — declaration contains `sorry`

### Manifested boundary
Leaked (unmanifested): YES — gap is NOT manifested in `alp_sorry_manifest.json` (silent leak risk)

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
1. Manifest the missing theorem(s) `coupledWeil`, `coupledWeil_psd_iff_dominates`, `genuinePrimeWeight`, `genuinePrimeCutoff`, `genuineArchStage`, `genuinePlaceStage`, `genuineCoupledStage`, `genuinePrimeCutoff_complete`, `atlasCompressedStage`, `atlasCoupledDim`, `atlasCoupledEmbedding`, `atlas_genuine_coupled_factorization`, +19 more as gated `sorry` stubs under `lean/Core/` and register each in `alp_sorry_manifest.json` (run the loop with `--scaffold-proofs`).
2. Add paired Rust/Kani stubs + governance tests in `crates/` per ADR-054 / ADR-045 hybrid boundary policy, so the gap is owned, not silent.
3. File proof-engineering tickets sized by effort; close `sorry`s in priority order from the ranked loop index until this cluster's score trends to 0.
4. Re-run `scripts/phase_mirror_loop.py` and confirm this tension's score decreases.

## Links
- Loop index: `docs/adr/ADR-Plan-Phase-Mirror-Dissonance-Loop.md`
- Sorry boundary: `alp_sorry_manifest.json`
- Goal: `Phase_Mirror_Loop_Goal.md`
