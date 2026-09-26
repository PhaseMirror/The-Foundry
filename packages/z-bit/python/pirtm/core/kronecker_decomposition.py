"""
Q-05: Kronecker Sum Decomposition (Tier 3).

Exploits block structure for spectral bounds:

    r(Λ_net) ≤ max_k r(Λ^(k)) + r(W)

where Λ^(k) are per-session blocks and W is the coupling matrix.
Tighter bound:  r(Λ_net) ≤ max_k r(Λ^(k)) + ‖W‖_2
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

import numpy as np
from scipy import sparse

from .network_gain import NetworkGainMatrix


@dataclass(frozen=True)
class KroneckerResult:
    """Result of Kronecker decomposition bound."""
    per_session_radii: np.ndarray  # r(Λ^(k)) for each session
    max_session_radius: float      # max_k r(Λ^(k))
    coupling_radius: float         # r(W) or ‖W‖_2
    bound: float                   # max_session + coupling
    tight_bound: float             # tighter bound using ‖W‖_2


class KroneckerDecomposition:
    """Tier 3: Kronecker sum decomposition for spectral bounds."""

    def decompose(self, network: NetworkGainMatrix) -> KroneckerResult:
        """Decompose network matrix into per-session + coupling components."""
        # Per-session spectral radii (small dense eigvals — fine)
        session_radii = []
        session_norms = []
        for sid in network.session_ids:
            lam = network.get_session(sid)
            r = float(np.max(np.abs(np.linalg.eigvals(lam))))
            session_radii.append(r)
            # Operator 2-norm (≥ spectral radius for non-symmetric)
            session_norms.append(float(np.linalg.norm(lam, ord=2)))
        session_radii_arr = np.array(session_radii)
        max_r = float(np.max(session_radii_arr))
        max_norm = float(np.max(session_norms))

        # Coupling matrix: extract W by subtracting block-diagonal from full
        W = self._extract_coupling(network)

        # Coupling spectral radius and operator norm
        if W.nnz == 0:
            coupling_r = 0.0
            coupling_norm = 0.0
        else:
            coupling_r = float(np.max(np.abs(np.linalg.eigvals(W.toarray()))))
            # ‖W‖_2 (operator 2-norm) for provably conservative bound
            try:
                from scipy.sparse.linalg import svds
                if min(W.shape) > 2 and W.nnz > 0:
                    s = svds(W.astype(float), k=1, return_singular_vectors=False)
                    coupling_norm = float(s[0])
                else:
                    coupling_norm = float(np.linalg.norm(W.toarray(), ord=2))
            except Exception:
                coupling_norm = float(np.linalg.norm(W.toarray(), ord=2))

        # Provably conservative: r(A+B) ≤ ‖A‖_2 + ‖B‖_2
        # bound uses operator norms (guaranteed)
        # tight_bound uses max spectral radius + coupling norm (tighter, practical)
        safe_coupling = max(coupling_r, coupling_norm)

        return KroneckerResult(
            per_session_radii=session_radii_arr,
            max_session_radius=max_r,
            coupling_radius=safe_coupling,
            bound=max_norm + safe_coupling,
            tight_bound=max_r + coupling_norm,
        )

    def bound(self, network: NetworkGainMatrix) -> float:
        """Upper bound: max_k r(Λ^(k)) + r(W)."""
        return self.decompose(network).bound

    def tight_bound(self, network: NetworkGainMatrix) -> float:
        """Tighter bound: max_k r(Λ^(k)) + ‖W‖_2."""
        return self.decompose(network).tight_bound

    def per_session_radii(self, network: NetworkGainMatrix) -> np.ndarray:
        """Array of per-session spectral radii."""
        return self.decompose(network).per_session_radii

    def _extract_coupling(self, network: NetworkGainMatrix) -> sparse.csr_matrix:
        """Extract coupling matrix W from network (full matrix - block diagonal)."""
        N = network.total_dim
        n = network.state_dim
        ids = network.session_ids
        idx_map = {sid: i for i, sid in enumerate(ids)}

        # Build coupling-only matrix
        W = np.zeros((N, N), dtype=float)
        for (si, sj), block in network._coupling.items():
            ki, kj = idx_map[si], idx_map[sj]
            W[ki * n:(ki + 1) * n, kj * n:(kj + 1) * n] += block

        return sparse.csr_matrix(W)
