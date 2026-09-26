# ADR-032: hcalc Brain-Aging Engine & Dynamics

- **Status:** Proposed
- **Date:** 2026-04-15
- **Owners:** Lead Healthcare Theorist, Eng
- **Related ADRs:** ADR-031, ADR-033, ADR-034
- **Systems:** hcalc (brain_aging)

---

## 1. Context

To model brain aging as a dynamic state space, we need a core engine in `hcalc` that integrates Ordinary Differential Equations (ODEs) and performs state estimation (filtering). This engine must map latent biological states to a standard vector for numerical operations.

---

## 2. Decision

We will implement the `hcalc.brain_aging` module with the following architectural components:

### 2.1 Latent State Vector Mapping
The state vector $\mathbf{x} \in \mathbb{R}^6$ is mapped to the following coordinates:
- `W`: White-matter integrity / reserve
- `S`: Senescence burden
- `I`: Inflammation
- `C`: Cognition-related latent factor
- `M`: Motor/functional factor
- `A`: Chronological Age

### 2.2 ODE Dynamics Interface
The dynamics will be defined in `hcalc/brain_aging/dynamics.py` as:
$$ \frac{d\mathbf{x}}{dt} = f(\mathbf{x}, t, \mathbf{p}) $$
where $\mathbf{p}$ is a `BrainAgingParams` dataclass.

### 2.3 Filtering & Simulation
- **`simulate_dynamics`**: Performs numerical integration (Euler/RK4) along a time grid.
- **`run_filter`**: Implements EKF, UKF, or Particle Filters to estimate latent states from observed biomarkers.

---

## 3. Rationale

- **Coordinate Stability**: Explicit mapping in `state.py` ensures that Jacobian calculations and matrix operations (e.g., Fisher Information) remain consistent.
- **Pluggable Integration**: Separating the ODE RHS (`f_ode`) from the integrator (`integrate_ode_euler`) allows for future optimization (e.g., using SciPy or JAX).

---

## 4. Implementation Details

```python
# State coordinate mapping
STATE_INDEX: Dict[StateName, int] = {
    "W": 0, "S": 1, "I": 2, "C": 3, "M": 4, "A": 5
}
```

- **ODE Structure**: dx/dt for each component (e.g., $dW/dt = -k_{WS} \cdot S \cdot W$).
- **Invariants**: Age component ($A$) must increase linearly ($dA/dt = 1.0$).

---

## 5. Consequences

- **Positive**: Mathematical source of truth is centralized and testable.
- **Negative**: Requires careful parameter calibration to ensure stability over long horizons (decades).
