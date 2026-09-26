/- # AffineCore.MTPI.PIRTM_Stable -/

import AffineCore.Foundations.BanachSpace

/-!
Clarified PIRTM Evolution Map.
X_{t+1} = (1 - lambda_m)X_t + lambda_m * P(Xi X_t + Lambda T(X_t) + G)
-/
noncomputable def pirtmEvolutionMap
    (lambda_m : Float) (Xi : Float -> Float) (Lambda : Float) (T : Float -> Float) (G : Float) : Float -> Float :=
  fun x => (1 - lambda_m) * x + lambda_m * (Xi x + Float.mul Lambda (T x) + G)

/-!
Theorem: MTPI Stability Guarantee.
-/
theorem mtpi_stability_guarantee
    (lambda_m : Float) (hlambda_m_pos : 0 < lambda_m) (hlambda_m_le : lambda_m <= 1)
    (Xi : Float -> Float) (Lambda : Float) (T : Float -> Float) (G : Float)
    (epsilon : Float) (hepsilon : 0 < epsilon)
    (L : Float) (hT : forall x y, Float.abs (T x - T y) <= L * Float.abs (x - y))
    (hc_bound : (1 - lambda_m) + lambda_m * (Float.abs (Xi 0) + Float.abs Lambda * L) < 1 - epsilon) :
    exists q : Float, q < 1 - epsilon ∧ forall x y : Float, Float.abs (pirtmEvolutionMap lambda_m Xi Lambda T G x - pirtmEvolutionMap lambda_m Xi Lambda T G y) <= q * Float.abs (x - y) := by
  sorry
