# ADR-0006: Upgrade Static V_oracle to Dynamic Lindblad Feedback Operators

## Status
Proposed (Phase Mirror Generated)

## Context
The Implementation Plan marks the integration of `Xi_oracle` into the solver loop as complete. However, the Phase Mirror audit shows that `OracleFeedback` in `python/zrsd/bitcoin_simulation.py` is implemented merely as a static diagonal matrix `V_oracle` added to the Hamiltonian. A static potential acts as a simple energy penalty, not a dynamic residual operator ($\Xi_{\text{oracle}}(t)$) capable of actively steering state probability amplitudes toward the minimum oracle score over time.

## Phase Mirror Governance

- **Hidden Assumptions**: We assumed a standard potential landscape `V` would suffice to create gradient descent in Fock space, without employing non-unitary dissipative Lindblad jump operators to explicitly cool the system into the target state.
- **Contradictions / Tensions**: **Energy Penalty vs. Probability Steering**. The theoretical model describes an active feedback loop that steers the density matrix, but the code merely offsets the energy eigenvalues. A static potential causes phase rotation, but does not definitively funnel amplitude into the solution state on its own (it needs dissipation).
- **Lever Introduced**: **Dynamic Lindblad Feedback ($\Xi_{\text{oracle}}$)**. We will implement the `get_lindblad_ops` function inside `OracleFeedback`. This will introduce specific collapse operators $L_{\text{oracle}}$ that probabilistically transfer amplitude from high-score (bad) states to low-score (good) states.
- **Validation Metric**: Telemetry from `run_bitcoin_simulation` must demonstrate that the expectation value of the Oracle score $\text{Tr}(\rho(t) V_{\text{oracle}})$ monotonically decreases (improves) over time when the feedback is active, compared to periodic oscillations observed with a purely static Hamiltonian potential.

## Decision
1. Implement `get_lindblad_ops(strength)` in `OracleFeedback`.
2. Update the solver loop in `run_bitcoin_simulation.py` to append these oracle-driven jump operators to the base list of dissipators `Ls`.
3. Stop calling the feedback term `V_oracle` a complete implementation of `Xi_oracle`.
