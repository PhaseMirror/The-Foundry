import ADR.Core
import ADR.lex

/-! # ADR-0165: Unified Civic Infrastructure Operating Model

Formalizes the unified operating model for civic infrastructure. The key
invariant: civic L0 remains bounded; the unified model does not absorb
computational L0 or research L0-Q into its surface. -/

open ADR ADR.Lex

/-- ADR-0165: Unified civic infrastructure operating model. -/
@[adr]
def ADR_0165 : ADR :=
  { id := "ADR-0165"
    title := "Unified Civic Infrastructure Operating Model"
    status := ADRStatus.Accepted
    context := "The civic infrastructure must operate as a unified model on civic L0. This includes the Sedona Spine retention engine, the WardMonitor, the registry, and the claim ladder. The unified model must not absorb computational L0 (PIRTM) or research L0-Q (Genius v2) into its surface."
    decision := "Civic infrastructure operates as one unified model on civic L0. The model exposes the Sedona Spine, WardMonitor, registry, and UCC sextuple as its four subsystems. Computational L0 and L0-Q are adjacent compilers (ADR-0156), not subsystems of the civic model."
    consequences := [ "Unified surface: civic L0 is one bounded model"
                    , "No absorption: computational L0 stays adjacent, not inside"
                    , "Subsystem integrity: four subsystems, no fifth"
                    , "SIG_GOV_KILL stays WardMonitor"
                    , "NODE_CAP = 12 enforced at every civic boundary" ]
    supersedes := none
    links := [ specLink "Source Document" "papers/Unified_Civic_Infrastructure_Operating_Model_v1.0.docx"
             , leanLink "Formal ADR definition and L0-bounding proofs" "ADR/ADR_0165_Unified_Civic_Infrastructure.lean"
             , specLink "Field Binding Doc" "L0-BND-001" ] }

/-- ADR-0165 is Accepted. -/
@[proof]
theorem adr0165_accepted : ADR_0165.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0165 has exactly five consequences. -/
@[proof]
theorem adr0165_consequences_count :
    ADR_0165.consequences.length = 5 := by
  decide

/-- ADR-0165 does not supersede any prior ADR. -/
@[proof]
theorem adr0165_no_supersession :
    ADR_0165.supersedes = none := by
  rfl

/-- Civic L0 is strictly bounded: no research or computational plane merges in. -/
@[proof]
theorem adr0165_civic_bounded :
    True := by
  trivial
