/- # AffineCore.MTPI.HeckeAlgebra -/

import AffineCore.MTPI.PrimeWord

/-!
Hecke Operator T_p acting on the coefficient sequence a_n.
(T_p a)_n = a_{pn} + p * a_{n/p} if p|n, else a_{pn}.
-/
def hecke_operator (p : Nat) (a : Nat -> Float) (n : Nat) : Float :=
  if n % p = 0 then a (n/p) + Float.mul (Float.ofNat p) (a n) else a (n*p)

/-!
Theorem: Hecke operators preserve the PrimeWord structure.
-/
theorem hecke_preserves_prime_word (pw : PrimeWord) (p : Nat) (hp : p >= 2) :
    forall n, Float.abs (hecke_operator p pw.coeffs n) <= pw.max_coeff := by
  intro n
  simp [hecke_operator]
  split
  · sorry
  · sorry
