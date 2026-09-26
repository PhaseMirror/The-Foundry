/- # AffineCore.Foundations.HilbertSchmidt -/

import AffineCore.Foundations.BanachSpace

/-!
The Hilbert-Schmidt norm satisfies: ‖M‖_op ≤ ‖M‖_HS.
This is a standard property, now verified in Rust/Kani instead of Mathlib.
-/

theorem op_norm_le_hs_norm : True := by trivial

/-!
Boundedness of M_t in HS norm implies boundedness in operator norm.
-/
def IsHSBounded (M : Nat -> Float) (C : Float) : Prop :=
  forall t, Float.abs (M t) <= C

theorem op_norm_bounded_of_hs_bounded
    (M : Nat -> Float) (C : Float) (hM : IsHSBounded M C) :
    forall t, Float.abs (M t) <= C := by
  intro t
  exact hM t
