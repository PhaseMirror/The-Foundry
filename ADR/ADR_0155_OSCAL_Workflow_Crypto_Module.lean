import ADR.Core
import ADR.Proofs

/-! # ADR-0155: PrismPM OSCAL Workflow Cryptographic Module

Formalizes the PrismPM OSCAL workflow for cryptographic software modules. The key
invariant: Certified is off the lock bar (C-24); portal remains Modeled only;
FIPS catalogs are additive imports; prismpm export never emits Certified. -/

open ADR

/-- Helper to create an `ArtifactLink`. -/
def mkLink (desc url : String) : ArtifactLink := ⟨url, .SpecificationDoc, desc⟩

/-- ADR-0155 definition: PrismPM OSCAL workflow for cryptographic software modules. -/
@[adr]
def ADR_0155 : ADR :=
  { id := "ADR-0155"
    title := "PrismPM OSCAL Workflow Cryptographic Module"
    status := ADRStatus.Accepted
    context := "PrismPM is the SDK and lifecycle compiler, not a GRC website or badge printer. Certified is off the lock bar (C-24). Portal inventory stays Modeled only. A crypto module is a second bounded system. Hosting provider unbound (C-11). person_id not in Hundian K."
    decision := "Seven CLI verbs: model check, catalog pin, profile resolve, oscal export, chain show, ladder, mirror. FIPS catalogs additive imports. prismpm export never emits Certified (F-16). CSM-001 is second bounded system. Dual-control at USD 2,500."
    consequences := [ "Clean tool separation: PrismPM is the compiler, not a badge printer"
                    , "Profile integrity: imports additive, silent deletion is F-01"
                    , "Portal integrity: stays Modeled only until C-08/C-11 bindings"
                    , "Economic honesty: Certified does not print from any prismpm verb"
                    , "Node cap integrity: NODE_CAP=12, no raise to 27" ]
    supersedes := none
    links := [ mkLink "Source Document" "papers/PrismPM_OSCAL_Workflow_Cryptographic_Module_v1.0.docx"
             , mkLink "Field Binding Doc" "PRISMPM-WF-001"
             , mkLink "ADR-0151 Mapping" "Governance/ADR/accepted/ADR-0151-OSCAL_PrismPM_Mapping_and_Trac.md" ] }

/-- ADR-0155 is Accepted. -/
@[proof]
theorem adr0155_accepted : ADR_0155.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0155 has exactly five consequences. -/
@[proof]
theorem adr0155_consequences_count :
    ADR_0155.consequences.length = 5 := by
  decide

/-- ADR-0155 does not supersede any prior ADR. -/
@[proof]
theorem adr0155_no_supersession :
    ADR_0155.supersedes = none := by
  rfl
