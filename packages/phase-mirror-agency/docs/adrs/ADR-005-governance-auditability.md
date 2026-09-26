# ADR 005: Governance & Auditability (Guardian, Examiner, Publisher)

## Status
Proposed

## Context
The integrity of the Agency depends on a continuous audit loop. We need deterministic agents to oversee the activities of the Meta-Ensemble and the specialized Ensembles.

## Decision
We will implement a "Triple-Lock" governance loop consisting of `The Guardian`, `The Examiner`, and `The Publisher`.

### 1. The Guardian (Deterministic Gating)
- **Role**: Validates every proposed `MissionProtocol` against the **Kill-Switch** and **ADR-001** thresholds.
- **Authority**: Primary gatekeeper for all state-modifying actions.

### 2. The Examiner (Drift Audit)
- **Role**: Performs continuous MD-005 audits on the Agency manifest.
- **Authority**: Investigates dissonances between "Stated Intent" (The Genius) and "Observed Outcome" (P-Kernel).

### 3. The Publisher (Artifact Generation)
- **Role**: Generates the authoritative documentation of Agency state (ADRs, SLAs, Manifests).
- **Authority**: Final step in the "Success" path, ensuring all verified outcomes are codified as new anchors.

## Implementation Guidelines
- **Autonomous Validation**: `The Examiner` must run independently of `The Commander` to prevent circular verification.
- **Immutable Log**: All Publisher artifacts must be written to the `governance/` directory and hashed immediately.

## Consequences
- **Positive**: Near-zero probability of silent drift; complete transparency of Agency actions.
- **Negative**: Increased complexity in the "Success" path.
