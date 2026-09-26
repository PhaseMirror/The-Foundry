"""Consent-Spectral-Limit (CSL) gate scaffold for K-04."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

import numpy as np


@dataclass(frozen=True)
class CSLGateParams:
    """Policy parameters for the first K-04 implementation slice."""

    consent_threshold: float = 0.5
    max_spectral_drift: float = 2.0
    norm_budget: float = 5.0


class CSLGate:
    """Gate that checks consent, drift, norm, and optional rollback budget."""

    def __init__(self, params: Optional[CSLGateParams] = None, rate_limiter: Any | None = None):
        self.params = params or CSLGateParams()
        self.rate_limiter = rate_limiter

    def check(
        self,
        *,
        X: np.ndarray,
        t: int,
        Sigma: np.ndarray,
        weights: np.ndarray,
    ) -> tuple[bool, str]:
        """Return (allowed, reason) for the current state transition."""
        if not self._check_consent(weights):
            return False, "consent_quorum_not_met"

        if not self._check_spectral_drift(X, Sigma):
            return False, "spectral_drift_exceeded"

        if not self._check_norm_budget(X):
            if self.rate_limiter is not None and not bool(self.rate_limiter.allow_step(t)):
                return False, "rollback_budget_exhausted"
            return False, "norm_budget_exceeded"

        return True, "pass"

    def _check_consent(self, weights: np.ndarray) -> bool:
        if weights.size == 0:
            return False
        consenting = float(np.sum(weights > self.params.consent_threshold))
        ratio = consenting / float(weights.size)
        return ratio >= self.params.consent_threshold

    def _check_spectral_drift(self, X: np.ndarray, Sigma: np.ndarray) -> bool:
        # Normalize by dominant eigvalue to avoid matrix-scale sensitivity.
        eigvals = np.linalg.eigvalsh(Sigma)
        lambda_max = float(np.max(np.abs(eigvals))) if eigvals.size else 0.0
        denom = max(lambda_max, 1e-12)
        drift = float(np.linalg.norm(X)) / denom
        return drift <= self.params.max_spectral_drift

    def _check_norm_budget(self, X: np.ndarray) -> bool:
        return float(np.linalg.norm(X)) <= self.params.norm_budget
