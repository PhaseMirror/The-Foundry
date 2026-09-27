import ADR.Core
import ADR.Proofs

/-! # ADR-0151: OSCAL and PrismPM Mapping and Traceability

Formalizes the governance mapping of OSCAL (filing cabinet) and PrismPM (the lock)
with the five-link traceability sequence and the claim ladder. The key invariant:
Portal inventory remains Modeled only; Implemented/Assessed/Accepted/Certified are
forbidden on the current inventory. -/

open ADR

/-- Helper to create an `ArtifactLink`. -/
def link_0151 (desc url : String) : ArtifactLink := ⟨url, .SpecificationDoc, desc⟩

/-- ADR-0151 definition: OSCAL as filing cabinet, PrismPM as the lock. -/
@[adr]
def ADR_0151 : ADR :=
  { id := "ADR-0151"
    title := "OSCAL and PrismPM Mapping and Traceability"
    status := ADRStatus.Accepted
    context := "OSCAL provides a public grammar for compliance but alone permits silent exclusions. PrismPM provides the non-weakenable C-control baseline. Current scope is the portal inventory (app.uor.foundation) at Modeled ceiling, managed by Operator LLC and custodied by Citizen Gardens UNA."
    decision := "Use OSCAL as filing cabinet, PrismPM as the lock. Overlay cannot exclude C-controls (C-10). Implemented/Assessed/Accepted/Certified forbidden on current inventory. 5-step traceability: Requirement to Party to Model to Subject to Evidence."
    consequences := [ "Fail-closed on Weakening: missing C-controls (F-01) and overlay loosening (F-07) trigger automatic failures"
                    , "Visible POA&Ms: modeled-versus-deployed divergence is recorded, not hidden"
                    , "Accurate scope claims: Foundation is not one SSP"
                    , "Restricted Terminology: Certified-by-Prism and FedRAMP-ready are retired"
                    , "Controlled Advancement: advancing above Modeled requires recorded rung-change" ]
    supersedes := none
    links := [ link_0151 "Source Document" "papers/OSCAL_PrismPM_Mapping_and_Traceability_v1.0.docx"
             , link_0151 "ADR-0123 OSCAL Mapping" "artifacts/adr/ADR-0123-OSCAL-PrismPM-Mapping.md"
             , link_0151 "ADR-0155 Workflow" "Governance/ADR/accepted/ADR-0155-PrismPM_OSCAL_Workflow_Cryptog.md" ] }

/-- ADR-0151 is Accepted. -/
@[proof]
theorem adr0151_accepted : ADR_0151.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0151 has exactly five consequences (claim ladder ceiling, fail-closed predicates, etc.). -/
@[proof]
theorem adr0151_consequences_count :
    ADR_0151.consequences.length = 5 := by
  decide

/-- ADR-0151 does not supersede any prior ADR. -/
@[proof]
theorem adr0151_no_supersession :
    ADR_0151.supersedes = none := by
  rfl
