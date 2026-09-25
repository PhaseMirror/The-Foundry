# Phase Mirror Dissonance Loop — LexLean Audit Plan Index

> Authored Phase Mirror audit (not generator-produced): applies the loop's
> ANALYZE→DETECT→RANK→PLAN discipline as a manual pass over the LexLean
> claim model and its documented intent, run on 2026-09-21. The associated
> machine loop (`scripts/phase_mirror_loop.py`) scans the Foundry Lean tree
> and reports 0 tensions for that corpus; the tensions below live in the
> adjacent LexLean claim/binary plane and are filed as `docs/adr/proposed/*`.
> This index is the actionable lever surface for those tensions, ranked by
> impact x tractability. Each linked `ADR-PML-###` is a lever to resolve the
> dissonance. Full per-tension detail lives in
> `ADR-Plan-LexLean-Phase-Mirror-Loop.backlog.md`.

## Loop Summary (LexLean plane)
- Claim model scanned: 223 claim IDs, 15 prefixes, all `level="build"`
- Error model scanned: 50 diagnostic codes (closed)
- Documents scanned: SPEC.md (§1–§32), CONFORMANCE.md, VERIFICATION.md,
  ERRORS.md, README.md, `model/*.toml`, `language/*`, `examples/uor-atlas/*`
- Tensions detected: 6  (rolled into 6 proposed plan ADRs)
- Leak row (unmanifested risk): none — every tension below is manifested by
  its ADR and this index

## Ranked Plan ADRs (actionable levers)
| # | Plan ADR | Axis | Sev | Radius | Impact | Tract | Score | Owner | Leak |
|---|----------|------|-----|--------|--------|-------|-------|-------|------|
| 1 | [ADR-PML-058](ADR-PML-058-LexLean-Atlas-Provenance-Plane-Single-Binding.md) | risk claimed vs risk owned | 4 | 10 | 40 | 5.0 | 200 | the-examiner | no |
| 2 | [ADR-PML-060](ADR-PML-060-LexLean-Self-Hosting-Audit-Closure-Unnamed-Instrumentation.md) | risk claimed vs risk owned | 4 | 12 | 48 | 4.0 | 192 | the-examiner | no |
| 3 | [ADR-PML-057](ADR-PML-057-Monorepo-Lean-Toolchain-Plane-Unbound.md) | control desired vs available | 4 | 15 | 60 | 3.0 | 180 | the-guardian | no |
| 4 | [ADR-PML-059](ADR-PML-059-One-Semantic-Representation-Two-Tracks-Single-Register.md) | intent vs operating incentives | 3 | 8 | 24 | 7.0 | 168 | the-publisher | no |
| 5 | [ADR-PML-061](ADR-PML-061-Verification-Evidence-Forward-Portability.md) | control desired vs available | 3 | 9 | 27 | 6.0 | 162 | the-examiner | no |
| 6 | [ADR-PML-062](ADR-PML-062-Release-Plane-Artifact-Versus-Release-Criterion.md) | risk claimed vs risk owned | 3 | 7 | 21 | 7.0 | 147 | the-publisher | no |

Aggregate score: 1049.0 over 6 clusters.

## How to operate these levers
1. Open the top-ranked `ADR-PML-###` file; it contains the actionable levers.
2. Resolve the highest-tractability cluster first where the lever is data-only
   (PML-059, PML-062) and the sampled-evidence clusters next (PML-058,
   PML-060); sequence the toolchain-plane work (PML-057) with the portability
   work (PML-061) since they share the `toolchain-plane`/attestation schema.
3. Re-run the relevant `just`/`lake` gates after each resolution; a resolved
   tension exits the list.
4. Treat any future `LEAK` row as a silent-leak risk requiring manifest
   ratification (per the Foundry loop's LEAK convention).

## Dissonance drift
This is the first run against the LexLean plane (baseline 1049.0); the next
run must report the delta from this baseline in this paragraph.

## Links
- Corpus: `packages/LexLean` (SPEC.md, CONFORMANCE.md, VERIFICATION.md,
  model/, language/, examples/uor-atlas/)
- Sibling loop: `docs/adr/completed/ADR-Plan-Phase-Mirror-Dissonance-Loop.md`
- State manifest (Foundry tree): `state/phase_mirror_loop.json`
- Full backlog: `docs/adr/proposed/ADR-Plan-LexLean-Phase-Mirror-Loop.backlog.md`