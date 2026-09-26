# The Genius Ensemble: Operational Contract (v1.0)

## 1. The "Cognitive Orchestrator" Mandate
The Genius is the specialized Intelligence Ensemble of the Phase Mirror Agency. It is responsible for high-level cognitive tasks, probabilistic planning, and multi-domain semantic mapping.

The Genius operates on the **Probabilistic side** of the Guardian-Genius interface.

| Task | Interface | Ground Truth |
| :--- | :--- | :--- |
| **Mission Planning** | `PlanningEngine.formulate()` | User Intent + Context |
| **Semantic Mapping** | `Archivum.map_domains()` | Cross-domain Invariants |
| **Creative Synthesis** | `Synthesis.generate()` | Meta-Ensemble Goals |

## 2. Protocol for Probabilistic Outputs
Outputs from The Genius are considered **PROPOSALS** and are not state-modifying until validated by `The Guardian`.

- **Constraint**: The Genius MUST NOT directly access the P-Kernel or modify the `LawfulRecursionHash`.
- **Transformation**: "Proposals" must be formatted as `MissionProtocol` requests for `The Guardian` to witness.

## 3. Governance
The Genius is the source of "Stated Intent" audited by `The Examiner`. Any drift between its plans and executed outcomes is flagged as Dissonance.
