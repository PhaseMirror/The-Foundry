# ADR-PML-067: Operative Lake Graph Is Harness-Staged; Root `defaultTargets=["PrismPM"]` Fails In-Tree

## Status
Proposed

## Axis (Phase Mirror tension class)
control desired vs available

## Owner (multi-agent lever)
`the-guardian`

## Dissonance Score
- Impact = severity (2) x blast radius (5) = **10**
- Tractability = **4.0** (leaked = False; not leaked)
- **Score = 40.0**

## Context (stated intent vs implementation)

### Stated intent (documents)
- SPEC.md §1.1 lists the project layout; §1.2 states "Generated Lean is a build artifact or a manifest-owned reviewed golden, never authoritative source" (`SPEC.md:63`); §1.3 step 2 says generated Lean "elaborates and replays through leanchecker"; §8 (`SPEC.md:439`) says the confined temporary verification workspace "has generated modules plus declarative lakefile.toml and lean-toolchain" — i.e. Lean building is defined as a harness-time operation, not an in-tree one.

### Implementation reality (PrismPM corpus)
- Repo root carries the *signature* of an in-tree lake project: `lakefile.toml` declares `defaultTargets = ["PrismPM"]` with `[[lean_lib]] name = "PrismPM"`, and `lean-toolchain` pins `leanprover/lean4:v4.32.1`.
- `lake build` at the repo root **fails immediately** (verified 2026-09-22): `error: some modules have bad imports or could not be read; no such file or directory: …/packages/PrismPM/PrismPM.lean; error: build failed`. There is no `PrismPM/` source directory in-tree; the only committed `.lean` corpus is the reviewed-golden set under `tests/golden/stdlib/build/lexlean/build/modules/`.
- All other lakefile.toml instances in the tree are declarative stubs that the harness fills during verification: `examples/Calculator/lakefile.toml`, `tests/browser-*/lakefile.toml`, `tests/fixtures/{controller,facets,holo}/**/project/lakefile.toml` — none of these projects has committed Lean sources next to its lakefile, so none is directly buildable from the committed tree either.

### Contradiction (productive)
The root Lake manifest advertises a buildable default target that the committed tree cannot realize, and nothing in the docs states this ("the root lake target is a declarative placeholder; the operative build is harness-staged"). A contributor or CI entrant that runs `lake build` as the Lean entrance gate gets a hard failure with no redirection to the harness-defined build path, and the landing perception is "the Lean project does not build."

### Hidden assumptions
- `defaultTargets=["PrismPM"]` at root implies a buildable `PrismPM` module; the intent (per SPEC §1.3/§8) is only a declarative shape for the harness.
- Fixture `project/lakefile.toml` files are assumed buildable-as-committed; they are inputs, not builds.

### Manifested boundary
Dissonance is documented, not active: SPEC §8 and §1.3 precisely describe the harness pipeline, so this is an *under-asserted* declared-surface gap rather than a live contradiction. It is ranked below the leaked items.

## Decision (the lever)
1. **Annotate the declarative stubs**: add a `# harness-input template — not directly buildable; see SPEC §8` comment line to root `lakefile.toml` and keep fixture lakefiles scoped as inputs.
2. **Add `scripts/check-lake-shape.sh`** that asserts the expected shape (root project name matches the golden `lean_lib` name; no `PrismPM/` source dir committed; corpus present) and exits non-zero on divergence — a cheap honesty check owned by `the-guardian`.
3. **Index the operative build path**: document in a `tests/golden/README.md` (or SPEC §1.3 pointer) that the only legal Lean build is via the verification harness against the reviewed-golden corpus.

## Consequences
- **Positive**: the Lean landing experience stops failing silently; the declarative vs operational split is explicit; the machine-loop audit (ADR-PML-064) can be pointed at the corpus rather than chasing a root build.
- **Negative / Constraints**: a comment in a TOML and one doc paragraph; no semantic change to the harness or the goldens.
- **Verification Strategy**: run `lake build` at root and confirm the documented failure message is the *expected* one; `check-lake-shape.sh` passes.

## Metrics (resolution is confirmed when)
- Root `lakefile.toml` carries the harness-input annotation.
- `scripts/check-lake-shape.sh` exists and passes in CI/`vv`.
- `tests/golden/` README (or SPEC pointer) names the single legal Lean build path.

## Actionable Levers
1. Add the annotation line to root `lakefile.toml` and to the fixture stub generator.
2. Author `check-lake-shape.sh` and wire into `vv`.
3. Add the `tests/golden/README.md` index paragraph.

## Links
- Root manifest: `packages/PrismPM/lakefile.toml`
- Fixture stubs: `packages/PrismPM/examples/Calculator/lakefile.toml`, `packages/PrismPM/tests/fixtures/**/project/lakefile.toml`
- Normative build semantics: `packages/PrismPM/SPEC.md` §1.2 (`:63`), §1.3, §8 (`:439`)
- Corpus: `packages/PrismPM/tests/golden/stdlib/build/lexlean/build/modules/`
- This index: `docs/adr/proposed/ADR-Plan-PrismPM-Phase-Mirror-Loop.md`