"""
ZRSD Phase 1: Zeta Data
Provides immutable Riemann zeta zero constants and surrogate generators.
"""

import numpy as np

# First 10 non-trivial zeta zero imaginary parts (gamma_j)
# Source: Odlyzko, A. M. "The 10^13-th zero of the Riemann zeta function and 70 million of its neighbors"
RIEMANN_ZETA_ZEROS = np.array([
    14.134725141734693790,
    21.022039638771554992,
    25.010857580145688763,
    30.424876125859513210,
    32.935061587376713341,
    37.586178158825671257,
    40.918719012147490355,
    43.327073280847111813,
    48.005150881167159727,
    49.773832477672323803
], dtype=np.float64)

def get_zeta_zeros(n: int = 3) -> np.ndarray:
    """Return the first n non-trivial zeta zero gammas."""
    if n > len(RIEMANN_ZETA_ZEROS):
        raise ValueError(f"Only {len(RIEMANN_ZETA_ZEROS)} zeros available in static data.")
    return RIEMANN_ZETA_ZEROS[:n]

def generate_surrogate_zeros(n: int = 3, seed: int = 42) -> np.ndarray:
    """Generate n random 'surrogate' zeros within the same spectral range."""
    rng = np.random.default_rng(seed)
    min_gamma = RIEMANN_ZETA_ZEROS[0]
    max_gamma = RIEMANN_ZETA_ZEROS[n-1] if n <= len(RIEMANN_ZETA_ZEROS) else RIEMANN_ZETA_ZEROS[-1]
    return rng.uniform(min_gamma, max_gamma, size=n)
