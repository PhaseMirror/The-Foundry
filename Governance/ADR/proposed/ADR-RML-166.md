# ADR-RML-166: No build gate exists, and the root workspace cannot resolve

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: repository root `Cargo.toml`, absence of `.github/`, `packages/PhaseMirror/phase_mirror_wasm/`
- Verdict signature: `e4dbd3d4fc051ed2`

## Context and Problem Statement

ADR-003 L328-361 specifies a four-job CI matrix. None of it exists. This ADR is
first in the remediation sequence in ADR-RML-158 because every other fix in that
set is unverifiable until a gate runs, and thirteen of the seventeen dissonances
persist undetected for this reason alone.

### No workflow can execute: `.github` exists only in subpackages

Correction to an earlier draft of this ADR, which asserted that no `.github`
directory exists anywhere in the repository. That is false. Seven exist:

```
packages/Agency/.github        packages/PIRTM/.github
packages/Foundry/.github       packages/prism/.github
packages/The-Foundry/.github   packages/uor-foundry-main/.github
test_lake/.github
```

The conclusion is unchanged and the reason is sharper. GitHub Actions reads
`<repository-root>/.github/workflows/` and nothing else. There is no `.github` at
the repository root of this monorepo, so none of these can execute. They are inert
artifacts of subpackages that were once standalone repositories.

`packages/Foundry/` is the clearest case. It is an empty directory holding only
`.git` and `.github` — the residue of a rebrand that moved the package tree to
`packages/The-Foundry/` and left the hidden directories behind. Its six workflow
files, `lean-gate.yml`, `phi-pe-gate.yml`, `prismpm.yml`, `bootstrap.yml`,
`template-update.yml`, and `dependabot.yml`, were written against the old tree and
none references the PhaseMirror crates.

Two workflows outside that husk do mention PhaseMirror, and neither gates this
crate. `packages/Agency/.github/workflows/sedona_spine_ci.yml:62` runs
`cd "Phase Mirror/phase-mirror-mcp"` — a path containing a space that does not
exist; the real path is `packages/PhaseMirror/phase-mirror-mcp`. The step would
fail at the `cd`. `packages/uor-foundry-main/.github/workflows/pages.yml:33`
declares a `wasm32-unknown-unknown` target for its own copy of the tree.

ADR-003 L330-361 declares four jobs:

| Job | Command | State |
|-----|---------|-------|
| `rust-core` (L332-339) | `cargo check --workspace --all-targets`, `cargo test --workspace` | cannot run, see below |
| `wasm-surface` (L341-345) | `cargo check --target wasm32-unknown-unknown -p phase_mirror_wasm -p phase-mirror-extension-host`, `wasm-pack test --node` | no tests exist; `-p` unresolvable |
| `esp32-edge` (L347-355) | `cargo check --target xtensa-*`, `lake build`, `./scripts/verify_lean_hash.sh` | no such script; `packages/PhaseMirror/Prime/lean` does not exist |
| `archivum-merge` (L357-360) | `cargo test -p archivum-local-first` | not wired |

`ADR-RML-159` names `esp32-lean-check.yml` as the mechanism that keeps the ESP32
kernel's Lean proof hash matched to `l0_edge.rs`. ADR-003 L157 and L323 both rest
on it. It does not exist, and neither does `scripts/verify_lean_hash.sh`. This is
the mechanism ADR-003 L289 relies on to catch proof drift, so proof drift is
currently uncatchable by construction.

### The root workspace does not resolve

Root `Cargo.toml` declares:

```toml
members = [
    "packages/Foundry/Foundations/universal_atomic",
    "crates/pirtm-compiler",
    "rust/ace",
    "crates/unified-witness",
    "packages/Foundry/Foundations/CalculatorExample"
]
```

`packages/Foundry/Foundations/universal_atomic` does not exist. Any cargo command
at the root fails before reaching any member:

```
failed to read `.../packages/Foundry/Foundations/universal_atomic/Cargo.toml`
No such file or directory (os error 2)
```

So `cargo check --workspace --all-targets` and `cargo test --workspace`, the
entire `rust-core` job, cannot execute. Neither can `cargo check -p
phase_mirror_wasm` from the root.

### The `-p` selection in the wasm job is unsatisfiable

`phase_mirror_wasm/Cargo.toml:1` declares its own `[workspace]`. That makes it a
separate workspace, not a member of the root one, so the root cannot select it with
`-p`. And from within `phase_mirror_wasm`, `-p phase-mirror-extension-host` cannot
resolve, because that crate is not its member either. ADR-003 L344 is therefore
unsatisfiable as written from either workspace. The two crates ADR-003 L63-67 draws
as adjacent have no shared workspace in which to be checked together.

### The test command is a no-op

`wasm-pack test --node` at L345 runs zero tests. `grep -c "cfg(test)\|#\[test\]" src/lib.rs`
returns 0, there are no `[dev-dependencies]`, and `wasm-bindgen-test` is not
declared. The command reports success, which is worse than failing: it records a
green check for a crate that has never been tested.

