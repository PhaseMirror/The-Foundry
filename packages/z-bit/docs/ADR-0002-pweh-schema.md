# ADR-0002: Adopt Prime-Weighted Execution Hashing (PWEH) for Bitcoin ZRSD

## Status
Proposed

## Context
The Bitcoin ZRSD project requires a tamper-evident mechanism to record the execution trajectory of the prime-indexed dynamical search. This attestation must capture the micro-steps of the solver, including operator applications, oracle scores, and multiplicity metrics, to ensure reproducibility and auditability.

## Decision
We adopt Prime-Weighted Execution Hashing (PWEH) as the canonical attestation layer. Every step of the simulation or mining run will be serialized into a canonical format and hashed into an order-sensitive chain.

### Canonical Step Schema (JSON)
Each step in the PWEH chain MUST include:
- `run_id`: UUID for the experiment.
- `step_index`: Monotonically increasing counter.
- `time`: Simulation time $t$.
- `active_prime`: The prime $p_i$ currently driving the dynamics.
- `operator_id`: Identifier for the applied operator (e.g., `H_zeta`, `L_k`, `Xi_oracle`).
- `operator_norm_mult`: Multiplicity-weighted norm $\|\Lambda_m^{op} A_{p_i}\|$.
- `lambda_m_cert`: Boolean certification flag ($q_t + \eta_t < 1$).
- `oracle_score`: Current SHA-256 closeness metric.
- `state_digest`: Hash of the current density matrix $\rho(t)$ or measurement outcome.
- `metadata`: Experiment-specific tags (e.g., seed, difficulty).

### Hash Chain Construction
$$ S_t = \text{Hash}(S_{t-1} \parallel \text{canonical\_serialize}(\text{Step}_t)) $$
Using SHA-256 as the base hash.

## Phase Mirror Governance
- **Hidden Assumptions**: We assume that a search trajectory can be trusted without a cryptographic commitment.
- **Contradictions / Tensions**: Reproducibility vs. Performance (logging every step adds overhead but is required for verification).
- **Lever Introduced**: Prime-Weighted Execution Hashing (PWEH) to bind trajectory steps to a SHA-256 chain.
- **Validation Metric**: Successful replay and hash verification of 100% of simulation runs.

## Consequences
- **Positive**: Provides a post-quantum-ready audit trail of the search process.
- **Positive**: Enables independent verification of "how" a nonce was found.
- **Negative**: Increases storage requirements for long trajectories.
- **Neutral**: Requires standardized serialization before implementation.
