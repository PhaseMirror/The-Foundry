# Phase Mirror Dissonance Loop — PrismPM Tension Backlog

> Authored audit backlog (2026-09-22) for the PrismPM claim/corpus plane.
> Full ranked detail of all 6 detected tensions. Each tension rolls up into
> a plan ADR (see `ADR-Plan-PrismPM-Phase-Mirror-Loop.md`).

| # | Plan ADR | Axis | Sev | Radius | Tract | Score | Leak |
|---|----------|------|-----|--------|-------|-------|------|
| 1 | ADR-PML-064 | control desired vs available | 3 | 10 | 3.0 | 90.0 | yes |
| 2 | ADR-PML-065 | risk claimed vs risk owned | 3 | 10 | 3.0 | 90.0 | yes |
| 3 | ADR-PML-066 | intent vs operating incentives | 3 | 6 | 4.0 | 72.0 | yes |
| 4 | ADR-PML-067 | control desired vs available | 2 | 5 | 4.0 | 40.0 | no |
| 5 | ADR-PML-068 | intent vs operating incentives | 3 | 6 | 2.0 | 36.0 | yes |
| 6 | ADR-PML-069 | control desired vs available | 2 | 3 | 4.0 | 24.0 | yes |

## Per-tension detail

### 1. ADR-PML-064 — Scanner blind to generated PrismPM Lean plane (Score 90.0)
**Evidence**: `scripts/phase_mirror_loop.py:345-349` decl regex accepted only
`private|protected|noncomputable|partial`; the corpus
(`tests/golden/stdlib/build/lexlean/build/modules/`, 52 files) is uniformly
`public`-prefixed, lives under `tests/golden/` (not `lean/`), and its paths
contain `build/` segments the walk skipped. Pre-fix measured run (staged root):
`docs=18 claims=0 lean_decls=0 tensions=0` — a vacuous 0-decl baseline for a
corpus with 5923 unique `def`/`theorem` declarations (7426 decl lines: 7308
`def` + 118 `theorem`; plus 399 top-level `class`/`structure`/`inductive`/`def`
type decls outside the declarator-keyword scope).
**Productive contradiction**: the loop chartered to weigh the mathematical
Lean plane returned a vacuous 0-decl baseline; any future purity/sorry-level
claim is invisible and can never produce a `LEAK` row.
**Lever status (applied 2026-09-22)**: added `public`/`unsafe`/`nonrec`/
`mutual`/`opaque` qualifiers, `--lean-subdir` arg, and a `/\.lake/`-only
walk skip. Post-fix re-run (`--root packages/PrismPM --lean-subdir
tests/golden/stdlib/build/lexlean/build/modules --dry-run`): `docs=19
claims=0 lean_decls=5923 sorry=0 mathlib=0`, `tensions=0`. Foundry plane
regression-checked unchanged (141 unique decls, 0-loss). Open follow-up:
add `class`/`structure`/`inductive` to the declarator keywords (would add the
399 type-level decls).

### 2. ADR-PML-065 — VERIFICATION.md receipts not commit/run-bound (Score 90.0)
**Evidence**: `VERIFICATION.md:44/49` quote bare SHA-256 receipts
(`cea54c6b…`, `037a3543…`) with no commit/attestation/run correlation;
`SPEC.md:494-495` binds only `prismpm/vv-evidence/1` to "the exact full Git
commit"; `VERIFICATION.md:1376` scopes clean-tree verification as still
required, with no machine-readable denotation of which claims are
ledger-only. **Productive contradiction**: risk claimed in unbound prose vs
risk owned only by the commit-bound receipt; forward-portability of the
ledger claims is unenforceable. **Levers**: binding header
(`bound-to-commit`, `vv-run-identifier`, `attestation-id`); tag each claim
family `bound`/`advisory`; gate on header/commit mismatch.

