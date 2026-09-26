/- # AffineCore.Stability.StabilityGate -/

import AffineCore.Foundations.BanachSpace

/-!
Master Stability Lemma (Soundness of StabilityGate):
-/
theorem stability_gate_soundness
    (lambda_m : Float) (h_lambda_m : 0 < lambda_m ∧ lambda_m <= 1)
    (L_G : Float) (h_LG : 0 <= L_G)
    (delta : Float) (h_delta : 0 <= delta)
    (epsilon : Float) (h_epsilon : 0 < epsilon)
    (h_gate : (1 - lambda_m) + lambda_m * (L_G + delta) <= 1 - epsilon) :
    exists q : Float, q < 1 ∧ forall x y : Float, Float.abs (((1 - lambda_m) * x + lambda_m * (L_G * x + delta * x)) - ((1 - lambda_m) * y + lambda_m * (L_G * y + delta * y))) <= q * Float.abs (x - y) := by
  let q := (1 - lambda_m) + lambda_m * (L_G + delta)
  use q
  constructor
  · linarith
  · intro x y
    sorry
