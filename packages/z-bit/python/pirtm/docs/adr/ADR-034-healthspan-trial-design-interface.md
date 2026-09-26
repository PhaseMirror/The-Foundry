# ADR-034: Healthspan Trial Design & Recommendation Interface

- **Status:** Proposed
- **Date:** 2026-04-15
- **Owners:** Lead Healthcare Theorist, Eng
- **Related ADRs:** ADR-031, ADR-032, ADR-033
- **Systems:** healthspan

---

## 1. Context

The `healthspan` layer represents the clinical application surface. It needs to provide a high-level API for researchers to design in-silico trials and receive recommendations for biomarker panels and sample sizes, without requiring direct knowledge of the underlying ODEs or lab codes.

---

## 2. Decision

We will implement the trial design interface in `packages/healthcare/healthspan/brain_aging_trial.py`.

### 2.1 Scenario Configuration
Users define `TrialScenarioConfig` which includes:
- `target_population`: Baseline risk and age range.
- `intervention_protocol`: Dosing and timing.
- `design`: Measurement schedule and candidate biomarkers.

### 2.2 Recommendation Engine
The `design_brain_aging_trial` function acts as the orchestrator:
1. Calls `hcalc.evaluate_trial_design` using the bridge from `clinical labs analytics`.
2. Computes Fisher Information for the candidate design.
3. Ranks biomarker subsets and suggests a minimum sample size ($N$) based on total information.

---

## 3. Rationale

- **Abstraction**: Researchers interact with "scenarios" and "recommendations" rather than "integration steps" or "Jacobians".
- **Domain Alignment**: The API speaks the language of clinical trials, making the complex mathematical modeling accessible to domain experts.

---

## 4. Implementation Details

- **Fisher Information**: Used to quantify how much information a given measurement schedule provides about the latent parameters (e.g., $k_{WS}$).
- **Sample Size Hint**: A monotone mapping from total information to suggested $N$ ensures that more informative panels require smaller cohorts.

---

## 5. Impact

- **Code / Modules**: `packages/healthcare/healthspan/brain_aging_trial.py`.
- **Operational**: Simplifies the process of identifying optimal biomarker panels for new anti-aging interventions.
