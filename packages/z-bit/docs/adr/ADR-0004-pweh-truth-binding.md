# ADR-0004: Enforce Truth Binding in PWEH Logger and Lambda_m Certification

## Status
Proposed (Phase Mirror Generated)

## Context
During a Phase Mirror audit, it was discovered that the current `run_bitcoin_simulation` loop in `python/zrsd/bitcoin_simulation.py` logs cryptographically signed execution trajectories (PWEH) but hardcodes crucial verification parameters: `norm_mult=1.0` and `lambda_m_cert=True`. This creates a dissonance between the stated architectural intent (cryptographically binding a verifiable mathematical trajectory) and the operating code (signing dummy values).

## Phase Mirror Governance

- **Hidden Assumptions**: The codebase assumed that the prototype could skip the mathematical validation of contractivity ($q_t + \eta_t < 1$) while still claiming Phase 1 (Attestation Pipeline) was "COMPLETE". It assumes that downstream validators won't check the physical meaning of `lambda_m_cert`.
- **Contradictions / Tensions**: **Attestation vs. Reality**. We are generating a tamper-evident chain of false data. The PWEH logger provides a post-quantum audit trail, but the values being hashed are hardcoded placeholders, neutralizing the entire purpose of the attestation layer.
- **Lever Introduced**: **$\Lambda_m$ Constraint Enforcement Mechanism**. We must wire the actual solver state to compute the multiplicity-weighted norm $\|\Lambda_m^{op} A_{p_i}\|$ and truthfully assert `lambda_m_cert` at each RK4 step. We will bind the `PIRTMPolicy.goal_budget` to the loop to ensure strict contractivity enforcement.
- **Validation Metric**: PWEH logs exported via `export_json()` show mathematically valid, dynamically varying `norm_mult` values, and `lambda_m_cert` correctly triggers `False` if contractivity bounds are breached.

## Decision
1. Remove `norm_mult=1.0` and `lambda_m_cert=True` placeholders from `run_bitcoin_simulation.py`.
2. Implement an explicit contractivity check using the `bridge` and `rho` state at each time step.
3. Compute the true $\Lambda_m$ operator norm and log it.
4. Fail the simulation or flag the PWEH log step as uncertified if the norm exceeds the threshold constraint.
