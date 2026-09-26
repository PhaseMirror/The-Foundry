"""
ZRSD Phase 4: Explicit Bridge Coupling
Refined integration between ZRSD and the certified PIRTM core.
"""

import numpy as np
import torch
from typing import Optional, List, Tuple, Dict
from pirtm.core.fock import FockSpaceBridge
from pirtm.core.multiplicity_cell import MultiplicityCell
from pirtm.gate.stability_gate import StabilityGate
from zrsd.speculative.algebra import get_binary_basis

class FockZRSDBridge:
    """
    Refined bridge that acts as a read-only consumer of the PIRTM core.
    """
    
    def __init__(self, primes: List[int], cell: Optional[MultiplicityCell] = None):
        self.primes = sorted(primes)
        self.num_primes = len(self.primes)
        self.fock_bridge = FockSpaceBridge(self.primes)
        self.cell = cell
        self.basis = get_binary_basis(self.num_primes)
        self.dim = len(self.basis)
        self._gate = None
        
    def get_gate(self) -> StabilityGate:
        """Initialize or return the StabilityGate based on certified parameters."""
        if self._gate is None:
            params = self.extract_core_parameters()
            self._gate = StabilityGate(
                lambda_m=params["lambda_m"], 
                L_G=params["lipschitz"]
            )
        return self._gate

    def validate_perturbation(self, delta: float) -> bool:
        """Check if a given resonance/perturbation strength is stable."""
        return self.get_gate().check_admissibility(delta)

    def get_multiplicity_operator(self) -> np.ndarray:
        """Forward certified multiplicity matrix from Layer-II."""
        return self.fock_bridge.get_multiplicity_matrix(self.basis)

    def get_number_operator(self) -> np.ndarray:
        """Forward certified number operator matrix from Layer-II."""
        return self.fock_bridge.get_number_matrix(self.basis)

    def get_creation_annihilation(self) -> Tuple[List[np.ndarray], List[np.ndarray]]:
        """Forward certified ladder operators from Layer-II."""
        return self.fock_bridge.get_ladder_matrices(self.basis)

    def extract_core_parameters(self) -> Dict[str, float]:
        """Extract certified contraction parameters from the core engine."""
        if self.cell is None:
            import warnings
            warnings.warn("No MultiplicityCell provided, using fallback parameters (Lambda_m=1.0)")
            return {"lambda_m": 1.0, "lipschitz": 1.0, "c_bound": 1.0}
            
        lm = torch.mean(self.cell.lambda_p).item()
        L_p = self.cell.compute_lipschitz_estimates()
        L_eff = torch.mean(L_p).item()
        
        # c(lambda) = (1-lm) + lm * L_eff
        c_bound = (1.0 - lm) + lm * L_eff
        
        return {
            "lambda_m": lm,
            "lipschitz": L_eff,
            "c_bound": c_bound
        }

    def compute_dissipator_strengths(self, target_c: float = 0.95) -> List[float]:
        """
        Compute kappas so that effective dynamics respect a target contraction.
        Returns a list of strengths per prime channel.
        """
        params = self.extract_core_parameters()
        c_base = params["c_bound"]
        
        kappas = []
        for p in self.primes:
            # Scale base damping by 1/log(p) as per blueprint
            base_k = 0.01 / np.log(p)
            if c_base > target_c:
                # Increase damping if base contraction exceeds target
                base_k *= (c_base / target_c)
            kappas.append(base_k)
        return kappas

    def stabilize_rho_lawful(self, rho: np.ndarray) -> np.ndarray:
        """
        Lawful manifold projection for density matrices.
        1. Symmetrize
        2. Normalize Trace
        3. Clip negative eigenvalues
        """
        # 1. Symmetrize
        rho = 0.5 * (rho + rho.conj().T)
        
        # 2. Normalize Trace
        tr = np.trace(rho)
        if abs(tr) > 1e-12:
            rho = rho / tr
            
        # 3. Clip negative eigenvalues (Lawful subspace projection)
        vals, vecs = np.linalg.eigh(rho)
        vals_clipped = np.maximum(vals, 0.0)
        
        # Renormalize clipped eigenvalues to sum to 1
        sum_v = np.sum(vals_clipped)
        if sum_v > 0:
            vals_clipped /= sum_v
        else:
            # Fallback to pure vacuum if everything is zero
            vals_clipped[0] = 1.0
            
        # Reconstruct
        rho_stable = vecs @ np.diag(vals_clipped) @ vecs.conj().T
        return rho_stable
