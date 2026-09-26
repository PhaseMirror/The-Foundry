"""
ZRSD Phase 2: Solver
Provides time-evolution (Euler/RK4) with trace preservation.
"""

import numpy as np
from .lindblad import lindblad_rhs

def euler_step(rho: np.ndarray, H: np.ndarray, Ls: list, dt: float) -> np.ndarray:
    """Perform one Euler step and normalize."""
    rho_next = rho + dt * lindblad_rhs(rho, H, Ls)
    
    # Hermitize
    rho_next = 0.5 * (rho_next + rho_next.conj().T)
    
    # Trace preservation
    tr = np.trace(rho_next)
    if abs(tr) > 1e-12:
        rho_next = rho_next / tr
    
    return rho_next

def rk4_step(rho: np.ndarray, t: float, H_func, Ls: list, dt: float) -> np.ndarray:
    """Perform one RK4 step and normalize."""
    k1 = lindblad_rhs(rho, H_func(t), Ls)
    k2 = lindblad_rhs(rho + 0.5 * dt * k1, H_func(t + 0.5 * dt), Ls)
    k3 = lindblad_rhs(rho + 0.5 * dt * k2, H_func(t + 0.5 * dt), Ls)
    k4 = lindblad_rhs(rho + dt * k3, H_func(t + dt), Ls)
    
    rho_next = rho + (dt / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)
    
    # Hermitize
    rho_next = 0.5 * (rho_next + rho_next.conj().T)
    
    # Trace preservation
    tr = np.trace(rho_next)
    if abs(tr) > 1e-12:
        rho_next = rho_next / tr
        
    return rho_next
