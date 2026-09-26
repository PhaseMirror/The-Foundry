"""
Core PIRTM Operators (Phase 2 Alignment).

This module implements formal operator primitives defined in PIRTM_CORE_SPEC.md.
Specifically, it formalizes the Multiplicity Operator M as a summation of 
prime-indexed A_p operators (implemented via XiOperator).
"""

from typing import List, Optional
import numpy as np
from pirtm.bindings.xi_operator import XiOperator

class MultiplicitySumOperator:
    """
    Formal implementation of M = Σ A_p as defined in PIRTM_CORE_SPEC.md.
    
    This operator aggregates multiple prime-indexed decay components
    (XiOperators) into a single linear operator acting on the multiplicity space.
    
    The weighting follows the canonical Ξ_p(t) decay law:
        A_p(t) = exp(-U · log(p) · t) · I
    
    Where M(t) = Σ_p A_p(t) is the total multiplicity operator.
    """

    def __init__(self, prime_set: List[int]):
        """
        Initialize the Multiplicity Operator with a set of primes.
        
        Args:
            prime_set: List of prime numbers defining the basis for M.
        """
        self.primes = sorted(prime_set)
        self.operators = [XiOperator(p) for p in self.primes]

    def evolve(self, psi: np.ndarray, t: float = 1.0) -> np.ndarray:
        """
        Apply M(t) = Σ Ξ_p(t) to the state vector psi.
        
        Args:
            psi: State vector in multiplicity space H.
            t: Evolution time parameter (default 1.0).
            
        Returns:
            The evolved state vector after applying the summed operator.
        """
        # Since each XiOperator is a scalar decay p^(-Ut), the sum is also scalar.
        total_decay = sum(np.exp(-op.U * np.log(op.p) * t) for op in self.operators)
        return total_decay * psi

    def get_matrix(self, dim: int, t: float = 1.0) -> np.ndarray:
        """
        Return the matrix representation of M(t) for a given dimension.
        
        Args:
            dim: Dimension of the space.
            t: Evolution time parameter.
            
        Returns:
            A diagonal matrix (dim x dim) representing M(t).
        """
        total_decay = sum(np.exp(-op.U * np.log(op.p) * t) for op in self.operators)
        return np.eye(dim) * total_decay

    @property
    def operator_norm(self, t: float = 1.0) -> float:
        """The spectral norm ||M(t)||."""
        return sum(np.exp(-op.U * np.log(op.p) * t) for op in self.operators)

    def __repr__(self) -> str:
        return f"MultiplicitySumOperator(primes={self.primes})"
