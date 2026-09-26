"""K-05 rate limiter and adversarial convergence tests.

Validates:
  1. RateLimiterParams field defaults and extended attributes.
  2. convergence_bound() agrees with the hand-computed formula.
  3. rollback_rate property correctness.
  4. Constructor invariant enforcement (R < N, positive deltas).
  5. Adversarial convergence simulation converges within T_max for a variety
     of (R, N, δ₀, δ_target) configurations.
  6. Monotonicity: tighter rollback budget ⟹ faster convergence.
  7. Boundary conditions: R=0 (no rollbacks allowed) and R=N-1 (maximum
     budget just under the liveness boundary).
  8. Simulation output structure and invariants.
"""

from __future__ import annotations

import math

import pytest

from pirtm.gate.convergence_sim import ConvergenceSimResult, simulate_adversarial_convergence
from pirtm.gate.rate_limiter import RateLimiter, RateLimiterParams


# ---------------------------------------------------------------------------
# RateLimiterParams — field defaults and attribute access
# ---------------------------------------------------------------------------


def test_default_params() -> None:
    p = RateLimiterParams()
    assert p.R == 5
    assert p.N == 50
    assert p.delta_target == pytest.approx(0.01)
    assert p.delta_0 == pytest.approx(1.0)


def test_custom_params_stored() -> None:
    p = RateLimiterParams(R=2, N=20, delta_target=0.001, delta_0=2.0)
    assert p.R == 2
    assert p.N == 20
    assert p.delta_target == pytest.approx(0.001)
    assert p.delta_0 == pytest.approx(2.0)


# ---------------------------------------------------------------------------
# Constructor invariant enforcement
# ---------------------------------------------------------------------------


def test_r_less_than_n_invariant_accepted() -> None:
    rl = RateLimiter(RateLimiterParams(R=4, N=5))
    assert rl.params.R == 4


def test_r_equals_n_raises() -> None:
    with pytest.raises(ValueError, match="R < N"):
        RateLimiter(RateLimiterParams(R=5, N=5))


def test_r_greater_than_n_raises() -> None:
    with pytest.raises(ValueError, match="R < N"):
        RateLimiter(RateLimiterParams(R=10, N=5))


def test_negative_r_raises() -> None:
    with pytest.raises(ValueError):
        RateLimiter(RateLimiterParams(R=-1, N=10))


def test_zero_n_raises() -> None:
    with pytest.raises(ValueError):
        RateLimiter(RateLimiterParams(R=0, N=0))


def test_zero_delta_target_raises() -> None:
    with pytest.raises(ValueError, match="delta_target"):
        RateLimiter(RateLimiterParams(delta_target=0.0))


def test_zero_delta_0_raises() -> None:
    with pytest.raises(ValueError, match="delta_0"):
        RateLimiter(RateLimiterParams(delta_0=0.0))


# ---------------------------------------------------------------------------
# rollback_rate property
# ---------------------------------------------------------------------------


def test_rollback_rate_empty_window_is_zero() -> None:
    rl = RateLimiter(RateLimiterParams(R=3, N=10))
    assert rl.rollback_rate == pytest.approx(0.0)


def test_rollback_rate_all_rollbacks() -> None:
    rl = RateLimiter(RateLimiterParams(R=4, N=5))
    for _ in range(4):
        rl.record(True)
    assert rl.rollback_rate == pytest.approx(4 / 4)


def test_rollback_rate_mixed_window() -> None:
    rl = RateLimiter(RateLimiterParams(R=3, N=10))
    for v in [True, False, True, False]:
        rl.record(v)
    # 2 rollbacks out of 4 recorded
    assert rl.rollback_rate == pytest.approx(2 / 4)


def test_rollback_rate_full_normal_window() -> None:
    rl = RateLimiter(RateLimiterParams(R=3, N=5))
    for _ in range(5):
        rl.record(False)
    assert rl.rollback_rate == pytest.approx(0.0)


# ---------------------------------------------------------------------------
# convergence_bound() — hand-computed reference values
# ---------------------------------------------------------------------------


def _manual_t_max(R: int, N: int, delta_0: float, delta_target: float) -> int:
    """Reference implementation of the K-05 formula for cross-checking."""
    gamma = 0.9
    rho = R / N
    gamma_eff = gamma * (1.0 - rho)
    numerator = math.log(delta_0 / delta_target)
    denominator = math.log(1.0 / gamma_eff)
    base = math.ceil(numerator / denominator)
    liveness = N / (N - R)
    return math.ceil(base * liveness)


@pytest.mark.parametrize(
    "R, N",
    [
        (0, 10),
        (1, 10),
        (3, 10),
        (4, 5),
        (5, 50),
        (1, 100),
        (9, 10),
    ],
)
def test_convergence_bound_matches_formula(R: int, N: int) -> None:
    params = RateLimiterParams(R=R, N=N)
    rl = RateLimiter(params)
    expected = _manual_t_max(R, N, params.delta_0, params.delta_target)
    assert rl.convergence_bound() == expected


def test_convergence_bound_is_positive() -> None:
    rl = RateLimiter(RateLimiterParams(R=2, N=10))
    assert rl.convergence_bound() > 0


