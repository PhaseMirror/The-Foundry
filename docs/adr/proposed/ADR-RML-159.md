# ADR-RML-159: The L0 gate is unpassable by any legitimate input

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: `packages/PhaseMirror/phase-mirror/src/l0_invariants.rs`
- Five copies of the kernel were found, each carrying the same defect independently:
  - `packages/PhaseMirror/phase-mirror/src/l0_invariants.rs`
  - `packages/PhaseMirror/phase-mirror-agency/agents/ataraxia/crates/phase-mirror/src/l0_invariants.rs`
  - `packages/PhaseMirror/the-commander/crates/phase-mirror/src/l0_invariants.rs`
  - `packages/The-Foundry/packages/rust/phase_mirror/src/l0_invariants.rs`
  - `packages/uor-foundry-main/packages/rust/phase_mirror/src/l0_invariants.rs`
- A sixth, divergent restatement of the same predicates lives in
  `packages/PhaseMirror/phase-mirror-mcp/src/tools/verify_ledger.rs:66`. It defines
  its own `PhaseMirrorState` rather than importing the kernel, so it is not a copy
  but a reimplementation of the same gate.
- Verdict signature: `827907f7211da7fc`

### Note on the two Foundry copies

`packages/The-Foundry/packages/rust/phase_mirror` and
`packages/uor-foundry-main/packages/rust/phase_mirror` are not members of the
PhaseMirror workspace and belong to a different crate family (an axum/websocket
agent). In both, `l0_invariants.rs` was present but never declared as a module, so
the kernel did not compile and its tests never ran; the defect was inert there.
Both now declare `pub mod l0_invariants;` so the module compiles and is covered.
Neither crate can currently be built: both manifests omit dependencies their own
`lib.rs` imports (`ed25519_dalek`, `lean_sdk`, `hex`). That is a pre-existing
breakage unrelated to this fix, and the kernel was verified in isolation against
each copy instead.

## Context and Problem Statement

`check_l0_invariants` is the L0 kernel. ADR-003 L18 names it the existing
invariant layer, ADR-003 L150 describes the ESP32 port as implementing "the same
logical predicates as `phase-mirror/src/l0_invariants.rs`", and ADR-003 L170
makes it the input type of the `L0Check` trait that is supposed to bind desktop,
WASM, and bare-metal together. It is the foundation of the stack.

Two of its five predicates are unsatisfiable by correct input. They are verified by
direct reproduction of the constant and the comparison.

### The schema hash is not a hexadecimal string

```rust
// l0_invariants.rs:33
const EXPECTED_SCHEMA_HASH: &str = "f7a8b9c0d1e2f3g4";
```

SHA-256 renders as hex over `[0-9a-f]`. The character `g` is not in that alphabet,
so no digest of any input can equal this value. The predicate
`state.schema_hash == EXPECTED_SCHEMA_HASH` is therefore true only when the caller
supplies the literal placeholder string. Reproduced:

```
A REAL sha256 hex can ever equal EXPECTED_SCHEMA_HASH? false
```

The check that is supposed to bind a state object to a schema is satisfied by
echoing a constant. It provides no binding at all.

### The witness bound is the exact value the formal layer forbids

```rust
// l0_invariants.rs:35
const CONTRACTION_WITNESS_THRESHOLD: f64 = 1.0;
// l0_invariants.rs:59
let witness_valid = state.contraction_witness_score.map_or(true, |s| s == CONTRACTION_WITNESS_THRESHOLD);
```

The governing invariant in Lean is strict contraction. `PIRTM/lean/prime_tensors/CPIRTM.lean:20`
defines `IsContractive` as non-expansiveness on a discrete prime-index metric, and
`PIRTM/rust/pirtm-clinical/lean-harness/Math/Lipschitz.lean:12` defines it as
`κ < 1 ∧ ∀ x y, dist (f x) (f y) ≤ κ * dist x y`. Both exclude `κ = 1`.

The L0 kernel accepts only `κ = 1.0`, by exact float equality. Reproduced:

```
witness_valid(0.95)  = false
witness_valid(0.999) = false
witness_valid(1.00)  = true
```

Every genuinely contractive score fails. The unique accepted score is the
boundary value the formal layer rejects as non-contractive.

### Combined effect

A caller must supply a non-hex placeholder hash and a formally-forbidden witness
score to reach `passed: true`. Every other consumer inherits this. `verify_ledger.rs:66`
carries the same constant and the same threshold, so the MCP `verify_ledger`
governance tool applies the identical vacuous check.

Note the third predicate is also fragile in the same way: `age >= 0` rejects
clock skew, and `NONCE_LIFETIME_MS` is compared against an unchecked
`issued_at`, so a far-future nonce passes freshness. That one is a lesser defect
but belongs in the same fix.

## Considered Options

### Option 1: Replace the constant with a real digest and the equality with a bound
Replace `EXPECTED_SCHEMA_HASH` with the actual SHA-256 of the canonical schema
document, and make it configurable per-deployment rather than compile-time
constant. Replace `== 1.0` with `< 1.0` and a non-zero lower bound.
- Pros: Restores the intended semantics. Makes the kernel falsifiable.
- Cons: The digest must be derived from a real artifact, which is a decision about
  which artifact. Tightening the bound will surface existing callers that were
  relying on the vacuous pass.

