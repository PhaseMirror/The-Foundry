# PIRTM Formal Certification Pipeline (SEAL)

This document describes the end-to-end pipeline for turning runtime operator norms into formal stability certificates.

## Pipeline Flow

1.  **Measurement (Python)**: The `pirtm.core.recurrence.step` function measures the spectral norms of the system operators:
    - $\|\Xi\|_2$ (Coefficient operator)
    - $\|\Lambda\|_2$ (Aggregation operator)
2.  **Hypothesis Bridging (Python)**: The `FormalStabilityCertificate` class in `core/certify.py` maps these norms to formal Lipschitz hypotheses:
    - $L_G = \|\Xi\| + \|\Lambda\| \cdot L_T$
    - $c(\lambda_m) = 1 - \lambda_m(1 - L_G)$
3.  **Formal Mapping (BRIDGE)**: The `PIRTM_PROOF_MAP.md` connects Python identifiers to Lean 4 theorem names.
4.  **Formal Proof (Lean 4)**:
    - `pirtm_step_lipschitz`: Proves the $L_G$ bound from operator norms.
    - `pirtm_contraction_theorem`: Proves that $c < 1$ implies a Banach contraction.
    - `pirtm_fixed_point_exists`: Guarantees unique stability.
5.  **Certification (Attestation)**: The runtime emits a JSON `formal_bridge` payload that acts as the witness for the formal stability of the execution.

## Machine-Readable Schema

The `formal_bridge` payload in step metadata follows this structure:

```json
{
  "lean_mapping": {
    "lambda_m": 0.5,
    "L_G": 0.7,
    "pirtm_contraction_const": 0.85,
    "is_contractive": true,
    "is_certified": true
  },
  "proof_obligations": [
    {"theorem": "pirtm_step_lipschitz", "hypothesis": "L_G = 0.7"},
    {"theorem": "pirtm_contraction_theorem", "hypothesis": "lambda_m = 0.5, L_G = 0.7"}
  ]
}
```

## Maintenance Invariants

-   **Theorem Preservation**: Lean theorem names in `RecursiveStability.lean` must never be changed without updating the bridge class.
-   **Norm Consistency**: All norm measurements in `recurrence.py` must use $L_2$ spectral norm to remain compatible with the Hilbert space hypotheses in Lean.
