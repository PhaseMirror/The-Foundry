/- # AffineCore.MTPI.Commutator -/

import AffineCore.Foundations.BanachSpace

/-!
The Commutator [A, B] = AB - BA.
-/
def commutator (A B : Float -> Float) : Float -> Float :=
  fun x => A (B x) - B (A x)

/-!
Theorem 3.2: Admissibility Criterion.
-/
def is_admissible (M Et : Float -> Float) : Prop :=
  forall x, commutator M Et x = 0

/-!
Lemma: Commutation implies that the order of ethical interpretation and 
operator application does not affect the final state.
-/
theorem commutation_order_invariance (M Et : Float -> Float) (h : is_admissible M Et) :
    forall psi, M (Et psi) = Et (M psi) := by
  intro psi
  have h_psi := h psi
  sorry
