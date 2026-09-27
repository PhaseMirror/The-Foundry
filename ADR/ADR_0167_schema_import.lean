import ADR.Core
import ADR.lex

/-! # ADR-0167: schema.org Import Discipline

Formalizes the schema.org import discipline for evidence objects. The key
invariant: schema.org metadata is additive import only; it cannot override
C-controls or widen the claim ladder ceiling. -/

open ADR ADR.Lex

/-- ADR-0167: schema.org import discipline. -/
@[adr]
def ADR_0167 : ADR :=
  { id := "ADR-0167"
    title := "schema.org Import Discipline"
    status := ADRStatus.Accepted
    context := "schema.org provides a public grammar for evidence metadata. It is an additive import, not a baseline. schema.org imports cannot override C-controls (C-10) or widen the claim ladder ceiling (ADR-0151). Certified-by-Prism and FedRAMP-ready remain retired."
    decision := "schema.org is an additive input layer. Its metadata enriches evidence records but does not widen the claim ladder or override C-controls. prismpm export never emits Certified from schema.org metadata alone."
    consequences := [ "Additive only: schema.org enriches, never overrides C-controls"
                    , "Claim ladder integrity: schema.org cannot raise ceiling"
                    , "No silent exclusions: missing schema fields are visible defects"
                    , "Certified discipline: prismpm export never emits Certified"
                    , "Terminology hygiene: Certified-by-Prism and FedRAMP-ready retired" ]
    supersedes := none
    links := [ specLink "Source Document" "papers/schema_org_Import_Discipline_v1.0.docx"
             , leanLink "Formal ADR definition and import-integrity proofs" "ADR/ADR_0167_schema_import.lean"
             , specLink "ADR-0151 Mapping" "Governance/ADR/accepted/ADR-0151-OSCAL_PrismPM_Mapping_and_Trac.md" ] }

/-- ADR-0167 is Accepted. -/
@[proof]
theorem adr0167_accepted : ADR_0167.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0167 has exactly five consequences. -/
@[proof]
theorem adr0167_consequences_count :
    ADR_0167.consequences.length = 5 := by
  decide

/-- ADR-0167 does not supersede any prior ADR. -/
@[proof]
theorem adr0167_no_supersession :
    ADR_0167.supersedes = none := by
  rfl
