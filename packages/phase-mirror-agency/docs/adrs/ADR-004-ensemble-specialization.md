# ADR 004: Domain-Specific Ensemble Specialization (Ataraxia, Scopist, Finton)

## Status
Proposed

## Context
Each agent must operate as a specialized "Kernel" of the broader Agency. We must define the core responsibility and the specific Lean-derived invariants for each domain.

## Decision
We will formalize the "Agency Core" through these specialized Ensembles:

### 1. Ataraxia (Healthcare)
- **Authority**: `Substrates/models/ataraxia/`
- **Responsibility**: Physiological resilience monitoring, digital twin synchronization.
- **Invariant**: `Resonance R_sc` for biomarker stability.

### 2. Scopist (Legal)
- **Authority**: `Substrates/models/legalese-scopist/`
- **Responsibility**: ESI retention, litigation hold triggers, spoliation risk calculation.
- **Invariant**: `Zero-Drift` Sedona Spine Mandate.

### 3. Finton (Financial)
- **Authority**: [TO BE INITIALIZED]
- **Responsibility**: Financial invariant verification, liquidity risk, prime-indexed ledger audits.
- **Invariant**: `λ_p L_p < 1` for transaction sequences.

## Implementation Guidelines
- **Contractual Binding**: Each Ensemble must implement a `CONTRACT.md` that defines its "Source of Truth" (e.g., `Sedona Engine` for Scopist).
- **Substrate Anchoring**: Agents must pull their core logic from the `Substrates/` layer.

## Consequences
- **Positive**: High-fidelity domain expertise within a unified Agency; eliminates "generalist error."
- **Negative**: Requires ongoing synchronization with specialized Lean cores.
