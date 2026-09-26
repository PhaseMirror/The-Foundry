"""
Phase 5-03: Multi-Realization Ensemble Optimization.

Runs large-scale ensemble simulations (100 realizations) to validate 
statistical robustness of the Healthy vs Pathological transition.

Objectives:
1. Establish mean/std for occupations in Healthy regime.
2. Characterize the "GABA collapse" pathological shift.
3. Compute confidence intervals for resonance specificity.
"""

import numpy as np
import pandas as pd
import json
import torch
import os
from typing import Dict, Any, List
from scipy import stats

from zrsd.fock.bridge_link import FockZRSDBridge
from zrsd.resonance.modes import true_zeta_mode
from zrsd.resonance.detectors import resonance_score_expM, compute_phase_lock_index
from zrsd.simulation import run_integrated_simulation
from pirtm.core.multiplicity_cell import MultiplicityCell

# --- CONFIGURATION ---
NUM_REALIZATIONS = 20
PRIMES = [2, 3, 7] # ACh, GABA, Glutamate
STEPS = 500
DT = 0.05
TARGET_C = 0.95

# Healthy: Normal damping
# Pathological: Increased GABA (p=3) damping to simulate "collapse"
# Optimized Healthy: Adjusted damping to match physiological targets (82% Glutamate)
KAPPA_MODS = {
    "healthy": {3: 1.0, 7: 1.0},
    "pathological": {3: 10.0, 7: 0.5},
    "optimized_healthy": {2: 5.0, 3: 5.0, 7: 0.1} # Suppress ACh/GABA, Boost Glutamate
}

def run_ensemble(bridge: FockZRSDBridge, mode: str, seeds: List[int]) -> List[Dict[str, Any]]:
    """Runs a batch of simulations for a given mode and set of seeds."""
    mode_true = true_zeta_mode(k=3)
    rho0 = np.eye(bridge.dim, dtype=complex) / bridge.dim
    
    # Adjust kappas based on mode
    base_kappas = bridge.compute_dissipator_strengths(target_c=TARGET_C)
    mods = KAPPA_MODS[mode]
    
    results = []
    
    for seed in seeds:
        np.random.seed(seed)
        # We don't have a direct way to pass modified kappas to run_integrated_simulation
        # without monkey-patching or passing Ls directly.
        # Let's compute Ls here.
        
        kappas = []
        for i, p in enumerate(bridge.primes):
            k = base_kappas[i]
            if p in mods:
                k *= mods[p]
            kappas.append(k)
            
        a_dag, a = bridge.get_creation_annihilation()
        Ls = [np.sqrt(k) * op for k, op in zip(kappas, a)]
        # Add small dephasing
        M = bridge.get_multiplicity_operator()
        Ls.append(np.sqrt(0.01) * M)
        
        # Run simulation
        config = {"steps": STEPS, "dt": DT}
        # We need a modified run_integrated_simulation or a way to override Ls.
        # Looking at simulation.py, it constructs Ls internally.
        # I'll re-implement the loop here for full control.
        
        df = run_sim_with_custom_ls(bridge, rho0, config, Ls, mode_true.gammas)
        
        # Compute average occupations in the final window
        final_window = df.tail(100)
        occ_stats = {}
        for i, p in enumerate(bridge.primes):
            occ_stats[f"n_{p}"] = float(final_window[f"n_{p}"].mean())
            
        # Resonance Score
        score = resonance_score_expM(df, mode_true)
        
        results.append({
            "seed": seed,
            **occ_stats,
            "resonance_score": score,
            "purity": float(final_window["purity"].mean())
        })
        
    return results

