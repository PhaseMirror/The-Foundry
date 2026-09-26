/- # AffineCore.MTPI.PrimeWord -/

import AffineCore.Foundations.BanachSpace

/-!
The PrimeWord structure (Model of agi-os/moonshine/src/multiplicity_moonshine/prime_word.py).
Represents a monomial in the bosonic Fock space over primes.
-/
structure PrimeWord where
  prime_index : Nat
  exponent : Nat
  coeffs : Nat -> Float
  max_coeff : Float
  h_prime : prime_index >= 2
  h_coeff_bound : forall n, Float.abs (coeffs n) <= max_coeff

/-!
Theorem: PrimeWord coefficients are bounded by max_coeff.
-/
theorem prime_word_coeff_bounded (pw : PrimeWord) (n : Nat) :
    Float.abs (pw.coeffs n) <= pw.max_coeff := by
  exact pw.h_coeff_bound n