The sibling crate `phase-mirror-surface` does have three unit tests at
`src/lib.rs:218-265`. The tested crate and the gating crate are not the same crate.

## Considered Options

### Option 1: Repair the root workspace, add a real CI matrix, add tests
- Pros: Every other ADR in the RML-158 set becomes verifiable. ADR-003 L283's
  claim that the build enforces cross-target parity becomes a real gate.
- Cons: Requires CI infrastructure that does not exist in this repository. Needs a
  decision on the `universal_atomic` member.

### Option 2: Add a crate-local gate only
A `Makefile` or `just` target per crate, runnable locally, no CI.
- Pros: Works today, no infrastructure. Verifiable by whoever is editing.
- Cons: Nothing runs it automatically. Recreates the current condition with extra
  steps: a gate nobody invokes is not a gate.

### Option 3: Declare the governance crates untested and unenforced
- Pros: No work.
- Cons: Makes the ADR-003 CI matrix a known fiction in writing. Every remaining
  dissonance in RML-158 becomes permanent.

## Decision Outcome

Option 1, in two stages. Stage 1 is deliberately the cheap part and can land
immediately.

### Stage 1: make the tree resolvable and locally verifiable

1. Resolve the `universal_atomic` member. Either restore the crate or remove it
   from `members`. Removing a declared member whose directory is absent is the
   lower-risk action; restoring it is preferable if the crate is intended to exist.
   This is a question for the owner of `packages/Foundry` and is deliberately left
   open here rather than decided unilaterally.
2. Add a `[workspace]` to `packages/PhaseMirror` covering all the
   `phase-mirror-*` crates, so `-p phase_mirror_wasm -p phase-mirror-extension-host`
   resolves as ADR-003 L344 requires. Remove the per-crate `[workspace]` stanzas
   that fragment the tree. `phase-mirror/Cargo.toml` and
   `phase_mirror_wasm/Cargo.toml` both carry one today.
3. Add unit tests to `phase_mirror_wasm` covering `evaluate_seal` and
   `run_gik_diagnostic`, plus `[dev-dependencies]` with `wasm-bindgen-test`. The
   test content is specified by ADR-RML-160, ADR-RML-162, and ADR-RML-165; this ADR
   requires only that the harness exists to hold them.
4. Add a `just` or `Makefile` target that runs the full local gate:
   `cargo check --workspace --all-targets`, `cargo test --workspace`,
   `cargo check --target wasm32-unknown-unknown -p phase_mirror_wasm`,
   and a `wasm-pack build` with a size assertion against the 2 MiB budget in
   ADR-003 L321. The budget has never been measured, because no build has been
   run under a gate.

### Stage 2: wire it to CI

5. A `wasm-surface` job running the Stage 1 targets, plus a non-zero test count
   assertion so a future test deletion is a failure rather than a silent green.
6. A `rust-core` job running the workspace checks.
7. `scripts/verify_lean_hash.sh` plus its workflow, or an explicit ADR-003 amendment
   recording that Lean proof-hash parity across targets is unenforced. An amendment
   is acceptable; silence is not, because ADR-003 L157 and L323 currently assert the
   check exists.

## Consequences

### Positive
- The other sixteen dissonances in ADR-RML-158 become verifiable, and each can be
  confirmed GOLDEN by re-running the mirror.
- The 2 MiB budget in ADR-003 L321 gets measured for the first time, which also
  gives ADR-RML-163 and ADR-RML-165 a number to justify their dependency removals.
- `wasm-pack test --node` stops reporting success for zero tests.
- The `universal_atomic` breakage is a single root cause that also affects any
  other tooling in this monorepo that invokes cargo at the root. Fixing it has
  benefits beyond this crate.

### Negative
- Requires a CI provider decision that this repository has not made. Until that is
  settled, Stage 1 gives a locally-runnable gate and Stage 2 does not exist, which is
  a partial resolution and should be recorded as partial.
- Adding a `packages/PhaseMirror` workspace changes Cargo's output directory layout
  and lockfile resolution for every member. A large diff, mostly mechanical.
- `xtensa` targets in the `esp32-edge` job need a separate toolchain and are out of
  scope here. Recording them as unenforced is more honest than a job that is defined
  and never green.

### Verification Strategy
`cargo metadata --no-deps` at the root exits 0, which is the direct test for the
`universal_atomic` breakage. `cargo check --workspace --all-targets` exits 0 from
the root. `cargo test -p phase_mirror_wasm` reports a non-zero test count. A
deliberate `compile_error!` injected into `phase_mirror_wasm` is observed to fail
the `wasm-surface` job, which proves the gate is actually wired rather than
green-by-omission.

## Links
- Index: `ADR-RML-158.md` (dissonance D13, D14)
- Claim: `Governance/ADR/accepted/ADR-003-sovereign-stack-implementation.md:157`, `:283`, `:321`, `:323`, `:328-361`
- Broken member: `Cargo.toml:4`
- Fragmented workspace stanzas: `packages/PhaseMirror/phase_mirror_wasm/Cargo.toml:1`, `packages/PhaseMirror/phase-mirror/Cargo.toml:16`
- Unblocks: every ADR in the RML-158 set
