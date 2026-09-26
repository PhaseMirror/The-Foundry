"""
PIRTM Phase 2: Spectral Computation

Combines the Prime-Spectral Operator (A) and Time-Sieve Operator (B)
to compute the spectral bound (sigma) for a given state and time.
"""
import numpy as np
from .prime_spectral_operator import PrimeSpectralOperator
from .time_sieve import TimeSieveOperator
from ..core.gain import compute_spectral_radius

class SpectralComputer:
    """
    Computes the spectral bound sigma.
    """
    def __init__(self, dimension: int):
        self.dimension = dimension
        self.operator_A = PrimeSpectralOperator(dimension)
        self.operator_B = TimeSieveOperator(dimension)

    def compute_sigma(self, state: dict, time_step: int) -> float:
        """
        Computes the spectral bound for the combined operator.
        """
        A = self.operator_A.compute(state)
        B = self.operator_B.compute(time_step)
        
        # Combine operators (e.g., by addition, subject to final model)
        combined_operator = A + B
        
        # Compute the spectral radius, which is our sigma
        sigma = compute_spectral_radius(combined_operator)
        
        return sigma