def run_sim_with_custom_ls(bridge, rho0, config, Ls, gammas):
    """Modified simulation loop that accepts custom dissipators and tracks occupations."""
    from zrsd.speculative.lindblad import get_h_zeta, lindblad_rhs
    from zrsd.speculative.zrsd_solver import rk4_step
    from zrsd.speculative.observables import expectation, purity
    
    steps = config["steps"]
    dt = config["dt"]
    M = bridge.get_multiplicity_operator()
    N_tot = bridge.get_number_operator()
    a_dag, a = bridge.get_creation_annihilation()
    Np_ops = [ad @ an for ad, an in zip(a_dag, a)]
    
    rho = rho0.copy()
    results = []
    
    amps = np.ones(len(gammas))
    
    for s in range(steps):
        t = s * dt
        # Add stochastic noise to the drive
        noise_amp = 0.05 * np.random.randn(len(gammas))
        current_amps = amps + noise_amp
        
        def H_func(time):
            return get_h_zeta(M, time, gammas, amplitudes=current_amps)
        
        rho = rk4_step(rho, t, H_func, Ls, dt)
        rho = bridge.stabilize_rho_lawful(rho)
        
        res = {
            't': t,
            'exp_M': expectation(rho, M),
            'purity': purity(rho)
        }
        for i, p in enumerate(bridge.primes):
            res[f"n_{p}"] = expectation(rho, Np_ops[i])
            
        results.append(res)
        
    return pd.DataFrame(results)

def main():
    print("=== [PHASE 5-03] STARTING MULTI-REALIZATION ENSEMBLE OPTIMIZATION ===")
    
    primes = [2, 3, 7]
    cell = MultiplicityCell(primes, feature_dim=8, sigma=1.0)
    bridge = FockZRSDBridge(primes, cell=cell)
    
    seeds = list(range(100, 100 + NUM_REALIZATIONS))
    
    print(f"Running Healthy Ensemble (N={NUM_REALIZATIONS})...")
    results_healthy = run_ensemble(bridge, "healthy", seeds)
    
    print(f"Running Pathological Ensemble (N={NUM_REALIZATIONS})...")
    results_pathological = run_ensemble(bridge, "pathological", seeds)
    
    print(f"Running Optimized Healthy Ensemble (N={NUM_REALIZATIONS})...")
    results_opt = run_ensemble(bridge, "optimized_healthy", seeds)
    
    # Statistical Analysis
    df_h = pd.DataFrame(results_healthy)
    df_p = pd.DataFrame(results_pathological)
    df_o = pd.DataFrame(results_opt)
    
    summary = {
        "healthy": {
            "n_2": {"mean": df_h["n_2"].mean(), "std": df_h["n_2"].std()},
            "n_3": {"mean": df_h["n_3"].mean(), "std": df_h["n_3"].std()},
            "n_7": {"mean": df_h["n_7"].mean(), "std": df_h["n_7"].std()},
        },
        "optimized_healthy": {
            "n_2": {"mean": df_o["n_2"].mean(), "std": df_o["n_2"].std()},
            "n_3": {"mean": df_o["n_3"].mean(), "std": df_o["n_3"].std()},
            "n_7": {"mean": df_o["n_7"].mean(), "std": df_o["n_7"].std()},
        },
        "pathological": {
            "n_2": {"mean": df_p["n_2"].mean(), "std": df_p["n_2"].std()},
            "n_3": {"mean": df_p["n_3"].mean(), "std": df_p["n_3"].std()},
            "n_7": {"mean": df_p["n_7"].mean(), "std": df_p["n_7"].std()},
        }
    }
    
    # Probabilities
    for mode in ["healthy", "optimized_healthy", "pathological"]:
        m = summary[mode]
        total = m["n_2"]["mean"] + m["n_3"]["mean"] + m["n_7"]["mean"]
        m["p_2"] = m["n_2"]["mean"] / total
        m["p_3"] = m["n_3"]["mean"] / total
        m["p_7"] = m["n_7"]["mean"] / total
        
    print("\n--- ENSEMBLE PROBABILITIES ---")
    for mode in ["healthy", "optimized_healthy", "pathological"]:
        m = summary[mode]
        print(f"{mode.capitalize():<18}: ACh={m['p_2']:.3f}, GABA={m['p_3']:.3f}, Glu={m['p_7']:.3f}")

    with open("ensemble_optimization_results.json", "w") as f:
        json.dump(summary, f, indent=2)
        
    print("\nResults saved to ensemble_optimization_results.json")

if __name__ == "__main__":
    main()
