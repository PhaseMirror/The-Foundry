# ADR-002: Formal Verification of M-QNN Multiplicity Theory via Axiom-Clean Rust & Kani

**Status:** Accepted  
**Date:** 2026-07-25  
**Author:** Multiplicity-Theory Project  
**Supersedes:** ADR-001 (Lean 4/Mathlib Integration)

---

## Context
The M-QNN classifier's adaptive shot-allocation loop was originally scoped for formal verification in Lean 4 (ADR-001). However, introducing probability theory to Lean 4 requires `Mathlib`, which violates the project's **Sedona Spine Mandate** (Axiom-Clean Core: No Mathlib, No Sorry). To maintain mathematical rigor while remaining strictly computable and compatible with the core engine, the formal verification layer must be migrated to a bounded model checker that natively integrates with the Rust ecosystem.

## Decision
We replace the Lean 4 formalisation (ADR-001) with an **Axiom-Clean Rust implementation verified by Kani (Bounded Model Checker)**. 
- The multiplicity state is natively represented as a Rust struct with `u32` bounds and `saturating_add` transitions.
- The continuous-real Hoeffding inequality is adapted into a deterministic, scale-adjusted integer proxy function.
- The probabilistic bounds ($\delta$) are assumed correct via external pen-and-paper proofs, while Kani symbolically executes the algorithmic state transitions to guarantee zero edge-case faults.

## Consequences
1. **Zero Runtime Panics:** Kani mechanically proves the absence of integer overflow, underflow, and divide-by-zero vectors within the transducer loop.
2. **Ecosystem Alignment:** The verified oracle can be exposed directly to Qiskit via Python FFI (e.g., PyO3/Maturin) without an intermediate Lean runtime translation layer.
3. **Bounded Exhaustion:** Shot scaling is capped to `u32::MAX`, ensuring Kani can exhaustively evaluate the bounded phase space for transition faults.
4. **Legacy Archiving:** ADR-001 and the associated `lean-mqnn` packages are immediately sequestered to the `lean/legacy/` directory as theatrical, non-binding modules.
