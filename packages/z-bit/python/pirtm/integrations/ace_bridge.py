"""
PIRTM-side ACE bridge adapter.

Translates between PIRTM's numpy-based runtime and the torch-based ACE
in packages/langlands/acepetc/. Falls back to pirtm.ace (numpy-native)
if torch/langlands_prism is not available.

Design: lazy torch import -- this module can be imported in numpy-only
environments without crashing. Torch is only loaded when step() is called.

See ADR-000_Thread (bridge adapter decision) for rationale.
"""
from __future__ import annotations

from typing import Any, Optional, Sequence

import numpy as np

from pirtm.step_types import StepInfo
from pirtm.ace.protocol import AceProtocol
from pirtm.ace.witness import AceWitness


# Lazy torch/langlands_prism availability flag
_TORCH_AVAILABLE: Optional[bool] = None


def _check_torch() -> bool:
    global _TORCH_AVAILABLE
    if _TORCH_AVAILABLE is None:
        try:
            import torch  # noqa: F401
            _TORCH_AVAILABLE = True
        except ImportError:
            _TORCH_AVAILABLE = False
    return _TORCH_AVAILABLE


class AceBridge:
    """
    Bridge between PIRTM numpy runtime and ACE certification.

    If torch + langlands_prism are available, delegates to the torch-based
    OperatorSafetySet for weighted-l1 projection. Otherwise, falls back to
    pirtm.ace.protocol (numpy-native, mathematically identical).

    Usage:
        bridge = AceBridge(tau=1.0)
        witness = bridge.certify(records, prime_index=7)
    """

    def __init__(self, tau: float = 1.0, delta: float = 0.05) -> None:
        self._protocol = AceProtocol(tau=tau, delta=delta)
        self._tau = tau
        self._delta = delta

    def certify_from_telemetry(
        self,
        records: Sequence[StepInfo],
        prime_index: int,
        *,
        tail_norm: float = 0.0,
    ) -> AceWitness:
        """L0 path -- always uses numpy-native protocol."""
        return self._protocol.certify_from_telemetry(
            records, prime_index, tail_norm=tail_norm
        )

    def certify_from_weights(
        self,
        weights: Sequence[float],
        basis_norms: Sequence[float],
        prime_index: int,
    ) -> AceWitness:
        """L1 path -- numpy-native weighted-l1 norm bound."""
        return self._protocol.certify_from_weights(
            weights, basis_norms, prime_index
        )

    def certify_from_matrix(
        self,
        K: np.ndarray,
        prime_index: int,
    ) -> AceWitness:
        """L2 path -- numpy-native power iteration."""
        return self._protocol.certify_from_matrix(K, prime_index)

    def step_torch(
        self,
        weights_np: np.ndarray,
        basis_norms_np: np.ndarray,
        tau: float,
        epsilon: float = 0.05,
    ) -> np.ndarray:
        """
        Full ACE projection step via torch backend (if available).
        numpy in -> torch.Tensor -> OperatorSafetySet.project() -> numpy out.
        Falls back to simple numpy clipping if torch unavailable.
        """
        if _check_torch():
            try:
                import torch
                from langlands_prism import SafetySet

                w_t = torch.from_numpy(weights_np).float()
                b_t = torch.from_numpy(basis_norms_np).float()
                safety = SafetySet(weights=b_t, tau=tau)
                projected = safety.project(w_t)
                return projected.numpy()
            except (ImportError, AttributeError):
                pass

        # Fallback: numpy soft-thresholding (mathematically identical)
        return self._numpy_project(weights_np, basis_norms_np, tau)

    @staticmethod
    def _numpy_project(
        weights: np.ndarray,
        basis_norms: np.ndarray,
        tau: float,
    ) -> np.ndarray:
        """Numpy fallback: weighted-l1 soft-thresholding via bisection."""
        budget = float(np.sum(basis_norms * np.abs(weights)))
        if budget <= tau:
            return weights  # already feasible

        # Bisection for soft-thresholding parameter lambda
        lo, hi = 0.0, float(np.max(np.abs(weights) * basis_norms))
        for _ in range(64):  # 64 iterations gives ~1e-19 precision
            mid = (lo + hi) / 2.0
            safe = basis_norms > 0
            projected = np.where(
                safe,
                np.sign(weights) * np.maximum(np.abs(weights) - mid / basis_norms, 0.0),
                weights,
            )
            current_budget = float(np.sum(basis_norms * np.abs(projected)))
            if current_budget > tau:
                lo = mid
            else:
                hi = mid
        return projected

    @property
    def has_torch_backend(self) -> bool:
        return _check_torch()
