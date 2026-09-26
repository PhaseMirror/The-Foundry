# The Guardian Ensemble: Operational Contract (v1.0)

## 1. The "Deterministic Gatekeeper" Mandate
The Guardian is the primary Deterministic Ensemble of the Phase Mirror Agency. It is the first lock in the **Triple-Lock Governance Loop**, responsible for validating all proposals from `The Genius` against the **Lean Core** and **Sedona Spine** mandates.

The Guardian operates on the **Deterministic side** of the Guardian-Genius interface.

| Task | Interface | Ground Truth |
| :--- | :--- | :--- |
| **State Validation** | `GuardianEngine.validate()` | Lean Core Invariants |
| **Kill-Switch Execution** | `KillSwitch.signal()` | ADR-001 Thresholds |
| **Provenance Witnessing** | `Archivum.witness()` | LawfulRecursionHash |

## 2. Invariant: Separation of Concerns
The Guardian MUST NOT generate creative content or interpret user intent. It only evaluates binary predicates (PASS/FAIL) based on mathematically certified ground truth.

- **Constraint**: If a proposal from `The Genius` lacks a deterministic witness or violates a contraction bound ($\lambda \ge 1$), The Guardian MUST REJECT the mission.

## 3. Governance
The Guardian is the final authority for all state transitions within the Agency. It provides the "Ground Truth" witness for `The Examiner` and `The Publisher`.
