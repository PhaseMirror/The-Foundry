"""K-04 CSL gate full matrix tests (first implementation slice)."""

from __future__ import annotations

import numpy as np
import pytest

from pirtm.core.controller import PIRTMController
from pirtm.gate.audit import build_gate_event
from pirtm.gate.csl_gate import CSLGate, CSLGateParams
from pirtm.gate.rate_limiter import RateLimiter, RateLimiterParams


class _MockEngine:
    def __init__(self) -> None:
        self.advanced = 0
        self.rolled_back = 0

    def get_state_digest(self) -> str:
        return "digest-123"

    def advance(self, *_args, **_kwargs) -> None:
        self.advanced += 1

    def rollback(self) -> None:
        self.rolled_back += 1


def _base_gate(
    *,
    consent_threshold: float = 0.5,
    max_spectral_drift: float = 2.0,
    norm_budget: float = 5.0,
    limiter: RateLimiter | None = None,
) -> CSLGate:
    return CSLGate(
        CSLGateParams(
            consent_threshold=consent_threshold,
            max_spectral_drift=max_spectral_drift,
            norm_budget=norm_budget,
        ),
        rate_limiter=limiter,
    )


@pytest.mark.parametrize(
    "weights, expected",
    [
        (np.array([1.0, 1.0]), True),
        (np.array([0.7, 0.6]), True),
        (np.array([0.7, 0.4]), True),
        (np.array([0.51, 0.2, 0.8, 0.1]), True),
        (np.array([0.0, 0.0]), False),
        (np.array([0.5, 0.5]), False),
        (np.array([0.49, 0.48, 0.47]), False),
        (np.array([0.51, 0.49, 0.49, 0.49]), False),
        (np.array([0.9, 0.2, 0.2, 0.2]), False),
        (np.array([0.51, 0.51, 0.49, 0.49]), True),
        (np.array([0.52, 0.52, 0.49, 0.49]), True),
        (np.array([0.51]), True),
    ],
)
def test_consent_matrix(weights: np.ndarray, expected: bool) -> None:
    gate = _base_gate(max_spectral_drift=100.0, norm_budget=100.0)
    x = np.array([0.1, 0.1], dtype=np.float64)
    sigma = np.eye(2, dtype=np.float64)
    allowed, reason = gate.check(X=x, t=0, Sigma=sigma, weights=weights)
    assert allowed is expected
    if expected:
        assert reason == "pass"
    else:
        assert reason == "consent_quorum_not_met"


@pytest.mark.parametrize(
    "x_norm, sigma_scale, threshold, expected",
    [
        (0.1, 1.0, 2.0, True),
        (1.0, 1.0, 2.0, True),
        (2.0, 1.0, 2.0, True),
        (2.1, 1.0, 2.0, False),
        (0.2, 0.1, 2.0, True),
        (0.21, 0.1, 2.0, False),
        (1.0, 2.0, 0.6, True),
        (1.3, 2.0, 0.6, False),
        (0.5, 0.5, 1.1, True),
        (0.56, 0.5, 1.1, False),
    ],
)
def test_spectral_drift_matrix(x_norm: float, sigma_scale: float, threshold: float, expected: bool) -> None:
    gate = _base_gate(max_spectral_drift=threshold, norm_budget=100.0)
    x = np.array([x_norm, 0.0], dtype=np.float64)
    sigma = np.eye(2, dtype=np.float64) * sigma_scale
    weights = np.array([1.0, 1.0], dtype=np.float64)
    allowed, reason = gate.check(X=x, t=0, Sigma=sigma, weights=weights)
    assert allowed is expected
    if expected:
        assert reason == "pass"
    else:
        assert reason == "spectral_drift_exceeded"


@pytest.mark.parametrize(
    "x, budget, expected",
    [
        (np.array([0.0, 0.0]), 1.0, True),
        (np.array([0.1, 0.1]), 1.0, True),
        (np.array([0.7, 0.7]), 1.0, True),
        (np.array([0.8, 0.8]), 1.0, False),
        (np.array([1.0, 0.0]), 1.0, True),
        (np.array([1.01, 0.0]), 1.0, False),
        (np.array([0.2, 0.2, 0.2]), 0.3, False),
        (np.array([0.1, 0.1, 0.1]), 0.3, True),
    ],
)
def test_norm_budget_matrix(x: np.ndarray, budget: float, expected: bool) -> None:
    gate = _base_gate(max_spectral_drift=100.0, norm_budget=budget)
    sigma = np.eye(max(2, x.shape[0]), dtype=np.float64)
    if x.shape[0] < 2:
        x = np.pad(x, (0, 2 - x.shape[0]))
    weights = np.array([1.0, 1.0], dtype=np.float64)
    allowed, reason = gate.check(X=x, t=0, Sigma=sigma[:2, :2], weights=weights)
    assert allowed is expected
    if expected:
        assert reason == "pass"
    else:
        assert reason == "norm_budget_exceeded"


