# ADR-RML-164: The crate is not a binding layer — `cdylib`-only and unwired from `L0Check`

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/Cargo.toml`, `ADR-003:26`, `:64-66`, `:115`, `:183`, `:283`
- Verdict signature: `f5153f973d72b8d1`

## Context and Problem Statement

ADR-003 L26 identifies the gap this crate exists to fill: "What is missing is the
**binding layer** that makes these components consumable by extension surfaces and
bare-metal targets."

The crate is that binding layer. It cannot bind.

### `crate-type = ["cdylib"]` means no crate can link it

```toml
# Cargo.toml
[lib]
crate-type = ["cdylib"]
```

A `cdylib` is a standalone dynamic library. It emits no `rlib`, so Cargo has no
artifact to link when another crate declares a path dependency on it. Verified
across the monorepo: no `Cargo.toml` anywhere declares `phase_mirror_wasm` as a
dependency.

The consequence for ADR-003 L115, that the extension host "receives pre-computed
`ContractivityReceipt` JSON from `phase_mirror_wasm`", is that no code path exists
by which it could. `phase-mirror-extension-host/Cargo.toml` depends only on
`phase-mirror-surface`, `serde`, `serde_json`, `thiserror`, and `uuid`. The two
crates that ADR-003 draws as adjacent in its component graph, at lines 63-67, do not
reference each other.

The only consumer is `packages/Agency/agency-server/wasm-pkg/package.json`, which is
a file-copy consumer of pre-built `wasm-pack` output. That is a publish boundary,
not a binding layer. The governance logic reaches the browser by being compiled into
a binary that a separate process copies, with no compile-time relationship to the
code that consumes it and therefore no compile-time enforcement of the contract
between them.

### `L0Check` is not implemented, and the crate cannot implement it

ADR-003 L183 states: "**New `phase_mirror_wasm`** wrapper implements `L0Check` for
`JsValue -> JsValue`." The trait is defined at
`phase-mirror-surface/src/lib.rs:165`:

```rust
pub trait L0Check {
    type Input;
    type Output;
    fn check(state: Self::Input) -> Self::Output;
}
```

The crate has no implementation and no dependency on `phase-mirror-surface`, so it
cannot have one. Its dependencies are `wasm-bindgen`, `serde`, `serde_json`, `uuid`,
`anyhow`, `chrono`, and `js-sys`.

ADR-003 L283 assigns this trait a specific enforcement role: "the `L0Check` trait
ensures any new L0 predicate must be implemented for all three targets or the build
fails." For the WASM target the build cannot fail on L0 drift, because the WASM
target is not connected to the trait at all. The cross-target parity property that
ADR-003 L157 and L323 depend on, a Lean proof hash matched against
`l0_edge.rs` and the desktop kernel, has no WASM leg.

There is a further shape problem. `L0Check::check` is an associated function with no
`self`. Implementing it for `JsValue -> JsValue` as ADR-003 L183 specifies would
require the whole check to be a pure function of its input, with no access to a
configured bound, a schema hash, or a clock. `evaluate_seal` needs all three. The
trait as written cannot express the WASM surface's actual job.

## Considered Options

### Option 1: Add `rlib`, depend on `phase-mirror-surface`, implement `L0Check`
```toml
crate-type = ["cdylib", "rlib"]
```
plus a `phase-mirror-surface` path dependency, and an adapter type implementing
`L0Check` over the WASM boundary.
- Pros: Makes ADR-003 L115 a real code path. Makes the parity claim in ADR-003 L283
  enforceable for the third target. Enables compile-time contract checking between
  the gate and its consumers.
- Cons: `rlib` plus `cdylib` doubles compile output for a target with a 2 MiB
  budget. The `JsValue -> JsValue` signature in ADR-003 L183 does not fit
  `evaluate_seal`'s needs.

### Option 2: Keep `cdylib` and correct ADR-003 to describe a publish boundary
Rewrite L115 and L183 to state that `phase_mirror_wasm` is a standalone WASM
artifact consumed by file copy, with the contract enforced by a schema conformance
test rather than by the compiler.
- Pros: Describes what the code actually does. Zero build changes.
- Cons: Gives up the compile-time contract that ADR-003 L283 names as the mechanism
  preventing desktop feature creep from leaving ESP32 behind. The conformance test
  is exactly the kind of check that decays; there is no CI to run it.

### Option 3: Extract the governance core into an `rlib` and make the WASM crate a thin shell
Move the receipt construction, the contractivity predicate, and the envelope mapping
into a shared `rlib`; leave `phase_mirror_wasm` with only the `wasm_bindgen` layer.
- Pros: The contractivity logic becomes testable natively without a WASM toolchain,
  which also unblocks ADR-RML-166's test requirement. The WASM crate becomes
  genuinely thin.
- Cons: Largest change. Touches the crate identity that ADR-003 L64 and the
  `agency-server` publish path are named after.

## Decision Outcome

Option 3, with Option 1's `crate-type` change applied to the extracted library.

1. Extract the governance core into a new `rlib` crate, `phase-mirror-governance-core`,
   owning: the contractivity predicate (unified per ADR-RML-160), `ContractivityReceipt`
   construction (per ADR-RML-161 and ADR-RML-162), and the seal decision. It has no
   `wasm-bindgen` dependency and is testable on `x86_64-unknown-linux-gnu`.
2. `phase_mirror_wasm` becomes a thin `cdylib` shell holding only the
   `#[wasm_bindgen]` exports and the JS value marshalling. Its logic becomes a
   one-line delegation per export.
