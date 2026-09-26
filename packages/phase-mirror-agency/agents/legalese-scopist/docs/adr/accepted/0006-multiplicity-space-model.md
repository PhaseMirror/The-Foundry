# ADR-0006: PhaseMirror Legal Multiplicity Space and Archetypes

## Status
Accepted

## Context
Legal strategy is often reduced to "vibes" or ad-hoc checklists. To ensure high-integrity litigation support, we need a formal representation of litigation states and strategic moves (operators).

## Decision
We adopt the Multiplicity Space model for PhaseMirror Legal:
1. **State Encoding ($M_t$)**: A litigation state is represented as $M = \prod p_i^{e_i}$, where $p_i$ are prime-indexed dimensions:
    - $P_2$: Standing Defects
    - $P_3$: Service Defects
    - $P_5$: Arbitration Leverage
    - $P_7$: Evidentiary Gaps
    - $P_{11}$: Procedural Rules
    - $P_{13}$: Cost/Risk Asymmetry
2. **Operators ($T_k$)**: Strategic moves act as multiplicative or divisive operations on $M_t$, mutating the exponents in a controlled, statistical way.
3. **Constraint Layer**: The agent acts as a "Judicial Mirror," proposing operators and projecting their impact on $M_t$, but never providing direct legal advice.
4. **Archetype Implementation**: The system will prioritize depth in three matters:
    - Standing-chain matter (P2, P7, P11)
    - Compel-arbitration matter (P5, P13)
    - Service/procedural-defect matter (P3, P11)

## Consequences
- Strategy becomes a deterministic, time-indexed sequence $\{M_t\}$.
- Enables machine-checkable compliance through rule packs (e.g., Clackamas SLR).
- Forces all legal narratives to be grounded in the multiplicity vector.