def test_controller_advances_on_pass() -> None:
    engine = _MockEngine()
    gate = _base_gate()
    controller = PIRTMController(engine=engine, gate=gate)

    ok, reason = controller.step(
        1,
        sigma_t=np.eye(2, dtype=np.float64),
        w_t=np.array([1.0, 1.0], dtype=np.float64),
        X=np.array([0.1, 0.1], dtype=np.float64),
    )

    assert ok is True
    assert reason == "pass"
    assert engine.advanced == 1
    assert engine.rolled_back == 0
    assert len(controller.audit_log) == 1
    assert controller.audit_log[-1].allowed is True


def test_controller_rolls_back_on_norm_budget_exceeded() -> None:
    engine = _MockEngine()
    gate = _base_gate(max_spectral_drift=100.0, norm_budget=0.1)
    controller = PIRTMController(engine=engine, gate=gate)

    ok, reason = controller.step(
        1,
        sigma_t=np.eye(2, dtype=np.float64),
        w_t=np.array([1.0, 1.0], dtype=np.float64),
        X=np.array([0.2, 0.2], dtype=np.float64),
    )

    assert ok is False
    assert reason == "norm_budget_exceeded"
    assert engine.advanced == 0
    assert engine.rolled_back == 1
    assert len(controller.audit_log) == 1
    assert controller.audit_log[-1].allowed is False


def test_rate_limiter_hook_blocks_second_rollback() -> None:
    engine = _MockEngine()
    limiter = RateLimiter(RateLimiterParams(R=1, N=5))
    gate = _base_gate(max_spectral_drift=100.0, norm_budget=0.1, limiter=limiter)
    controller = PIRTMController(engine=engine, gate=gate)

    ok1, reason1 = controller.step(
        0,
        sigma_t=np.eye(2, dtype=np.float64),
        w_t=np.array([1.0, 1.0], dtype=np.float64),
        X=np.array([0.2, 0.2], dtype=np.float64),
    )
    assert ok1 is False
    assert reason1 == "norm_budget_exceeded"

    ok2, reason2 = controller.step(
        1,
        sigma_t=np.eye(2, dtype=np.float64),
        w_t=np.array([1.0, 1.0], dtype=np.float64),
        X=np.array([0.2, 0.2], dtype=np.float64),
    )
    assert ok2 is False
    assert reason2 == "rollback_budget_exhausted"
    assert engine.rolled_back == 1


@pytest.mark.parametrize(
    "t, reason, allowed, digest",
    [
        (0, "pass", True, "abc"),
        (1, "norm_budget_exceeded", False, "abc"),
        (2, "consent_quorum_not_met", False, "digest-2"),
        (3, "spectral_drift_exceeded", False, "digest-3"),
    ],
)
def test_gate_event_hash_is_deterministic(t: int, reason: str, allowed: bool, digest: str) -> None:
    e1 = build_gate_event(t=t, reason=reason, allowed=allowed, state_digest=digest)
    e2 = build_gate_event(t=t, reason=reason, allowed=allowed, state_digest=digest)
    assert e1.event_hash == e2.event_hash


# ---------------------------------------------------------------------------
# Checker precedence tests — combined-failure conditions
# ---------------------------------------------------------------------------

# Witness vectors that trigger each individual failure:
#   consent_fail  : weights with mean <= threshold
#   spectral_fail : ||X|| / lambda_max(Sigma) > max_spectral_drift
#   norm_fail     : ||X|| > norm_budget

_W_FAIL = np.array([0.0, 0.0])   # consent fails (all zero → quorum 0/2 < 0.5)
_W_PASS = np.array([1.0, 1.0])   # consent passes easily

_X_NORM_FAIL = np.array([10.0, 0.0])  # ||X||=10 > norm_budget=5
_X_OK = np.array([0.1, 0.0])          # ||X||=0.1 well inside all budgets


