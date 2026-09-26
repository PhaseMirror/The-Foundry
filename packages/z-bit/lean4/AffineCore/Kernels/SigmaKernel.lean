/- # AffineCore.Kernels.SigmaKernel -/

import AffineCore.Foundations.BanachSpace

/-!
The Beta function for a quartic coupling in melonic GFT.
-/
def beta4 (lambda : Float) : Float := lambda^2 - 0.1 * lambda

/-!
The Beta function for a sextic coupling in melonic GFT.
-/
def beta6 (lambda : Float) : Float := lambda^2 - 0.08 * lambda - 0.02

/-!
Equilibrium Fixed Point for lambda4.
-/
theorem lambda4_fixed_point_stable :
    beta4 0.1 = 0 := by
  sorry

/-!
Theorem: Monotonicity of flow toward the IR attractor.
-/
theorem beta4_neg_in_range (lambda : Float) (h1 : 0 < lambda) (h2 : lambda < 0.1) :
    beta4 lambda < 0 := by
  sorry
