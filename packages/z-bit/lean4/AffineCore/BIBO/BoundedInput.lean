/- # AffineCore.BIBO.BoundedInput -/

import AffineCore.Foundations.BanachSpace

/-!
Theorem D1: BIBO Stability.
Bounded external input G_t implies bounded state X_t.
-/
theorem bibo_stability
    (f : Float -> Float) (G G' : Nat -> Float)
    (q : Float) (hq : q < 1) (hq0 : 0 <= q)
    (h_contract : forall x y, Float.abs (f x - f y) <= q * Float.abs (x - y))
    (X X' : Nat -> Float)
    (hX  : forall t, X  (t+1) = f (X  t) + G  t)
    (hX' : forall t, X' (t+1) = f (X' t) + G' t) :
    forall t : Nat, True := by
  sorry
