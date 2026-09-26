"""
Phase 5-04: EchoBraid Bridge Integration (ASD Modeling).

Models Autism Spectrum Disorder (ASD) using the EchoBraid protocol:
- Altered coupling weights J_pq.
- Reduced GABA -> Glutamate inhibition.
- Increased ACh -> Glutamate drive.
"""

import numpy as np
import pandas as pd
import json
import os
from typing import Dict, Any, List
import matplotlib.pyplot as plt

from zrsd.fock.bridge_link import FockZRSDBridge
from zrsd.resonance.modes import true_zeta_mode
from zrsd.resonance.detectors import resonance_score_expM
from zrsd.speculative.lindblad import get_h_zeta, lindblad_rhs
from zrsd.speculative.zrsd_solver import rk4_step
from zrsd.speculative.observables import expectation, purity
from pirtm.core.multiplicity_cell import MultiplicityCell

# --- CONFIGURATION ---
PRIMES = [2, 3, 7] # ACh, GABA, Glutamate
STEPS = 500
DT = 0.05
TARGET_C = 0.95

# J_pq matrix indices: 0: ACh (2), 1: GABA (3), 2: Glu (7)
# Healthy J (Balanced)
J_HEALTHY = np.zeros((3, 3))
J_HEALTHY[0, 2] = 0.1  # ACh -> Glu drive
J_HEALTHY[1, 2] = 0.1  # GABA -> Glu coupling (balanced)

# ASD J (Hyper-coupled ACh, Hypo-coupled GABA)
J_ASD = np.zeros((3, 3))
J_ASD[0, 2] = 0.8    # Increased ACh -> Glu drive (Hyper-coupling)
J_ASD[1, 2] = 0.02   # Reduced GABA -> Glu coupling (Hypo-coupling)

# Inverted J (Hypo-coupled ACh, Hyper-coupled GABA) -> "Hyper-Focused"
J_FOCUS = np.zeros((3, 3))
J_FOCUS[0, 2] = 0.02  # Reduced ACh -> Glu drive
J_FOCUS[1, 2] = 0.8   # Increased GABA -> Glu coupling (Hyper-inhibition)

# ASD Damping (GABA collapse)
KAPPA_MODS_ASD = {2: 1.0, 3: 5.0, 7: 1.0}

# Focus Damping (GABA stabilization)
KAPPA_MODS_FOCUS = {2: 1.0, 3: 0.2, 7: 1.0} # Reduced GABA damping

def run_echobraid_sim(bridge: FockZRSDBridge, J: np.ndarray, name: str, kappa_mods: Dict[int, float] = None):
    """Runs a ZRSD simulation with EchoBraid coupling weights J."""
    mode_true = true_zeta_mode(k=3)
    rho0 = np.eye(bridge.dim, dtype=complex) / bridge.dim
    
    # Dissipators
    base_kappas = bridge.compute_dissipator_strengths(target_c=TARGET_C)
    a_dag, a = bridge.get_creation_annihilation()
    
    kappas = []
    for i, p in enumerate(bridge.primes):
        k = base_kappas[i]
        if kappa_mods and p in kappa_mods:
            k *= kappa_mods[p]
        kappas.append(k)
        
    Ls = [np.sqrt(k) * op for k, op in zip(kappas, a)]
    M = bridge.get_multiplicity_operator()
    Ls.append(np.sqrt(0.01) * M) # Dephasing
    
    Np_ops = [ad @ an for ad, an in zip(a_dag, a)]
    ladder_ops = (a_dag, a)
    gammas = np.array(mode_true.gammas)
    amps = np.ones(len(gammas))
    
    rho = rho0.copy()
    history = []
    
    print(f"Running {name} Simulation...")
    for s in range(STEPS):
        t = s * DT
        # Add small noise to drive
        current_amps = amps + 0.05 * np.random.randn(len(gammas))
        
        def H_func(time):
            # Pass ladder_ops for hopping coupling
            return get_h_zeta(M, time, gammas, amplitudes=current_amps, J=J, 
                              Np_ops=Np_ops, ladder_ops=ladder_ops)
        
        rho = rk4_step(rho, t, H_func, Ls, DT)
        rho = bridge.stabilize_rho_lawful(rho)
        
        res = {
            't': t,
            'exp_M': expectation(rho, M),
            'purity': purity(rho)
        }
        for i, p in enumerate(bridge.primes):
            res[f"n_{p}"] = expectation(rho, Np_ops[i])
        history.append(res)
        
    return pd.DataFrame(history)

