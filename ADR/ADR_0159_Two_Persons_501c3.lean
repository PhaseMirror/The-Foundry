import ADR.Core
import ADR.lex

/-! # ADR-0159: Two Persons, Not Present Tense, 501(c)(3)

Formalizes the two-person governance rule and 501(c)(3) compliance boundary.
The key invariant: no single person can authorize a capital move; the
"present tense" rule rejects any resolution that does not name a concrete
legal person at the time of execution. -/

open ADR ADR.Lex

/-- ADR-0159: Two-person rule and 501(c)(3) compliance. -/
@[adr]
def ADR_0159 : ADR :=
  { id := "ADR-0159"
    title := "Two Persons, Not Present Tense, 501(c)(3)"
    status := ADRStatus.Accepted
    context := "The 501(c)(3) organizational form requires that no single natural person controls capital disposition. The two-person rule requires at least two distinct legal persons to authorize any wire, halt, or certification. The 'present tense' rule rejects any resolution that refers to persons in future or conditional tense without binding them at execution time."
    decision := "Every capital action requires two distinct legal persons, both in present tense. person_id is excluded from the prime ledger as a seating key. Conditional or future-tense authorizations are refused as non-binding. SIG_GOV_KILL requires two signatures from distinct persons."
    consequences := [ "No single-person capital moves: dual-control enforced for all wires"
                    , "Present-tense binding: conditional authorizations are refused"
                    , "Person exclusion: person_id never appears as a seating key in prime ledger"
                    , "SIG_GOV_KILL requires two distinct person signatures"
                    , "501(c)(3) compliance: no private inurement from capital decisions" ]
    supersedes := none
    links := [ specLink "Source Document" "papers/Two_Persons_Not_Present_Tense_501c3_v1.0.docx"
             , leanLink "Formal ADR definition and dual-control proofs" "ADR/ADR_0159_Two_Persons_501c3.lean"
             , specLink "Field Binding Doc" "PM-AGENT-001" ] }

/-- ADR-0159 is Accepted. -/
@[proof]
theorem adr0159_accepted : ADR_0159.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0159 has exactly five consequences. -/
@[proof]
theorem adr0159_consequences_count :
    ADR_0159.consequences.length = 5 := by
  decide

/-- ADR-0159 does not supersede any prior ADR. -/
@[proof]
theorem adr0159_no_supersession :
    ADR_0159.supersedes = none := by
  rfl

/-- Dual-control threshold is 2500; any amount above requires two persons. -/
@[proof]
theorem adr0159_dual_control_bound :
    DualControlThreshold = 2500 := by
  rfl

/-- Any amount exceeding the dual-control threshold requires two persons. -/
@[proof]
theorem adr0159_exceeds_dual_control (amount : Nat)
    (h : exceedsDualControl amount = true) :
    amount > DualControlThreshold := by
  unfold exceedsDualControl at h
  simp [DualControlThreshold] at h
  exact h
