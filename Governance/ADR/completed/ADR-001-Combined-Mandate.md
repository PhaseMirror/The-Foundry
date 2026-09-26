# ADR-001: Combined Mandate — Sedona Spine Governance Framework

## Status
Accepted (2026-04-16)

## Context
The Multiplicity Sovereign Core requires unified governance across:
- F1 Square formalization (Lean 4)
- Λ-RMAM-ZΞ 7.3 engine (Rust)
- Phase Mirror Observatory
- Commander orchestration

## Decision
Adopt the **Sedona Spine** as the binding governance framework:

### L0 Invariants (Non-bypassable)
1. **Successor Predicates** — Every discrete state transition must satisfy P_N(t+1) = σ(P_N(t))
2. **Multiplicity Conservation** — M(S) functor preserves structural invariants across strata
3. **Rational64 Exactness** — All rational computations use exact arithmetic (ExactRat) with certified bounds

### Enforcement Layers
- **ALP Gate** — Atomic Language Policy validates all actions before execution
- **Sigma Kernel** — State transitions produce provable receipts
- **Archivum Ledger** — Immutable witness chain in `state/archivum/witnesses.jsonl`

## Consequences
- All front-matter entry points fail closed on invariant violation
- No `sorry` placeholders in core proofs (lean/scripts/honesty_audit.sh enforced)
- No external library imports (Mathlib excluded, pure Lean 4 core)

## References
- `Ξ-Constitution.md` — Constitutional law
- `GEMINI.md` — Sedona Spine mandate specification

## Appendix B: Spectral L0 Contractivity (2026-06-28)

### Overview
Hybrid Gershgorin + power iteration spectral contractivity enforcement for Multiplicity Theory execution substrate.

### Theorem Structure (Lean 4)
```lean
theorem spectral_l0_preserved
  (A : Matrix)
  (cert : GershgorinCertificate)
  (tier : Nat)
  (h_bound : hybrid_spectral_radius A cert < 1 - tier_epsilon tier) :
  L0_contractivity_preserved A
```

### Binding
- Gershgorin upper bound ≤ spectral_radius ≤ power_iteration_limit
- Tier-based ε margins: Tier 1 (0.1) Conservative, Tier 4 (0.01) Aggressive
- Conservative safety prioritized: early violation detection via Gershgorin disks
- See: `Prime/substrates/multiplicity/lean/SpectralStability.lean`

### Rust Implementation
- `SpectralGovernor::hybrid_spectral_radius` in `hologram-core/src/spectral.rs`
- `SpectralMetrics` tracks spectral_radius, gershgorin_radius, drift_score
- 143 tests pass; `cargo test --workspace` validates on every commit

## Appendix C: Successor and Stratum Failable Constructors (Phase Mirror Hooks)

### Mechanics
- **Dual-Gate Ordering**: Predicate ordering is strictly enforced. Sedona Spine invariants (structural and semantic checks) must pass **first**.
- **Rejection Before Lever**: A hard Sedona violation immediately returns `Err`, blocking further execution.
- **Lever Hooks**: The Phase Mirror lever hook (`emit_lever`) is only evaluated *after* a successful structural/semantic pass, ensuring that a near-miss classification path never inadvertently returns `Ok` on a hard Sedona violation.
- **Closure Evidence**: `try_successor` and `try_stratum_boundary` are failable constructors (`Result<Expr, String>`) that ensure the shared Result type enforces this sequence securely at compile time.

### L0 Sign-Off
- **Status**: APPROVED. The ordering strictly conforms to L0 fail-closed semantics. Validation confirmed by CI dual-gate assertion.

## Appendix D: Third Operator Stress Test and Formalization Gate

### Stress-Test Directive
To prevent premature abstraction and template drift, a third operator (`try_prime_shift`) will be manually implemented using the exact dual-gate pattern established for `try_successor` and `try_stratum_boundary`. Zero structural deviations are permitted. This manual implementation serves as a stress test for the mathematical stability of the L0 enforcement model.

### Formalization Gate Criteria
Lean 4 template formalization is strictly delayed. The formalization gate will only open if:
1. The third operator is fully implemented and tested.
2. The implementation exhibits zero structural deviations from the prior pattern.
3. A subsequent governance re-audit grants L0 sign-off for the generalized pattern.

## Appendix E: L0Predicate Trait Formalization and Template Authorization

### Authorization
- **Status**: AUTHORIZED. The third operator stress test passed. Template extraction is approved.

### L0Predicate Constraint
To prevent mathematical drift during abstraction, the generic template must enforce strict domain boundaries via an `L0Predicate` trait.
1. **Trait Definition**: Every operator must implement `L0Predicate`, defining its structural bounds (e.g., scalar bounds, zero checks, prime multiplicity) explicitly.
2. **Template Binding**: The generic failable constructor template is restricted to `T: L0Predicate`.
3. **Lean 4 Mirroring**: The Lean 4 formalization must capture these domain-specific bounds explicitly, mapping the trait invariants to inductive theorems.

### Associated Constants Mandate
To structurally eliminate the risk of silent invariant escape paths, `L0Predicate` is augmented to require a mandatory `DomainConfig` with explicitly declared mathematical bounds (e.g., `MAX_MULTIPLICITY`, `PRIME_BOUNDARY`).
- Every operator, even simple scalar checks, must define these boundaries at compile time (using generic defaults or `None` if mathematically provable).
- **Fourth Operator Delay Gate**: No fourth operator may be merged until the L0Predicate structural parameter declarations are strictly enforced across the codebase.