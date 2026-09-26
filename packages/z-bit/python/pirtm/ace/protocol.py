"""
AceProtocol: single entry-point that dispatches to the correct level
based on available inputs, then emits an AceWitness for ETP.
"""
from __future__ import annotations

from typing import Sequence

import numpy as np

from pirtm.step_types import StepInfo
from .budget import AceBudget
from .witness import AceWitness
from .types import AceBudgetState
from .levels.l0_heuristic import certify_l0
from .levels.l1_normbound import certify_l1
from .levels.l2_poweriter import certify_l2


class AceProtocol:
    """
    Stateful ACE protocol runner. Maintains a budget across calls.
    Caller must provide the prime_index from the active PETC chain.
    """

    def __init__(self, tau: float = 1.0, delta: float = 0.05) -> None:
        self.budget = AceBudget(tau=tau)
        self.delta = delta

    def certify_from_telemetry(
        self,
        records: Sequence[StepInfo],
        prime_index: int,
        *,
        tail_norm: float = 0.0,
    ) -> AceWitness:
        """L0 path -- telemetry only."""
        cert = certify_l0(
            records,
            tau=self.budget.snapshot().tau,
            tail_norm=tail_norm,
            delta=self.delta,
        )
        self._try_consume(cert.budget_used)
        return AceWitness.from_certificate(cert, prime_index)

    def certify_from_weights(
        self,
        weights: Sequence[float],
        basis_norms: Sequence[float],
        prime_index: int,
    ) -> AceWitness:
        """L1 path -- weighted-l1 norm bound."""
        cert = certify_l1(
            weights,
            basis_norms,
            tau=self.budget.snapshot().tau,
            delta=self.delta,
        )
        self._try_consume(cert.budget_used)
        return AceWitness.from_certificate(cert, prime_index)

    def certify_from_matrix(
        self,
        K: np.ndarray,
        prime_index: int,
    ) -> AceWitness:
        """L2 path -- power iteration spectral radius."""
        cert = certify_l2(
            K,
            tau=self.budget.snapshot().tau,
            delta=self.delta,
        )
        self._try_consume(cert.budget_used)
        return AceWitness.from_certificate(cert, prime_index)

    def budget_state(self) -> AceBudgetState:
        return self.budget.snapshot()

    def _try_consume(self, amount: float) -> None:
        """Consume budget, silently skip if amount is zero."""
        if amount > 0:
            self.budget.consume(amount)
