# ADR-RML-165: The sealed event embeds wall-clock time, so it is not reproducible

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/src/lib.rs:175`
- Verdict signature: `9e5e480942da3dc3`

## Context and Problem Statement

ADR-003's receipt linkage, at lines 298-311, anchors every governed action to
`witness_id` and `archivum_log`, the SHA-256 of the local log tail. The intent is
that a receipt identifies one governed action and can be re-derived and checked
later. The merge protocol at ADR-003 L130-133 resolves conflicts by
last-writer-wins on `timestamp_ms` with a witness-hash tie-break.

`evaluate_seal` writes `chrono::Utc::now().timestamp_millis()` directly into the
event body:

```rust
// src/lib.rs:175
"timestamp": chrono::Utc::now().timestamp_millis()
```

Three problems follow.

### The same witness produces different event bodies

`evaluate_seal` is a pure function of `self`, `max_lipschitz`, and `step_id`, except
for this field. Calling it twice on an unchanged witness with identical arguments
yields two different event bodies. A governance seal is therefore not a value and
cannot be compared, cached, deduplicated, or re-derived. Any consumer that
re-evaluates a witness to confirm a prior decision gets a mismatch on `timestamp` and
must special-case it, which is precisely the class of special-casing that makes a
verification scheme untrustworthy.

### It perturbs the merge order the design depends on

Under ADR-003 L131, `timestamp_ms` is the primary merge key. A replay of the same
witness advances its timestamp and can reorder it against a genuinely newer entry
from another surface. Re-running a verification, which should be a read-only act,
changes merge outcomes. ADR-003 L133 requires that conflicts are "never silently
dropped" and both receipts preserved, so the result is a log that grows a new
conflicting entry on every re-verification rather than converging.

### On WASM the clock is the host's, not the surface's

`chrono` is declared with the `wasmbind` feature at `Cargo.toml`, which sources
`Utc::now()` from `js_sys::Date::now()`. The recorded time is therefore whatever the
embedding page or Node process reports, with no relation to any monotonic surface
clock.

ADR-003 L288 makes monotonic clock discipline an explicit mitigation for the
CRDT merge risk: "surface-level monotonic clocks (e.g., ESP32 RTC) ensure timestamp
monotonicity within a single device." The WASM surface has no clock discipline at
all. It inherits an untrusted host value and writes it into a signed field. A user
who changes the system clock, or a page that stubs `Date.now`, controls the
ordering key of a governance log.

The field is also undeclared. Neither ADR-003 L298-311 nor
`phase-mirror-surface/src/lib.rs:61-70` includes `timestamp` in the envelope, so
this value is in no schema and no consumer validates it.

## Considered Options

### Option 1: Remove the timestamp from the seal event
The seal is a decision about a witness. Its identity is `witness_id`. Time belongs
to the persistence layer, which is where `ArchivumEvent.timestamp_ms` already exists
at `phase-mirror-surface/src/lib.rs:135`.
- Pros: Makes `evaluate_seal` a pure function. The seal becomes reproducible and
  comparable. No clock trust question in the WASM crate. The timestamp is still
  recorded, once, by the layer that owns the log.
- Cons: A caller wanting the decision time must read the log. Correct, but one more
  hop for the GlassConsole, which may want to show "decided at".

### Option 2: Take the timestamp as a parameter
Change the signature to `evaluate_seal(&self, max_lipschitz, step_id, now_ms)` and
let the caller supply it.
- Pros: Still pure. Caller controls presentation time.
- Cons: Makes the governance decision depend on a caller-supplied clock, which is
  the trust problem in a different position rather than solved. Every caller must
  now decide to pass a trustworthy time.

### Option 3: Keep the wall clock and add the surface's monotonic counter alongside
- Pros: Preserves the current shape.
- Cons: The seal is still irreproducible, because two of its fields now differ
  between runs. Adds a field to solve a problem it does not address.

## Decision Outcome

Option 1.

1. `evaluate_seal` no longer reads the clock. It becomes a pure function of the
   witness, the bound, and `step_id`, so the same inputs always yield byte-identical
   output. This is what makes the seal checkable after the fact.
2. Decision time is recorded by the persistence layer in `ArchivumEvent.timestamp_ms`,
   which already exists for exactly this purpose. The GlassConsole reads decision
   time from the stored event, not from the seal.
3. `chrono` is removed from `Cargo.toml` once this lands. That is the last use of it
   in the crate at `src/lib.rs:175`, and it removes the `wasmbind` feature and its
   `js-sys` dependency from the WASM binary entirely, which is a material saving
   under the 2 MiB budget in ADR-003 L321.
4. Per ADR-RML-162, the `SealProjection` type returned to the GlassConsole keeps
   `stepId` and `reason` but drops `timestamp`. If a UI genuinely needs a
   display-time, it reads the log.

Clause 3 also resolves the `js-sys` question cleanly. In ADR-RML-163 `js-sys` is
listed as removable because it is unused directly and reachable only through `uuid`.
After this ADR it is also unreferenced through `chrono`, so the removal is
unconditional rather than incidental.

## Consequences

### Positive
- The seal is reproducible. A consumer can re-evaluate a witness and compare
  byte-for-byte, which is the property a verification scheme exists to provide.
- Re-verification stops mutating merge order. The append-only log converges instead
  of growing a conflict on every read.
- The WASM crate no longer trusts or records any host clock.
- `chrono` and the `wasmbind` feature leave the binary.

### Negative
- A signature change on the crate's only decision function. The published
  TypeScript declaration changes shape, so `agency-server` consumers must
  recompile. Coordinate with ADR-RML-167.
- The GlassConsole loses an inline decision time and must read the log. This is a
  small UI change and a deliberate one: a governance timestamp read from an
  untrusted host clock was not a trustworthy value to display.
- Reproducibility now depends on the `lambda_trace` and proof fields being
  deterministic too, which is the subject of ADR-RML-161. If proof material is
  gathered from a non-deterministic source the purity is only partial. Purity is
  therefore asserted in the same test that covers ADR-RML-162.

### Verification Strategy
A test that calls `evaluate_seal` twice on an unchanged witness with a wall-clock
gap between calls, across a thread sleep, and asserts byte-identical output. A
second test asserts the output contains no `timestamp` key and that no
`chrono` symbol appears in the crate. A third asserts `cargo tree` shows no
`chrono` under this package.

## Links
- Index: `ADR-RML-158.md` (dissonance D10)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/src/lib.rs:175`
- Merge protocol: `Governance/ADR/accepted/ADR-003-sovereign-stack-implementation.md:130-133`, `:288`
- Existing time field: `packages/PhaseMirror/phase-mirror-surface/src/lib.rs:135`
- Related: `ADR-RML-162.md`, `ADR-RML-163.md` (dependency removal)
