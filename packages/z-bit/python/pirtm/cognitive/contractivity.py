"""T-03: Contractivity as Cognitive Bound — convergence verification.

Reinterprets PIRTM contractivity (spectral radius) as a bound on reasoning
convergence.  Provides rate estimation, depth limits, and composition checks.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Optional, Tuple

from .session import CognitiveSession, ReasonStep, SessionStatus


# ─── Convergence analysis ────────────────────────────────────────────


@dataclass(frozen=True)
class ConvergenceEstimate:
    """Estimated convergence characteristics of a cognitive session."""

    spectral_radius: float
    convergence_rate: float  # -log(ρ)
    estimated_steps_to_converge: int
    is_contractive: bool
    is_slow: bool


# Constants
SLOW_CONVERGENCE_THRESHOLD = 0.98  # ρ > this → slow convergence
MAX_DEPTH_DEFAULT = 500


def verify_contractivity(session: CognitiveSession) -> bool:
    """Verify that the session's spectral radius is < 1 (contractive)."""
    if not session.steps:
        return True  # vacuously contractive
    max_rho = max(s.spectral_radius for s in session.steps)
    return max_rho < 1.0


def estimate_convergence(session: CognitiveSession) -> ConvergenceEstimate:
    """Estimate convergence rate and steps-to-convergence."""
    if not session.steps:
        return ConvergenceEstimate(
            spectral_radius=0.0,
            convergence_rate=float("inf"),
            estimated_steps_to_converge=0,
            is_contractive=True,
            is_slow=False,
        )
    max_rho = max(s.spectral_radius for s in session.steps)
    is_contractive = max_rho < 1.0
    if is_contractive and max_rho > 0:
        rate = -math.log(max_rho)
        # Steps ≈ log(1/ε) / rate  for ε = 0.01
        steps = int(math.ceil(math.log(100) / rate))
    elif max_rho == 0:
        rate = float("inf")
        steps = 1
    else:
        rate = 0.0
        steps = MAX_DEPTH_DEFAULT  # won't converge

    return ConvergenceEstimate(
        spectral_radius=max_rho,
        convergence_rate=rate,
        estimated_steps_to_converge=steps,
        is_contractive=is_contractive,
        is_slow=max_rho > SLOW_CONVERGENCE_THRESHOLD,
    )


# ─── Depth-limit enforcement ─────────────────────────────────────────


class SlowConvergenceWarning(Exception):
    """Raised when a session exceeds depth limit due to slow convergence."""


def check_depth_limit(
    session: CognitiveSession,
    max_depth: int = MAX_DEPTH_DEFAULT,
) -> Tuple[bool, Optional[str]]:
    """Check if the session has exceeded depth limits.

    Returns (ok, reason).  If ok is False, reason explains the issue.
    """
    if len(session.steps) < max_depth:
        return (True, None)
    est = estimate_convergence(session)
    if est.is_slow and not est.is_contractive:
        return (False, "true_divergence")
    if est.is_slow:
        return (False, "slow_convergence")
    return (True, None)


# ─── Composition contractivity ────────────────────────────────────────


def verify_composition_contractivity(
    session_a: CognitiveSession,
    session_b: CognitiveSession,
) -> Tuple[bool, float]:
    """Verify contractivity of a composed operator T_a ∘ T_b.

    For composition: ρ(T_a ∘ T_b) ≤ ρ(T_a) · ρ(T_b) (sub-multiplicative).
    Returns (is_contractive, composition_bound).
    """
    est_a = estimate_convergence(session_a)
    est_b = estimate_convergence(session_b)
    bound = est_a.spectral_radius * est_b.spectral_radius
    return (bound < 1.0, bound)


def verify_composition_strict(
    session_a: CognitiveSession,
    session_b: CognitiveSession,
) -> Tuple[bool, float]:
    """Strict composition: ρ < 1 - min(ε_a, ε_b)."""
    if not session_a.steps or not session_b.steps:
        return (True, 0.0)
    rho_a = max(s.spectral_radius for s in session_a.steps)
    rho_b = max(s.spectral_radius for s in session_b.steps)
    eps_a = 1.0 - rho_a
    eps_b = 1.0 - rho_b
    strict_bound = 1.0 - min(eps_a, eps_b)
    comp_bound = rho_a * rho_b
    return (comp_bound < strict_bound, comp_bound)
