import UCC.Core

namespace UCC.Proofs
open UCC.Core

theorem accepted_immutable (a a' : ADR) (rest : List ADR)
  (h : ADRHistory (a' :: a :: rest))
  (h_acc : a.status = ADRStatus.Accepted) :
  a'.status = ADRStatus.Superseded ∨ a'.id ≠ a.id := by
  cases h with
  | accept a_prev a_curr rest_inner h_inner eq_id st_prop st_acc =>
    rw [h_acc] at st_prop
    contradiction
  | supersede a_prev a_curr rest_inner h_inner st_acc st_sup is_sup =>
    left
    exact st_sup

theorem history_starts_proposed (history : List ADR) (h : ADRHistory history) :
  ∃ a, history.getLast? = some a ∧ a.status = ADRStatus.Proposed := by
  induction h with
  | init a prop =>
    exact ⟨a, rfl, prop⟩
  | accept a_prev a_curr rest h' eq st_prop st_acc ih =>
    exact ih
  | supersede a_prev a_curr rest h' st_acc st_sup is_sup ih =>
    exact ih

end UCC.Proofs
