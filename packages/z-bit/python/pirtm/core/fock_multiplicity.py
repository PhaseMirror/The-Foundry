"""
PIRTM Layer-II: Fock-Multiplicity Integration.

This module integrates the MultiplicityCell with the FockSpaceBridge
to enable many-body dynamics on the prime-indexed Hilbert space.

Reference: MultiplicityLawfulRecursion.md (Layer-II Spec)
"""

import torch
import numpy as np
from typing import List, Dict, Any
from .multiplicity_cell import MultiplicityCell
from .fock import FockSpaceBridge, FockState, fock_embedding

class FockMultiplicityEngine:
    """
    Engine that coordinates MultiplicityCell evolution with Fock space embedding.
    """
    
    def __init__(self, 
                 primes: List[int], 
                 feature_dim: int,
                 sigma: float = 1.0):
        self.primes = sorted(primes)
        self.cell = MultiplicityCell(primes, feature_dim, sigma)
        self.bridge = FockSpaceBridge(primes)
        self.sigma = sigma

    def step(self, 
             psi_t: torch.Tensor, 
             x_t: torch.Tensor = None) -> Dict[str, Any]:
        """
        Execute one step of combined evolution:
        1. Recurrence in H (MultiplicityCell)
        2. Embedding into F(H) (FockBridge)
        3. Stabilization in F(H)
        """
        # 1. Multiplicity Cell Recurrence
        cell_output = self.cell(psi_t, x_t)
        psi_next = cell_output["psi_next"]
        
        # 2. Fock Embedding
        # Convert torch tensor to numpy for the bridge (current limitation)
        psi_np = psi_next.detach().cpu().numpy()
        # We aggregate across features for a simplified embedding demonstration
        psi_flat = np.mean(psi_np, axis=1) 
        fock_state = fock_embedding(psi_flat, self.bridge)
        
        # 3. Stabilization
        # Use an aggregate lambda_m for stabilization (mean of lambda_p)
        lambda_m_eff = torch.mean(self.cell.lambda_p).item()
        stable_fock = self.bridge.stabilized_update(fock_state, lambda_m_eff)
        
        return {
            "psi_next": psi_next,
            "fock_state": stable_fock,
            "ace": cell_output["total_ace"],
            "number_exp": self.bridge.number_operator(stable_fock)
        }

    def __repr__(self) -> str:
        return f"FockMultiplicityEngine(primes={self.primes}, σ={self.sigma})"
