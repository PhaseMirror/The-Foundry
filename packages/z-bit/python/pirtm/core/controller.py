"""PIRTM controller scaffold for K-04 CSL gate integration."""

from __future__ import annotations

from typing import Any

import numpy as np

from pirtm.core.multiplicity_core import MultiplicityCoreEngine
from pirtm.gate.audit import GateAuditEvent, build_gate_event
from pirtm.gate.csl_gate import CSLGate, CSLGateParams


class PIRTMController:
    """Thin orchestration layer that enforces CSL checks before engine advance."""

    def __init__(self, engine: MultiplicityCoreEngine, gate: CSLGate | None = None):
        self.engine = engine
        self.gate = gate or CSLGate(CSLGateParams())
        self.audit_log: list[GateAuditEvent] = []

    def step(
        self,
        t: int,
        sigma_t: np.ndarray,
        w_t: np.ndarray,
        *,
        X: np.ndarray,
        advance_payload: Any | None = None,
    ) -> tuple[bool, str]:
        """Run a gated step and record deterministic audit output."""
        allowed, reason = self.gate.check(X=X, t=t, Sigma=sigma_t, weights=w_t)

        if not allowed:
            if reason == "norm_budget_exceeded" and hasattr(self.engine, "rollback"):
                self.engine.rollback()
            if self.gate.rate_limiter is not None and hasattr(self.gate.rate_limiter, "record"):
                self.gate.rate_limiter.record(reason == "norm_budget_exceeded")
            event = build_gate_event(
                t=t,
                reason=reason,
                allowed=False,
                state_digest=self.engine.get_state_digest(),
            )
            self.audit_log.append(event)
            return False, reason

        if hasattr(self.engine, "advance"):
            if advance_payload is None:
                self.engine.advance(sigma_t, w_t)
            else:
                self.engine.advance(advance_payload)

        if self.gate.rate_limiter is not None and hasattr(self.gate.rate_limiter, "record"):
            self.gate.rate_limiter.record(False)

        event = build_gate_event(
            t=t,
            reason="pass",
            allowed=True,
            state_digest=self.engine.get_state_digest(),
        )
        self.audit_log.append(event)
        return True, "pass"
