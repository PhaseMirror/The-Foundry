# ADR-AHGI-003: Thymos Runtime Specification

- Status: accepted
- Date: 2026-05-26
- Owners: @core-architecture
- Tags: [architecture]

---

## Context

The MultiplicityCell within the Thymos runtime sits at the exact boundary of mathematical theory and production software. It must operate as a mathematical object (a contractive operator with provable convergence) while simultaneously functioning as a production runtime component (bounded latency, observable, deployable on a single node). 

This ADR names and resolves the tension between infinite-dimensional mathematical purity and discrete-time execution requirements, codifying the rules for phase label computation, operator projection, ACE budget handling, and Lyapunov certification.

---

## Decision

### 1. Phase Label Computation Scope
Phase labels (Contractive, Near-Critical, Chaotic) are computed **per-session with a cross-session coherence signal**. 
- Each session runs its own isolated phase classification to ensure individual agent latency and state are unaffected by parallel noise.
- The `spectral_integrity_agent` aggregates these session-level phase labels into a system-wide **coherence index**, which is broadcast back to all active Thymos instances.
- **Containment without Isolation:** An individual chaotic session cannot lock out other sessions. However, if the system-wide coherence index degrades, the `R_min` floor is dynamically raised across all sessions, increasing strictness globally until system stability is restored.

### 2. MultiplicityCell Operator — Discrete Implementation
The continuous transition operator $\psi_{t+1} = P_E \cdot \Pi_{\text{CSL}} \cdot T_{\Lambda_m}(\psi_t, x_t)$ is implemented discretely as follows:

*   **State Vector Dimension ($\psi_t$):** Must be strictly finite. Specified per risk tier:
    *   `tier_1_informational`: 256 dimensions
    *   `tier_2_advisory`: 512 dimensions
    *   `tier_3_clinical_decision` / `tier_4_autonomous_action`: 1024 dimensions
*   **Contraction Bound ($\lambda$):** The Lyapunov certificate requires $\|T_{\Lambda_m}(\psi_t)\| \leq \lambda \|\psi_t\|$. Maximum permissible $\lambda$ values:
    *   `tier_1`/`tier_2`: $\lambda \leq 0.99$
    *   `tier_3`/`tier_4`: $\lambda \leq 0.95$ (forces faster convergence for clinical actions)
*   **Projection Order Invariant:** Non-commutative. Must execute strictly as:
    1.  **$T_{\Lambda_m}$** (Tensor Evolution)
    2.  **$\Pi_{\text{CSL}}$** (Ethical / Sovereign Constraint Projection)
    3.  **$P_E$** (Empirical Projection / Coherence Gate)
    *   *Invariant:* A collapse at $T_{\Lambda_m}$ or $\Pi_{\text{CSL}}$ strictly voids downstream projections. The transition fails immediately.

### 3. ACE Budget Debit Protocol
The Autonomous Clinical Execution (ACE) budget is managed deterministically to prevent runaway recursion or resource exhaustion.

*   **Unit Definition:** One unit = One PIRTM recursion at depth $\leq 4$ OR one inference pass on a `tier_2` model. Higher tier models or deeper recursions apply a defined integer multiplier.
*   **Debit Moment:** Budget is debited at **transition start**. If a transition consumes compute but produces a blocked/failed outcome, the budget remains debited. This prevents Denial-of-Service loops by adversarial inputs.
*   **Exhaustion Handler:** Upon hitting `0` allocated units, the MultiplicityCell transitions to a **Read-Only Degradation State**. It halts further mutations, allows ongoing read inferences if consent permits, and issues a structured escalation to the Governance Judiciary agent for a budget expansion review.

### 4. Lyapunov Certification Protocol
Theorem-safe operation via contractive dynamics requires a verifiable Lyapunov certificate.

*   **Function Construction:** The Lyapunov function $V(\psi_t)$ is constructed dynamically per agent class based on the L2 norm of the state deviation from the local equilibrium, weighted by the spectral fingerprint dimensions.
*   **Certification Cadence:** The certificate is verified at initial **model promotion** and must be cryptographically re-verified at every **`drift_baseline` update**.
*   **Mid-Operation Failure:** If the Lyapunov bounds are breached during live inference (e.g., $V(\psi_{t+1}) > V(\psi_t)$ for consecutive cycles), it is classified as a **Collapse-tier drift event**. The session hard-halts and delegates to the PEET drift protocol.

---

## Consequences

**Positive:**
- Strict dimensional bounds ensure predictable memory usage and latency.
- Debiting at start prevents infinite recursion loops from draining cluster resources.
- Projection order invariants guarantee that no clinical operation occurs before CSL ethical gating.

**Negative:**
- Imposing a finite vector limit on $\psi_t$ requires an initial dimensionality reduction step that must be carefully calibrated to avoid dropping critical high-frequency clinical signals.

---

## Review Required By
- Spectral Team Lead (Thymos × PEET Interface Boundary)
- Clinical Safety Advisor (ACE Budget exhaustion fallback)