import PhaseMirror.ADR.Core

namespace PhaseMirror.ADR

inductive ValidTransition : ADR → ADR → Option ADR → Prop where
  | accept (a b : ADR) :
      a.id = b.id →
      a.status = ADRStatus.Proposed →
      b.status = ADRStatus.Accepted →
      ValidTransition a b none
  | supersede (a b c : ADR) :
      a.id = b.id →
      a.status = ADRStatus.Accepted →
      b.status = ADRStatus.Superseded →
      c.supersedes = some a.id →
      c.status = ADRStatus.Accepted →
      ValidTransition a b (some c)

theorem accepted_is_immutable (a b : ADR) (c : Option ADR) (h : ValidTransition a b c) :
  a.status = ADRStatus.Accepted → b.status = ADRStatus.Superseded ∧ c.isSome = true := by
  intro h_acc
  cases h with
  | accept h_id h_prop h_b_acc =>
    rw [h_acc] at h_prop
    contradiction
  | supersede c h_id h_a_acc h_b_sup h_c_sup h_c_acc =>
    exact ⟨h_b_sup, rfl⟩

def ConsequencesEntailed (adr : ADR) : Prop :=
  ∀ c ∈ adr.consequences, c ∈ adr.context ∨ c ∈ adr.decision

def checkEntailment (adr : ADR) : Bool :=
  adr.consequences.all (λ c => adr.context.contains c || adr.decision.contains c)

end PhaseMirror.ADR