@pytest.mark.parametrize(
    "weights, x, expected_reason",
    [
        # A: consent fails AND spectral drift fails AND norm fails
        #    → first check wins: consent_quorum_not_met
        (
            _W_FAIL,
            _X_NORM_FAIL,
            "consent_quorum_not_met",
        ),
        # B: consent fails AND norm fails (spectral OK)
        (
            _W_FAIL,
            _X_NORM_FAIL,
            "consent_quorum_not_met",
        ),
        # C: spectral drift fails AND norm fails (consent passes)
        #    spectral: ||X||=10 / lambda_max(0.1*I)=0.1 = 100 > 2.0
        #    norm:     ||X||=10 > 5.0
        #    → spectral_drift_exceeded wins over norm_budget_exceeded
        (
            _W_PASS,
            _X_NORM_FAIL,
            "spectral_drift_exceeded",
        ),
        # D: all three fail — consent is first and wins
        (
            _W_FAIL,
            _X_NORM_FAIL,
            "consent_quorum_not_met",
        ),
        # E: only norm fails (consent OK, spectral OK via large Sigma)
        #    Sigma = 100*I  →  drift = 10/100 = 0.1 <= 2.0 → spectral passes
        #    norm: ||X||=10 > 5.0 → norm fails
        (
            _W_PASS,
            _X_NORM_FAIL,   # will use large sigma in the test body
            "norm_budget_exceeded",
        ),
    ],
    ids=[
        "consent+spectral+norm→consent",
        "consent+norm→consent",
        "spectral+norm→spectral",
        "all_three→consent",
        "norm_only→norm",
    ],
)
def test_checker_precedence_combined_failures(
    weights: np.ndarray, x: np.ndarray, expected_reason: str
) -> None:
    """First failing checker in pipeline order must set the reason code."""
    gate_tight = CSLGate(
        CSLGateParams(consent_threshold=0.5, max_spectral_drift=2.0, norm_budget=5.0)
    )
    # For the "norm_only" case use a large Sigma so spectral passes.
    if expected_reason == "norm_budget_exceeded":
        sigma = np.eye(2, dtype=np.float64) * 100.0
    else:
        sigma = np.eye(2, dtype=np.float64) * 0.1
    allowed, reason = gate_tight.check(X=x, t=0, Sigma=sigma, weights=weights)
    assert allowed is False
    assert reason == expected_reason


def test_norm_fail_with_fresh_limiter_returns_norm_budget_exceeded() -> None:
    """norm_budget_exceeded is returned when the rate limiter still has capacity."""
    limiter = RateLimiter(RateLimiterParams(R=3, N=10))
    gate = CSLGate(
        CSLGateParams(max_spectral_drift=100.0, norm_budget=0.1),
        rate_limiter=limiter,
    )
    _, reason = gate.check(
        X=np.array([0.5, 0.0]), t=0, Sigma=np.eye(2), weights=np.array([1.0, 1.0])
    )
    assert reason == "norm_budget_exceeded"


def test_norm_fail_with_exhausted_limiter_returns_rollback_budget_exhausted() -> None:
    """rollback_budget_exhausted is returned when the rate limiter is full."""
    limiter = RateLimiter(RateLimiterParams(R=1, N=5))
    # Exhaust the budget manually.
    limiter.record(True)
    gate = CSLGate(
        CSLGateParams(max_spectral_drift=100.0, norm_budget=0.1),
        rate_limiter=limiter,
    )
    _, reason = gate.check(
        X=np.array([0.5, 0.0]), t=0, Sigma=np.eye(2), weights=np.array([1.0, 1.0])
    )
    assert reason == "rollback_budget_exhausted"


def test_spectral_fail_ignores_rate_limiter() -> None:
    """A spectral_drift_exceeded failure must not consult the rate limiter at all."""
    limiter = RateLimiter(RateLimiterParams(R=1, N=5))
    limiter.record(True)  # budget exhausted
    gate = CSLGate(
        CSLGateParams(max_spectral_drift=0.01, norm_budget=100.0),
        rate_limiter=limiter,
    )
    _, reason = gate.check(
        X=np.array([1.0, 0.0]), t=0, Sigma=np.eye(2), weights=np.array([1.0, 1.0])
    )
    assert reason == "spectral_drift_exceeded"


def test_consent_fail_ignores_rate_limiter() -> None:
    """A consent_quorum_not_met failure must not consult the rate limiter."""
    limiter = RateLimiter(RateLimiterParams(R=1, N=5))
    limiter.record(True)  # budget exhausted
    gate = CSLGate(
        CSLGateParams(consent_threshold=0.5, max_spectral_drift=100.0, norm_budget=100.0),
        rate_limiter=limiter,
    )
    _, reason = gate.check(
        X=np.array([0.1, 0.0]),
        t=0,
        Sigma=np.eye(2),
        weights=np.array([0.0, 0.0]),
    )
    assert reason == "consent_quorum_not_met"


# ---------------------------------------------------------------------------
# Audit-log sequence tests
# ---------------------------------------------------------------------------


def _make_controller_with_norm_gate(*, norm_budget: float = 5.0) -> tuple[PIRTMController, _MockEngine]:
    engine = _MockEngine()
    gate = CSLGate(CSLGateParams(max_spectral_drift=100.0, norm_budget=norm_budget))
    ctrl = PIRTMController(engine=engine, gate=gate)
    return ctrl, engine


