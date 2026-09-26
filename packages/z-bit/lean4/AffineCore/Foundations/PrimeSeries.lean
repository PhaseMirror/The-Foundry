/- # AffineCore.Foundations.PrimeSeries -/

import AffineCore.Foundations.BanachSpace

/-!
A prime-indexed family of bounded operators.
-/
structure PrimeOperatorFamily where
  weight : Nat -> Float
  op     : Nat -> Float -> Float
  support_prime : forall p, weight p = 0 -> p >= 2

/-!
The weighted sum Xi(t) = sum p, w_p(t) * U_p(t)
-/
noncomputable def Xi (F : PrimeOperatorFamily) : Float -> Float :=
  fun x => List.sum (List.map (fun p => F.weight p * F.op p x) (List.range 10))

/-!
Theorem A1: Absolute convergence in operator norm implies Xi is bounded.
-/
theorem Xi_bounded
    (F : PrimeOperatorFamily)
    (C : Float) (hC : 0 <= C)
    (h_summable : forall p, Float.abs (F.op p 0) <= C) :
    forall x, Float.abs (Xi F x) <= C * List.sum (List.map (fun p => Float.abs (F.weight p)) (List.range 10)) := by
  sorry

/-!
A time-dependent prime-indexed family of bounded operators.
-/
def TimeDependentPrimeOperatorFamily := Nat -> PrimeOperatorFamily

/-!
The time-dependent weighted sum Xi(t) = sum p, w_p(t) * U_p(t)
-/
noncomputable def Xi_t (F : TimeDependentPrimeOperatorFamily) (t : Nat) : Float -> Float :=
  Xi (F t)

/-!
Theorem A1 (Time-dependent): Uniform convergence in operator norm implies Xi(t) is uniformly bounded.
-/
theorem Xi_t_bounded
    (F : TimeDependentPrimeOperatorFamily)
    (C : Float)
    (h_summable : forall t, forall p, Float.abs ((F t).op p 0) <= C)
    (h_uniform : forall t, List.sum (List.map (fun p => Float.abs ((F t).weight p)) (List.range 10)) <= 1.0) :
    forall t, forall x, Float.abs (Xi_t F t x) <= C := by
  intro t x
  sorry
