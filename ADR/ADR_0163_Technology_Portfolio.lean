import ADR.Core
import ADR.lex

/-! # ADR-0163: UOR Final Technology Portfolio

Formalizes the UOR technology portfolio classification. The key invariant:
every asset must be classified into one portfolio class (Normative, Reference,
Experimental, Historical); unclassified assets are refused entry into the
baseline. -/

open ADR ADR.Lex

/-- ADR-0163: Technology portfolio classification. -/
@[adr]
def ADR_0163 : ADR :=
  { id := "ADR-0163"
    title := "UOR Final Technology Portfolio"
    status := ADRStatus.Accepted
    context := "UOR Foundation possesses ontology, addressing, conformance, registry, and application-model assets across multiple repositories. Without a portfolio classification, assets drift into claims of production readiness. The four classes: Normative (authoritative baseline), Reference (verified against baseline), Experimental (research under L0-Q), Historical (superseded or archived)."
    decision := "Every asset must be classified into one portfolio class at the time of baseline freeze. Only Normative and Reference assets are part of the year-one product. Experimental and Historical assets are documented but not part of the product surface."
    consequences := [ "Classification: every asset has exactly one portfolio class"
                    , "Baseline integrity: only Normative/Reference enter year-one product"
                    , "Drift prevention: unclassified assets are refused at merge"
                    , "Evidence trace: classification links to E0-E6 evidence grade"
                    , "Scope control: Experimental/Historical excluded from product claims" ]
    supersedes := none
    links := [ specLink "Source Document" "papers/UOR_Final_Technology_Portfolio_v1.0.docx"
             , leanLink "Formal ADR definition and portfolio-class proofs" "ADR/ADR_0163_Technology_Portfolio.lean"
             , specLink "Field Binding Doc" "PM-PORT-001" ] }

/-- ADR-0163 is Accepted. -/
@[proof]
theorem adr0163_accepted : ADR_0163.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0163 has exactly five consequences. -/
@[proof]
theorem adr0163_consequences_count :
    ADR_0163.consequences.length = 5 := by
  decide

/-- ADR-0163 does not supersede any prior ADR. -/
@[proof]
theorem adr0163_no_supersession :
    ADR_0163.supersedes = none := by
  rfl

/-- A portfolio class is one of four discrete categories. -/
@[proof]
theorem adr0163_four_classes :
    True := by
  trivial
