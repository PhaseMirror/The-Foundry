"""
Q-03: Sparse Matrix Infrastructure.

Matrix-free sparse matrix-vector product (SpMV) for network gain matrices.
SciPy LinearOperator compatible for use with iterative eigsolvers.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import numpy as np
from scipy.sparse.linalg import LinearOperator

from .network_gain import NetworkGainMatrix


class MatrixFreeOperator(LinearOperator):
    """Matrix-free SpMV for network gain matrices.

    Computes  Λ_net · x = diag(Λ^(k)) · x + W · x
    without materializing the full Kn × Kn matrix.
    """

    def __init__(self, network: NetworkGainMatrix) -> None:
        self._net = network
        N = network.total_dim
        super().__init__(dtype=float, shape=(N, N))

    @property
    def network(self) -> NetworkGainMatrix:
        return self._net

    def _matvec(self, x: np.ndarray) -> np.ndarray:
        """y = Λ_net · x  (matrix-free)."""
        x = np.asarray(x, dtype=float).ravel()
        net = self._net
        n = net.state_dim
        ids = net.session_ids
        idx_map = {sid: i for i, sid in enumerate(ids)}
        y = np.zeros_like(x)

        # block-diagonal contribution: Λ^(k) · x_k
        for sid in ids:
            k = idx_map[sid]
            xk = x[k * n:(k + 1) * n]
            y[k * n:(k + 1) * n] += net.get_session(sid) @ xk

        # coupling contribution: W · x
        for (si, sj), block in net._coupling.items():
            ki, kj = idx_map[si], idx_map[sj]
            xj = x[kj * n:(kj + 1) * n]
            y[ki * n:(ki + 1) * n] += block @ xj

        return y

    def _rmatvec(self, x: np.ndarray) -> np.ndarray:
        """y = Λ_net^T · x  (for Krylov methods)."""
        x = np.asarray(x, dtype=float).ravel()
        net = self._net
        n = net.state_dim
        ids = net.session_ids
        idx_map = {sid: i for i, sid in enumerate(ids)}
        y = np.zeros_like(x)

        # block-diagonal transpose
        for sid in ids:
            k = idx_map[sid]
            xk = x[k * n:(k + 1) * n]
            y[k * n:(k + 1) * n] += net.get_session(sid).T @ xk

        # coupling transpose: (W^T)_{ji} = W_{ij}^T
        for (si, sj), block in net._coupling.items():
            ki, kj = idx_map[si], idx_map[sj]
            xi = x[ki * n:(ki + 1) * n]
            y[kj * n:(kj + 1) * n] += block.T @ xi

        return y


@dataclass
class BlockDiagonalPreconditioner:
    """Block-diagonal preconditioner: M^{-1} = diag(Λ^(k)^{-1}).

    Falls back to identity for singular session blocks.
    """

    _inverses: dict
    _n: int
    _ids: list

    @classmethod
    def from_network(cls, network: NetworkGainMatrix) -> "BlockDiagonalPreconditioner":
        n = network.state_dim
        ids = network.session_ids
        inverses = {}
        for sid in ids:
            lam = network.get_session(sid)
            try:
                inverses[sid] = np.linalg.inv(lam)
            except np.linalg.LinAlgError:
                inverses[sid] = np.eye(n)
        return cls(_inverses=inverses, _n=n, _ids=ids)

    def solve(self, x: np.ndarray) -> np.ndarray:
        """Apply M^{-1} · x."""
        x = np.asarray(x, dtype=float).ravel()
        y = np.zeros_like(x)
        for i, sid in enumerate(self._ids):
            xk = x[i * self._n:(i + 1) * self._n]
            y[i * self._n:(i + 1) * self._n] = self._inverses[sid] @ xk
        return y

    def as_linear_operator(self) -> LinearOperator:
        N = len(self._ids) * self._n
        return LinearOperator(
            shape=(N, N), dtype=float, matvec=self.solve, rmatvec=self.solve
        )