3. `L0Check` is implemented once, in the core crate, over a surface-neutral input
   type, and both `phase-mirror` and `phase_mirror_wasm` delegate to that single
   implementation. The `JsValue -> JsValue` signature in ADR-003 L183 is withdrawn as
   unimplementable against the trait's shape, and the ADR is amended to record the
   actual signature.
4. ADR-003 L283's parity claim is restated to cover the two targets that are actually
   wired, and the WASM leg is added when a CI job exists to enforce it
   (ADR-RML-166).

Clause 3 deliberately does not paper over the trait shape problem. Restating the
claim honestly is better than implementing `L0Check` as a vacuous passthrough to
satisfy a line in an ADR.

## Consequences

### Positive
- ADR-003 L115 becomes a code path rather than an aspiration.
- The governance logic becomes unit-testable on a native target, which is the
  prerequisite for the test requirement in ADR-RML-166.
- One contractivity implementation, one receipt type, three surfaces, enforced by
  the compiler.
- The `cdylib` output stays small, because the heavy logic compiles once into the
  core and is inlined into the single consumer artifact.

### Negative
- A new package in a tree that already has eleven `phase-mirror-*` directories.
  The proliferation is a real cost and ADR-003 L280 already flags it.
- The `agency-server/wasm-pkg` publish path builds by crate name. Renaming or
  splitting changes what `wasm-pack` emits, so the artifact names in
  `wasm-pkg/package.json` must be updated in the same change. Coordinate with
  ADR-RML-167.
- `phase-mirror-surface` is not `no_std`, so the core crate is unavailable to
  `phase-mirror-edge` as written. That is the same constraint ADR-RML-161 clause 4
  runs into, and the same resolution applies: either make the core `no_std`-capable
  or record a tested divergence for the edge target.

### Verification Strategy
`cargo test -p phase-mirror-governance-core` runs the contractivity, veto, bound, and
envelope tests natively with no WASM toolchain. A compile-fail test asserts that a
surface omitting the `L0Check` impl does not build, so ADR-003 L283's enforcement
claim becomes testable. `cargo tree` shows no `wasm-bindgen` under
`phase-mirror-governance-core`.

## Links
- Index: `ADR-RML-158.md` (dissonance D3, D11)
- Claim: `Governance/ADR/accepted/ADR-003-sovereign-stack-implementation.md:26`, `:64-66`, `:115`, `:183`, `:283`
- Trait: `packages/PhaseMirror/phase-mirror-surface/src/lib.rs:162-169`
- Publish boundary: `packages/Agency/agency-server/wasm-pkg/package.json`
- Prerequisites: `ADR-RML-160.md`, `ADR-RML-161.md`, `ADR-RML-162.md`
