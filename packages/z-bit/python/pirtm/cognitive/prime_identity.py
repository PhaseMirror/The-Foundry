"""T-01: Prime-Indexed Session Identity.

Assigns unique prime identifiers to sessions, supports squarefree composition
and factorization-based decomposition.
"""

from __future__ import annotations

import math
import threading
from dataclasses import dataclass
from typing import FrozenSet, List, Optional, Set, Tuple


# ─── Primality ───────────────────────────────────────────────────────


def is_prime(n: int) -> bool:
    """Deterministic primality test."""
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True


def _sieve(limit: int) -> List[int]:
    """Sieve of Eratosthenes up to *limit*."""
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, int(limit**0.5) + 1):
        if sieve[i]:
            for j in range(i * i, limit + 1, i):
                sieve[j] = False
    return [i for i, v in enumerate(sieve) if v]


def is_squarefree(n: int) -> bool:
    """Return True if *n* has no squared prime factor.  μ²(n) = 1."""
    if n < 1:
        return False
    d = 2
    while d * d <= n:
        if n % (d * d) == 0:
            return False
        d += 1
    return True


def factorize(n: int) -> List[int]:
    """Return the sorted prime factorization of *n*."""
    factors: List[int] = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors


# ─── Prime Registry ─────────────────────────────────────────────────


class PrimeRegistry:
    """Thread-safe prime allocator for session identities.

    Pre-sieve through a configurable ceiling; allocations are unique
    and can be released back to the pool.
    """

    def __init__(self, ceiling: int = 104_729) -> None:  # 10,000th prime
        self._pool: List[int] = _sieve(ceiling)
        self._allocated: Set[int] = set()
        self._lock = threading.Lock()
        self._cursor = 0

    def allocate(self) -> int:
        """Return the next available prime.  Raises if pool exhausted."""
        with self._lock:
            while self._cursor < len(self._pool):
                p = self._pool[self._cursor]
                self._cursor += 1
                if p not in self._allocated:
                    self._allocated.add(p)
                    return p
            raise RuntimeError("Prime pool exhausted")

    def release(self, prime: int) -> None:
        """Return a prime to the pool for reuse."""
        with self._lock:
            self._allocated.discard(prime)

    def is_allocated(self, prime: int) -> bool:
        with self._lock:
            return prime in self._allocated

    @property
    def allocated_count(self) -> int:
        with self._lock:
            return len(self._allocated)

    @property
    def pool_size(self) -> int:
        return len(self._pool)


# ─── Composition / Decomposition ─────────────────────────────────────


@dataclass(frozen=True)
class CompositeId:
    """Squarefree composite session identity."""

    value: int
    factors: Tuple[int, ...]

    @classmethod
    def compose(cls, *primes: int) -> CompositeId:
        """Create a composite identity from 2-5 primes."""
        if len(primes) < 2 or len(primes) > 5:
            raise ValueError("Compose requires 2–5 primes")
        if len(primes) != len(set(primes)):
            raise ValueError("All primes must be distinct")
        for p in primes:
            if not is_prime(p):
                raise ValueError(f"{p} is not prime")
        product = math.prod(primes)
        return cls(value=product, factors=tuple(sorted(primes)))

    @classmethod
    def decompose(cls, composite: int) -> CompositeId:
        """Decompose a composite identity back to its prime factors."""
        if composite < 4:
            raise ValueError(f"{composite} is not a valid composite")
        if not is_squarefree(composite):
            raise ValueError(f"{composite} is not squarefree")
        primes = factorize(composite)
        if len(primes) < 2:
            raise ValueError(f"{composite} is prime, not composite")
        return cls(value=composite, factors=tuple(primes))

    @property
    def participant_count(self) -> int:
        return len(self.factors)
