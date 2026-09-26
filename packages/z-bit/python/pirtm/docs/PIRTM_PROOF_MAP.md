# PIRTM Proof-Implementation Mapping (BRIDGE)

This document maps formal Lean 4 theorem identifiers to their corresponding Python implementation and tests in `agi-os/packages/pirtm`.

## 1. Contraction Theory

| Lean Identifier | Python Location | Test Location | Description |
|-----------------|-----------------|---------------|-------------|
| `pirtm_contraction_const` | `core/recurrence.py:step` (line 120) | `test_core_spec_alignment.py:test_lambda_m_0_5_behavior` | Definition of the contraction constant $c = 1 - \lambda_m(1 - L_G)$. |
| `pirtmUpdate` | `core/recurrence.py:step` (lines 106-114) | `test_core_spec_alignment.py:test_lambda_m_regression_values` | The convex update rule $X_{t+1} = (1 - \lambda_m)X_t + \lambda_m P(Y_t)$. |
| `pirtm_contraction_theorem` | `core/recurrence.py:step` (Contractivity Guarantee comment) | `test_core_spec_alignment.py:test_geometric_shrinkage_witness` | Formal proof that the update rule is a Banach contraction. |
| `pirtm_fixed_point_exists` | N/A (Runtime) | N/A (Analytical) | Guarantee that the recurrence converges to a unique fixed point $\Psi^*$. |

## 2. Operator Stability

| Lean Identifier | Python Location | Test Location | Description |
|-----------------|-----------------|---------------|-------------|
| `UpdateOperator` | `policy.py:PIRTMPolicy` | `test_core_spec_alignment.py:test_iterate_lambda_m_propagation` | Structure of the operators $\Xi_t$, $\Lambda_t$, and $G_t$. |
| `evolution_uniform_contraction` | `core/recurrence.py:step` (line 121) | `test_core_spec_alignment.py:test_certificate_failure_negative_margin` | Stability bound based on operator norms $\|\Xi\| + \|\Lambda\|L_T < 1$. |

## 3. Multiplicity Space & Layer-II

| Lean Identifier | Python Location | Test Location | Description |
|-----------------|-----------------|---------------|-------------|
| `prime_decomp_unique` | `multiplicity_lwe/prime_utils.py` | `test_multiplicity_lwe_params.py` | Unique representation of indices via prime factors. |
| `multiplicity_space_stable` | `core/operators.py:MultiplicitySumOperator` | `test_core_spec_alignment.py:test_multiplicity_sum_operator` | Stability of the prime-indexed sum operator. |
| `FockSpace` | `core/fock.py:FockState` | `test_fock_bridge.py` | Structure representing the many-body state space. |
| `CreationOp` / `AnnihilationOp` | `core/fock.py:FockSpaceBridge.a_dag` / `.a` | `test_fock_bridge.py` | Formalized ladder operators for prime modes. |
| `pirtmUpdateFock_lipschitz_test` | `tools/fock_viz.py` | `PIRTM/FockContractivityTest.lean` | Test for stability preservation in truncated Fock space. |

## 4. Certification Pipeline

See `docs/CERTIFICATION_PIPELINE.md` for the end-to-end SEALed workflow.

---
*Last Updated: Wednesday, May 6, 2026*
