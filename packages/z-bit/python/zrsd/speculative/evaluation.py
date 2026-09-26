"""
ZRSD EVALUATE Phase: Telemetry & Sanity Checks.
Implements the experimental protocol to verify integrated stack behavior.
"""

import numpy as np
import pandas as pd
import torch
from typing import Dict, List, Any
from .zeta_data import get_zeta_zeros, generate_surrogate_zeros
from .lindblad import get_h_zeta, commutator
from .zrsd_solver import rk4_step
from .observables import multiplicity_operator, total_number_operator, expectation, purity
from .algebra import get_binary_basis, get_creation_annihilation
from ..fock.bridge_link import FockZRSDBridge
from pirtm.core.fock_multiplicity import FockMultiplicityEngine

class ZRSDTelemetryRunner:
    """
    Runner for the EVALUATE phase experimental protocol.
    """
    
    def __init__(self, primes: List[int], feature_dim: int = 4, sigma: float = 1.0):
        self.primes = sorted(primes)
        self.num_primes = len(self.primes)
        self.engine = FockMultiplicityEngine(self.primes, feature_dim, sigma)
        self.bridge = FockZRSDBridge(self.primes)
        self.basis = self.bridge.basis
        self.dim = self.bridge.dim
        
        # Certified Operators
        self.M = self.bridge.get_multiplicity_operator()
        self.N_tot = np.diag([sum(occ) for occ in self.basis])
        self.a_dag, self.a = self.bridge.get_creation_annihilation()
        
        # Effective Lambda for stabilization
        self.lambda_m = torch.mean(self.engine.cell.lambda_p).item()

    def run_protocol(self, steps: int = 500, dt: float = 0.05) -> pd.DataFrame:
        """
        Run the 3-condition protocol: True, Surrogate, Baseline.
        """
        results = []
        
        conditions = [
            ("true", get_zeta_zeros(3), 1.0),
            ("surrogate", generate_surrogate_zeros(3, seed=42), 1.0),
            ("baseline", get_zeta_zeros(3), 0.0)
        ]
        
        # Non-diagonal coupling for interesting dynamics
        H_coupling = sum(self.a_dag) + sum(self.a)
        
        for name, gammas, amp in conditions:
            # Initialize with vacuum state
            rho = np.zeros((self.dim, self.dim), dtype=complex)
            rho[0, 0] = 1.0
            
            # Dissipators: decay to vacuum + dephasing
            Ls = [0.1 * a for a in self.a]
            Ls.append(0.05 * self.M)
            
            for s in range(steps):
                t = s * dt
                
                # Define H_func for RK4
                def H_func(time):
                    H_base = get_h_zeta(self.M, time, gammas, amplitudes=np.full(len(gammas), amp))
                    return H_base + 0.5 * H_coupling # Add constant coupling
                
                # Step
                rho = rk4_step(rho, t, H_func, Ls, dt)
                
                # Stabilization
                rho = self.bridge.stabilized_rho(rho, self.lambda_m)
                
                # Sanity metrics
                e_vals = np.linalg.eigvalsh(rho)
                tr = np.real_if_close(np.trace(rho))
                exp_M = expectation(rho, self.M)
                exp_N = expectation(rho, self.N_tot)
                pur = purity(rho)
                
                # CCR Drift Check for first prime
                # Tr(rho [a_0, a_0^dag])
                ccr_val = expectation(rho, self.a[0] @ self.a_dag[0] - self.a_dag[0] @ self.a[0])
                
                results.append({
                    'condition': name,
                    'step': s,
                    't': t,
                    'trace': float(tr),
                    'min_eig': float(np.min(e_vals)),
                    'exp_M': float(exp_M),
                    'exp_N': float(exp_N),
                    'purity': float(pur),
                    'ccr_drift': float(ccr_val)
                })
                
        df = pd.DataFrame(results)
        return df

def perform_evaluation():
    """Execute the full EVALUATE protocol and save telemetry."""
    primes = [2, 3, 5, 7] # 4 primes as requested
    runner = ZRSDTelemetryRunner(primes)
    
    print(f"[EVALUATE] Starting protocol with primes {primes}...")
    df = runner.run_protocol(steps=400, dt=0.05)
    
    csv_path = "zrsd_telemetry.csv"
    df.to_csv(csv_path, index=False)
    print(f"[EVALUATE] Telemetry saved to {csv_path}")
    
    # Summary Analysis
    print("\n[SUMMARY] Mean Observables by Condition:")
    summary = df.groupby('condition')[['exp_M', 'exp_N', 'purity', 'trace', 'min_eig']].mean()
    print(summary)
    
    # Check trace preservation
    trace_err = np.abs(df['trace'] - 1.0).max()
    print(f"\n[SANITY] Max Trace Error: {trace_err:.2e}")
    
    # Check CCR stability (standard deviation of ccr_drift)
    ccr_std = df.groupby('condition')['ccr_drift'].std().max()
    print(f"[SANITY] Max CCR Drift StdDev: {ccr_std:.2e}")

if __name__ == "__main__":
    perform_evaluation()
