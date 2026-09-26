# ADR-033: Clinical Labs Analytics Bridge for State Space

- **Status:** Proposed
- **Date:** 2026-04-15
- **Owners:** Lead Healthcare Theorist, Eng
- **Related ADRs:** ADR-031, ADR-032, ADR-034
- **Systems:** clinical labs analytics

---

## 1. Context

The latent states modeled in `hcalc` are not directly observable. We require a bridge layer in `clinical labs analytics` to map these states to observable biomarkers (e.g., p16, SASP, NfL) with specific units, normal ranges, and measurement noise.

---

## 2. Decision

We will implement the `ClinicalLabsBridge` in `packages/healthcare/clinical labs analytics/bridge_brain_aging.py`.

### 2.1 Biomarker Metadata
Each observable biomarker is defined by `BiomarkerMeta`:
- `code`: Lab/assay code (e.g., `LAB_P16`).
- `unit`: Physical units (e.g., `pg/mL`, `ratio`).
- `transform`: Measurement transform (`identity`, `log`, `zscore`).

### 2.2 Measurement Equations
The bridge implements $h(\mathbf{x})$, the deterministic mapping from latent state $\mathbf{x}$ to observation $y$:
$$ y = h(\mathbf{x}) + \eta $$
where $\eta \sim \mathcal{N}(0, \sigma^2)$ is the measurement noise.

---

## 3. Rationale

- **Encapsulation**: All lab semantics (codes, unit conversions, transforms) are isolated in the `clinical labs analytics` package. `hcalc` remains agnostic to lab codes.
- **Traceability**: Mapping from latent state to z-score or log-scale ensures that the engine works with numerically stable values while the bridge provides human-readable clinical outputs.

---

## 4. Implementation Details

- **Example Mapping**: `p16` is mapped as an exponential function of the Senescence burden (`S`): `val = exp(x.S)`.
- **Noise Sampling**: Bridge provides a `sample_noise` utility for in-silico trial simulation.

---

## 5. Impact

- **Code / Modules**: `packages/healthcare/clinical labs analytics/bridge_brain_aging.py`.
- **Mathematical**: Defines the observation model $H$ used by the EKF/UKF in `hcalc`.
