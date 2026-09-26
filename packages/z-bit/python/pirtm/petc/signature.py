"""
PETC prime-exponent vector signatures.
A tensor's type identity is encoded as a vector of prime exponents:
  T of type p_2^2 * p_3^1  <->  signature [2, 1, 0, ...]
Tensor product = signature addition (prime exponent addition).
Contraction on index i = decrement exponent at position i.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence


FIRST_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]


@dataclass(frozen=True)
class PETCSignature:
    exponents: tuple[int, ...]  # exponent for each prime slot

    @classmethod
    def from_sequence(cls, exps: Sequence[int]) -> "PETCSignature":
        return cls(exponents=tuple(exps))

    @classmethod
    def zero(cls, n_slots: int = 15) -> "PETCSignature":
        return cls(exponents=(0,) * n_slots)

    def product(self, other: "PETCSignature") -> "PETCSignature":
        """Tensor product <-> component-wise addition of exponents."""
        if len(self.exponents) != len(other.exponents):
            raise ValueError("Signature slot mismatch -- cannot compute product")
        return PETCSignature(
            exponents=tuple(a + b for a, b in zip(self.exponents, other.exponents))
        )

    def contract(self, slot: int) -> "PETCSignature":
        """Contraction on prime slot -- decrement exponent at position slot."""
        if slot < 0 or slot >= len(self.exponents):
            raise IndexError(f"slot {slot} out of range")
        if self.exponents[slot] <= 0:
            raise ValueError(
                f"PETC_SIGNATURE_CONTRACTION_UNDERFLOW: "
                f"slot {slot} already at 0"
            )
        exps = list(self.exponents)
        exps[slot] -= 1
        return PETCSignature(exponents=tuple(exps))

    def verify_matches(self, other: "PETCSignature") -> bool:
        return self.exponents == other.exponents

    def to_prime_product(self) -> int:
        """Decode back to integer: product of p_i^e_i."""
        result = 1
        for prime, exp in zip(FIRST_PRIMES, self.exponents):
            result *= prime ** exp
        return result
