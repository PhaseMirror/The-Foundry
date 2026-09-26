"""
Q-08: Production Hardening for Network Spectral Computation.

Feature flag gating, numerical stability guards, observability metrics,
latency monitoring, and graceful tier fallback.
"""
from __future__ import annotations

import os
import time
import math
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional

import numpy as np

from .network_gain import NetworkGainMatrix
from .spectral_router import SpectralTierRouter, SpectralResult

logger = logging.getLogger(__name__)


# ── Feature flag ──────────────────────────────────────────────────────────
_FEATURE_FLAG = "PIRTM_NETWORK_SPECTRAL"


def is_network_spectral_enabled() -> bool:
    """Check whether the network spectral path is enabled."""
    return os.environ.get(_FEATURE_FLAG, "disabled").strip().lower() == "enabled"


# ── Latency targets by tier (microseconds) ────────────────────────────────
LATENCY_TARGETS_US: Dict[int, float] = {
    1: 10.0,         # Gershgorin: 10 μs
    2: 100_000.0,    # Arnoldi: 100 ms
    3: 1_000_000.0,  # Kronecker: 1 s
    4: 1_000_000.0,  # Dense fallback: 1 s
}


@dataclass
class NumericalDiagnostic:
    """Diagnostics for numerical stability."""
    has_nan: bool = False
    has_inf: bool = False
    condition_number: float = 0.0
    condition_warning: bool = False   # True if κ > 1e10
    spectral_radius: float = 0.0
    tier_used: int = 0
    fallback_triggered: bool = False


@dataclass
class SpectralMetrics:
    """Observability metrics for spectral queries."""
    tier_counts: Dict[int, int] = field(default_factory=lambda: {1: 0, 2: 0, 3: 0, 4: 0})
    total_queries: int = 0
    total_fallbacks: int = 0
    latency_us: List[float] = field(default_factory=list)
    spectral_radii: List[float] = field(default_factory=list)

    def record(self, result: SpectralResult, fallback: bool = False) -> None:
        """Record a query result."""
        self.total_queries += 1
        self.tier_counts[result.tier_used] = self.tier_counts.get(result.tier_used, 0) + 1
        self.latency_us.append(result.computation_time_us)
        self.spectral_radii.append(result.spectral_radius)
        if fallback:
            self.total_fallbacks += 1

    @property
    def fallback_rate(self) -> float:
        """Fraction of queries using Tier 3+ fallback."""
        if self.total_queries == 0:
            return 0.0
        return self.total_fallbacks / self.total_queries

    @property
    def median_latency_us(self) -> float:
        if not self.latency_us:
            return 0.0
        return float(np.median(self.latency_us))

    def to_dict(self) -> dict:
        return {
            "total_queries": self.total_queries,
            "tier_counts": dict(self.tier_counts),
            "total_fallbacks": self.total_fallbacks,
            "fallback_rate": round(self.fallback_rate, 4),
            "median_latency_us": round(self.median_latency_us, 2),
        }


def check_numerical_stability(
    network: NetworkGainMatrix,
    result: SpectralResult,
) -> NumericalDiagnostic:
    """Check numerical stability of a spectral computation."""
    diag = NumericalDiagnostic(
        spectral_radius=result.spectral_radius,
        tier_used=result.tier_used,
    )

    # NaN/Inf guard
    if math.isnan(result.spectral_radius) or math.isinf(result.spectral_radius):
        diag.has_nan = math.isnan(result.spectral_radius)
        diag.has_inf = math.isinf(result.spectral_radius)
        logger.warning(
            "Numerical failure: spectral_radius=%s (tier %d)",
            result.spectral_radius, result.tier_used,
        )
        return diag

    # Condition number for small networks (dense is feasible)
    if network.n_sessions <= 50:
        try:
            M = network.to_dense()
            sv = np.linalg.svd(M, compute_uv=False)
            if sv[-1] > 0:
                kappa = sv[0] / sv[-1]
            else:
                kappa = float("inf")
            diag.condition_number = float(kappa)
            diag.condition_warning = kappa > 1e10
        except Exception:
            pass

    return diag


def check_latency(result: SpectralResult) -> bool:
    """Check if computation met the latency target for its tier."""
    target = LATENCY_TARGETS_US.get(result.tier_used, 1_000_000.0)
    return result.computation_time_us <= target


class HardenedSpectralRouter:
    """Production-hardened wrapper around SpectralTierRouter.

    Adds feature flag gating, numerical checks, latency monitoring,
    graceful fallback, and observability.
    """

    def __init__(
        self,
        router: Optional[SpectralTierRouter] = None,
        timeout_us: float = 1_000_000.0,
    ) -> None:
        self._router = router or SpectralTierRouter()
        self._metrics = SpectralMetrics()
        self._timeout_us = timeout_us

    @property
    def metrics(self) -> SpectralMetrics:
        return self._metrics

    def compute(
        self,
        network: NetworkGainMatrix,
        epsilon: float = 0.05,
    ) -> SpectralResult:
        """Compute spectral radius with hardening.

        If feature flag is disabled, raises RuntimeError.
        Falls back to Kronecker bound on Arnoldi failure.
        """
        if not is_network_spectral_enabled():
            raise RuntimeError(
                f"Network spectral path disabled. Set {_FEATURE_FLAG}=enabled."
            )

        fallback = False
        try:
            result = self._router.compute_spectral_radius(network, epsilon)

            # NaN/Inf guard → fallback to Kronecker bound
            if math.isnan(result.spectral_radius) or math.isinf(result.spectral_radius):
                result = self._kronecker_fallback(network, epsilon)
                fallback = True

        except Exception:
            result = self._kronecker_fallback(network, epsilon)
            fallback = True

        self._metrics.record(result, fallback=fallback)
        return result

    def _kronecker_fallback(
        self, network: NetworkGainMatrix, epsilon: float,
    ) -> SpectralResult:
        """Fallback to Kronecker conservative bound."""
        from .kronecker_decomposition import KroneckerDecomposition
        t0 = time.perf_counter()
        kron = KroneckerDecomposition().decompose(network)
        dt = (time.perf_counter() - t0) * 1e6
        r = kron.bound
        return SpectralResult(
            spectral_radius=r,
            is_contractive=r < (1.0 - epsilon),
            tier_used=3,
            computation_time_us=dt,
            is_exact=False,
            margin=(1.0 - epsilon) - r,
        )

    def check_health(self, network: NetworkGainMatrix) -> NumericalDiagnostic:
        """Run numerical health check without consuming a query."""
        result = self._router.compute_spectral_radius(network)
        return check_numerical_stability(network, result)
