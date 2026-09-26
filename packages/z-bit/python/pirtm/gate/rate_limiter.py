"""Rollback rate limiter hooks for CSL gate integration.

This module provides the K-05-ready primitive that K-04 can call to enforce a
bounded number of rollback events inside a sliding step window.  It also
exposes :meth:`RateLimiter.convergence_bound` which computes the K-05 theorem
upper bound on steps required to converge under adversarial rollback pressure.
"""

from __future__ import annotations

import math
from collections import deque
from dataclasses import dataclass, field


@dataclass(frozen=True)
class RateLimiterParams:
    """Configuration for rollback budget control and convergence theorem.

    Attributes:
        R: Maximum rollbacks allowed in any sliding window of N steps.
        N: Window size (number of consecutive gate steps).
        delta_target: Convergence target distance from the fixed point.
        delta_0: Initial distance from the fixed point (||X_0||).
    """

    R: int = 5
    N: int = 50
    delta_target: float = 0.01
    delta_0: float = 1.0


class RateLimiter:
    """Tracks rollback events in a sliding window of recent steps.

    The invariant R < N is enforced at construction time: it is the necessary
    and sufficient condition for the convergence bound to be finite.
    """

    # Gate K contraction coefficient — fixed per ADR-004 / K-05 spec.
    _GAMMA: float = 0.9

    def __init__(self, params: RateLimiterParams | None = None):
        self.params = params or RateLimiterParams()
        if self.params.R < 0 or self.params.N <= 0:
            raise ValueError("RateLimiter requires R >= 0 and N > 0")
        if self.params.R >= self.params.N:
            raise ValueError("RateLimiter requires R < N for bounded liveness")
        if self.params.delta_target <= 0 or self.params.delta_0 <= 0:
            raise ValueError("RateLimiter requires delta_target > 0 and delta_0 > 0")
        self._window: deque[bool] = deque(maxlen=self.params.N)

    # ------------------------------------------------------------------
    # Step-level API
    # ------------------------------------------------------------------

    def allow_step(self, _t: int) -> bool:
        """Return whether another rollback-producing step is currently allowed."""
        return sum(self._window) < self.params.R

    def record(self, was_rollback: bool) -> None:
        """Record step outcome so future rollback checks see latest window."""
        self._window.append(bool(was_rollback))

    @property
    def rollback_count(self) -> int:
        """Current rollback count inside active sliding window."""
        return int(sum(self._window))

    @property
    def rollback_rate(self) -> float:
        """Empirical rollback rate: rollbacks / window length.  Zero if window is empty."""
        n = len(self._window)
        return float(self.rollback_count) / n if n > 0 else 0.0

    # ------------------------------------------------------------------
    # K-05 convergence theorem
    # ------------------------------------------------------------------

    def convergence_bound(self) -> int:
        """Compute T_max — upper bound on steps to reach delta_target.

        From the K-05 convergence theorem (ADR-005):

            T_max = ceil(log(δ₀ / δ_target) / log(1 / γ_eff)) * N / (N - R)

        where γ_eff = γ · (1 − ρ),  ρ = R / N,  γ = 0.9 (Gate K spec).

        The bound is finite precisely when γ_eff < 1, which holds as long as
        R < N (the constructor invariant).

        Returns:
            T_max as a positive integer.
        """
        rho = self.params.R / self.params.N
        gamma_eff = self._GAMMA * (1.0 - rho)
        # gamma_eff < 1 is guaranteed because rho > 0 (R >= 1 when R < N allows
        # rollbacks) or rho = 0 and gamma_eff = 0.9 < 1.
        numerator = math.log(self.params.delta_0 / self.params.delta_target)
        denominator = math.log(1.0 / gamma_eff)
        base = math.ceil(numerator / denominator)
        liveness = self.params.N / (self.params.N - self.params.R)
        return math.ceil(base * liveness)