### Option 2: Make the thresholds configuration, defaulting to the current values
- Pros: No behaviour change on deploy.
- Cons: Ships a known-vacuous default as the shipped default. Preserves the defect
  and makes it configurable, which is strictly worse than either fixing or removing it.

### Option 3: Remove the witness predicate from L0 and delegate to the formal layer
- Pros: Avoids restating a Lean invariant in Rust.
- Cons: L0 then has no contractivity check at all, and ADR-003 L157's proof-hash
  parity job does not exist to take over. Not acceptable on its own.

## Decision Outcome

Option 1. Specifically:

1. The compile-time `EXPECTED_SCHEMA_HASH` constant is removed. The expected digest
   becomes a field of a new `L0Policy` value supplied by the caller at the point of
   verification, on the principle that the authoritative digest is a deployment
   property rather than a property of the source tree.
   - `check_l0_invariants` gains the signature
     `check_l0_invariants(state: &State, policy: &L0Policy, now_ms: Option<i64>)`.
   - `L0Policy::default()` carries an **empty** `expected_schema_hash`, so the
     default policy is rejected by `L0Policy::validate`. A caller cannot obtain
     `passed: true` without naming a real digest. The gate fails closed.
   - `L0Policy::validate` requires the digest to be 64 lowercase hex characters,
     optionally prefixed with `sha256:`. A placeholder such as
     `f7a8b9c0d1e2f3g4` is rejected as malformed before any comparison happens.
   - The comparison is made against the normalized digest, so `sha256:<hex>` and
     bare `<hex>` are equivalent inputs rather than a silent mismatch.
2. `CONTRACTION_WITNESS_THRESHOLD` is replaced by an interval predicate
   `0.0 < score < policy.contraction_witness_exclusive_max`. Exact float equality
   on a boundary is not a check. The exclusive maximum is itself validated to lie
   in `(0.0, 1.0]`, matching the Lean `κ < 1 ∧ κ > 0` invariant; `1.0` is the
   strictest legal exclusive bound and any score strictly below it is contractive.
   A `None` witness now fails closed instead of passing via `map_or(true, ..)`.
3. Nonce freshness gains an upper bound on future skew of
   `MAX_FUTURE_SKEW_MS` (60 s), and `issued_at` is range-checked so that a
   far-future nonce no longer passes freshness.
4. The same edits are applied to all four duplicated copies, byte-identical. A
   shared constant module is preferred; four hand-maintained copies is the mechanism
   that let this drift. Until that module exists, the five copies are verified
   identical by content hash.

### Build-time sourcing is deferred, not rejected

An earlier draft of this ADR specified a build-time digest input with a
`compile_error!` guard, on the reasoning that a malformed digest must fail the
build rather than the runtime. That is stronger than the present decision and is
recorded here as the intended follow-up, not as current behaviour:

- It requires choosing the canonical schema artifact to hash, and no such artifact
  has been agreed. Hashing an arbitrary file would merely replace one unjustified
  constant with another.
- The digest is deployment-specific. A build-time constant would hardcode one
  deployment's value into every artifact built from the tree.
- Until it exists, the runtime guard is the load-bearing one: an unset or malformed
  digest yields `passed: false` with a `schema_hash` violation, never a silent pass.

When the canonical artifact is named, add the `compile_error!` guard as a second
layer and keep the runtime validation.

This is a breaking change for any caller currently passing `passed: true`. That is
the correct outcome. Those callers are passing today with a placeholder hash and a
forbidden score.

## Consequences

### Positive
- The L0 kernel becomes falsifiable. A test can now fail.
- The Rust predicate and the Lean `κ < 1` invariant stop contradicting each other.
- The placeholder digest class of bug is unrepresentable at the call boundary: no
  digest, a malformed digest, or the default policy all fail closed.
- The breaking change is forced at compile time for in-crate callers, since
  `L0Check::Input` changes from `State` to `(State, L0Policy)`.

### Negative
- Unknown number of callers currently depend on the vacuous pass. They will begin
  failing. This is a visible, intended failure.
- `phase-mirror/src/l0_invariants.rs:73-80` will emit a `schema_hash` violation
  where it previously emitted one silently. Log volume and UI badges will change.
- A caller that wants a passing verdict must now carry a policy. There is no
  zero-configuration path, by design.
- The five copies remain hand-maintained. Byte-identity is enforced by review and
  by content hash, not by the type system, until a shared module replaces them.
- ADR-003's `esp32-lean-check` parity job does not exist, so parity with
  `phase-mirror-edge/src/l0_edge.rs` cannot be asserted. See ADR-RML-166.

### Verification Strategy
Unit tests in each copy assert that a well-formed state under a valid policy passes,
and that each of the following is rejected: a non-hex schema hash, the historical
`f7a8b9c0d1e2f3g4` placeholder, the default policy, a witness score of exactly 1.0,
a witness score of 0.0, a `None` witness, a future-dated nonce beyond the skew bound,
and an exclusive-max bound above 1.0. The last six must fail before this ADR is
applied and pass after.

## Links
- Index: `ADR-RML-158.md` (dissonance D7, D8)
- Formal invariant: `packages/PIRTM/lean/prime_tensors/CPIRTM.lean:20`, `packages/PIRTM/rust/pirtm-clinical/lean-harness/Math/Lipschitz.lean:12`
- Duplicated constant: `phase-mirror-mcp/src/tools/verify_ledger.rs:66`
- Predicate conflict: `ADR-RML-160.md`
