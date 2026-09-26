"""Utilities for primality and squarefree checks.

This module is intentionally self-contained and dependency-free.
"""

from __future__ import annotations

import math
from typing import Iterator, Tuple


def _is_probable_prime(n: int) -> bool:
    """Deterministic Miller-Rabin for 64-bit inputs.

    This implementation is sufficient for the prime ranges used in Gate K.
    """
    if n < 2:
        return False
    # Small primes quick path
    small_primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    for p in small_primes:
        if n % p == 0:
            return n == p

    # Write n-1 as d*2^s
    d = n - 1
    s = 0
    while d % 2 == 0:
        d //= 2
        s += 1

    # Deterministic bases for testing 64-bit integers
    bases = [2, 325, 9375, 28178, 450775, 9780504, 1795265022]

    def check(a: int, s: int, d: int, n: int) -> bool:
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            return True
        for _ in range(s - 1):
            x = (x * x) % n
            if x == n - 1:
                return True
        return False

    for a in bases:
        if a % n == 0:
            return True
        if not check(a, s, d, n):
            return False

    return True


def is_prime(n: int) -> bool:
    """Return True if n is prime."""
    return _is_probable_prime(n)


def prime_factors(n: int) -> Iterator[int]:
    """Yield prime factors of n (with repetition)."""
    if n < 2:
        return

    # Factor out 2s
    while n % 2 == 0:
        yield 2
        n //= 2

    # Factor odd numbers
    p = 3
    max_p = math.isqrt(n) + 1
    while p <= max_p and n > 1:
        while n % p == 0:
            yield p
            n //= p
            max_p = math.isqrt(n) + 1
        p += 2

    if n > 1:
        yield n


def is_squarefree(n: int) -> bool:
    """Return True if n is squarefree (no prime factor appears twice)."""
    last = None
    for p in prime_factors(n):
        if p == last:
            return False
        last = p
    return True


def factorize(n: int) -> Tuple[bool, str]:
    """Return (is_squarefree, factored_string) for diagnostics."""
    if n < 2:
        return False, f"{n}"

    factors = list(prime_factors(n))
    if not factors:
        return True, str(n)

    counts = {}
    for p in factors:
        counts[p] = counts.get(p, 0) + 1

    parts = []
    is_sf = True
    for p in sorted(counts):
        exp = counts[p]
        if exp == 1:
            parts.append(str(p))
        else:
            parts.append(f"{p}^{exp}")
            is_sf = False

    return is_sf, " * ".join(parts)
