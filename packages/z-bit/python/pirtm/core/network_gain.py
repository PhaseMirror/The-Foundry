"""
Q-01: Network Gain Matrix Model.

Defines the mathematical model for coupled-session gain matrices:

    Λ_net = diag(Λ^(1), ..., Λ^(K)) + W

where Λ^(k) are per-session gain matrices and W is the inter-session
coupling matrix (sparse, block-structured).
"""
from __future__ import annotations

import enum
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np
from scipy import sparse


class CouplingTopology(enum.Enum):
    """Coupling topology between sessions."""
    RING = "ring"
    STAR = "star"
    RANDOM = "random"
    CUSTOM = "custom"


@dataclass
class NetworkGainMatrix:
    """Block-diagonal + coupling network gain matrix.

    Λ_net = diag(Λ^(1), ..., Λ^(K)) + W
    """

    _sessions: Dict[int, np.ndarray] = field(default_factory=dict)
    _coupling: Dict[Tuple[int, int], np.ndarray] = field(default_factory=dict)
    _state_dim: Optional[int] = None

    # -- builders ----------------------------------------------------------

    def add_session(self, session_id: int, Lambda_k: np.ndarray) -> None:
        """Register a session's gain matrix (n×n)."""
        n = Lambda_k.shape[0]
        if Lambda_k.shape != (n, n):
            raise ValueError(f"Gain matrix must be square, got {Lambda_k.shape}")
        if self._state_dim is None:
            self._state_dim = n
        elif n != self._state_dim:
            raise ValueError(
                f"Dimension mismatch: expected {self._state_dim}, got {n}"
            )
        self._sessions[session_id] = np.array(Lambda_k, dtype=float)

    def set_coupling(
        self, session_i: int, session_j: int, coupling_block: np.ndarray
    ) -> None:
        """Set coupling block between session i and session j (n×n)."""
        n = coupling_block.shape[0]
        if coupling_block.shape != (n, n):
            raise ValueError("Coupling block must be square")
        if self._state_dim is not None and n != self._state_dim:
            raise ValueError(
                f"Coupling block dim {n} != state dim {self._state_dim}"
            )
        self._coupling[(session_i, session_j)] = np.array(
            coupling_block, dtype=float
        )

    # -- topology helpers --------------------------------------------------

    @classmethod
    def from_topology(
        cls,
        sessions: Dict[int, np.ndarray],
        topology: CouplingTopology,
        coupling_strength: float = 0.01,
        *,
        p: float = 0.05,
        seed: Optional[int] = None,
        custom_edges: Optional[List[Tuple[int, int]]] = None,
    ) -> "NetworkGainMatrix":
        """Build a network matrix from a coupling topology."""
        net = cls()
        for sid, lam in sessions.items():
            net.add_session(sid, lam)

        ids = sorted(sessions.keys())
        n = net.state_dim
        rng = np.random.default_rng(seed)

        if topology == CouplingTopology.RING:
            for idx in range(len(ids)):
                i, j = ids[idx], ids[(idx + 1) % len(ids)]
                block = rng.standard_normal((n, n)) * coupling_strength
                net.set_coupling(i, j, block)
                net.set_coupling(j, i, block.T)

        elif topology == CouplingTopology.STAR:
            hub = ids[0]
            for spoke in ids[1:]:
                block = rng.standard_normal((n, n)) * coupling_strength
                net.set_coupling(hub, spoke, block)
                net.set_coupling(spoke, hub, block.T)

        elif topology == CouplingTopology.RANDOM:
            for i_idx, i in enumerate(ids):
                for j in ids[i_idx + 1:]:
                    if rng.random() < p:
                        block = rng.standard_normal((n, n)) * coupling_strength
                        net.set_coupling(i, j, block)
                        net.set_coupling(j, i, block.T)

        elif topology == CouplingTopology.CUSTOM:
            if custom_edges is None:
                raise ValueError("custom_edges required for CUSTOM topology")
            for i, j in custom_edges:
                block = rng.standard_normal((n, n)) * coupling_strength
                net.set_coupling(i, j, block)

        return net

    # -- properties --------------------------------------------------------

    @property
    def n_sessions(self) -> int:
        return len(self._sessions)

    @property
    def state_dim(self) -> int:
        if self._state_dim is None:
            raise ValueError("No sessions added yet")
        return self._state_dim

    @property
    def total_dim(self) -> int:
        return self.n_sessions * self.state_dim

    @property
    def session_ids(self) -> List[int]:
        return sorted(self._sessions.keys())

    # -- matrix forms ------------------------------------------------------

    def to_dense(self) -> np.ndarray:
        """Full Kn × Kn dense matrix (validation only)."""
        N = self.total_dim
        n = self.state_dim
        ids = self.session_ids
        idx_map = {sid: i for i, sid in enumerate(ids)}
        M = np.zeros((N, N), dtype=float)

        # block-diagonal
        for sid, lam in self._sessions.items():
            k = idx_map[sid]
            M[k * n:(k + 1) * n, k * n:(k + 1) * n] = lam

        # coupling
        for (si, sj), block in self._coupling.items():
            ki, kj = idx_map[si], idx_map[sj]
            M[ki * n:(ki + 1) * n, kj * n:(kj + 1) * n] += block

        return M

    def to_sparse(self) -> sparse.csr_matrix:
        """CSR sparse representation."""
        return sparse.csr_matrix(self.to_dense())

    def coupling_nnz(self) -> int:
        """Number of non-zero entries contributed by coupling."""
        total = 0
        for block in self._coupling.values():
            total += np.count_nonzero(block)
        return total

    def get_session(self, session_id: int) -> np.ndarray:
        """Return per-session gain matrix."""
        return self._sessions[session_id]

    def get_coupling(self, si: int, sj: int) -> Optional[np.ndarray]:
        """Return coupling block, or None if not set."""
        return self._coupling.get((si, sj))

    def spectral_radius_dense(self) -> float:
        """Baseline: dense NumPy spectral radius (for validation)."""
        M = self.to_dense()
        return float(np.max(np.abs(np.linalg.eigvals(M))))
