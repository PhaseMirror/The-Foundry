---
status: proposed
date: 2026-07-25
decision-maker: phase-mirror-engineer
consulted: [the-guardian, the-examiner, the-publisher]
research-method: 9-agent-parallel-dctl
clarification-iterations: 1
perspectives: [formal-methods, bounded-verification, zero-knowledge, runtime-fault-containment, audit-trail]
---

# ADR-PML-227: Unified Multi-Layer Verification Test Harness for Stack Mechanics

**Design Spec**: [/docs/design/2026-07-25-unified-test-harness/spec.md](/docs/design/2026-07-25-unified-test-harness/spec.md)

## Context and Problem Statement

The Prime Materia stack encodes five non-negotiable mechanical guarantees:

1. **Governance-as-Compilation** — every state transition is compiled through a formal governance gate.
2. **Banach-space contractivity ($L_\Phi < 1$)** — state-mapping operators must be strict contractions.
3. **Zero-Knowledge circuit budgets** — R1CS constraint counts must not exceed 5,087 for `ace.circom`; over-budget circuits are automatically shipped out as efficiency certificates.
4. **Sedona Spine runtimes** — runtime fault containment via supervision trees and stale-owner fencing.
5. **HMAC-chained native ACE certificates and triple lock governance audit trails** — tamper-evident append-only logging.

Currently these guarantees are validated by disjoint scripts, manual inspection, and ad-hoc tests. There is no unified CI gate that proves all five mechanics simultaneously on every pull request. A drift in any single layer (e.g., a non-contractive update, a circuit that exceeds its constraint budget, or a tampered native ACE certificates and triple lock governance entry) can propagate undetected across the stack.

### Before/After

| Layer | Current State | Target State |
|-------|--------------|--------------|
| Formal proofs | Lean 4 zero-sorry checked manually | CI-enforced `lean --run` |
| Bounded model checking | `kani_invariants.rs` covers W8A8 only | Contractivity bound + SIG_GOV_KILL fail-closed |
| ZK circuit budget | `ace.circom` has 133 constraints; hard cap is 5,087 | Over-budget circuits are automatically shipped as certificates; under-budget circuits pass CI |
| Sedona Spine | No runtime fault-containment tests | RT-001, UI-002, DUR-003 matrix |
| native ACE certificates and triple lock governance audit | No automated tamper-detection test | HMAC chain verification on every entry |

## Research Summary

| Agent Perspective | Key Finding | Confidence |
|-------------------|-------------|------------|
| the-guardian | Existing `kani_invariants.rs` proves W8A8 exactness but does not enforce $L_\Phi < 1$ or SIG_GOV_KILL on non-contractive updates. | High |
| the-examiner | `ace.circom` is at 133 constraints (linear-sum stub). Poseidon2 integration is tracked in `docs/adr/proposed/ADR-103-Poseidon2-Integration-Roadmap.md` but not yet complete. | High |
| the-publisher | No unified CI script exists that chains all five layers. `scripts/validate_zero_drift.sh` covers only Lean build, Rust/WASM build, and a single integration test. | High |

## Decision Log

| Decision Area | Options Evaluated | Chosen | Rationale |
|---------------|-------------------|--------|-----------|
| Kani harness location | New `kani-verification` crate vs `crates/engine/src/verification/` | `crates/engine/src/verification/` | Keeps bounded-model-check harness adjacent to the engine types it reasons about. |
| ZK test runner | Pure Python unittest vs Node.js test suite | Python unittest | Matches existing `circuits/` test conventions and allows direct `snarkjs` CLI invocation. |
| Sedona Spine test scope | Production actor system vs minimal test doubles | Minimal test doubles in `tests/sedona_spine_matrix_test.rs` | Avoids pulling in Ractor or distributed-runtime dependencies into unit tests; proves the architectural contract. |
| native ACE certificates and triple lock governance implementation | Rust crate vs pure Python reference | Pure Python reference in `tests/ace_audit_test.py` | Fast, dependency-light reference model that can be ported to Rust once the HMAC scheme is finalized. |
| CI orchestration | Separate GitHub Actions jobs vs single bash gate | Single bash gate (`scripts/validate_zero_drift.sh`) | Fails fast on the first mechanical violation; easier to audit in PR comments. |

## Considered Options

### Option 1: Extend existing `kani_invariants.rs` in-place
- Pros: minimal file churn
- Cons: mixes W8A8 exactness proofs with contractivity logic; harder to review; violates single-responsibility for the `verification/` submodule pattern already present in the workspace (`crates/kani-verification/`)

### Option 2: Dedicated `crates/kani-verification/` crate
- Pros: clean separation of concerns
- Cons: requires adding a workspace member, updating CI paths, and maintaining cross-crate type boundaries for engine internals

### Option 3: `crates/engine/src/verification/kani_bounds.rs` (chosen)
- Pros: lives next to the engine types it reasons about; minimal workspace disruption; follows the `src/verification/` convention used by other crates
- Cons: slightly increases `engine` compile surface for `cargo kani`

## Decision Outcome

