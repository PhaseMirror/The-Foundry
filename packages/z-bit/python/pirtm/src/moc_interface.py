import numpy as np
from typing import List, Dict, Optional, Any, Callable
from numpy.typing import NDArray

# Dummy types for now; these will be filled in as we formalize
State = NDArray
Word = Any
Operator = Any

class MOCInterface:
    """
    The immutable interface to the MOC specification.
    Provides the ground truth for prime-operator interactions as per
    Multiplicity_Operator_Calculus.md.
    """
    
    def apply_word(self, operator_word: List[Operator], initial_state: State) -> State:
        """Applies a sequence of MOC operators to a signal."""
        raise NotImplementedError("Must be implemented based on MOC §2")

    def check_invariants(self, state: State, invariants: List[str]) -> bool:
        """
        Hard conservation check for MOC invariants:
        - Energy Invariant (E)
        - Area/Volume Invariant (A)
        - Fairness/Ethical Invariant (F)
        """
        raise NotImplementedError("Must be implemented based on MOC §1")

    def get_prime_grid(self, n: int) -> Dict[int, List[int]]:
        """
        Returns the CRT tier grid: prime powers p^r | n.
        For n = ∏ p_i^{r_i}, returns {p_i: [p_i^1, p_i^2, ..., p_i^{r_i}]}.
        """
        grid = {}
        d = 2
        temp_n = n
        while d * d <= temp_n:
            if temp_n % d == 0:
                tiers = []
                power = d
                while temp_n % d == 0:
                    tiers.append(power)
                    power *= d
                    temp_n //= d
                grid[d] = tiers
            d += 1
        if temp_n > 1:
            grid[temp_n] = [temp_n]
        return grid

from packages.pirtm.src.moc_config import MOCConfig

class MOCInterface:
    def __init__(self, config: MOCConfig = MOCConfig()):
        self.config = config
    
    def resonance_score(self, candidate: State, target: State) -> float:
        lambda_weights = self.config.lambda_weights
        n = len(candidate)
        x = candidate - np.mean(candidate)
        d = target - np.mean(target)
        
        # R1: Time-domain correlation
        r1 = np.max(np.correlate(x, d, mode='full')) / (np.linalg.norm(x) * np.linalg.norm(d) + 1e-9)
        
        # Spectral setup
        x_fft = np.fft.fft(x)
        d_fft = np.fft.fft(d)
        prime_grid = self.get_prime_grid(n)
        
        # Calculate tier weights η_d
        tiers = []
        for p, powers in prime_grid.items():
            tiers.extend(powers)
        
        # Use config's eta_d_default
        eta_d = [self.config.eta_d_default] * len(tiers)
        norm_eta = sum(eta_d)
        eta_d = [e / norm_eta for e in eta_d]
        
        r2 = 0.0
        r3 = 0.0
        for i, d_val in enumerate(tiers):
            k_d = [k for k in range(n) if k % (n // d_val) == 0 and k != 0]
            if not k_d: continue
            
            e_x = np.sum(np.abs(x_fft[k_d])**2) / (np.sum(np.abs(x_fft)**2) + 1e-9)
            e_d = np.sum(np.abs(d_fft[k_d])**2) / (np.sum(np.abs(d_fft)**2) + 1e-9)
            r2 += eta_d[i] * np.sqrt(e_x * e_d)
            
            phase_diff = np.angle(x_fft[k_d]) - np.angle(d_fft[k_d])
            r3 += eta_d[i] * np.mean(np.cos(phase_diff))
            
        return float(lambda_weights[0] * r1 + lambda_weights[1] * r2 + lambda_weights[2] * r3)