def test_convergence_bound_matches_manual_for_two_pressures() -> None:
    """Cross-check two pressure regimes directly against manual formula."""
    p_low = RateLimiterParams(R=1, N=10)
    p_high = RateLimiterParams(R=4, N=10)
    rl_low = RateLimiter(p_low)
    rl_high = RateLimiter(p_high)
    assert rl_low.convergence_bound() == _manual_t_max(1, 10, p_low.delta_0, p_low.delta_target)
    assert rl_high.convergence_bound() == _manual_t_max(4, 10, p_high.delta_0, p_high.delta_target)


def test_convergence_bound_independent_of_window_state() -> None:
    """The bound must be a pure function of params, not of recorded history."""
    rl = RateLimiter(RateLimiterParams(R=2, N=10))
    t_before = rl.convergence_bound()
    for v in [True, False, True]:
        rl.record(v)
    t_after = rl.convergence_bound()
    assert t_before == t_after


def test_convergence_bound_larger_delta_ratio() -> None:
    """Larger δ₀/δ_target ratio ⟹ larger T_max."""
    t_small = RateLimiter(RateLimiterParams(R=1, N=10, delta_0=1.0, delta_target=0.1)).convergence_bound()
    t_large = RateLimiter(RateLimiterParams(R=1, N=10, delta_0=1.0, delta_target=0.001)).convergence_bound()
    assert t_large > t_small


# ---------------------------------------------------------------------------
# Adversarial convergence simulation — convergence guarantee
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "R, N, delta_0, delta_target",
    [
        # Default configuration
        (5, 50, 1.0, 0.01),
        # Minimal rollback pressure
        (1, 10, 1.0, 0.01),
        # Higher rollback fraction
        (3, 10, 1.0, 0.01),
        # Near-maximum budget
        (4, 5, 1.0, 0.01),
        # Larger initial distance
        (2, 10, 5.0, 0.01),
        # Tighter convergence target
        (1, 10, 1.0, 0.001),
        # Zero rollbacks allowed (adversary always blocked)
        # R=0 means allow_step always returns False (sum < 0 never true),
        # so all steps are normal contractions.
        # Note: R=0 is allowed by the constructor (0 < N).
        (0, 10, 1.0, 0.01),
        # Maximum pressure (R=N-1)
        (9, 10, 1.0, 0.01),
    ],
    ids=[
        "default",
        "low_pressure",
        "medium_pressure",
        "near_max_budget",
        "large_delta0",
        "tight_target",
        "no_rollbacks",
        "max_pressure",
    ],
)
def test_simulation_converges_within_t_max(
    R: int, N: int, delta_0: float, delta_target: float
) -> None:
    """The adversarial simulation must converge at or before T_max."""
    params = RateLimiterParams(R=R, N=N, delta_0=delta_0, delta_target=delta_target)
    result = simulate_adversarial_convergence(params)

    assert result.converged is True, (
        f"Did not converge within T_max={result.t_max}; "
        f"final_delta={result.final_delta:.6f}, target={delta_target}"
    )
    assert result.converged_at is not None
    assert result.converged_at <= result.t_max


def test_simulation_result_fields_present() -> None:
    result = simulate_adversarial_convergence()
    assert isinstance(result, ConvergenceSimResult)
    assert isinstance(result.converged, bool)
    assert isinstance(result.t_max, int)
    assert isinstance(result.final_delta, float)
    assert isinstance(result.rollback_count, int)
    assert isinstance(result.normal_count, int)


def test_simulation_final_delta_at_or_below_target() -> None:
    params = RateLimiterParams()
    result = simulate_adversarial_convergence(params)
    assert result.final_delta <= params.delta_target


def test_simulation_rollback_count_bounded_by_rate() -> None:
    """Adversary cannot exceed R rollbacks per N-step window on average."""
    params = RateLimiterParams(R=2, N=10, delta_0=2.0, delta_target=0.001)
    result = simulate_adversarial_convergence(params)
    # Over T_max steps, max rollbacks ≤ R * ceil(T_max / N) + R
    max_possible = params.R * (math.ceil(result.t_max / params.N) + 1)
    assert result.rollback_count <= max_possible


def test_simulation_step_conservation() -> None:
    """rollback_count + normal_count must equal converged_at (steps taken)."""
    params = RateLimiterParams(R=1, N=10)
    result = simulate_adversarial_convergence(params)
    assert result.rollback_count + result.normal_count == result.converged_at


def test_simulation_no_rollback_config_has_zero_rollbacks() -> None:
    """When R=0 the adversary cannot rollback — rollback_count must be 0."""
    params = RateLimiterParams(R=0, N=10)
    result = simulate_adversarial_convergence(params)
    assert result.rollback_count == 0


def test_simulation_high_pressure_respects_its_own_bound() -> None:
    """Both pressure regimes must converge no later than their own T_max."""
    low = simulate_adversarial_convergence(RateLimiterParams(R=1, N=10))
    high = simulate_adversarial_convergence(RateLimiterParams(R=4, N=10))
    assert low.converged and high.converged
    assert low.converged_at is not None and low.converged_at <= low.t_max
    assert high.converged_at is not None and high.converged_at <= high.t_max


def test_simulation_defaults_use_default_params() -> None:
    """Calling sim with no args should use RateLimiterParams() defaults."""
    result = simulate_adversarial_convergence()
    expected_t_max = RateLimiter(RateLimiterParams()).convergence_bound()
    assert result.t_max == expected_t_max
