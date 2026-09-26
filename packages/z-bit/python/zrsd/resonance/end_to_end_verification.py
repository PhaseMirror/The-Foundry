"""
Layer-III End-to-End Verification Script.

Executes the full MTPI stack comparison:
1. Certified Core (MultiplicityCell)
2. Fock Bridge (Ladder operators & M)
3. ZRSD Solver (Lindblad evolution)
4. Resonance Layer (Scoring & Specificity)

Outputs:
- telemetry_true.csv
- telemetry_rand.csv
- telemetry_none.csv
- resonance_summary.json
"""

import numpy as np
import pandas as pd
import json
import torch
from zrsd.fock.bridge_link import FockZRSDBridge
from zrsd.resonance.modes import true_zeta_mode, randomized_mode
from zrsd.resonance.detectors import resonance_score_expM, zeta_specificity, compute_phase_lock_index
from zrsd.simulation import run_integrated_simulation
from pirtm.core.multiplicity_cell import MultiplicityCell

def run_end_to_end_verification():
    print("=== [MTPI] STARTING END-TO-END VERIFICATION ===")
    
    # 1. Setup Layer-I/II Foundations
    primes = [2, 3, 5, 7]
    cell = MultiplicityCell(primes, feature_dim=8, sigma=1.0)
    bridge = FockZRSDBridge(primes, cell=cell)
    
    # 2. Define Layer-III Modes
    mode_true = true_zeta_mode(k=3)
    mode_rand = randomized_mode(seed=123, k=3) # Different seed for separation
    
    # 3. Setup Initial State (Maximally Mixed)
    rho0 = np.eye(bridge.dim, dtype=complex) / bridge.dim
    
    config = {
        "steps": 1000,
        "dt": 0.05,
        "amplitudes": 2.0,
        "target_c": 0.95
    }
    
    # 4. Run Conditions
    print("[LAYER-III] Running True Zeta condition...")
    df_true = run_integrated_simulation(bridge, rho0, config, 
                                        gammas=np.array(mode_true.gammas))
    df_true.to_csv("telemetry_true.csv", index=False)
    
    print("[LAYER-III] Running Randomized Null condition...")
    df_rand = run_integrated_simulation(bridge, rho0, config, 
                                        gammas=np.array(mode_rand.gammas))
    df_rand.to_csv("telemetry_rand.csv", index=False)
    
    print("[LAYER-III] Running Baseline (No-Drive) condition...")
    config_none = config.copy()
    config_none["mode"] = "none"
    df_none = run_integrated_simulation(bridge, rho0, config_none)
    df_none.to_csv("telemetry_none.csv", index=False)
    
    # 5. Compute Resonance Scores
    s_true = resonance_score_expM(df_true, mode_true, bandwidth=0.1)
    s_rand = resonance_score_expM(df_rand, mode_rand, bandwidth=0.1)
    specificity = s_true - s_rand
    
    # 6. Compute Phase-Lock Indices (for the primary zero)
    gamma0 = mode_true.gammas[0]
    pli_true = compute_phase_lock_index(df_true, gamma0)
    pli_rand = compute_phase_lock_index(df_rand, gamma0)
    pli_none = compute_phase_lock_index(df_none, gamma0)
    
    summary = {
        "params": {
            "primes": primes,
            "zetas": mode_true.gammas,
            "lambda_m_eff": float(torch.mean(cell.lambda_p).item())
        },
        "scores": {
            "resonance_true": s_true,
            "resonance_rand": s_rand,
            "zeta_specificity": specificity
        },
        "phase_lock": {
            "pli_true": pli_true,
            "pli_rand": pli_rand,
            "pli_none": pli_none
        },
        "stability": {
            "max_trace_err": float(np.abs(df_true["trace"] - 1.0).max()),
            "min_eig_true": float(df_true["min_eig"].min())
        }
    }
    
    with open("resonance_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
        
    print("\n=== [VERIFICATION COMPLETE] ===")
    print(f"Resonance Score (True): {s_true:.4f}")
    print(f"Resonance Score (Rand): {s_rand:.4f}")
    print(f"Zeta Specificity:      {specificity:.4f}")
    print(f"PLI (True @ gamma0):   {pli_true:.4f}")
    print(f"PLI (Rand @ gamma0):   {pli_rand:.4f}")
    print("Summary saved to resonance_summary.json")

if __name__ == "__main__":
    run_end_to_end_verification()
