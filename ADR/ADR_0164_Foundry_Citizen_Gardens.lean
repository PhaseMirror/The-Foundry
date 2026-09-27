import ADR.Core
import ADR.lex

/-! # ADR-0164: UOR Foundry and Citizen Gardens UNA

Formalizes the relationship between the Foundry (civic L0) and Citizen
Gardens UNA (the 501(c)(3) steward). The key invariant: legal person and
computational L0 remain distinct; no computational artifact can name a legal
person as its sole owner. -/

open ADR ADR.Lex

/-- ADR-0164: Foundry and Citizen Gardens UNA relationship. -/
@[adr]
def ADR_0164 : ADR :=
  { id := "ADR-0164"
    title := "UOR Foundry and Citizen Gardens UNA"
    status := ADRStatus.Accepted
    context := "The Foundry operates on civic L0 under the 501(c)(3) stewardship of Citizen Gardens UNA. Operator LLC manages day-to-day execution. The legal person (UNA) and the computational plane (L0) must remain distinct. No computational artifact can name a legal person as its sole owner."
    decision := "Citizen Gardens UNA holds title; Operator LLC manages execution; Foundry operates on civic L0. All three are distinct legal/technical entities. person_id is never a seating key in the prime ledger. All capital moves require two persons in present tense (ADR-0159)."
    consequences := [ "Legal separation: UNA holds title, Operator LLC manages, Foundry computes"
                    , "Plane integrity: civic L0 and computational L0 stay distinct"
                    , "Person exclusion: person_id never binds prime ledger as a key"
                    , "Two-person rule: all capital moves require two legal persons"
                    , "No sole ownership: computational artifacts cannot name a legal person alone" ]
    supersedes := none
    links := [ specLink "Source Document" "papers/UOR_Foundry_and_Citizen_Gardens_v1.0.docx"
             , leanLink "Formal ADR definition and entity-separation proofs" "ADR/ADR_0164_Foundry_Citizen_Gardens.lean"
             , specLink "ADR-0159 Dual-Control" "Governance/ADR/accepted/ADR-0159-Two_Persons_Not_Present_Tense_.md" ] }

/-- ADR-0164 is Accepted. -/
@[proof]
theorem adr0164_accepted : ADR_0164.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0164 has exactly five consequences. -/
@[proof]
theorem adr0164_consequences_count :
    ADR_0164.consequences.length = 5 := by
  decide

/-- ADR-0164 does not supersede any prior ADR. -/
@[proof]
theorem adr0164_no_supersession :
    ADR_0164.supersedes = none := by
  rfl

/-- NodeCap is exactly 12, shared with ADR-0152 and ADR-0154. -/
@[proof]
theorem adr0164_node_cap :
    NodeCap = 12 := by
  rfl
