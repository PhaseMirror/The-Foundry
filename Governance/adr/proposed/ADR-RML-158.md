# ADR-RML-158: Phase Mirror audit of `phase_mirror_wasm` — dissonance register and lever index

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/` (crate `phase_mirror_wasm` v1.0.0-alpha)
- Claim source: `Governance/ADR/accepted/ADR-003-sovereign-stack-implementation.md` (mtime 2026-07-20)
- 17 dissonances surfaced, 0 GOLDEN
- Verdict signature: `2266bc1ff7d6a087`

## Context

`phase_mirror_wasm` is the declared upstream for the Chromium and VS Code surfaces
(ADR-003 lines 64-66) and the only crate in the stack that both a browser extension
and a VS Code sidecar can link. It is therefore load-bearing for ADR-002's
four-surface sovereignty claim.

This ADR applies the Phase Mirror method from `AGENTS.md` to the crate itself:
reflect the claims without endorsement, name the tensions, and bind each tension
to a small testable action. It is the index. Each dissonance below is resolved by a
sibling RML ADR; no fix is specified here.

The crate builds. `cargo check` and `cargo check --target wasm32-unknown-unknown`
both succeed, emitting one `dead_code` warning. Nothing about the crate fails
loudly. Every dissonance below is a silent failure.

## Dissonance register

| # | Claim | Reality | Severity | Lever |
|---|-------|---------|----------|-------|
| D1 | `verify_resonance_buffer` exposed via `wasm_bindgen` (ADR-003 L20) | Fully commented out at `src/lib.rs:15-25`, stub body returns `""` | Critical | RML-163 |
| D2 | Commented binding is restorable | `#[path]` at `src/lib.rs:4` resolves to `packages/PhaseMirror/rust/src/l0_verification_gate.rs`, which does not exist | High | RML-163 |
| D3 | WASM wrapper implements `L0Check` (ADR-003 L183) | No `L0Check` impl; crate has no dependency on `phase-mirror-surface` where the trait lives | High | RML-164 |
| D4 | Extension-host receives `ContractivityReceipt` JSON from this crate (ADR-003 L115) | `evaluate_seal` emits an ad-hoc `{stepId, hash, status, slopeUb, reason, timestamp}`; 6 of 8 envelope fields absent | Critical | RML-162 |
| D5 | "All components share a single `ContractivityReceipt` envelope format" (ADR-003 L32) | 12 independent definitions across the monorepo, 3+ incompatible shapes | Critical | RML-161 |
| D6 | Receipt carries `proof_hash` and `lean_manifest_hash` (ADR-003 L300-301) | `ContractivityReceipt::ok` and `::blocked` hardcode both to `String::new()`; no other constructor exists | Critical | RML-161 |
| D7 | `IsContractive` invariant is `κ < 1` (Lean, `CPIRTM.lean:20`, `Lipschitz.lean:12`) | `l0_invariants.rs:35,59` requires `contraction_witness_score == 1.0` exactly, the one value the formal layer rejects | Critical | RML-159 |
| D8 | Schema hash is a cryptographic binding | `EXPECTED_SCHEMA_HASH = "f7a8b9c0d1e2f3g4"` at `l0_invariants.rs:33` contains `g`; not valid hex; no digest can equal it | Critical | RML-159 |
| D9 | Witness is governed | `evaluate_seal` ignores `veto_status`; a vetoed witness with score 0.5 at `max_lipschitz = 1.0` returns `CERTIFIED` | Critical | RML-160 |
| D10 | Receipt is anchored to `witness_id` and `archivum_log` | `chrono::Utc::now()` is embedded in the event body at `src/lib.rs:175`; re-evaluation mutates the same witness | High | RML-165 |
| D11 | Crate is a binding layer for extension-host (ADR-003 L26, L115) | `crate-type = ["cdylib"]` only; no `rlib`; no crate in the monorepo depends on it | High | RML-164 |
| D12 | Published artifact identity | Cargo `1.0.0-alpha` vs `wasm-pkg/package.json` `0.1.0`; declared `files` do not exist; hand-maintained | Medium | RML-167 |
| D13 | CI matrix gates the stack (ADR-003 L328-361) | No `.github` directory exists; root workspace member `universal_atomic` is missing so `cargo check --workspace` cannot run | Critical | RML-166 |
| D14 | `wasm-pack test --node` (ADR-003 L345) | Crate has 0 tests, no `[dev-dependencies]`, no `wasm-bindgen-test` | High | RML-166 |
| D15 | `run_gik_diagnostic` is a diagnostic (ADR-003 L20) | Keyword scorer wearing prime-factor formalism; hardcoded `Horizon: Q2`; no dissonance detection; no evidence binding | Medium | RML-168 |
| D16 | Crate ships a `templates/` input (implicit) | `templates/retention_policy.yaml` is an ESI policy owned by `phase-mirror-mcp`; no YAML parser in the dep list; nothing reads it | Low | RML-167 |
| D17 | Dependency set is load-bearing | `anyhow`, `uuid`, `js-sys` declared, 0 uses each, against a 2 MiB budget (ADR-003 L321) | Low | RML-163 |

