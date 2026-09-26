# ADR-RML-161: `ContractivityReceipt` is fragmented and its proof binding is severed at the source

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: `ContractivityReceipt`, 12 definitions across the monorepo
- Verdict signature: `d6328855ea923021`

## Context and Problem Statement

ADR-003 L32 states: "All components share a single `ContractivityReceipt` envelope
format and a common `ArchivumEvent` schema." ADR-003 L298-311 then specifies the
envelope as the carrier for proof binding, listing `proof_hash` and
`lean_manifest_hash` as required fields.

Both statements are false.

### Twelve definitions, three incompatible shapes

`grep -rn "struct ContractivityReceipt"` returns 12 sites. Within
`packages/PhaseMirror` alone:

| Definition | Fields | Notes |
|------------|--------|-------|
| `phase-mirror-surface/src/lib.rs:61` | status, witness_id, lambda_trace, proof_hash, lean_manifest_hash, surface, archivum_log, triple_lock_phase | The ADR-003 shape. camelCase |
| `phase-mirror-mcp/src/lib.rs:46` | status, witness_id, lambda_trace | 3 fields. No `surface`, no `proof_hash`, no `triple_lock_phase` |
| `phase-mirror-mcp/vendor/pirtm-candle/src/lib.rs:39` | status, witness_id, lambda_trace | Byte-identical to the above |
| `phase-mirror-mcp/src/lmstudio/tools.rs:347` | _status, witness_id | Not `Serialize`. Cannot cross a wire boundary |

Plus `PIRTM/rust/pirtm-parser/src/ast.rs:15`, `The-Foundry/.../zm_binding.rs:12`,
`uor-foundry-main/.../zm_binding.rs:12`, `The-Foundry/.../pirtm-parser/src/ast.rs:15`,
`The-Foundry/.../pirtm-candle/src/lib.rs:41`, and two vendored copies.

The fragmentation is not merely redundant. A receipt deserialized by
`archivum-local-first` requires 8 fields; one produced by `phase-mirror-mcp` supplies
3. Any consumer that accepts an opaque `receipt_json` string, which is exactly what
`archivum-local-first` does at `src/lib.rs:56`, will sign and append a 3-field object
into an append-only Ed25519-signed log while the type system says nothing.

The `lmstudio` variant is worse. It is not `Serialize`, and its builder at
`src/lmstudio/tools.rs:353` sets `witness_id` to a constant all-zero digest:

```rust
witness_id: format!("sha256:{}", hex::encode([0u8; 32])),
```

`sha256:0000...0000` is not a hash of anything. It is a shape that satisfies the
`sha256:<64-hex>` format check in ADR-003 L299 while binding to no content.

### The canonical constructor cannot populate the proof binding

```rust
// phase-mirror-surface/src/lib.rs:89-90 and 106-107
proof_hash: String::new(),
lean_manifest_hash: String::new(),
```

Both `ContractivityReceipt::ok` and `::blocked` hardcode these two fields to empty
strings. These are the only two constructors. The struct has no builder and no
other initializer. Therefore every `ContractivityReceipt` that exists anywhere in
the stack carries an empty proof binding, and there is no code path that can
produce one that does not.

ADR-003 L300-301 declares these fields as `LEAN_PROOF_HASH_108_CORE` and
`<lake-manifest.json sha256>`. The type makes both values impossible to supply.

The failure is silent. There is no error, no `Option`, no type-level signal. The
receipt is well-formed, serializes, signs, and appends. The chain of custody from a
Lean proof to a stored receipt is broken at its first link, and ADR-003 L289 names
this precise hazard as "Lean proof drift the desktop build will not catch", then
provides no mechanism that could catch it.

## Considered Options

### Option 1: One canonical type, proof binding mandatory
Delete the 11 other definitions, re-export `phase_mirror_surface::ContractivityReceipt`
everywhere, and change `proof_hash` and `lean_manifest_hash` from `String` to a
non-empty newtype whose constructor rejects empty input. `ok` and `blocked` take the
proof binding as required parameters.
- Pros: Makes fragmentation and a severed binding both unrepresentable. The type
  system starts enforcing the ADR-003 claim. One place to change the schema.