def main():
    print("=== [PHASE 5-04] ECHO-BRAID BRIDGE INTEGRATION: ASD MODELING ===")
    
    primes = [2, 3, 7]
    cell = MultiplicityCell(primes, feature_dim=8, sigma=1.0)
    bridge = FockZRSDBridge(primes, cell=cell)
    
    # 1. Run Healthy Braid
    df_healthy = run_echobraid_sim(bridge, J_HEALTHY, "Healthy (Balanced)")
    
    # 2. Run ASD Braid
    df_asd = run_echobraid_sim(bridge, J_ASD, "ASD (Altered Coupling)", kappa_mods=KAPPA_MODS_ASD)
    
    # 3. Run Hyper-Focused Braid
    df_focus = run_echobraid_sim(bridge, J_FOCUS, "Hyper-Focused (Inverted)", kappa_mods=KAPPA_MODS_FOCUS)
    
    # 4. Analysis
    h_final = df_healthy.tail(100).mean()
    a_final = df_asd.tail(100).mean()
    f_final = df_focus.tail(100).mean()
    
    print("\n--- Comparative Analysis ---")
    print(f"Regime      | ACh (p=2) | GABA (p=3) | Glu (p=7) | exp_M")
    print(f"------------|-----------|------------|-----------|-------")
    print(f"Healthy     | {h_final['n_2']:.4f}    | {h_final['n_3']:.4f}     | {h_final['n_7']:.4f}    | {h_final['exp_M']:.4f}")
    print(f"ASD         | {a_final['n_2']:.4f}    | {a_final['n_3']:.4f}     | {a_final['n_7']:.4f}    | {a_final['exp_M']:.4f}")
    print(f"Focus       | {f_final['n_2']:.4f}    | {f_final['n_3']:.4f}     | {f_final['n_7']:.4f}    | {f_final['exp_M']:.4f}")
    
    # PAC-like metric: Standard deviation of exp_M (proxy for adaptive variance)
    h_var = df_healthy["exp_M"].std()
    a_var = df_asd["exp_M"].std()
    f_var = df_focus["exp_M"].std()
    print(f"\nSpectral Variance (exp_M std):")
    print(f"  Healthy: {h_var:.6f}")
    print(f"  ASD:     {a_var:.6f}")
    print(f"  Focus:   {f_var:.6f} (Change vs Healthy: {(f_var/h_var - 1)*100:+.2f}%)")

    # Export results
    results = {
        "healthy": h_final.to_dict(),
        "asd": a_final.to_dict(),
        "focus": f_final.to_dict(),
        "metrics": {
            "healthy_var": h_var,
            "asd_var": a_var,
            "focus_var": f_var
        }
    }
    
    with open("echobraid_asd_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print("\nEchoBraid ASD Results (including Focus) saved to echobraid_asd_results.json")

    # Plot results
    plt.figure(figsize=(12, 6))
    plt.plot(df_healthy['t'], df_healthy['exp_M'], label='Healthy', alpha=0.6)
    plt.plot(df_asd['t'], df_asd['exp_M'], label='ASD (Hyper-coupled)', alpha=0.6)
    plt.plot(df_focus['t'], df_focus['exp_M'], label='Focus (Hyper-inhibited)', alpha=0.8, linewidth=2)
    plt.title("EchoBraid Cognitive Modeling: Multiplicity Expectation (exp_M)")
    plt.xlabel("Time (t)")
    plt.ylabel("exp_M")
    plt.legend()
    plt.savefig("echobraid_asd_plot.png")
    print("Plot saved to echobraid_asd_plot.png")

if __name__ == "__main__":
    main()