## Ranked dissonance

Three findings dominate and are not independent of each other.

**The L0 gate cannot be passed by any legitimate input.** D7 and D8 compound. The
schema check demands a value that is not a hexadecimal string, so the only way to
satisfy it is for a caller to echo the placeholder. The witness check demands a
score of exactly 1.0, and every real contractive score is below 1.0 by definition.
A caller must therefore supply a fake hash and a formally-forbidden score to reach
`passed: true`. Verified by direct reproduction of the predicate.

**The proof-binding chain is severed at its source.** D5 and D6 mean the
`ContractivityReceipt` that `archivum-local-first` signs and appends is not the
receipt ADR-003 describes. Its `proof_hash` and `lean_manifest_hash` are empty
strings by construction, and the type is redefined 12 times so no consumer is
forced to notice. ADR-003 L289 names this exact failure mode as "Lean proof drift
the desktop build will not catch", and then leaves it uncatchable.

**Nothing executes.** D13 means every gate in ADR-003 is decorative. The root
workspace cannot even resolve, so `cargo check --workspace` fails before reaching
this crate. D14 means the crate's own two exported surfaces have no test. The
other fourteen dissonances persist undetected for this reason alone.

## Decision (the lever)

Adopt the ten sibling ADRs as the resolution set. Sequencing is by dependency,
not severity:

1. RML-166 first. Until a build gate runs, no other fix is verifiable.
2. RML-159, RML-160, RML-161, RML-162. The correctness and envelope set.
3. RML-163, RML-164, RML-165. Removals and wiring.
4. RML-167, RML-168. Hygiene and claim calibration.

Correct ADR-003 in the same pass. Its "Binding contract" and "Receipt Linkage"
sections are the source of D3, D4, D5, D11, and D13, and they describe an
architecture that was never built. Leaving them as accepted text is what allows
the drift to re-accumulate.

## Consequences

### Positive
- Each dissonance has one owner, one direction, and one verification command.
- The three critical findings are separable from the eleven cosmetic ones, so
  remediation cost is not obscured by volume.

### Negative
- RML-159 requires a decision on the authoritative `IsContractive` predicate that
  the Lean sources do not currently agree on. This audit surfaces the conflict; it
  does not have the standing to resolve it unilaterally.
- D7 and D8 are duplicated in four source trees. Fixing `phase-mirror` alone will
  leave three copies of the same vacuous check live.

### Verification Strategy
Re-run the mirror. A claim is resolved when it flips to GOLDEN. The audit is
reproducible: every finding above cites a `file:line` or a command whose output is
reproducible offline.

## Links
- Claim source: `Governance/ADR/accepted/ADR-003-sovereign-stack-implementation.md`
- Method: `AGENTS.md`
- Prior automated pass: `ADR-RML-010.md` (flagged the same document, DOC_STALE only)
- Resolution set: `ADR-RML-159` through `ADR-RML-168`
