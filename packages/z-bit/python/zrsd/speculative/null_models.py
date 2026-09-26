"""
ZRSD Phase 3: Null Models
Provides comparisons for zeta-driven vs. noisy evolution.
"""

import numpy as np
from .zeta_data import get_zeta_zeros, generate_surrogate_zeros
from .lindblad import get_h_zeta
from .zrsd_solver import rk4_step
from .observables import multiplicity_operator, total_number_operator, expectation, purity
from .telemetry import TelemetryFrame, TelemetryTracker

def run_comparison(primes: list, steps: int = 500, dt: float = 0.05, seed: int = 42):
    """
    Run three models: Zeta-True, Zeta-Surrogate, No-Zeta.
    Returns a dictionary of TelemetryTrackers.
    """
    from .algebra import get_binary_basis
    basis = get_binary_basis(len(primes))
    dim = len(basis)
    M = multiplicity_operator(primes, basis)
    N_tot = total_number_operator(len(primes), basis)
    rho0 = np.eye(dim, dtype=complex) / dim
    
    gammas_true = get_zeta_zeros(3)
    gammas_surr = generate_surrogate_zeros(3, seed=seed)
    
    trackers = {
        "true": TelemetryTracker(),
        "surrogate": TelemetryTracker(),
        "baseline": TelemetryTracker()
    }
    
    models = [
        ("true", gammas_true, 1.0),
        ("surrogate", gammas_surr, 1.0),
        ("baseline", gammas_true, 0.0) # alpha=0 effectively no drive if H=alpha*M
    ]
    
    # We need to refine the baseline - if alpha=0 and drive=0 then it's trivial.
    # Let's say baseline has alpha=1.0 but amplitudes=0.
    
    for name, gammas, amp in models:
        rho = rho0.copy()
        tracker = trackers[name]
        Ls = [0.05 * M] # Uniform damping
        
        for s in range(steps):
            t = s * dt
            
            # Hamiltonian function for RK4
            def H_func(time):
                return get_h_zeta(M, time, gammas, amplitudes=np.full(len(gammas), amp))
            
            rho = rk4_step(rho, t, H_func, Ls, dt)
            
            # Record
            e_vals = np.linalg.eigvalsh(rho)
            frame = TelemetryFrame(
                t=t,
                trace=float(np.real_if_close(np.trace(rho))),
                exp_M=expectation(rho, M),
                exp_N=expectation(rho, N_tot),
                purity=purity(rho),
                min_eig=float(np.min(e_vals))
            )
            tracker.record(frame)
            
    return trackers
