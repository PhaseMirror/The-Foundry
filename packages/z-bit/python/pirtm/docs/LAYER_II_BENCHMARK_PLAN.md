# PIRTM Layer-II Benchmark Plan: Fock Stability vs. Classical Dissipation

This plan outlines the methodology for comparing certified Fock-lifted contraction against classical dissipative baselines (e.g., Ornstein-Uhlenbeck, Fokker-Planck).

## 1. Objective
Verify that the contractive rate of the certified PIRTM Layer-II update matches or exceeds the decay rates of classical dissipative systems while maintaining prime-indexed identity integrity.

## 2. Baselines
- **Ornstein-Uhlenbeck (OU)**: $dX_t = -\theta X_t dt + \sigma dW_t$
- **Fokker-Planck (FP)**: $\frac{\partial p}{\partial t} = \frac{\partial}{\partial x} [\theta x p] + \frac{\sigma^2}{2} \frac{\partial^2 p}{\partial x^2}$

## 3. Metrics
- **Contraction Ratio**: $\gamma(t) = \frac{\|X_{t+1} - X^*\|}{\|X_t - X^*\|}$
- **Spectral Gap**: $1 - |\lambda_{max}|$ of the transition operator.
- **Identity Residual**: $E(t) = \|S(t) - \tilde{S}(t)\|^2$ (Prime reconstruction error).

## 4. Benchmark Scenarios

### 4.1. Truncated Fock Stability (Lean Test)
- **Target**: `pirtmUpdateFock_lipschitz_test`
- **Method**: Formal verification of the Lipschitz bound in a 3-mode, cutoff=3 Fock space.
- **Success Criteria**: Lean build passes with $K < 1$.

### 4.2. Empirical Contraction (QuTiP)
- **Target**: `tools/fock_viz.py`
- **Method**: Iterative simulation of the lifted update.
- **Success Criteria**: Empirical ratio $\gamma_{emp} \le c(\lambda_m)$ theoretical bound.

### 4.3. Dissipative Rate Comparison
- **Target**: Comparative plot of $\gamma(t)$ for PIRTM vs. OU.
- **Method**: Script-based comparison of decay envelopes.
- **Success Criteria**: PIRTM shows non-inferiority in convergence speed.

## 5. Execution Pipeline
1. Run `lake build PhaseMirror.PIRTM.FockContractivityTest`.
2. Run `python agi-os/packages/pirtm/tools/fock_viz.py`.
3. Generate comparative rate report.
