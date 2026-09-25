# ADR-PML-063: Universal Atomic Crate Job Classification (Docs-Governance Helper vs UCC Kernel)

## Status
Proposed

## Axis (Phase Mirror tension class)
classification vs implementation

## Owner (multi-agent lever)
`Profile maintainer`

## Dissonance Score
- Impact = severity (4) x blast radius (15) = **60**
- Tractability = **4.0**
- **Score = 240.0**

## Context (stated intent vs implementation)

### Stated intent (documents)
- The Universal Closure Calculator (UCC) is intended to be a formally verified engine written in Lean 4 that acts as the Year One closure kernel (`POST /close`).
- It must mathematically prove that an `Accepted` ADR is immutable unless explicitly `Superseded`.
- Consequence entailment must strictly bind the context and decision to the consequences.

### Implementation reality (both corpora)
- Code exists at `Foundations/universal_atomic/lean/src/ADR/*` (namespace `UAC.ADR`) and `ADR/Core.lean` (namespace `ADR`).
- These modules define an `inductive ADRStatus` with four constructors.
- However, `ADR/Core.lean` natively allows a transition to `Deprecated` (`ValidTransition Accepted Deprecated none`), and the structure itself is a mutable record allowing arbitrary field updates (`{ a with status := Proposed }`).
- Existing theorems like `accepted_immutable` are tautological (`a.status = Accepted \vdash a.status = Accepted`) and do not prove transition immutability.
- The `Entails` relation evaluates unparsed strings as propositions, achieving syntax validation but lacking semantic binding between English text and logical consequences.

### Contradiction (productive)
A narrative report claimed the existing `universal_atomic` framework satisfied the formal L0 requirements for the UCC kernel. In reality, the mathematical foundation of these crates allows structural mutation and illegal state progressions. The contradiction arises from treating a 4-value enum and a propositional toy logic as equivalent to a closure kernel that locks civic state.

### Hidden assumptions
- **Syntax vs Semantic Binding**: Assuming that mapping strings to variables in an `Entails` logic represents true entailment of civic consequences.
- **Record Mutation Unseen**: Believing that defining an `Accepted` state inherently locks the data, overlooking that Lean structures permit field-replacement updates unless transitions are exclusively gated by a dedicated relation.

### Manifested boundary
The boundary manifested when a compliance checklist treated the presence of `universal_atomic` as evidence of a green build for the UCC kernel, forcing the $G=0$ posture to reject the report. The code's actual properties do not match the required invariants.

## Decision (the lever)
1. **Classify the Existing Crate**: Formally name the job of the existing `universal_atomic` crate and `ADR/Core.lean` as a **docs-governance helper** operating under UAC research constraints (`L0-Q`). 
2. **Deny UCC Status**: Explicitly state that these files are **not** the year-one UCC kernel and do not provide closure.
3. **Transition Mandate**: The true year-one UCC kernel is defined by `UCC-FD-001` as the `POST /close` API closure boundary. It is not an ADR `Step` enum machine.

## Consequences
- **Positive**: Correctly scopes the existing crates as syntax helpers for CI, keeping the sales and civic surfaces clean ($G=0$). It clears the runway for a rigorous UCC design.
- **Negative / Constraints**: The true year-one UCC kernel must be built from scratch (or significantly refactored) in a separate path, demanding stricter mathematical proof of `accepted_next`.
- **Verification Strategy**: Code review strictly checks for `--reject-sorry` and ensures no field-update lemmas are misnamed as "immutable."

## Metrics (resolution is confirmed when)
- This classification ADR is accepted and integrated into the ledger.
- Pilot Lead verifies no public pages or sales surfaces cite the `universal_atomic` crate or `ADR/Core.lean` as UCC production.
- Future UCC implementation utilizes a rigorous `inductive Step` transition and is housed outside the `universal_atomic` path.

## Actionable Levers
1. Release/Lean steward drops any claims of immutability attached to `UAC.ADR`.
2. Profile maintainer segregates the UAC research from the UCC kernel deliverables.
3. Lean reviewer strictly rejects PRs to the future UCC that simulate transitions via structure updates.

## Links
- Step 0 / L0 freeze
- UCC-FD-001
- ADR-0001 Lean posture
- Existing `UAC.ADR` tautological proofs
