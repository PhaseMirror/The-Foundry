# SPEC-LAWFULNESS: Structural Integrity and Validation-First Gate

## 1. Overview
This specification formalizes the **Validation-First Gate** and **Lawfulness Budgeting** as defined in [ADR-009](../adr/ADR-009.md).

## 2. Validation-First Gate
No canonical "cell" (conjecture or model component) may be promoted to "Accepted" status or integrated into a production agent unless it satisfies the following:
- **Numerical Grounding:** At least one reproducible numerical result (e.g., MNIST benchmark) must be provided.
- **Artifact Hash:** The evidence must be stored in a permanent artifact store with a verifiable SHA-256 hash.
- **Compliance Link:** The module manifest (`module.adr.json`) must explicitly link to the evidence.

## 3. ACE Budget (Absolute Contraction Energy)
We define a **Lawfulness Budget** to prevent "conjecture bloat" and non-computable state collapse.
- **Budget Allocation:**
    - 50% Stable/Validated (Balanced Type).
    - 25% Established Research (Exploratory Type).
    - 25% Speculative/High-Risk (High-Entropy Type).
- **Monitoring:** The Meta-Controller (ADR-006) monitors the total "Energy" of active conjectures. If the speculative portion exceeds 25%, the Network Governor (ADR-003) will throttle new high-risk requests.

## 4. Prime-Ordered Closure
Development gaps are re-ordered into a prime-indexed roadmap to ensure structured growth:
- **7-Day Cycle (Prime 7):** Local module refinement and unit testing.
- **30-Day Cycle (Composite 2*3*5):** Substrate integration and benchmark sweeps.
- **90-Day Cycle (Composite 2*3^2*5):** Full system evaluation and ADR review.
