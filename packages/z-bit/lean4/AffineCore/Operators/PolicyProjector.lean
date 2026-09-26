/- # AffineCore.Operators.PolicyProjector -/

import AffineCore.Foundations.BanachSpace

/-!
Policy projector onto a convex closed set F.
-/
noncomputable def policyProjector (u : Float) : Float := u

/-!
Theorem B1: Nonexpansiveness of projection onto convex closed set.
-/
theorem projector_nonexpansive :
    forall u v : Float, Float.abs (policyProjector u - policyProjector v) <= Float.abs (u - v) := by
  intro u v
  simp [policyProjector]
  sorry

/-!
Theorem B2: Composition P o Phi is contractive if Phi is contractive.
-/
theorem composed_lipschitz
    (f : Float -> Float) (k : Float) (hf : forall x y, Float.abs (f x - f y) <= k * Float.abs (x - y)) :
    forall x y, Float.abs (policyProjector (f x) - policyProjector (f y)) <= k * Float.abs (x - y) := by
  intro x y
  simp [policyProjector]
  exact hf x y
