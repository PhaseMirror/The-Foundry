# ADR-RML-160: The contractivity bound is caller-controlled and the veto is advisory

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/src/lib.rs:157-179`
- Verdict signature: `915080f7e3f34f5f`

## Context and Problem Statement

`UnifiedWitnessWasm::evaluate_seal` is the only exported governance decision in
`phase_mirror_wasm`. It is documented at `src/lib.rs:157-158` as projecting a
witness onto the phase space boundary and returning an event for the GlassConsole.
It is the crate's entire security surface.

It has two defects that independently make it unsound as a gate.

### The caller supplies the bound it is checked against

```rust
// src/lib.rs:160
pub fn evaluate_seal(&self, max_lipschitz: f64, step_id: u32) -> String {
    let mut status = "CERTIFIED";
    ...
    if self.contractivity_score >= max_lipschitz {
        status = "REJECTED";
```

`max_lipschitz` is an unvalidated caller input. The predicate is
`score < max_lipschitz`, with no constraint that `max_lipschitz` is itself below 1.
The formal invariant in `CPIRTM.lean:20` and `Lipschitz.lean:12` is
`κ < 1 ∧ Lipschitz bound`. A caller passing `max_lipschitz = 1.0` certifies any
finite score, including a divergent operator. A caller passing `100.0` certifies
everything.

The gate is therefore satisfied by the act of choosing the bound. It is not a check.

### `veto_status` is carried but never consulted

`UnifiedWitnessWasm` stores `veto_status: String` (`src/lib.rs:128`) and exposes a
getter (`src/lib.rs:155`). `evaluate_seal` reads only `contractivity_score` and
`witness_id`. A witness constructed as

```
new(witness_id, action_id, ts, "VETOED", 0.5).evaluate_seal(1.0, 0)
```

returns `{"status":"CERTIFIED", ...}`. A veto on a governance witness is metadata
that the governance gate does not read. `action_id` is likewise stored and
surfaced but never participates in the decision, so the seal does not bind to the
action being authorized.

### Three predicates, none shared

This crate's check, the surface crate's check, and the MCP evaluator's check are
three different functions:

| Location | Predicate |
|----------|-----------|
| `phase_mirror_wasm` `evaluate_seal:164` | `score < max_lipschitz`, bound unvalidated |
| `phase-mirror-surface` `LambdaTrace::is_contractive:126` | `lambda_p * l_p < 1.0 && !zero_spacings.is_empty()` |
| `phase-mirror-mcp` `SedonaSpineEvaluator::evaluate_stop_rules` | `product >= 1.0` rejected, `zero_spacings` non-empty |
| `l0_invariants.rs:59` | `score == 1.0` |

The first admits `κ ≥ 1`. The second and third never inspect a Lipschitz constant
over states at all; they multiply two scalars and test non-emptiness. The fourth is
covered by ADR-RML-159. Four surfaces that all claim to enforce `IsContractive` do
not agree on what it means.

## Considered Options

### Option 1: Validate the bound inside the gate and honour the veto
Constrain `max_lipschitz` to `(0.0, 1.0)` and reject out-of-range input as a
`REJECTED` with an explicit reason. Short-circuit to `REJECTED` when
`veto_status` is not a recognised clean value. Delegate the contractivity
arithmetic to a single shared function.
- Pros: Closes both defects without changing the exported signature. The caller
  keeps choosing the policy bound, within a range where the choice is meaningful.
- Cons: Does not by itself unify the predicate across the four surfaces.

### Option 2: Remove `max_lipschitz` and fix the constant at 1.0 exclusive
- Pros: Maximum safety. The caller cannot weaken the gate.
- Cons: Loses per-deployment policy. ADR-003 does not describe a per-deployment
  contractivity budget, so this may be discarding a capability that was never
  specified. Over-corrects relative to the claim.

### Option 3: Reject the witness on construct
Move the decision into `UnifiedWitnessWasm::new` and make `evaluate_seal` a pure
projection.
- Pros: Cannot construct an uncertifiable witness.
- Cons: Breaks the exported ABI, which ADR-003 L321 and the
  `agency-server/wasm-pkg` publish boundary depend on. Premature.

## Decision Outcome

Option 1, plus a predicate-unification clause:

1. `evaluate_seal` rejects `max_lipschitz` outside `(0.0, 1.0)` with reason
   `"Bound outside contractivity domain: 0 < κ < 1 required."` The check runs
   before the score comparison.
2. `veto_status` is interpreted as an enum, not a free string. Any value other than
   the clean sentinel yields `REJECTED` with the veto reason. Unknown values fail
   closed.
3. `action_id` is emitted in the result event so the seal binds to the authorized
   action.
4. The score comparison moves to a single shared `is_contractive` function owned by
   `phase-mirror-surface`, and `evaluate_seal`, `LambdaTrace::is_contractive`, and
   `SedonaSpineEvaluator::evaluate_stop_rules` all call it. Divergence between
   surfaces becomes a compile-time or test failure rather than a latent
   disagreement.

Clause 4 is a prerequisite for RML-161 and RML-162, which both assume a receipt
carries a `lambda_trace` that means the same thing everywhere.

## Consequences

### Positive
- The gate can no longer be satisfied by choosing a large bound.
- A veto now blocks. A witness that governance has marked as vetoed cannot certify.
- Three of the four contractivity predicates collapse to one.

### Negative
- Any existing caller passing `max_lipschitz >= 1.0` starts receiving `REJECTED`.
  Given that the current code accepts such calls, this is a behaviour change on the
  crate's only decision path.
- Unifying the predicate will change `LambdaTrace::is_contractive` semantics for
  `phase-mirror-surface`, `archivum-local-first`, and `phase-mirror-extension-host`,
  which all consume it. The surface crate's own test
  `lambda_trace_contractivity` asserts the current scalar-product behaviour and
  must be rewritten.
- The Lean sources still disagree between non-expansive (`≤`) and strict (`<`)
  contraction. This ADR unifies the Rust predicates but does not settle which Lean
  statement is normative. That remains open and is recorded here rather than
  silently decided.

### Verification Strategy
Table-driven tests on `evaluate_seal` asserting `REJECTED` for
`max_lipschitz ∈ {0.0, 1.0, 1.5, -1.0, f64::NAN}`, for `veto_status = "VETOED"` at
`max_lipschitz = 0.9`, and `CERTIFIED` only for a clean witness with a valid bound
and a score strictly inside the domain. `f64::NAN` is included because the current
comparison returns `false` for every `NaN` comparison and would certify it.

## Links
- Index: `ADR-RML-158.md` (dissonance D7, D9)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/src/lib.rs:157-179`
- Duplicate predicate: `packages/PhaseMirror/phase-mirror-surface/src/lib.rs:125-128`
- Formal conflict: `packages/PIRTM/lean/prime_tensors/CPIRTM.lean:20`
- Downstream: `ADR-RML-161.md`, `ADR-RML-162.md`
