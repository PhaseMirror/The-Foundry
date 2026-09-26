"""
ZRSD Integrated Simulation Runner.
Canonical entry point for Layer-III experiments grounded in Layer-I/II.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
from .fock.bridge_link import FockZRSDBridge
from .speculative.zeta_data import get_zeta_zeros, generate_surrogate_zeros
from .speculative.lindblad import get_h_zeta
from .speculative.zrsd_solver import rk4_step
from .speculative.observables import expectation, purity

def run_integrated_simulation(
    bridge: FockZRSDBridge,
    rho0: np.ndarray,
    config: Dict[str, Any],
    gammas: Optional[np.ndarray] = None,
    amplitudes: Optional[np.ndarray] = None
) -> pd.DataFrame:
    """
    Runs a simulation using operators and parameters strictly obtained from the bridge.
    """
    steps = config.get("steps", 200)
    dt = config.get("dt", 0.05)
    
    # 1. Obtain certified operators
    M = bridge.get_multiplicity_operator()
    N_tot = bridge.get_number_operator()
    a_dag, a = bridge.get_creation_annihilation()
    
    # 2. Setup zeta drive
    if gammas is None:
        num_zetas = 3
        mode = config.get("mode", "true")
        if mode == "true":
            gammas = get_zeta_zeros(num_zetas)
            amps = np.full(num_zetas, config.get("amplitudes", 1.0))
        elif mode == "random":
            gammas = generate_surrogate_zeros(num_zetas, seed=config.get("seed", 42))
            amps = np.full(num_zetas, config.get("amplitudes", 1.0))
        else: # none
            gammas = get_zeta_zeros(num_zetas)
            amps = np.zeros(num_zetas)
    else:
        amps = amplitudes if amplitudes is not None else np.ones(len(gammas))
        
    # 3. Setup dissipators from certified strengths
    kappas = bridge.compute_dissipator_strengths(target_c=config.get("target_c", 0.95))
    Ls = [np.sqrt(k) * op for k, op in zip(kappas, a)]
    # Optional dephasing in M
    Ls.append(np.sqrt(config.get("dephasing", 0.01)) * M)
    
    # 3b. Validate Drive Admissibility
    # Estimate delta as the maximum amplitude of the drive
    total_delta = np.sum(np.abs(amps))
    if not bridge.validate_perturbation(total_delta):
        raise ValueError(
            f"Simulation aborted: Drive perturbation (delta={total_delta:.4f}) "
            "exceeds stability envelope certified by StabilityGate."
        )
    
    # 4. Evolution Loop
    rho = rho0.copy()
    results = []
    
    for s in range(steps):
        t = s * dt
        
        # Hamiltonian drive function
        def H_func(time):
            return get_h_zeta(M, time, gammas, amplitudes=amps)
        
        # Step
        rho = rk4_step(rho, t, H_func, Ls, dt)
        
        # Lawful manifold projection
        rho = bridge.stabilize_rho_lawful(rho)
        
        # Telemetry
        e_vals = np.linalg.eigvalsh(rho)
        results.append({
            't': t,
            'step': s,
            'trace': float(np.real_if_close(np.trace(rho))),
            'min_eig': float(np.min(e_vals)),
            'exp_M': expectation(rho, M),
            'exp_N': expectation(rho, N_tot),
            'purity': purity(rho)
        })
        
    return pd.DataFrame(results)
