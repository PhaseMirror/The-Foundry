# ADR-RML-163: `verify_resonance_buffer` disposition and dead dependency removal

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/src/lib.rs:4-25`
- Verdict signature: `2266bc1ff7d6a087`

## Context and Problem Statement

ADR-003 L20 states: "`phase_mirror_wasm` — `verify_resonance_buffer` and
`run_gik_diagnostic` exposed via `wasm_bindgen`." Half of that sentence is true.
`run_gik_diagnostic` exists at `src/lib.rs:28`. `verify_resonance_buffer` does not
exist as a binding at all.

```rust
// src/lib.rs:4-6
// #[path = "../../rust/src/l0_verification_gate.rs"]
// pub mod l0_verification_gate;
// use l0_verification_gate::{L0VerificationGate, ResonanceBufferState};

// src/lib.rs:15-25
/*
#[wasm_bindgen]
pub fn verify_resonance_buffer(
    state_json: &str,
    expected_schema_hash: &str,
    required_permission_bits: u32,
) -> String {
    // Stubbed out to allow compilation of UnifiedWitnessWasm
    "".to_string()
}
*/
```

Three separate problems.

### The stub would return an empty string

The body is `"".to_string()`. It is not a placeholder for a partial implementation.
Even if the module import resolved, the exported function would return the empty
string for every input, including for a state that fails L0. A consumer cannot
distinguish "verification passed" from "verification is not implemented" from
"verification threw", because all three produce `""`. The signature also promises a
`String` while `VerifyResponse` at `src/lib.rs:8-13` sits unused beside it, so the
intended return type is unclear from the code.

The compiler already reports the dead type:

```
warning: struct `VerifyResponse` is never constructed
 --> src/lib.rs:9:8
```

### The commented import cannot be restored

`#[path = "../../rust/src/l0_verification_gate.rs"]` at `src/lib.rs:4` resolves
relative to `src/lib.rs`, giving
`packages/PhaseMirror/phase_mirror_wasm/src/../../rust/src/l0_verification_gate.rs`,
that is `packages/PhaseMirror/rust/src/l0_verification_gate.rs`.

That path does not exist. The only two copies of the file in the monorepo are
`packages/The-Foundry/packages/rust/atlas/src/l0_verification_gate.rs` and
`packages/uor-foundry-main/packages/rust/atlas/src/l0_verification_gate.rs`, both in
different package trees.

The comment reads as a reversible state. It is not. Un-commenting lines 4-6 is a
hard compile error, and the path it names was never valid. A future maintainer
reading `// Stubbed out to allow compilation` would reasonably assume there is a
restore path. There is not.

### The intended function has no home in this crate

`L0VerificationGate` and `ResonanceBufferState` are governance-kernel types that
belong with the L0 invariants in `phase-mirror/src/l0_invariants.rs`, not in a
WASM presentation crate that has no dependency on `phase-mirror` and no L0
predicate of its own. The stub was removed from the wrong crate. Per ADR-RML-160
this crate's only decision function is `evaluate_seal`, which implements a
different, caller-bounded check.

## Considered Options

### Option 1: Delete the stub, dead type, and broken import
Remove `src/lib.rs:4-6` and `src/lib.rs:8-25` outright. The crate's public surface
becomes `run_gik_diagnostic` and `UnifiedWitnessWasm`, which is what actually
exists.
- Pros: Eliminates the false claim, the `dead_code` warning, and the misleading
  restore hint. Makes `cargo check` clean.
- Cons: Removes a name that ADR-003 L20 and ADR-RML-010 both cite. Any consumer
  calling it is already receiving `""`, so there is no working caller to break.

### Option 2: Implement it properly by depending on `phase-mirror`
Add a dependency on `phase-mirror`, call `check_l0_invariants`, and return a
`VerifyResponse` serialized as JSON.
- Pros: Makes ADR-003 L20 true. Puts the L0 check on the browser surface, which is
  where ADR-003 L215 says it should run.
- Cons: L0 is currently unpassable per ADR-RML-159. Shipping a WASM binding to a
  gate that cannot pass would put a second broken surface in front of users. Blocked
  on RML-159, and it would also be blocked on `phase-mirror` being
  `no_std`-incompatible for the WASM target until that is checked.

### Option 3: Return `Result` and make absence of implementation explicit
- Pros: Makes the unimplemented case observable.
- Cons: Preserves a function with no implementation. Adds surface area to ship a
  name that does nothing.

## Decision Outcome

Option 1 now, Option 2 deferred and explicitly sequenced after ADR-RML-159.

1. Delete `src/lib.rs:4-6` (the broken `#[path]` block) and `src/lib.rs:8-25`
   (`VerifyResponse` and the commented stub).
2. Amend ADR-003 L20 to state that `verify_resonance_buffer` is not implemented and
   is not part of the accepted surface, so the automated mirror stops counting it
   as a claim to be satisfied. A claim that is explicitly withdrawn is resolved;
   a claim that is silently absent keeps generating DOC_STALE rows in the RML ledger.
3. Record in the ADR-003 amendment that re-adding the function requires RML-159 to
   land first, so nobody restores a binding to an unpassable gate.
4. Remove the three unused dependencies from `Cargo.toml`:
   - `anyhow = "1.0.102"`, 0 uses
   - `uuid = { version = "1.3", features = ["v4", "js"] }`, 0 uses. This pulls
     `getrandom` and `js-sys` into the WASM binary for nothing.
   - `js-sys = "0.3"`, 0 uses directly and now reachable only through `uuid`.

   Against the 2 MiB budget in ADR-003 L321 this is unmeasured savings, but it is
   strictly positive and the measurement will finally happen in ADR-RML-166.

`chrono` is retained here and handled in ADR-RML-165, because it is used, at
`src/lib.rs:175`, and the question is whether that use is correct rather than
whether it exists.

## Consequences

### Positive
- The crate's advertised surface equals its actual surface.
- `cargo check` and `cargo check --target wasm32-unknown-unknown` both become
  warning-free.
- The ADR-003 claim count drops by a claim that was never satisfiable.
- Three dependencies leave the WASM binary.

### Negative
- The RML ledger grows a row marking `verify_resonance_buffer` withdrawn, which is
  noise if the withdrawal is not read as a resolution. That is the cost of keeping
  the mirror honest about intent versus reality.
- Removing `uuid` is a real constraint on future work: `ArchivumEvent::new` in
  `phase-mirror-surface` generates ids with `uuid`, so any future code in this
  crate that constructs an event will need the dependency back. It should be
  re-added at the point of use, not retained pre-emptively.

### Verification Strategy
`cargo check --all-targets` and `cargo check --target wasm32-unknown-unknown` both
emit zero warnings. `cargo tree` no longer lists `anyhow`, `uuid`, or `getrandom` for
this package. `grep -n "verify_resonance_buffer" -r packages/` returns only the
ADR records, no Rust.

## Links
- Index: `ADR-RML-158.md` (dissonance D1, D2, D17)
- Claim: `Governance/ADR/accepted/ADR-003-sovereign-stack-implementation.md:20`
- Real gate file location: `packages/The-Foundry/packages/rust/atlas/src/l0_verification_gate.rs`
- Blocked on: `ADR-RML-159.md`
- Also: `ADR-RML-164.md` (why this crate is the wrong home for an L0 gate)