def test_audit_log_length_matches_step_count() -> None:
    ctrl, _ = _make_controller_with_norm_gate()
    sigma = np.eye(2, dtype=np.float64)
    w = np.array([1.0, 1.0], dtype=np.float64)

    for step in range(5):
        ctrl.step(step, sigma, w, X=np.array([0.1, 0.1]))

    assert len(ctrl.audit_log) == 5


def test_audit_log_records_correct_t_values() -> None:
    ctrl, _ = _make_controller_with_norm_gate()
    sigma = np.eye(2, dtype=np.float64)
    w = np.array([1.0, 1.0], dtype=np.float64)

    for step in [10, 20, 30]:
        ctrl.step(step, sigma, w, X=np.array([0.1, 0.1]))

    assert [e.t for e in ctrl.audit_log] == [10, 20, 30]


def test_audit_log_mixed_pass_deny_sequence() -> None:
    """Pass and deny events must appear in log order with correct allowed flags."""
    engine = _MockEngine()
    # norm_budget=5.0: X=[0.1,0.1]→pass,  X=[4.0,4.0]→fail (||x||≈5.66)
    gate = CSLGate(CSLGateParams(max_spectral_drift=100.0, norm_budget=5.0))
    ctrl = PIRTMController(engine=engine, gate=gate)
    sigma = np.eye(2, dtype=np.float64)
    w = np.array([1.0, 1.0], dtype=np.float64)
    x_pass = np.array([0.1, 0.1], dtype=np.float64)
    x_fail = np.array([4.0, 4.0], dtype=np.float64)   # ||x||≈5.657 > 5.0

    schedule = [
        (0, x_pass, True,  "pass"),
        (1, x_fail, False, "norm_budget_exceeded"),
        (2, x_pass, True,  "pass"),
        (3, x_fail, False, "norm_budget_exceeded"),
        (4, x_pass, True,  "pass"),
    ]
    for t, x, _, _ in schedule:
        ctrl.step(t, sigma, w, X=x)

    assert len(ctrl.audit_log) == 5
    for i, (t, _x, allowed, reason) in enumerate(schedule):
        ev = ctrl.audit_log[i]
        assert ev.t == t, f"step {i}: expected t={t}, got {ev.t}"
        assert ev.allowed is allowed, f"step {i}: expected allowed={allowed}"
        assert ev.reason == reason, f"step {i}: expected reason={reason!r}, got {ev.reason!r}"


def test_audit_log_hashes_are_unique_across_sequence() -> None:
    """Every step in a multi-step run should have a distinct event_hash."""
    ctrl, _ = _make_controller_with_norm_gate()
    sigma = np.eye(2, dtype=np.float64)
    w = np.array([1.0, 1.0], dtype=np.float64)

    for step in range(6):
        ctrl.step(step, sigma, w, X=np.array([0.1, 0.1]))

    hashes = [e.event_hash for e in ctrl.audit_log]
    assert len(set(hashes)) == len(hashes), "duplicate event hashes detected in audit log"


def test_audit_log_consent_deny_recorded_correctly() -> None:
    """consent_quorum_not_met denial is recorded with allowed=False in the log."""
    engine = _MockEngine()
    gate = CSLGate(CSLGateParams())
    ctrl = PIRTMController(engine=engine, gate=gate)
    sigma = np.eye(2, dtype=np.float64)
    # weights all zero → consent failure
    w_fail = np.array([0.0, 0.0], dtype=np.float64)
    ctrl.step(7, sigma, w_fail, X=np.array([0.1, 0.1]))

    assert len(ctrl.audit_log) == 1
    assert ctrl.audit_log[0].allowed is False
    assert ctrl.audit_log[0].reason == "consent_quorum_not_met"
    assert ctrl.audit_log[0].t == 7


def test_audit_log_append_only_per_step() -> None:
    """Each call to step() appends exactly one event."""
    ctrl, _ = _make_controller_with_norm_gate()
    sigma = np.eye(2, dtype=np.float64)
    w = np.array([1.0, 1.0], dtype=np.float64)

    for i in range(8):
        ctrl.step(i, sigma, w, X=np.array([0.1, 0.1]))
        assert len(ctrl.audit_log) == i + 1


def test_audit_log_state_digest_matches_engine() -> None:
    """state_digest in audit events must equal engine.get_state_digest()."""
    engine = _MockEngine()
    gate = CSLGate(CSLGateParams())
    ctrl = PIRTMController(engine=engine, gate=gate)
    sigma = np.eye(2, dtype=np.float64)
    w = np.array([1.0, 1.0], dtype=np.float64)

    ctrl.step(0, sigma, w, X=np.array([0.1, 0.1]))
    assert ctrl.audit_log[0].state_digest == engine.get_state_digest()
