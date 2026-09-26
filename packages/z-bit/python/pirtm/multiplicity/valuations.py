"""Valuation Theory for Multiplicity.

Implements valuations on UFDs and Dedekind domains, including discrete valuations,
p-adic valuations, and order valuations.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Protocol
from math import log, gcd
from functools import reduce


class Valuation(ABC):
    """Abstract base class for valuations."""

    @abstractmethod
    def __call__(self, x: Any) -> int | float:
        """Compute the valuation of x."""
        pass

    @abstractmethod
    def domain(self) -> str:
        """Return the domain of the valuation."""
        pass


class DiscreteValuation(Valuation):
    """Discrete valuation on a UFD."""

    def __init__(self, prime: int):
        self.prime = prime

    def __call__(self, x: int) -> int:
        """p-adic valuation: highest power of prime dividing x."""
        if x == 0:
            return float('inf')
        count = 0
        while x % self.prime == 0:
            x //= self.prime
            count += 1
        return count

    def domain(self) -> str:
        return f"Z_(p={self.prime})"


class OrderValuation(Valuation):
    """Order valuation at a point."""

    def __init__(self, point: complex):
        self.point = point

    def __call__(self, poly: list[float]) -> int:
        """Order of zero at point for polynomial coefficients."""
        # Simple implementation for monic polynomials
        # In practice, would use root finding or series expansion
        if abs(poly[0]) < 1e-10:  # constant term
            return 0
        # Placeholder: return 1 for non-zero constant term
        return 1 if poly[0] != 0 else float('inf')

    def domain(self) -> str:
        return f"C_(z={self.point})"


def kronecker_symbol(a: int, b: int) -> int:
    """Compute Kronecker symbol (a/b)."""
    if b == 0:
        return 0
    if b == 1:
        return 1
    if b == -1:
        return (-1) ** ((a - 1) // 2) if a > 0 else 0

    # Handle negative b
    if b < 0:
        return kronecker_symbol(a, -b) * (-1) ** ((a - 1) // 2)

    # Factor b into primes
    result = 1
    for p, e in factorize(abs(b)):
        result *= legendre_symbol(a, p) ** e

    return result


def legendre_symbol(a: int, p: int) -> int:
    """Compute Legendre symbol (a/p) for odd prime p."""
    if a == 0 or a % p == 0:
        return 0
    if a == 1:
        return 1

    # Use Euler's criterion: (a/p) = a^((p-1)/2) mod p
    # If result == p-1, return -1; if result == 1, return 1
    result = pow(a, (p - 1) // 2, p)
    if result == p - 1:
        return -1
    elif result == 1:
        return 1
    else:
        return 0  # Should not happen for prime p


def factorize(n: int) -> list[tuple[int, int]]:
    """Factorize n into primes."""
    factors = []
    i = 2
    while i * i <= n:
        if n % i:
            i += 1
        else:
            n //= i
            count = 1
            while n % i == 0:
                n //= i
                count += 1
            factors.append((i, count))
    if n > 1:
        factors.append((n, 1))
    return factors