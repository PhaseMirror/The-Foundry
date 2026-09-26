# ADR-PML-057: Monorepo Lean toolchain plane is unbound (LexLean 4.32.1 vs Foundry 4.34.0-rc2)

## Status
Proposed

## Axis (Phase Mirror tension class)
control desired vs available

## Owner (multi-agent lever)
`the-guardian`

## Dissonance Score
- Impact = severity (4) x blast radius (15) = **60**
- Tractability = **3.0**
- **Score = 180.0** (LexLean audit, rank 3 of 6)

## Context (stated intent vs implementation)

### Stated intent (documents)
- `packages/LexLean/SPEC.md` §8.2: "LexLean MUST reject a verification
  environment whose reported Lean version is not 4.32.1"; the repository-root
  `lean-toolchain` "MUST contain exactly that line followed by LF" and the
  pinned Lean tag resolves to commit `f054605aea4b840552cca2e725580bffd1e1b704`.
- `packages/LexLean/README.md:9`: verification compiles the generated Lean
  "under the pinned `leanprover/lean4:v4.32.1` toolchain".
- `packages/Foundry/lean-toolchain` (this package): `leanprover/lean4:v4.34.0-rc2`.
  The Foundry formal core (`ADR/R4.lean`, `ADR/Sovereign.lean`, `ADR-0113`
  UCC) is authored and CI-gated under 4.34.0-rc2; `scripts/check_lake_toolchain.sh`
  enforces the pin.

### Implementation reality (both corpora)
- The same monorepo carries **two exclusive Lean toolchain pins**: LexLean
  demands 4.32.1 and rejects any other version; Foundry pins 4.34.0-rc2.
  A single `lean`/`lake` on the user PATH cannot serve both without
  toolchain-skeleton switching — the exact failure class already observed in
  this repository when `~/.local/bin/{lake,lean}` shadowed the pinned
  toolchain (a 4.33.0-rc2 binary was answered even though the project pinned
  4.34.0-rc2; `lake test` broke until the symlinks were repointed).
- `CF-14` (`CONFORMANCE.md`) ratifies: "Language 1.0 accepts only
  leanprover/lean4:v4.32.1 for verification."
- LexLean's axiom parser (SPEC §22.5) accepts only the *pinned* 4.32.1
  normalized output forms, so its attestations cannot even be re-read under
  the 4.34 plane without byte translation.

### Contradiction (productive)
Two kernel-backed artifacts in one monorepo each claim "verified by Lean's
kernel" yet cannot be jointly elaborated or jointly audited. The UCC's
machine-checked consequences (4.34) and LexLean's machine-checked generated
modules (4.32.1) are incommunicado: neither package can import the other's
certified `.lean` without a cross-pin jump whose correctness is itself
unattested. The productivity is the *single account* intuition: the monorepo
should own one verifiable toolchain authority; today it earns a coin from
each side separately and can spend neither together.

### Hidden assumptions
- **Version-transferability unstated**: "verified at 4.32.1" is silently
  believed to remain true at 4.34 (and vice versa); nothing in either spec
  records the upgrade witness.
- **Axiom-form stability promised**: the 4.32.1-only axiom payload acceptance
  presumes the 4.34 `#print axioms` forms differ — which is exactly why
  porting would not be silent — yet no data confirms the presumption of an
  easy mechanical translation.
- **Kernel authority commutes**: "Lean 4" as a brand is treated as one
  verifier across pin boundaries, though elaborator/kernel changes
  (4.32 → 4.33 → 4.34) are exactly the kind of change this session's PATH
  bug demonstrated is neither visible nor caught by either package's guard.

### Manifested boundary
The PATH-shadowing incident is the manifested boundary: the monorepo has a
toolchain-binding mechanism per package but no cross-package binding, so the
class of failure ("which Lean answered?") recurs unobserved until a build
breaks. Leaked (unmanifested): no — manifested by this ADR (and by the
recorded incident).

## Decision (the lever)
Bind one monorepo toolchain axis with a documented delta, implemented in
three moves:

1. **Root pin**: a repository-root `lean-toolchain` (single authoritative
   version, alignment target) plus per-package `delta` notes in each
   package's `README.md`/AGENTS declaring the package's pin and its
   relationship to the root pin.
2. **Cross-pin attestation (data, non-normative to a 4.32.1-pinned spec)**:
   a monorepo job, under the *root* pin, elaborates every LexLean example
   `Main.lean` and records per-module pass/`# print axioms` diff against the
   LexLean-pinned result; output is a committed `state/toolchain-plane.json`
   consumed by the Foundry ADR ledger. This does not weaken LexLean's
   §8.2/`CF-14` refusal — it produces *evidence about* the 4.32.1 plane while
   running from the 4.34 plane.
3. **Skeleton guard**: promote the existing
   `scripts/check_lake_toolchain.sh` pattern to a monorepo-wide check that
   each package's `lean-toolchain` says what the package thinks it says
   (prevents the PATH-shadowing class by comparing the resolved binary's
   version against the pin before every `lake` invocation in CI).

## Consequences
- **Positive**: a single version story for the monorepo; the toolchain-shadow
  failure class becomes machine-caught; UCC consequences and LexLean modules
  become jointly auditable under one pin with an explicit delta ledger.
- **Negative / Constraints**: cross-pin attestation cannot claim LexLean
  verdicts beyond the 4.32.1 plane (it records, it does not over-verify);
  introducing a root pin requires all packages to sign the delta or migrate.
- **Verification Strategy**: `make adr-verify`-style gate runs
  `toolchain-plane` and refutes (exit non-zero) whenever the recorded plane
  digest differs from the actual resolved toolchain.

## Metrics (resolution is confirmed when)
- Repository-root `lean-toolchain` exists and every package
  `lean-toolchain` file (41 in LexLean, 1 in Foundry) matches or declares a
  recorded delta.
- `state/toolchain-plane.json` exists and is re-derived by CI on every
  toolchain-relevant change; zero drift in the last 10 runs.
- The PATH-shadowing incident cannot reproduce: `check_lake_toolchain.sh`
  (monorepo variant) fails the build rather than answering the wrong binary.

## Actionable Levers
1. Author root `lean-toolchain` + package delta notes.
2. Add `toolchain-plane` cross-pin re-elaboration job (ids, ls, examples).
3. Add the skeleton guard to the Foundry gate chain and to LexLean CI
   (optional, as a `just` recipe that does not alter §8.2 refusal semantics).
4. Update the Foundry ADR ledger (`docs/adr/README.md`) with the
   `toolchain-plane` evidence column.

## Links
- LexLean: `SPEC.md` §8.2, §22.5; `README.md:9`; `CONFORMANCE.md` (`CF-14`)
- Foundry: `lean-toolchain`, `ADR/README.md`,
  `scripts/check_lake_toolchain.sh`, `docs/adr/ADR-0119.md`
- Incident: this session's PATH-shadowing fix (`~/.local/bin` symlinks → 4.34)
- Loop index: `docs/adr/proposed/ADR-Plan-LexLean-Phase-Mirror-Loop.md`