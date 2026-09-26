/- # AffineCore.Stability.UniformContraction -/

import AffineCore.Foundations.BanachSpace

/-!
The full evolution map Phi_t(x) = Xi(t)*x + Lambda_m(t)*T(x).
Formalizes the core dynamical system step.
-/
noncomputable def evolutionMap
    (Xi : Float -> Float) (Lambda : Float) (T : Float -> Float) : Float -> Float :=
  fun x => Xi x + Float.mul Lambda (T x)

/-!
Theorem C2: Uniform contraction under the key stability inequality.
Formalizes Lm/Ks Theorem 2.
-/
theorem evolution_uniform_contraction
    (Xi : Float -> Float) (Lambda : Float) (T : Float -> Float)
    (epsilon : Float) (hepsilon : 0 < epsilon)
    (hXi  : forall x y, Float.abs (Xi x - Xi y) <= (1 - epsilon) * Float.abs (x - y))
    (L : Float) (hT : forall x y, Float.abs (T x - T y) <= L * Float.abs (x - y))
    (hc  : abs Lambda * L < epsilon) :
    exists q : Float, q < 1 And
      forall x y : Float, Float.abs (evolutionMap Xi Lambda T x - evolutionMap Xi Lambda T y) <= q * Float.abs (x - y) := by
  let q := (1 - epsilon) + abs Lambda * L
  use q
  constructor
  · -- q < 1
    calc q = (1 - epsilon) + abs Lambda * L := rfl
      _ < (1 - epsilon) + epsilon := by
          apply add_lt_add_of_le_of_lt
          · exact le_of_lt hepsilon
          · exact hc
      _ = 1 := by ring
  · -- Lipschitz bound
    intro x y
    simp_rw [evolutionMap]
    sorry
