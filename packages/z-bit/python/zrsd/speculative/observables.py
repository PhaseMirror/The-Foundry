"""
ZRSD Phase 1: Observables
Provides high-fidelity state tracking for speculative dynamics.
"""

import numpy as np

def expectation(rho: np.ndarray, A: np.ndarray) -> float:
    """Compute the expectation value <A> = Tr(rho A)."""
    return float(np.real_if_close(np.trace(rho @ A)))

def purity(rho: np.ndarray) -> float:
    """Compute the state purity Tr(rho^2)."""
    return float(np.real_if_close(np.trace(rho @ rho)))

def fidelity(rho: np.ndarray, sigma: np.ndarray) -> float:
    """
    Compute the fidelity between two density matrices rho and sigma.
    F(rho, sigma) = [Tr(sqrt(sqrt(rho) sigma sqrt(rho)))]^2
    For pure states, this simplifies to <psi|phi>^2.
    """
    from scipy.linalg import sqrtm
    sqrt_rho = sqrtm(rho)
    inner = sqrt_rho @ sigma @ sqrt_rho
    return float(np.real_if_close(np.trace(sqrtm(inner)))**2)

def entropy_vn(rho: np.ndarray) -> float:
    """Compute the von Neumann entropy S = -Tr(rho log rho)."""
    from scipy.linalg import logm
    return float(-np.real_if_close(np.trace(rho @ logm(rho))))

def total_number_operator(num_primes: int, basis: list) -> np.ndarray:
    """Construct the diagonal total number operator N_tot."""
    n_tot = [sum(occ) for occ in basis]
    return np.diag(n_tot)

def multiplicity_operator(primes: list, basis: list) -> np.ndarray:
    """Construct the diagonal multiplicity operator M."""
    m_vals = [sum(np.log(p) * k for p, k in zip(primes, occ)) for occ in basis]
    return np.diag(m_vals)
