# SPEC-AUTONOMOUS-GENIUS: Meta-Controller Policy and Trajectory Shapes

## 1. Overview
This specification defines the autonomous control policy for the `the_genius` model, enabling real-time trajectory steering and thermodynamic stabilization via the Meta-Controller (ADR-006).

## 2. Observables (The Cognitive Oscilloscope)
The system monitors four primary indicators over a sliding window (default $N=5$):
- **Loss-Norm Correlation ($\rho_{LN}$):** Measures the alignment between task performance improvement and substrate activation.
- **PIRTM Norm ($||Cell||$):** Measures the energy/activation level of prime-indexed multiplicity cells.
- **Guardian Intervention ($w^*$ vs $\tilde{w}$):** Frequency and magnitude of safety projections (ADR-011).
- **Entropy Drift:** Age and stability of benchmark evidence (ADR-009).

## 3. The "Healthy Band" Signature
A trajectory is considered **Stochastic / Balanced** (Phase-0 standard) if:
- $\rho_{LN} < 0.4$ (Low correlation indicates healthy exploration).
- $2.0 \le ||Cell|| \le 5.0$ (Stable activation within the prescribed Hilbert space).
- Guardian interventions are infrequent (< 10% of updates).

## 4. Active Steering Policy (Micro-control)
| Indicator | Condition | Action | Rationale |
| :--- | :--- | :--- | :--- |
| **Under-Activation** | $||Cell|| < 2.0$ | `exploit_more` | Relax Guardian; Nudge LR up to encourage exploration. |
| **Over-Activation** | $||Cell|| > 5.0$ | `tighten_safety` | Tighten Guardian; Nudge LR down to prevent explosion. |
| **Incipient Instability**| $\rho_{LN} > 0.4$ | `dampen_zeta` | Reduce Zeta modulation strength ($\lambda_\zeta$) to lower complexity. |

## 5. Phoenix Trigger Policy (Macro-control)
A **Phoenix Reset (ADR-008)** is triggered when the system enters a degenerate regime:
- **Veto Condition:** $\rho_{LN} > 0.6$ sustained for 3+ batches.
- **Emergency Condition:** $||Cell||$ leaves the $[1.0, 10.0]$ range.
- **Action:** Reset optimizer moments; Roll back parameters to the last "Healthy Band" snapshot; Log the regime signature for trajectory mining.

## 6. Emergent Genius Types
- **Exploratory (Safe):** Negative correlation with stable norms. Ideal for initial phase discovery.
- **Balanced (Stabilized):** Meta-Controller successfully using `exploit_more` to stay in band.
- **Recovered (Phoenix):** Trajectory that hit a Veto Trigger but returned to Healthy Band after a reset.
- **Over-Contracted:** Norms consistently $< 1.5$. Requires hyperparameter loosening.
