# ADR-PML-006: Unmanifested sorry debt: 1 declaration(s) carry `sorry` with no alp_sorry_manifest.json entry

## Status
Proposed

## Axis (Phase Mirror tension class)
risk claimed vs risk owned

## Owner (multi-agent lever)
`the-examiner`

## Dissonance Score
- Impact = severity (4) x blast radius (1) = **4**
- Tractability = **3.0**
- **Score = 12.0**  (cluster rank 6 of 8)

## Context (stated intent vs implementation)
The documented intent below is not reflected by the current mathematical Lean 4
implementation. This is a measured gap produced by the Phase Mirror operational
loop.

### Stated intent (documents)
  - alp_sorry_manifest.json: 'Debt ledger for transitional sorry/axiom blocks. Every entry must be amortized' — the ledger claims exhaustiveness over manifested proof debt
  - docs/adr/ADR-PML-005.md — Facet A (inline `:= sorry`) + Facet B (unmanifested blocks)

### Implementation reality (lean/)
  - lean/Core/Axioms.lean:4 — `placeholder_axiom` carries unmanifested `sorry`

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
1. Ratify the ADR-PML-005 debt-amnesty batch at the next governance cycle: classify every listed declaration via state/amnesty_batch_PML-005.json with a disposition (tier3_aspirational | prove | exclude), governor, deadline, and pairing per entry — no fabricated metadata.
2. Apply ratified entries to alp_sorry_manifest.json; move `exclude` scaffolds out of the canonical tree (_archive/, legacy/, phase_mirror_loop_scaffolds/).
3. Re-run scripts/honesty_audit.sh until it exits green with zero unauthorized blocks and loop-tally parity holds.
4. Re-run `scripts/phase_mirror_loop.py` and confirm this tension's score decreases.

## Links
- Loop index: `docs/adr/ADR-Plan-Phase-Mirror-Dissonance-Loop.md`
- Sorry boundary: `alp_sorry_manifest.json`
- Goal: `Phase_Mirror_Loop_Goal.md`
