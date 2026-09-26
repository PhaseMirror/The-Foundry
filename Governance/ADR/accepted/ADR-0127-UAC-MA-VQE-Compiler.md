# ADR-0127: MA-VQE Compiler Architecture

## Status
Proposed - Empirical limits formalized; refinement to Rust pending

## Context
Compiling molecular Hamiltonians directly into qudit subspaces requires a compiler toolchain (extending Qiskit vs standalone).

## Decision
A standalone multiplicity-aware compiler tailored for generalized Jordan-Wigner transformations is required. The compiler is implemented in Rust (`ma_vqe_compiler`) and enforces the following structural limits to prevent the failures identified in ADR-0123:

1. **`f_hat` Stability Limit (8192):** The Q-SQD `f_hat` mapping causes instability at `9200` due to combinatorial memory explosion. The compiler strictly halts and rejects `f_hat` maps exceeding a chunk size of `8192` (`2^13`).
2. **ZK-Circom Overflow Limit (80-bit):** To prevent accumulator overflow prior to modulo operations in the Circom zero-knowledge circuits, witness parameters are strictly capped at `2^80 - 1`. The compiler halts if this is violated.

Extending Qiskit is rejected, as Python-based compilation environments cannot provide the strict memory and mathematical guarantees required by the Foundry verification policy. 

### Evidence
The `ma_vqe_compiler` test harness strictly enforces these limits:
```
test tests::test_compiler_gate ... ok
test tests::test_f_hat_boundary_resolution ... ok
test tests::test_zk_overflow_resolution ... ok
```

## Consequences
- Guarantees compiler output satisfies the formal constraints of the UAC.
- Replaces standard transpilation passes with certified compilation steps.
