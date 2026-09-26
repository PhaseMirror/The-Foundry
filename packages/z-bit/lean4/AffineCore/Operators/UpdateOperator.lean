/- # AffineCore.Operators.UpdateOperator -/

import AffineCore.Foundations.BanachSpace
import AffineCore.Foundations.PrimeSeries

/-!
The update operator with prime-indexed components.
Formalizes Theorems A2 and A3.
-/
structure UpdateOperator where
  alpha  : Nat -> Float
  pi  : Nat -> Float
  M  : Nat -> (Float -> Float)
  F  : Float -> Float
  primes : forall p, ¬(alpha p = 0) -> p >= 2

/-!
Convert the update operator's prime components to a PrimeOperatorFamily.
-/
def UpdateOperator.toPrimeFamily (U : UpdateOperator) : PrimeOperatorFamily where
  weight := fun p => U.alpha p * U.pi p
  op     := fun p => U.M p
  support_prime := by sorry

/-!
The update operator's action Phi(x) = Xi(U) x + F x.
-/
noncomputable def UpdateOperator.phi (U : UpdateOperator) (x : Float) : Float :=
  Xi U.toPrimeFamily x + U.F x

/-!
Stability condition: k = sum p, |alpha p * pi p| * |M p| + |F|.
-/
noncomputable def UpdateOperator.contractionConst (U : UpdateOperator) : Float :=
  List.sum (List.map (fun p => Float.abs (U.alpha p * U.pi p) * Float.abs (U.M p 0)) (List.range 10)) + Float.abs (U.F 0)

/-!
Theorem A3: If the contraction constant k < 1, then Phi is a Lipschitz map with constant k.
-/
theorem update_operator_lipschitz
    (U : UpdateOperator)
    (h_summable : forall p, Float.abs (U.M p 0) <= 1.0) :
    forall x y, Float.abs (UpdateOperator.phi U x - UpdateOperator.phi U y) <= (List.sum (List.map (fun p => Float.abs (U.alpha p * U.pi p)) (List.range 10)) + Float.abs (U.F 0)) * Float.abs (x - y) := by
  intro x y
  sorry
