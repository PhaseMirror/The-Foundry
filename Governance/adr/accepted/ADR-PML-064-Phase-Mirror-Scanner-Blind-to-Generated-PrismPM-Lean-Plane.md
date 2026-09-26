# ADR-PML-064: Phase-Mirror Scanner Is Blind to the Generated PrismPM Lean Plane (machine loop reports 0 decls)

## Status
Proposed

## Axis (Phase Mirror tension class)
control desired vs available

## Owner (multi-agent lever)
`the-examiner`

## Dissonance Score
- Impact = severity (3) x blast radius (10) = **30**
- Tractability = **3.0** (leaked)
- **Score = 90.0**

## Context (stated intent vs implementation)

### Stated intent (documents)
- The Phase Mirror operational loop (`scripts/phase_mirror_loop.py`) weighs "the dissonance between stated intent (documents) and the reality of the mathematical Lean 4 proof implementations" and is the tool that produced `docs/adr/proposed/ADR-PML-057..063` for the adjacent LexLean plane. Its `scan_lean` is supposed to index every Lean 4 declaration so that monitoring surfaces (honesty audits, `state/phase_mirror_loop.json`) are meaningful.
- The declaration regex is `scripts/phase_mirror_loop.py:345-349`: it accepts optional attributes plus only the qualifiers `private`, `protected`, `noncomputable`, `partial` before `theorem|lemma|axiom|def|abbrev|example`.

### Implementation reality (PrismPM corpus)
- PrismPM's entire Lean corpus is generated output: 52 `.lean` files under `tests/golden/stdlib/build/lexlean/build/modules/` (a "manifest-owned reviewed golden", `SPEC.md` §1.2 line 63). Every declaration is emitted with the leading `public` qualifier.
- The corpus has 399 top-level `public class`/`structure`/`def`/`inductive` declarations (162 `class`, 110 `structure`, 80 `def`, 47 `inductive`) and 118 `theorem` declarations across 10 files; 0 `lemma`/`axiom`/`abbrev`/`example`, 0 `sorry`, 0 Mathlib imports.
- `scan_lean`'s declarator keyword set is `theorem|lemma|axiom|def|abbrev|example` — so its indexed surface is the `def`/`theorem` lines: 5923 unique named declarations (7308 `def` declarator lines + 118 `theorem` lines). `class`/`structure`/`inductive` remain outside that keyword set (a documented residual scope gap, see Levers).
- Pre-fix measurement (2026-09-22): a staged PrismPM root run of the loop printed `docs=18 claims=0 lean_decls=0 sorry=0 mathlib=0` then `tensions=0`. Zero declarations matched: `public` was absent from the qualifier set at `scripts/phase_mirror_loop.py:347`.

### Contradiction (productive)
The loop that is chartered to weigh the mathematical Lean reality against stated intent cannot count a single declaration of the very corpus it is pointed at. Any future purity/`sorry`/invariant claim in PrismPM documents would surface as `claims=0`, `tensions=0` — a silent-leak condition that defeats the audit's purpose. The "0 tensions" number reads as a green control-surface result while the underlying scan is empty.

### Hidden assumptions
- The Lean corpus root is assumed to be `<root>/lean/` (`_resolve_paths`, `LEAN_SUBDIR = "lean"`), which PrismPM does not have; its corpus lives under `tests/golden/`.
- Declaration lines are assumed to carry no qualifier beyond the accepted set; PrismPM's generated Lean is uniformly `public`-prefixed.
- The Foundry-specific symbol detectors (`L_eff`, `R_{sc}`, `tau_R`) and purity regexes are assumed to cover every honesty claim; PrismPM's honesty plane (CONFORMANCE.md "Claims that are not conformance IDs") uses different wording.

### Manifested boundary
Dissonance manifested during the reported audit run: the machine loop returned `lean_decls=0` for a corpus with 399 declarations. No `LEAK` row can ever be produced for the PrismPM plane by the current scanner because no tension detector fires.

