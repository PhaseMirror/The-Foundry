# ADR-031: Phased Brain-Aging State Space Implementation Plan

- **Status:** Proposed
- **Date:** 2026-04-15
- **Owners:** Lead Healthcare Theorist, Eng
- **Related ADRs:** ADR-027, ADR-032, ADR-033, ADR-034
- **Systems:** hcalc, clinical labs analytics, healthspan

---

## 1. Context

The brain-aging state space integration requires a unified architectural approach to map latent biological states (White-matter, Senescence, Inflammation, Cognition, Motor, Age) to observable clinical biomarkers and trial designs. This integration spans three primary healthcare modules:
- **hcalc**: Core ODE dynamics and state vector filtering (EKF/UKF/PF).
- **clinical labs analytics**: Mapping between latent states and lab-grade biomarkers (transforms, units, noise).
- **healthspan**: High-level trial scenario configuration and recommendation engine.

---

## 2. Decision

We will implement the brain-aging state space in three distinct phases, mirroring the dependency graph from mathematical modeling to clinical application.

### Phase 1: Mathematical Bedrock (hcalc)
- **Objective**: Implement the core `BrainAgingEngine` and ODE dynamics.
- **Key Artifacts**: 
  - [ADR-032](./ADR-032-hcalc-brain-aging-engine-and-dynamics.md)
  - `hcalc/brain_aging/engine.py`: ODE integration and filtering logic.
  - `hcalc/brain_aging/state.py`: Latent state vector mapping (W, S, I, C, M, A).
- **Gates**: Successful simulation of latent trajectories; EKF/UKF convergence on synthetic data.

### Phase 2: Biomarker Bridging (Clinical Labs)
- **Objective**: Define the `ClinicalLabsBridge` for mapping latent states to observations.
- **Key Artifacts**:
  - [ADR-033](./ADR-033-clinical-labs-biomarker-bridge.md)
  - `clinical_labs_analytics/bridge_brain_aging.py`: Biomarker metadata and measurement equations.
- **Gates**: Accurate translation of latent states to biomarker-specific units (e.g., pg/mL for p16) and transforms (e.g., log).

### Phase 3: Trial Synthesis (Healthspan)
- **Objective**: Expose the state space through the `healthspan` recommendation engine.
- **Key Artifacts**:
  - [ADR-034](./ADR-034-healthspan-trial-design-interface.md)
  - `healthspan/brain_aging_trial.py`: Scenario-based trial design and Fisher Information analysis.
- **Gates**: End-to-end recommendation of biomarker panels for specific clinical trial scenarios.

---

## 3. Rationale

- **Separation of Concerns**: hcalc handles the "heavy math" (ODEs), clinical labs handles the "domain knowledge" (lab codes/units), and healthspan handles the "business logic" (trial recommendations).
- **Extensibility**: The state space model can be swapped or refined in hcalc without breaking the clinical or trial-facing APIs.
- **Verification**: Each phase has specific gates ensuring mathematical validity before proceeding to clinical application.

---

## 4. Phased Execution Roadmap

| Step | Owner | Artifact | Horizon | Status |
| :-- | :-- | :-- | :-- | :-- |
| 1 | Eng | hcalc/brain_aging/state.py (Mapping) | 3 days | Planned |
| 2 | Eng | hcalc/brain_aging/dynamics.py (ODE) | 5 days | Planned |
| 3 | Eng | hcalc/brain_aging/engine.py (Filter) | 7 days | Planned |
| 4 | Lead | bridge_brain_aging.py (Biomarkers) | 10 days | Planned |
| 5 | Lead | healthspan/brain_aging_trial.py (Scenarios) | 14 days | Planned |

---

## 5. Impact

- **Code / Modules**: `packages/healthcare/hcalc`, `packages/healthcare/clinical labs analytics`, `packages/healthcare/healthspan`.
- **Protocols / APIs**: New `BrainAgingState` and `TrialDesign` protocols.
- **Mathematical**: ODE-driven state estimation as the source of truth for brain aging.
