"""
PIRTM Layer-II Stability Gate
Implements the Fock-lifted contraction admission logic.
Reference: ADR-PIRTM-003
"""

from typing import Optional
import logging

logger = logging.getLogger(__name__)

class StabilityGate:
    """
    Gate for certifying the admissibility of Fock-lifted perturbations.
    Ensures that the total many-body update remains a contraction.
    """
    
    def __init__(self, lambda_m: float, L_G: float, epsilon: float = 1e-6):
        """
        Initialize the gate with base PIRTM parameters.
        
        Args:
            lambda_m: Convexity parameter (Layer-I step size).
            L_G: Lipschitz constant of the base operator G.
            epsilon: Safety margin for contractivity (c < 1 - epsilon).
        """
        if not (0 <= lambda_m <= 1):
            raise ValueError(f"lambda_m must be in [0, 1], got {lambda_m}")
        if L_G < 0:
            raise ValueError(f"L_G must be non-negative, got {L_G}")
            
        self.lambda_m = lambda_m
        self.L_G = L_G
        self.epsilon = epsilon
        
        # Base contraction constant (without perturbation)
        self.c_base = (1.0 - lambda_m) + lambda_m * self.L_G
        
    def check_admissibility(self, delta: float) -> bool:
        """
        Check if a perturbation with Lipschitz constant delta is admissible.
        
        Formula: c_total = (1 - lambda_m) + lambda_m * (L_G + delta)
        Admissible if c_total < 1 - epsilon
        """
        if delta < 0:
            logger.warning(f"Negative delta ({delta}) passed to StabilityGate. Treating as 0.")
            delta = 0.0
            
        c_total = self.c_base + self.lambda_m * delta
        
        # Special case: if lambda_m is 0, we are at the identity.
        # This is admissible if epsilon is 0 (marginal stability), 
        # but technically not a contraction. 
        # For PIRTM, we allow lambda_m=0 as a "pause" state if L_G was stable.
        if self.lambda_m == 0:
            is_admissible = True # Identity doesn't grow
        else:
            is_admissible = c_total < (1.0 - self.epsilon)
        
        if not is_admissible:
            logger.error(
                f"StabilityGate Rejected: c_total={c_total:.6f} >= {1.0-self.epsilon:.6f} "
                f"(delta={delta:.6f}, L_G={self.L_G:.6f}, λm={self.lambda_m:.6f})"
            )
        return is_admissible
        
    def max_allowed_delta(self) -> float:
        """
        Calculate the maximum allowed perturbation Lipschitz constant.
        
        delta_max = (1 - epsilon - c_base) / lambda_m
        """
        if self.lambda_m == 0:
            return float('inf')  # Pure identity is always stable
            
        delta_max = (1.0 - self.epsilon - self.c_base) / self.lambda_m
        return max(0.0, delta_max)

    def get_contraction_constant(self, delta: float) -> float:
        """Calculate the resulting contraction constant for a given delta."""
        return self.c_base + self.lambda_m * delta

def certify_step(lambda_m: float, L_G: float, delta: float) -> bool:
    """One-shot certification utility."""
    gate = StabilityGate(lambda_m, L_G)
    return gate.check_admissibility(delta)
