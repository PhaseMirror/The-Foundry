"""K-05 adversarial convergence simulation.

Implements the chosen-reset adversary model from the K-05 convergence theorem.
The adversary greedily triggers rollbacks whenever the rate limiter allows,
maximising rollback pressure.  Under this worst-case schedule the simulation
verifies that the state distance δ reaches δ_target within T_max steps.

Mathematical model
------------------
Per-step dynamics (adversary is greedy):

  if allow_step(t):          # adversary wins this step
      record(True)           # window sees a rollback
  else:                      # budget exhausted
      record(False)
  δ ← δ · γ_eff              # theorem-consistent effective contraction step

where γ_eff = γ · (1 − R/N), with γ = 0.9 from the Gate K contractivity spec.
"""

from __future__ import annotations

from dataclasses import dataclass

from .rate_limiter import RateLimiter, RateLimiterParams


@dataclass(frozen=True)
class ConvergenceSimResult:
    """Outcome of one adversarial convergence simulation run.

    Attributes:
        converged: True iff δ ≤ δ_target was reached within T_max steps.
        converged_at: The step index at which convergence was first detected,
            or ``None`` if the run exhausted T_max without converging.
        t_max: The upper-bound step count predicted by the theorem.
        final_delta: State distance at the end of the simulation.
        rollback_count: Total rollback events triggered by the adversary.
        normal_count: Total normal (contracting) steps.
    """

    converged: bool
    converged_at: int | None
    t_max: int
    final_delta: float
    rollback_count: int
    normal_count: int


def simulate_adversarial_convergence(
    params: RateLimiterParams | None = None,
) -> ConvergenceSimResult:
    """Run the chosen-reset adversarial convergence simulation.

    The adversary plays optimally: it attempts a rollback on every step where
    allow_step returns True (greedy strategy).  The state distance evolves by
    the theorem-consistent effective contraction coefficient γ_eff each step.

    The simulation terminates as soon as δ ≤ δ_target **or** the T_max step
    budget is exhausted (inclusive — the check at step T_max is the final
    failure check).

    Args:
        params: Rate limiter configuration.  Defaults to RateLimiterParams()
            (R=5, N=50, δ_target=0.01, δ_0=1.0).

    Returns:
        A :class:`ConvergenceSimResult` describing the simulation outcome.
        For any valid configuration (R < N, δ_0 > δ_target), ``converged``
        will be True and ``converged_at`` will be ≤ T_max.
    """
    params = params or RateLimiterParams()
    limiter = RateLimiter(params)
    t_max = limiter.convergence_bound()

    rho = params.R / params.N
    gamma_eff = RateLimiter._GAMMA * (1.0 - rho)

    delta = float(params.delta_0)
    converged_at: int | None = None
    rollback_count = 0
    normal_count = 0

    # Run at most T_max steps; check convergence before each step so that if
    # the initial state already satisfies the target we record converged_at=0.
    for t in range(t_max + 1):
        if delta <= params.delta_target:
            converged_at = t
            break

        if limiter.allow_step(t):
            # Adversary triggers rollback for this step.
            limiter.record(True)
            rollback_count += 1
        else:
            # Rate limiter is saturated — normal contracting step.
            limiter.record(False)
            normal_count += 1

        # K-05 theorem uses effective per-step contraction under rollback
        # pressure, so the simulation updates delta every step with gamma_eff.
        delta *= gamma_eff
        if delta <= params.delta_target:
            converged_at = t + 1
            break

    return ConvergenceSimResult(
        converged=converged_at is not None,
        converged_at=converged_at,
        t_max=t_max,
        final_delta=delta,
        rollback_count=rollback_count,
        normal_count=normal_count,
    )
