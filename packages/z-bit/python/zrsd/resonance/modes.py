"""
Layer-III Resonance Modes.
Defines how the zeta-resonant dynamics are driven (zeta zeros vs nulls).
"""

from dataclasses import dataclass
from typing import List
import numpy as np

@dataclass
class ResonanceMode:
    """Parameter bundle for driving ZRSD spectral evolution."""
    name: str
    gammas: List[float]   # frequencies (zeta zeros or nulls)
    weights: List[float]  # drive amplitudes
    description: str

def true_zeta_mode(k: int = 3) -> ResonanceMode:
    """Factory for the first k non-trivial zeta zeros."""
    # Source: Odlyzko list
    gammas = [14.134725, 21.022040, 25.010858, 30.424876, 32.935061][:k]
    return ResonanceMode(
        name=f"true_zeta_{k}",
        gammas=gammas,
        weights=[1.0] * len(gammas),
        description=f"First {k} non-trivial zeta zeros on the critical line.",
    )

def randomized_mode(seed: int = 0, k: int = 3) -> ResonanceMode:
    """Factory for a null-model mode with random frequencies in the same band."""
    rng = np.random.default_rng(seed)
    # Target band roughly matches the first 5-10 zeta zeros
    gammas = rng.uniform(10.0, 40.0, size=k).tolist()
    return ResonanceMode(
        name=f"random_band_{k}",
        gammas=gammas,
        weights=[1.0] * len(gammas),
        description=f"Random frequencies in the same band as true zeta zeros (seed={seed}).",
    )
