/- # AffineCore.Stability.ContractionWitness -/

import AffineCore.Foundations.BanachSpace

/-!
The contraction witness q_t — four equivalent formulations from the Affine Core.
-/
inductive WitnessFamily (Phi : Float -> Float) where
  | Jacobian (x : Float) (L : Float) (hL : forall y, Float.abs (Phi y - Phi x) <= L * Float.abs (y - x)) : WitnessFamily Phi
  | Lyapunov (V : Float -> Float) (hV_pos : forall x, 0 < V x) (hV_decay : forall x, V (Phi x) < V x) : WitnessFamily Phi
  | Incremental (L : Float) (hL : forall x y, Float.abs (Phi x - Phi y) <= L * Float.abs (x - y)) : WitnessFamily Phi
  | Wasserstein : WitnessFamily Phi

/-!
Certification condition: q < 1 - epsilon.
-/
def certified (q : Float) (epsilon : Float) : Prop := 0 < epsilon ∧ q < 1 - epsilon
