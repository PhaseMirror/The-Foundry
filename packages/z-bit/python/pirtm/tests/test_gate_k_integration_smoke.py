"""Gate K end-to-end integration smoke test.

This test matches the K-05 completion snippet in intent: instantiate the
canonical engine, CSL gate, and rollback rate limiter together, execute a
multi-step controller loop, and verify the integrated path remains stable.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

from pirtm.core.controller import PIRTMController
from pirtm.core.multiplicity_core import MultiplicityCoreEngine, load_multiplicity_params
from pirtm.gate.csl_gate import CSLGate, CSLGateParams
from pirtm.gate.rate_limiter import RateLimiter, RateLimiterParams


class _GateKSmokeEngine(MultiplicityCoreEngine):
    """Minimal stateful engine shim for Gate K integration smoke coverage."""

    def __init__(self, *args, state_dim: int = 20, **kwargs):
        super().__init__(*args, **kwargs)
        self.state = np.full(state_dim, 0.05, dtype=np.float64)
        self._previous_state = self.state.copy()

    def advance(self, sigma_t: np.ndarray, w_t: np.ndarray) -> None:
        self._previous_state = self.state.copy()
        consent_gain = float(np.mean(w_t))
        spectral_scale = float(np.max(np.abs(np.linalg.eigvalsh(sigma_t)))) if sigma_t.size else 1.0
        # Stable contractive update that keeps the smoke path inside the gate envelope.
        self.state = 0.9 * self.state + 0.01 * consent_gain * np.ones_like(self.state) / max(spectral_scale, 1.0)

    def rollback(self) -> None:
        self.state = self._previous_state.copy()


def _params_path() -> Path:
    return Path(__file__).resolve().parent.parent / "multiplicity_lwe" / "params.example.toml"


def test_gate_k_integration_smoke() -> None:
    params = load_multiplicity_params(_params_path())
    engine = _GateKSmokeEngine(params=params)
    gate = CSLGate(
        CSLGateParams(
            consent_threshold=0.5,
            max_spectral_drift=2.0,
            norm_budget=5.0,
        ),
        rate_limiter=RateLimiter(RateLimiterParams()),
    )
    controller = PIRTMController(engine, gate=gate)

    sigma_t = np.eye(20, dtype=np.float64)
    w_t = np.ones(20, dtype=np.float64)

    seen_reasons: set[str] = set()
    for t in range(100):
        ok, reason = controller.step(t, sigma_t=sigma_t, w_t=w_t, X=engine.state)
        seen_reasons.add(reason)
        assert ok or reason in {
            "spectral_drift_exceeded",
            "consent_quorum_not_met",
            "norm_budget_exceeded",
            "rollback_budget_exhausted",
        }

    assert "pass" in seen_reasons
    assert controller.audit_log
    assert engine.get_state_digest()
    assert controller.audit_log[-1].state_digest == engine.get_state_digest()
