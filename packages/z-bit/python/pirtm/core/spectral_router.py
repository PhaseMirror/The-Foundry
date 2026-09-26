"""
Q-06: Spectral Tier Router.

Routes spectral queries to the appropriate algorithmic tier:
  - Tier 1: Gershgorin Guard  (O(Kn), microseconds, 80% of cases)
  - Tier 2: Distributed Arnoldi (O(Kn²), milliseconds)
  - Tier 3: Kronecker bound (conservative, cheaper than Arnoldi)
  - Tier 4 (fallback): Dense NumPy (only for K ≤ 10)
"""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional

import numpy as np

from .network_gain import NetworkGainMatrix
from .gershgorin_guard import GershgorinGuard, GuardVerdict
from .sparse_spectral import MatrixFreeOperator
from .distributed_arnoldi import DistributedArnoldi
from .kronecker_decomposition import KroneckerDecomposition


@dataclass(frozen=True)
class SpectralResult:
    """Result of tiered spectral computation."""
    spectral_radius: float       # computed or bounded value
    is_contractive: bool         # r < 1 - epsilon
    tier_used: int               # 1, 2, 3, or 4
    computation_time_us: float   # microseconds
    is_exact: bool               # True for Tier 2/4, False for Tier 1/3 bound
    margin: float                # 1 - epsilon - spectral_radius


class SpectralTierRouter:
    """Route spectral queries to the optimal algorithmic tier."""

    def __init__(
        self,
        arnoldi_tol: float = 1e-6,
        dense_threshold: int = 10,
    ) -> None:
        self._guard = GershgorinGuard()
        self._arnoldi = DistributedArnoldi()
        self._kronecker = KroneckerDecomposition()
        self._arnoldi_tol = arnoldi_tol
        self._dense_threshold = dense_threshold

    def compute_spectral_radius(
        self,
        network: NetworkGainMatrix,
        epsilon: float = 0.05,
    ) -> SpectralResult:
        """Compute spectral radius using the most efficient tier."""
        K = network.n_sessions
        t0 = time.perf_counter()

        # Tier 1: Gershgorin Guard
        guard_result = self._guard.check(network, epsilon=epsilon)
        if guard_result.verdict == GuardVerdict.PASS:
            dt = (time.perf_counter() - t0) * 1e6
            return SpectralResult(
                spectral_radius=guard_result.gershgorin_bound,
                is_contractive=True,
                tier_used=1,
                computation_time_us=dt,
                is_exact=False,
                margin=guard_result.margin,
            )

        # Small networks: go straight to dense
        if K <= self._dense_threshold:
            r = network.spectral_radius_dense()
            dt = (time.perf_counter() - t0) * 1e6
            return SpectralResult(
                spectral_radius=r,
                is_contractive=r < (1.0 - epsilon),
                tier_used=4,
                computation_time_us=dt,
                is_exact=True,
                margin=(1.0 - epsilon) - r,
            )

        # Medium networks: Kronecker bound
        if K <= 100:
            kron = self._kronecker.decompose(network)
            if kron.tight_bound < (1.0 - epsilon):
                dt = (time.perf_counter() - t0) * 1e6
                return SpectralResult(
                    spectral_radius=kron.tight_bound,
                    is_contractive=True,
                    tier_used=3,
                    computation_time_us=dt,
                    is_exact=False,
                    margin=(1.0 - epsilon) - kron.tight_bound,
                )

        # Tier 2: Distributed Arnoldi
        op = MatrixFreeOperator(network)
        r = self._arnoldi.spectral_radius(op, tol=self._arnoldi_tol)
        dt = (time.perf_counter() - t0) * 1e6
        return SpectralResult(
            spectral_radius=r,
            is_contractive=r < (1.0 - epsilon),
            tier_used=2,
            computation_time_us=dt,
            is_exact=True,
            margin=(1.0 - epsilon) - r,
        )