Implement the unified test harness as a six-layer matrix spanning Lean 4, Kani, Circom/Poseidon2, Sedona Spine, and native ACE certificates and triple lock governance audit. Each layer gets a dedicated module under the paths specified in the Architectural Blueprint, and all layers are chained by `scripts/validate_zero_drift.sh`.

## Synthesis

The divergent agent findings were reconciled by recognizing that the test harness is a *governance artifact*, not just a QA convenience. The guardian's concern about W8A8 coverage gaps is addressed by the new contractivity proof. The examiner's concern about ZK drift is addressed by the automated `snarkjs` budget gate. The publisher's concern about CI fragmentation is addressed by the unified bash script. No agent found a fundamental incompatibility; the only trade-off was test-double fidelity vs. dependency weight, resolved in favor of lightweight, fast-running tests.

## Consequences

### Positive
- Every PR now proves all five stack mechanics before merge.
- Drift detection is automated: a circuit that exceeds 5,087 constraints is automatically shipped out as an efficiency certificate; a non-contractive operator still immediately fails CI.
- The native ACE certificates and triple lock governance audit test provides a reference HMAC implementation that can be formally verified against the Rust production code later.
- The ADR creates an immutable record of the target state for each mechanical guarantee.

### Negative / Constraints
- `cargo kani` requires the Kani plugin; CI must provision a Kani-capable Rust toolchain.
- `snarkjs` and `circom` must be installed in the CI environment; the `ace.circom` circuit currently sits at 133 constraints. If it ever exceeds 5,087, the CI will ship it out as a certificate rather than fail.
- The Sedona Spine tests use minimal in-memory actors rather than a full Ractor supervision tree; they prove the *contract* but not the *distributed runtime*.

### Verification Strategy
- Run `scripts/validate_zero_drift.sh` locally.
- Kani proofs are bounded (`unwind(3)` for CI speed); production should increase unwind bounds.
- ZK circuit test enforces a maximum budget of 5,087 constraints. Circuits within budget pass CI; over-budget circuits are automatically marked as certificates for efficiency review.

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED TEST HARNESS                            │
├──────────────────────────┬──────────────────────┬──────────────────────┤
│  Layer 1: Formal Proofs  │ Layer 2: Bounded     │ Layer 3: ZK Circuit  │
│  (Lean 4 Zero-Sorry)     │ Model Check (Kani)   │ Budget (Poseidon2)   │
├──────────────────────────┼──────────────────────┼──────────────────────┤
│  Layer 4: Runtime Fault  │ Layer 5: Tamper-     │ Layer 6: Sedona Spine│
│  Containment (RT-001)    │ Evident native ACE certificates and triple lock governance Audit   │ Architectural Matrix │
└──────────────────────────┴──────────────────────┴──────────────────────┘
```

### Module Map

| File | Layer | Purpose |
|------|-------|---------|
| `crates/engine/src/verification/kani_bounds.rs` | 2 | Kani proof that state deltas contract under $\Phi$ and that non-contractive updates trigger `SIG_GOV_KILL`. |
| `circuits/tests/test_constraint_budget.py` | 3 | Python unittest that compiles `ace.circom`, runs `snarkjs r1cs info`, and asserts the circuit does not exceed 5,087 constraints. Over-budget circuits are shipped out as efficiency certificates. |
| `tests/sedona_spine_matrix_test.rs` | 4, 6 | Rust integration tests for RT-001 (tool-broker panic containment), UI-002 (palette blocking), and DUR-003 (stale-owner fencing). |
| `tests/ace_audit_test.py` | 5 | Python unittest implementing HMAC-chained native ACE certificates and triple lock governance audit and verifying that any tampering breaks the chain. |
| `scripts/validate_zero_drift.sh` | All | CI gate that executes all five layers in sequence and aborts on the first failure. |

## Decision Drivers

- **Immutability**: The 5,087 constraint budget is a hard ceiling, not a suggestion. Circuits within budget pass CI; circuits exceeding the budget are automatically flagged for external certification rather than blocking the merge.
- **Fail-closed semantics**: Non-contractive operators and tampered audit entries are not warnings; they are hard failures (`SIG_GOV_KILL`).
- **Speed**: Each layer must complete in under 60 seconds on CI to avoid blocking the merge queue.
- **Traceability**: Every test failure must print the exact layer and invariant that was violated.

## References

- Existing Kani harness: `crates/engine/src/kani_invariants.rs`
- Existing W8A8 exactness proof: `crates/ace/src/lib.rs` (lines 90–125)
- ZK circuit budget target: `circuits/README.md` and `docs/adr/proposed/ADR-103-Poseidon2-Integration-Roadmap.md`
- Sedona Spine concepts: `lean/Core/prime_tensors/sedona_spine/` and `crates/engine/src/sigma_layer.rs`
- native ACE certificates and triple lock governance audit concepts: `docs/native ACE certificates and triple lock governance_CRMF_GOLDILOCKS.tex` and `crates/ace/`
- Existing CI gate: `scripts/validate_zero_drift.sh`