- Cons: Touches five packages including two vendored trees. `ok` and `blocked` are
  called at 5 sites in `archivum-local-first` and 2 in `phase-mirror-edge`, each of
  which must now supply a proof hash it does not currently have.

### Option 2: Keep the types, add a conformance test
Leave all 12 definitions and add a test asserting field-for-field agreement.
- Pros: Cheap. No call-site churn.
- Cons: A test that asserts twelve types agree is a test that will be deleted or
  skipped the first time one of them needs to change, and it does not stop a
  consumer from passing a 3-field object where an 8-field one is expected. It also
  cannot make `proof_hash` non-empty. Treats the symptom.

### Option 3: One canonical type, proof binding optional for now
Consolidate to one type but keep `proof_hash: String` and permit empty.
- Pros: Consolidates the schema without breaking call sites.
- Cons: Ships the severed proof binding permanently while making it look resolved.
  This is the same defect with a smaller diff, and it is the option most likely to
  be chosen by accident. Rejected.

## Decision Outcome

Option 1. Ordered clauses:

1. `phase-mirror-surface` owns the sole definition. Every other site deletes its
   local struct and re-exports. Vendored trees are patched to re-export rather than
   fork.
2. `proof_hash` and `lean_manifest_hash` become a `ProofBinding` newtype that
   validates on construction: non-empty, and for the Lean hash, 64 lowercase hex
   characters. An empty binding is a compile error at the call site, not a runtime
   surprise.
3. `ok` and `blocked` take `ProofBinding` as a required argument.
4. `archivum-local-first::append` refuses to sign and append a receipt whose proof
   binding is unpopulated, as defence in depth for any path that bypasses the
   constructor.
5. `lmstudio/tools.rs`'s constant all-zero `witness_id` is replaced with an actual
   digest over the receipt content, and its local `ContractivityReceipt` is deleted.
6. A schema-version field is added to the envelope so a future shape change is
   detectable by consumers rather than silently mis-parsed.

Clause 6 is what makes the consolidation durable. Without a version tag, the next
divergence is as undetectable as this one.

## Consequences

### Positive
- The ADR-003 L32 claim becomes true and is now enforced by the compiler.
- A receipt in the append-only log can no longer assert an empty proof binding.
- A `sha256:`-prefixed witness id must be a digest of something, closing the
  `lmstudio` placeholder.

### Negative
- Five packages change, two of them vendored. Vendored patches are a recurring
  maintenance cost and are the usual reason this consolidation gets deferred.
- The 7 call sites of `ok`/`blocked` must now obtain a real Lean proof hash and a
  real `lake-manifest.json` digest. Until `ADR-RML-166` lands there is no job that
  produces those, so this ADR is blocked on that one. Sequencing in ADR-RML-158
  places RML-166 first for this reason.
- `phase-mirror-edge` is `no_std` and gates `phase-mirror-surface` behind an
  optional feature at `Cargo.toml:13`. It currently builds its own
  `EdgeContractivityReceipt` at `src/lib.rs:52` precisely because the canonical type
  is unavailable to it. Clause 1 must either enable that feature for the edge target
  or record a deliberate, documented divergence with a conformance test.

### Verification Strategy
A repo-wide test that greps for `struct ContractivityReceipt` and asserts exactly
one definition outside `vendor/`. A round-trip test that constructs a receipt,
serializes it, and deserializes it through `archivum-local-first`, asserting
`proof_hash` is non-empty and parses as hex. A negative test asserting
`ProofBinding::new("")` and `ProofBinding::new("nothex")` fail to construct.

## Links
- Index: `ADR-RML-158.md` (dissonance D5, D6)
- Claim source: `Governance/ADR/accepted/ADR-003-sovereign-stack-implementation.md:32`, `:298-311`
- Canonical type: `packages/PhaseMirror/phase-mirror-surface/src/lib.rs:61-113`
- Consumer that hides the mismatch: `packages/PhaseMirror/archivum-local-first/src/lib.rs:56`
- Placeholder witness: `packages/PhaseMirror/phase-mirror-mcp/src/lmstudio/tools.rs:347-357`
- Blocked on: `ADR-RML-166.md`
