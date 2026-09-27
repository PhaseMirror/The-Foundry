# ADR-RML-162: `evaluate_seal` must emit the canonical envelope, not an ad-hoc event

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/src/lib.rs:157-179`
- Verdict signature: `d6328855ea923021`

## Context and Problem Statement

ADR-003 L115 states the binding contract: "The extension-host must never call into
`phase-mirror-client` crypto directly in the WASM target. Instead, it receives
pre-computed `ContractivityReceipt` JSON from `phase_mirror_wasm` and stores /
transmits it."

`evaluate_seal` is the only function in the crate that produces anything
resembling a receipt. It does not produce a `ContractivityReceipt`.

```rust
// src/lib.rs:169-176
let event = serde_json::json!({
    "stepId": step_id,
    "hash": self.witness_id.clone(),
    "status": status,
    "slopeUb": self.contractivity_score,
    "reason": reason,
    "timestamp": chrono::Utc::now().timestamp_millis()
});
```

Field-by-field against the envelope declared in ADR-003 L298-311 and defined at
`phase-mirror-surface/src/lib.rs:61-70`:

| Declared field | Present | Note |
|----------------|---------|------|
| `status` | yes | |
| `witness_id` | renamed | emitted as `hash`; no `sha256:` prefix validation |
| `lambda_trace` | degraded | a bare scalar `slopeUb`; no `lambda_p`, no `l_p`, no `zero_spacings` |
| `proof_hash` | absent | |
| `lean_manifest_hash` | absent | |
| `surface` | absent | |
| `archivum_log` | absent | |
| `triple_lock_phase` | absent | |
| — | extra | `stepId`, `reason`, `timestamp` are undeclared |

Six of eight declared fields are missing and one is renamed. The function's own doc
comment at `src/lib.rs:158` says it returns "a stringified `TelemetryEvent`", and no
`TelemetryEvent` type exists anywhere in the crate. The comment describes a type
that was never written.

This matters because of what consumes the output. `archivum-local-first::append`
takes `receipt: &ContractivityReceipt` and a separate signature, and stores
`receipt_json` as an opaque string. `phase-mirror-extension-host` stores
`ContractivityReceipt` values. Neither can distinguish "a real receipt" from "an
event object with six fields missing" at the point of persistence. Per ADR-RML-161
the mismatch is invisible at the type boundary and permanent once signed and
appended.

ADR-003 L281 anticipates a WASM size problem and proposes lazy-loading. The actual
problem is different and worse: the object being persisted is not the declared
type, and no size budget would surface it.

## Considered Options

### Option 1: Return a real `ContractivityReceipt`
Add a dependency on `phase-mirror-surface` and have `evaluate_seal` return the
canonical envelope, populating `surface`, `triple_lock_phase`, and the
`lambda_trace`, and taking the proof binding and archivum tail as inputs.
- Pros: Makes ADR-003 L115 true. The object that reaches `archivum-local-first` is
  the declared type, so a deserialization failure becomes a loud error instead of a
  silent archival defect.
- Cons: The surface cannot itself compute a `proof_hash` or an `archivum_log` tail;
  those come from the Lean plane and the local log respectively. The signature must
  grow to accept them, or the crate must be given access to both. Blocked on
  ADR-RML-166 and ADR-RML-161.

### Option 2: Declare the event as a distinct, honestly-named type
Keep the current shape but rename it and document that it is a UI projection, not a
receipt.
- Pros: Removes the false claim without a schema migration.
- Cons: Leaves ADR-003 L115 unimplemented. Nothing binds a browser action to a
  proof. A UI projection is genuinely useful and can coexist, but it is not what
  the extension-host stores, so the storage path stays unbound.

### Option 3: Have the extension-host construct the receipt from the event
- Pros: No change to the WASM crate.
- Cons: Directly violates ADR-003 L115, which forbids the extension host from
  performing the computation. Moves trust to the least-verified surface.

## Decision Outcome

Option 1, with Option 2 retained as a separate artifact.

1. `evaluate_seal` gains a dependency on `phase-mirror-surface` and returns
   `ContractivityReceipt`. The existing event object is preserved as a distinct
   `SealProjection` type for the GlassConsole, so the UI keeps its `stepId` /
   `reason` fields and those undeclared fields become an intentional second type
   rather than a malformed receipt.
2. The receipt's `proof_hash` and `lean_manifest_hash` are supplied by the caller
   per ADR-RML-161, since only the Lean plane and the build can produce them.
   `archivum_log` likewise, since only the local log can attest its own tail.
3. `witness_id` is validated against the `sha256:<64-hex>` format at the boundary
   and rejected if it does not conform, rather than being passed through as `hash`.
4. `triple_lock_phase` is set from the seal outcome: `Completed` on `CERTIFIED`,
   `Failed` on `REJECTED`. A `ContractivityReceipt` with `status: "OK"` and
   `triple_lock_phase: "Failed"` is not constructible, which removes a
   contradictory-receipt state the current schema permits.

Clause 4 is why this cannot be a serialization-only change. The phase and the
status have to be bound to each other, and only a typed construction enforces that.

## Consequences

### Positive
- ADR-003 L115 becomes implementable and the extension host receives the declared
  type.
- A governance decision now carries a surface, a lock phase, and a proof binding,
  so a stored receipt is self-describing.
- The GlassConsole projection and the governance receipt stop masquerading as the
  same object.

### Negative
- Exported signature changes. Anything calling `evaluate_seal(max_lipschitz,
  step_id)` must be updated. `agency-server/wasm-pkg` republishes on every
  `wasm-pack build`, so the version bump in ADR-RML-167 lands with this change.
- The crate gains a path dependency on `phase-mirror-surface` and, through it, on
  `thiserror` and `serde`. Bounded against the 2 MiB budget in ADR-003 L321, but
  the budget was never measured because no CI job exists.
- The crate can no longer be constructed to produce a receipt without external
  proof material. Any demo or fixture flow that wants a receipt must now supply
  proof hashes. Intended.

### Verification Strategy
A test asserting that `evaluate_seal` output deserializes into
`phase_mirror_surface::ContractivityReceipt` and that all eight fields are
populated. A negative test asserting a `witness_id` lacking the `sha256:` prefix is
rejected. A property test asserting no accepted receipt has
`status == "OK"` together with `triple_lock_phase != Completed`.

## Links
- Index: `ADR-RML-158.md` (dissonance D4)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/src/lib.rs:157-179`
- Claim: `Governance/ADR/accepted/ADR-003-sovereign-stack-implementation.md:115`, `:298-311`
- Envelope: `packages/PhaseMirror/phase-mirror-surface/src/lib.rs:61-113`
- Prerequisite: `ADR-RML-161.md`
- Related: `ADR-RML-165.md` (determinism of the emitted event)
