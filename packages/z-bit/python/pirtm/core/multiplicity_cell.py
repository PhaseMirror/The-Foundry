"""
PIRTM MultiplicityCell - Channel-Resolved Prime-Indexed Recurrence.

This module implements the canonical MultiplicityCell using PyTorch.
It uses a channel-resolved multiplicity vector λ_p to govern contraction
and diversity across prime modes.

Reference: MultiplicityLawfulRecursion.md (Layer-II Spec)
"""

import torch
import torch.nn as nn
import numpy as np
from typing import List, Optional, Dict

class MultiplicityCell(nn.Module):
    """
    Prime-indexed recursive cell with channel-resolved Λ.
    
    Update Rule:
        ψ_{t+1} = P_E [ Π_CSL ( ψ_t + Σ_p λ_p (A_p ψ_t + B_p ψ_t + E_p(ψ_t, x_t)) ) ]
    """
    
    def __init__(self, 
                 primes: List[int], 
                 feature_dim: int,
                 sigma: float = 1.0,
                 init_scale: float = 0.1):
        super().__init__()
        self.primes = sorted(primes)
        self.num_channels = len(self.primes)
        self.feature_dim = feature_dim
        
        # Channel-resolved multiplicity vector λ_p ∝ p^-σ
        # We store this as a non-trainable buffer by default, aligned with spec.
        lambda_p = torch.tensor([p**(-sigma) for p in self.primes], dtype=torch.float32)
        self.register_buffer('lambda_p', lambda_p)
        
        # Prime mixing operators A_p (feature_dim x feature_dim)
        # In this surrogate, we use a block-diagonal approach.
        self.A_p = nn.Parameter(torch.randn(self.num_channels, feature_dim, feature_dim) * init_scale)
        
        # Temporal/Sieve operators B_p
        self.B_p = nn.Parameter(torch.randn(self.num_channels, feature_dim, feature_dim) * init_scale)
        
        # Coupling operators E_p
        self.E_p = nn.Parameter(torch.randn(self.num_channels, feature_dim, feature_dim) * init_scale)

    def compute_lipschitz_estimates(self) -> torch.Tensor:
        """
        Compute per-channel Lipschitz bounds: L_p = ||A_p|| + ||B_p|| + ||E_p||.
        Uses a conservative Frobenius norm for the surrogate implementation.
        """
        norm_A = torch.linalg.matrix_norm(self.A_p, ord='fro', dim=(-2, -1))
        norm_B = torch.linalg.matrix_norm(self.B_p, ord='fro', dim=(-2, -1))
        norm_E = torch.linalg.matrix_norm(self.E_p, ord='fro', dim=(-2, -1))
        return norm_A + norm_B + norm_E

    def check_contraction(self, margin: float = 0.05) -> bool:
        """Verify the channel-wise contraction condition: λ_p * L_p < 1 - ε."""
        L_p = self.compute_lipschitz_estimates()
        bounds = self.lambda_p * L_p
        return torch.all(bounds < 1.0 - margin).item()

    def forward(self, 
                psi_t: torch.Tensor, 
                x_t: Optional[torch.Tensor] = None) -> Dict[str, torch.Tensor]:
        """
        Execute one step of the multiplicity recursion.
        
        Args:
            psi_t: Current state tensor of shape (num_channels, feature_dim)
            x_t: External input tensor of shape (num_channels, feature_dim)
            
        Returns:
            Dict containing psi_next, ACE, and contraction bounds.
        """
        if x_t is None:
            x_t = torch.zeros_like(psi_t)
            
        # Compute operator contributions per channel
        # A_p psi_t, B_p psi_t, E_p x_t
        term_A = torch.matmul(self.A_p, psi_t.unsqueeze(-1)).squeeze(-1)
        term_B = torch.matmul(self.B_p, psi_t.unsqueeze(-1)).squeeze(-1)
        term_E = torch.matmul(self.E_p, x_t.unsqueeze(-1)).squeeze(-1)
        
        # Summed update: Delta = Σ_p λ_p (A_p + B_p + E_p)
        delta_psi = self.lambda_p.unsqueeze(-1) * (term_A + term_B + term_E)
        
        # Raw next state
        psi_raw = psi_t + delta_psi
        
        # Projectors (surrogate: clipping to [-1, 1] as per Layer-I freeze)
        psi_next = torch.clamp(psi_raw, -1.0, 1.0)
        
        # Compute ACE (Absolute Contraction Energy) contribution
        # ACE_p = ||λ_p * Delta_p||
        ace_p = torch.norm(delta_psi, dim=-1)
        
        return {
            "psi_next": psi_next,
            "ace_p": ace_p,
            "total_ace": torch.sum(ace_p),
            "contraction_bounds": self.lambda_p * self.compute_lipschitz_estimates()
        }
