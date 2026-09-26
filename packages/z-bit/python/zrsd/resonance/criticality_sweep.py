"""
Phase 5-04 Extension: Criticality Sweep.

Varies the EchoBraid coupling strength J_pq to find the 
phase transition point between Healthy Balance and Focused Locking.
"""

import numpy as np
import pandas as pd
import json
import matplotlib.pyplot as plt
from typing import List, Dict

from zrsd.fock.bridge_link import FockZRSDBridge
from zrsd.resonance.modes import true_zeta_mode
from zrsd.speculative.lindblad import get_h_zeta
from zrsd.speculative.zrsd_solver import rk4_step
from zrsd.speculative.observables import expectation
from pirtm.core.multiplicity_cell import MultiplicityCell

# --- CONFIGURATION ---
J_MIN = 0.0
J_MAX = 15.0
J_STEPS = 60
STEPS = 1000
DT = 0.05
PRIMES = [2, 3, 7]

def run_sweep():
    print(f"=== [PHASE 5-04] STARTING CRITICALITY SWEEP (J: {J_MIN} -> {J_MAX}) ===")
    
    primes = [2, 3, 7]
    cell = MultiplicityCell(primes, feature_dim=8, sigma=1.0)
    bridge = FockZRSDBridge(primes, cell=cell)
    
    mode_true = true_zeta_mode(k=3)
    gammas = np.array(mode_true.gammas)
    amps = np.ones(len(gammas))
    
    # Operators
    M = bridge.get_multiplicity_operator()
    a_dag, a = bridge.get_creation_annihilation()
    ladder_ops = (a_dag, a)
    Np_ops = [ad @ an for ad, an in zip(a_dag, a)]
    N3 = Np_ops[1]
    
    # Dissipators (Healthy)
    kappas = bridge.compute_dissipator_strengths(target_c=0.95)
    Ls = [np.sqrt(k) * op for k, op in zip(kappas, a)]
    Ls.append(np.sqrt(0.01) * M)
    
    rho0 = np.eye(bridge.dim, dtype=complex) / bridge.dim
    
    j_values = np.linspace(J_MIN, J_MAX, J_STEPS)
    results = []
    
    for j in j_values:
        # Uniform coupling across all sectors
        J_mat = np.full((3, 3), j)
        np.fill_diagonal(J_mat, 0)
        
        rho = rho0.copy()
        m_vals = []
        n3_vals = []
        
        print(f"Testing J={j:.3f}...", end="\r")
        for s in range(STEPS):
            t = s * DT
            current_amps = amps + 0.05 * np.random.randn(len(gammas))
            
            def H_func(time):
                return get_h_zeta(M, time, gammas, amplitudes=current_amps, J=J_mat, ladder_ops=ladder_ops)
            
            rho = rk4_step(rho, t, H_func, Ls, DT)
            rho = bridge.stabilize_rho_lawful(rho)
            
            if s > STEPS // 2: 
                m_vals.append(expectation(rho, M))
                n3_vals.append(expectation(rho, N3))
        
        results.append({
            "j": float(j),
            "exp_M_mean": float(np.mean(m_vals)),
            "exp_M_std": float(np.std(m_vals)),
            "n3_mean": float(np.mean(n3_vals))
        })
    
    df = pd.DataFrame(results)
    
    # Criticality at the point where variance drops significantly
    df["d_std"] = df["exp_M_std"].diff()
    j_crit = df.iloc[df["d_std"].idxmin()]["j"] if not df["d_std"].isna().all() else 0.0
    
    print(f"\nSweep Complete. Identified Criticality Point J_crit ≈ {j_crit:.3f}")
    
    # Save Data
    df.to_json("criticality_sweep_results.json", orient="records")
    
    # Plotting
    fig, ax1 = plt.subplots(figsize=(10, 6))
    
    ax1.set_xlabel('Uniform Coupling Strength J')
    ax1.set_ylabel('Spectral Variance (exp_M std)', color='tab:red')
    ax1.plot(df['j'], df['exp_M_std'], 'o-', color='tab:red', label='Variance')
    ax1.tick_params(axis='y', labelcolor='tab:red')
    
    ax2 = ax1.twinx()
    ax2.set_ylabel('Mean Multiplicity <M>', color='tab:blue')
    ax2.plot(df['j'], df['exp_M_mean'], 's--', color='tab:blue', label='Mean <M>')
    ax2.tick_params(axis='y', labelcolor='tab:blue')
    
    plt.axvline(x=j_crit, color='k', linestyle='--', alpha=0.5, label=f'J_crit={j_crit:.2f}')
    plt.title("EchoBraid Criticality Sweep: Phase Transition Mapping")
    fig.tight_layout()
    plt.savefig("criticality_sweep_plot.png")
    print("Plot saved to criticality_sweep_plot.png")

if __name__ == "__main__":
    run_sweep()
