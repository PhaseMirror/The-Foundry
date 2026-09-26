"""
ACE Budget tracker — enforces L0 invariant: depletion_rate < MAX_DEPLETION_RATE.
"""
from __future__ import annotations

from .types import AceBudgetState

MAX_DEPLETION_RATE = 0.01  # L0 invariant: depletion rate < 0.01/cycle


class AceBudget:
    """
    Tracks ACE budget tau consumption across certification calls.
    L0 invariant: depletion_rate < MAX_DEPLETION_RATE per cycle.
    Violation raises -- never silently continues.
    """

    def __init__(self, tau: float = 1.0) -> None:
        if tau <= 0:
            raise ValueError("tau must be > 0")
        self._state = AceBudgetState(tau=tau)

    def consume(self, amount: float) -> AceBudgetState:
        if amount < 0:
            raise ValueError("budget consumption must be >= 0")
        self._state.consumed += amount
        self._state.depletion_rate = amount  # last consumption as rate proxy
        if self._state.depletion_rate >= MAX_DEPLETION_RATE * self._state.tau:
            raise RuntimeError(
                f"ACE_BUDGET_DEPLETION_RATE_EXCEEDED: {self._state.depletion_rate:.6f} "
                f">= {MAX_DEPLETION_RATE * self._state.tau:.6f}. "
                "L0 invariant violated -- execution halted."
            )
        if self._state.is_depleted:
            raise RuntimeError(
                f"ACE_BUDGET_DEPLETED: consumed={self._state.consumed:.4f} "
                f">= tau={self._state.tau:.4f}"
            )
        return self._state

    def snapshot(self) -> AceBudgetState:
        return AceBudgetState(
            tau=self._state.tau,
            consumed=self._state.consumed,
            depletion_rate=self._state.depletion_rate,
        )

    def reset_cycle(self) -> None:
        self._state.depletion_rate = 0.0
