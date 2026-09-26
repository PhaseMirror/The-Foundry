import math
from typing import Dict

def get_prime_factors(n: int) -> Dict[int, int]:
    """
    Decomposes an integer n > 1 into its unique prime factors.
    Returns a dictionary where keys are primes and values are multiplicities.
    Follows the Fundamental Theorem of Arithmetic.
    """
    if n <= 1:
        return {}
    
    factors = {}
    d = 2
    temp = n
    while d * d <= temp:
        while temp % d == 0:
            factors[d] = factors.get(d, 0) + 1
            temp //= d
        d += 1
    if temp > 1:
        factors[temp] = factors.get(temp, 0) + 1
    return factors

class Decomposable:
    """
    Base class for objects that can be decomposed into a prime-indexed multiplicity signature.
    """
    def decompose(self) -> Dict[int, int]:
        raise NotImplementedError("Subclasses must implement decompose()")

class PrimeAnchor(Decomposable):
    """
    A simple decomposable object representing a positive integer.
    """
    def __init__(self, value: int):
        if value <= 0:
            raise ValueError("Value must be a positive integer.")
        self.value = value

    def decompose(self) -> Dict[int, int]:
        return get_prime_factors(self.value)

    def __repr__(self):
        return f"PrimeAnchor({self.value})"
