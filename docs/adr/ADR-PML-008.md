# ADR-PML-008: Unledgered axioms: 1 mathematical postulate(s), 0 infrastructure symbol(s) with no alp_sorry_manifest.json entry

## Status
Proposed

## Axis (Phase Mirror tension class)
risk claimed vs risk owned

## Owner (multi-agent lever)
`the-examiner`

## Dissonance Score
- Impact = severity (4) x blast radius (1) = **4**
- Tractability = **2.0**
- **Score = 8.0**  (cluster rank 8 of 8)

## Context (stated intent vs implementation)
The documented intent below is not reflected by the current mathematical Lean 4
implementation. This is a measured gap produced by the Phase Mirror operational
loop.

### Stated intent (documents)
  - alp_sorry_manifest.json: 'Debt ledger for transitional sorry/axiom blocks' — the ledger claims exhaustiveness over manifested axioms too
  - docs/adr/ADR-PML-006.md Resolution — SigmaKernel Real/beta4 axioms flagged as candidate axiom-audit lever

### Implementation reality (lean/)
  - lean/Core/Axioms.lean:4 — `axiom placeholder_axiom` (mathematical postulate)

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
1. Ratify the ADR-PML-007 axiom-amnesty batch at the next governance cycle: account for every listed axiom via state/amnesty_batch_PML-007.json — mathematical postulates need a witness, a proof plan, or demotion; infrastructure symbols (shadow Real/Complex algebra) are recorded as declared-API pending Mathlib reconstitution — no fabricated metadata.
2. Apply ratified entries to alp_sorry_manifest.json (type: axiom); prefer verified Rust/Kani pairings where witnesses exist (Quarternion precedent).
3. Re-run scripts/honesty_audit.sh (axiom parity lines) and phase_mirror_loop.py; the 'Unledgered axioms' tension must drop out of the ranked list.
4. Re-run `scripts/phase_mirror_loop.py` and confirm this tension's score decreases.

## Links
- Loop index: `docs/adr/ADR-Plan-Phase-Mirror-Dissonance-Loop.md`
- Sorry boundary: `alp_sorry_manifest.json`
- Goal: `Phase_Mirror_Loop_Goal.md`