### 3. ADR-PML-066 — Published-crate docs duplicated, no parity gate (Score 72.0)
**Evidence**: `crates/prismpm/{SPEC,CONFORMANCE,README,ERRORS}.md` are
byte-identical to root today (verified by diff, 2026-09-22); no script/CI
gate enforces it (no doc-copy parity in Justfile/scripts/xtask; only
`xtask/src/audit.rs:898` references the crate source path); monorepo
precedent: the deleted `platform_model/` fork drifted to drop 17 CONFORMANCE
rows and rewrite 20 SPEC passages while presenting as "PrismPM docs".
**Productive contradiction**: single-normative-source intent (CONTRACTS.md
header "R1: the model is the single source") vs a shipped duplicate channel
with no mechanical continuity. **Levers**: `scripts/check-doc-parity.sh`
wired into `vv` + `release.yml`; or pack-time copy from root normatives with
a no-tracked-divergence gate.

### 4. ADR-PML-067 — Operative Lake graph is harness-staged (Score 40.0)
**Evidence**: root `lakefile.toml` declares `defaultTargets=["PrismPM"]` and
`lake build` fails immediately — `error: no such file or directory:
…/PrismPM/PrismPM.lean` (verified 2026-09-22); the only committed corpus is
reviewed goldens (`SPEC.md:63`); all other lakefiles
(`examples/Calculator/lakefile.toml`, `tests/browser-*/lakefile.toml`,
`tests/fixtures/**/project/lakefile.toml`) are declarative stubs whose
modules are staged by the harness (`SPEC.md:439`). **Productive
contradiction (documented, not leaked)**: the root manifest advertises a
buildable default target the committed tree cannot realize, and nothing
states the root lake target is a harness-input placeholder. **Levers**:
annotate the stubs as harness-input; add `scripts/check-lake-shape.sh` to
`vv`; index the single legal build path in `tests/golden/README.md`.

### 5. ADR-PML-068 — Cross-plane "calculator" term collision (Score 36.0)
**Evidence**: PrismPM normatively defines a mechanical calculator artifact —
`CONTRACTS.md:35` `prismpm/calculator-baseline/1` (closed, exact-major,
schema-validated), `SPEC.md:500` `prism-calculator`, `Calculator.holo`,
calculator-example Pages, CalculatorSystem; Foundry proposed ADR-0121/0122
re-scope "physics calculator" as an undefined vibe to be eliminated — with
zero cross-citation between the planes. **Productive contradiction**: one
token, two disjoint meanings, no disambiguation link on either side; the
collision fires on the first Foundry/PrismPM integration touchpoint.
**Levers**: bind ADR-0121/0122 cross-plane reference to
`prismpm/calculator-baseline/1`; term-gate shared tokens (e.g. "calculator")
across planes; record the disambiguation in this index.

### 6. ADR-PML-069 — ADR-006 record lag (Score 24.0)
**Evidence**: `docs/adr/006-lean4-prod-upstream.md` status = **Proposed**,
yet its "vendored artifacts are release artifacts" + fork-contingency policy
is already the operating normativity: CONFORMANCE.md cited authorities bind
the fork's LEAN-REL-4-32-1/LAKE/LEANCHECKER values; model/dependencies.toml
pins `ac84a4de…`; RELEASE-STATUS.md declares 0.3.0 acceptance closure;
README calls 0.3.0 "the accepted production-system release". **Productive
contradiction**: a governance entry marked Proposed is the binding decision
for the release — a false-open signal; Phase 1 vs Phase 2 materialization is
not in the record's status. **Levers**: Promote ADR-006 to Accepted with the
phase denotation (or Supersede by a maintenance ADR); add the hygiene rule
"Proposed ADRs may not appear in Cited-authorities/contract tables"; keep
ADR-002 (crates.io, honestly Proposed, not performed) unchanged but watch.

## Watch list (non-tensions, next-run checks)
- ADR-002 (crates.io bootstrap): Proposed and consistent with reality (not
  performed) — verify it flips to Accepted before the first registry publish.
- SPEC §18 /1+/2 coexistence: explicit and internally consistent — confirm no
  new `/1` contract rows appear without the stated frozen-Holo posture.
- Golden-corpus purity (SPEC §9 canonical artifacts): 0 sorry/axiom/admit and
  no absolute paths/hostnames/timestamps in the 52 committed `.lean` files —
  re-audit once the scanner sees the corpus (ADR-PML-064).