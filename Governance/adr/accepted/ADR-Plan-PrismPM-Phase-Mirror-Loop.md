# Phase Mirror Dissonance Loop — PrismPM Audit Plan Index

> Authored Phase Mirror audit (not generator-produced): applies the loop's
> ANALYZE→DETECT→RANK→PLAN discipline as a manual pass over the PrismPM
> claim model and its documented intent, run on 2026-09-22. The associated
> machine loop (`scripts/phase_mirror_loop.py`) was run against the PrismPM
> root and *originally* reported `lean_decls=0`, `tensions=0` — which was
> *vacuous*, not clean: every declaration in the PrismPM Lean corpus is
> emitted with the `public` qualifier, lives under `tests/golden/` (not a
> `lean/` root) and under `build/`-segment paths the walk skipped. The
> ADR-PML-064 lever was applied on 2026-09-22 (added the full modifier
> qualifier set, a `--lean-subdir` arg, and a `/\.lake/`-only walk skip); the
> re-run indexes **5923** unique `def`/`theorem` declarations with **0**
> tensions. The tensions below live in the PrismPM claim/corpus plane and
> are filed as `docs/adr/proposed/*`. This index is the actionable lever
> surface for those tensions, ranked by impact x tractability. Each linked
> `ADR-PML-###` is a lever to resolve the dissonance. Full per-tension detail
> lives in `ADR-Plan-PrismPM-Phase-Mirror-Loop.backlog.md`.

## Loop Summary (PrismPM plane)
- Claim model scanned: SPEC.md (§1–§18 + Appendix A), CONFORMANCE.md
  (cited authorities + "claims that are not conformance IDs"), VERIFICATION.md
  (Gates 1–15 + OC/DK/SY claim families), CONTRACTS.md, README.md,
  RELEASE-STATUS.md, ERRORS.md, `docs/adr/001-008`
- Lean corpus scanned: 52 reviewed-golden `.lean` files under
  `tests/golden/stdlib/build/lexlean/build/modules/`; the loop indexes 5923
  unique `def`/`theorem` declarations (7426 decl lines: 7308 `def` + 118
  `theorem`; 0 lemma/axiom; 0 sorry; 0 Mathlib; plus 399 top-level
  `class`/`structure`/`inductive`/`def` type decls outside `scan_lean`'s
  declarator-keyword scope — post-ADR-PML-064 re-run, 2026-09-22)
- Tensions detected: 6  (rolled into 6 proposed plan ADRs)
- Leak rows (unmanifested risk): 5 of 6 clusters are leaked (ADR-PML-064,
  065, 066, 068, 069); only ADR-PML-067 is documented behavior, not a leak

## Ranked Plan ADRs (actionable levers)
| # | Plan ADR | Axis | Sev | Radius | Impact | Tract | Score | Owner | Leak |
|---|----------|------|-----|--------|--------|-------|-------|-------|------|
| 1 | [ADR-PML-064](ADR-PML-064-Phase-Mirror-Scanner-Blind-to-Generated-PrismPM-Lean-Plane.md) | control desired vs available | 3 | 10 | 30 | 3.0 | 90 | the-examiner | yes |
| 2 | [ADR-PML-065](ADR-PML-065-Verification-Report-Receipts-Not-Commit-Bound.md) | risk claimed vs risk owned | 3 | 10 | 30 | 3.0 | 90 | the-examiner | yes |
| 3 | [ADR-PML-066](ADR-PML-066-Published-Crate-Docs-Lack-Parity-Gate.md) | intent vs operating incentives | 3 | 6 | 18 | 4.0 | 72 | the-publisher | yes |
| 4 | [ADR-PML-067](ADR-PML-067-Operative-Lake-Graph-Is-Harness-Staged.md) | control desired vs available | 2 | 5 | 10 | 4.0 | 40 | the-guardian | no |
| 5 | [ADR-PML-068](ADR-PML-068-Cross-Plane-Calculator-Term-Collision.md) | intent vs operating incentives | 3 | 6 | 18 | 2.0 | 36 | the-guardian | yes |
| 6 | [ADR-PML-069](ADR-PML-069-ADR-006-Vendor-Policy-Record-Lag.md) | control desired vs available | 2 | 3 | 6 | 4.0 | 24 | the-publisher | yes |

Aggregate score: 352.0 over 6 clusters.

## How to operate these levers
1. Open the top-ranked `ADR-PML-###` file; it contains the actionable levers.
2. Resolve the tooling clusters first — ADR-PML-064 (applied 2026-09-22;
   inspect the re-run evidence and consider the `class`/`structure`/`inductive`
   declarator-keyword follow-up) un-blinds every future machine-loop run
   against PrismPM, and ADR-PML-066 (doc-parity gate) prevents the
   `platform_model`-style fork-drift failure mode already seen in this
   monorepo; both are data/low-effort changes.
3. Re-run the loop against the PrismPM root after consuming the levers and
   confirm `lean_decls` is truthful (post-fix: 5923) with 0 real tensions; a
   resolved tension exits the list.
4. Treat any future `LEAK` row as a silent-leak risk requiring manifest
   ratification (per the Foundry loop's LEAK convention).

## Dissonance drift
This is the first run against the PrismPM plane. The ADR-PML-064 scanner lever
was applied during this first run, so the meaningful baseline is the *post-fix*
measurement: 5923 indexed declarations, 0 tensions, aggregate 352.0. The
pre-fix loop read (`lean_decls=0`) is recorded in ADR-PML-064 as the vacuous
baseline; the next run must report the delta from 352.0 / 5923 in this
paragraph.

## Links
- Corpus: `packages/PrismPM` (SPEC.md, CONFORMANCE.md, VERIFICATION.md,
  CONTRACTS.md, RELEASE-STATUS.md, `docs/adr/`, `tests/golden/`, `model/`)
- Sibling loop: `docs/adr/completed/ADR-Plan-Phase-Mirror-Dissonance-Loop.md`
- Sibling audit: `docs/adr/proposed/ADR-Plan-LexLean-Phase-Mirror-Loop.md`
- State manifest (Foundry tree): `state/phase_mirror_loop.json`
- Full backlog: `docs/adr/proposed/ADR-Plan-PrismPM-Phase-Mirror-Loop.backlog.md`