## Decision (the lever)
1. **Extend the declaration recognizer.** Add `public` (and the remaining Lean 4 modifier set: `unsafe`, `nonrec`, `mutual`, `opaque`) to the qualifier class at `scripts/phase_mirror_loop.py:347`, so generated declarations are indexed like any Lean decl. (*Applied 2026-09-22.*)
2. **Parameterize the corpus root.** Add `--lean-subdir`/`--lean-root` to `_resolve_paths` so an audit can point `scan_lean` at `tests/golden/stdlib/build/lexlean/build/modules` instead of assuming `<root>/lean/`. (*Applied 2026-09-22.*)
3. **Un-exclude golden `build/` paths.** `scan_lean`'s walk skip was the bare `/build/` segment — that deskips reviewed-golden corpora that live *under* `build/` paths. Skips are now `/\.lake/`-only (per-package Lean output). (*Applied 2026-09-22.*)
4. **Re-baseline.** Re-run the loop against the PrismPM root with `--lean-subdir tests/golden/stdlib/build/lexlean/build/modules` and record the true numbers. (*Measured below.*)

## Consequences
- **Positive**: the machine loop can no longer report a false-clean 0-decl baseline for a plane with 399 declarations; honesty-audit parity lines become meaningful for generated corpora.
- **Negative / Constraints**: the script change touches a shared Foundry tool; it is backward compatible (pure addition of qualifiers + an optional arg) and the Foundry tree's own baseline is unchanged (its corpus uses no `public` qualifier).
- **Verification Strategy**: re-run `scripts/phase_mirror_loop.py --root <prismpm-staged-root>` and assert `lean_decls >= 399`.

## Metrics (resolution is confirmed when)
- Re-run of the loop against the real PrismPM tree yields a truthful `lean_decls` (the pre-fix run said 0; the post-fix re-run says 5923 unique `def`/`theorem` declarations) and 0 real tensions.
- The index records a non-zero `lean_decls` for the PrismPM plane and still 0 real tensions.
- `state/phase_mirror_loop.json` for a PrismPM run shows a truthful `lean_decls` value.
- Regression check: the Foundry plane baseline is unchanged (old-rx and new-rx both index 141 unique declarations on `lean/`; 0-loss).

## Re-run evidence (2026-09-22)
Command: `python3 scripts/phase_mirror_loop.py --root packages/PrismPM --lean-subdir tests/golden/stdlib/build/lexlean/build/modules --dry-run --verbose`

Output (Phase 1): `docs=19 claims=0 lean_decls=5923 sorry=0 mathlib=0`; Phase 2: `tensions=0`.
Breakdown (scanner logic, same regex): 52 files; 7308 `def` declarator lines + 118 `theorem` lines = 7426 decl lines, 5923 unique names; 0 `lemma`/`axiom`/`abbrev`/`example`; 0 `sorry`; 0 Mathlib imports.
Residual scope note: `class`/`structure`/`inductive` are not (yet) declarator keywords in `scan_lean`; adding them is a backward-compatible follow-up lever for a later run and would surface the 399 type-level declarations (162+110+47) as well.

## Actionable Levers
1. Add `--lean-subdir` argument + `public`/modifier qualifiers to `scripts/phase_mirror_loop.py` and the `/\.lake/`-only walk skip (applied 2026-09-22).
2. Add a `just`/script alias `prismpm-audit` that stages the documented corpus root and runs the loop.
3. Re-run the loop and append the measured baseline to this ADR; file no further planes against PrismPM until `lean_decls` is truthful.

## Links
- Loop engine: `scripts/phase_mirror_loop.py`
- Corpus: `packages/PrismPM/tests/golden/stdlib/build/lexlean/build/modules/`
- Normative corpus role: `packages/PrismPM/SPEC.md` §1.2
- Sibling authored audit: `docs/adr/proposed/ADR-Plan-LexLean-Phase-Mirror-Loop.md`
- This index: `docs/adr/proposed/ADR-Plan-PrismPM-Phase-Mirror-Loop.md`