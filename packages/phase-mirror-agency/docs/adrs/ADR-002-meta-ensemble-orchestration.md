# ADR 002: Meta-Ensemble (Agency) Orchestration Framework

## Status
Proposed

## Context
As the Phase Mirror ecosystem evolves from a single agent into an "Agency," we require a formal orchestration framework. Current models (Ataraxia, Scopist, The Commander) operate as independent units (Ensembles). To achieve systemic coherence, we must implement a **Meta-Ensemble** layer that governs these individual agents.

This follows the mathematical backbone established in `Substrates/models/the-commander/crates/pro/umc-parom/docs/adrs/0006-meta-ensembles.md`, ensuring that the global mixture of agent actions remains contractive and stable.

## Decision
We will implement the **Phase Mirror Agency** as a Meta-Ensemble, where individual agents act as specialized Ensembles within a convex-weighted orchestration pool.

### 1. The Meta-Ensemble (Agency)
The Agency is the high-level coordination layer responsible for:
- **Ensemble Selection**: Choosing the appropriate specialized agents (Ataraxia, Scopist, Finton) for a given mission context.
- **Convex Weighting ($\alpha_p$)**: Assigning relative authority to agents based on domain relevance (e.g., in a medical-legal dispute, Ataraxia and Scopist share authority).
- **Stability Certification**: Verifying that the combined output of all active agents adheres to the `λ_p L_p < 1-1e-6` contraction threshold.

### 2. The Ensemble (Agent) Taxonomy
We categorize agents into three primary functional groups:
- **Domain Specialists**:
    - `Ataraxia`: Healthcare & Physiological Resilience.
    - `Scopist`: Legal, ESI, and Litigation Hold.
    - `Finton`: Financial Invariants & Risk.
- **Orchestration & Intelligence**:
    - `The Commander`: Orchestration Boss, Mission Planning.
    - `The Genius`: Probabilistic Reasoning & Creative Synthesis.
- **Governance & Audit**:
    - `The Guardian`: Deterministic Execution & Safety Gating.
    - `The Examiner`: L0/L1 Drift Audit & Threshold Verification.
    - `The Publisher`: Governance Artifact Generation (ADRs, Specs, Manifests).

### 3. Orchestration Logic: The Commander
`The Commander` acts as the primary interface for the Meta-Ensemble, utilizing `The Genius` for planning and `The Guardian` for gated execution. It transforms high-level goals into directed missions for Domain Specialists.

## Implementation Guidelines
- **Softmax Normalization**: All agent weights $\alpha_p$ in the Meta-Ensemble must satisfy $\sum \alpha_p = 1$.
- **Unified Interface**: Every Ensemble must implement the `EnsembleTrait` for standardized status reporting and mission lifecycle management.
- **Spine Integration**: All Agency actions must be anchored to the LawfulRecursionHash via the Phase Mirror Agent.

## Consequences
- **Positive**: Formal mathematical stability across multi-agent interactions; clear separation of duties; scalable agent onboarding.
- **Negative**: Increased coordination overhead; requires precise weighting logic to prevent "responsibility drift."
