"""Multiplicity Core Engine (Gate K LWE primitive) for PIRTM.

This module provides the canonical LWE engine used by Gate K.

It exposes the same deterministic, auditable randomness API as the legacy
`pirtm.multiplicity_lwe` toy implementation, but is intended to be the
stable, production-grade "multiplicity core" interface for PIRTM.

Note: For compatibility, this module currently delegates to the existing Toy
implementation under `pirtm.multiplicity_lwe`.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import sqrt
from typing import Any

from pirtm.multiplicity_lwe import (
    MultiplicityParams,
    load_multiplicity_params,
    validate_multiplicity_contractivity,
)
from pirtm.core.engines import ReferenceAEngine, ProductionAEngine

class MultiplicityCoreEngine(ProductionAEngine):
    """Canonical Multiplicity Core engine used by Gate K.

    This class intentionally provides a narrow boundary API for policy and
    controller callsites while preserving deterministic behavior inherited from
    ``ToyAEngine``.
    """

    def get_public_sample(self, context: str) -> tuple[int, int]:
        """Return deterministic public LWE sample for the provided context."""
        return self.public_lwe_sample(context)

    def get_state_digest(self) -> str:
        """Return stable, public digest for audit logging."""
        return self.public_digest()

    def inspect_params(self) -> MultiplicityParams:
        """Return read-only parameter record for boundary-safe inspection."""
        return self.params


class ProtectedEngine:
    """Boundary-enforcing wrapper around MultiplicityCoreEngine.

    Only boundary-safe public methods are exposed. Any non-boundary access
    raises ``AttributeError`` so policy code cannot depend on internals.
    """

    _ALLOWED = frozenset(
        {
            "get_public_sample",
            "get_state_digest",
            "inspect_params",
            "public_random",
            "validate_contractivity",
            "contractivity_margin",
        }
    )

    def __init__(self, inner: MultiplicityCoreEngine):
        object.__setattr__(self, "_inner", inner)

    def __getattr__(self, name: str) -> Any:
        if name not in self._ALLOWED:
            raise AttributeError(
                f"ProtectedEngine: '{name}' is not part of the boundary API. "
                f"Allowed: {sorted(self._ALLOWED)}"
            )
        return getattr(self._inner, name)


@dataclass(frozen=True)
class StateTransitionHarnessConfig:
    """Locked K-02 state-transition harness configuration.

    The transition is intentionally simple and deterministic:

        x_{t+1} = gamma * x_t + (1 - gamma) * u_t

    where u_t is a bounded deterministic public-driving signal derived from
    ``MultiplicityCoreEngine.get_public_sample``.
    """

    dim: int = 8
    gamma: float | None = None
    drive_scale: float = 0.25
    context_prefix: str = "k02/harness"


def _drive_signal(
    engine: MultiplicityCoreEngine,
    *,
    step_idx: int,
    coord_idx: int,
    config: StateTransitionHarnessConfig,
) -> float:
    """Bounded deterministic driving signal u_t in [-drive_scale, drive_scale]."""
    context = f"{config.context_prefix}:t={step_idx}:i={coord_idx}"
    a_t, b_t = engine.get_public_sample(context)
    q = float(engine.inspect_params().q)
    centered = ((float(a_t + b_t) / q) - 1.0)  # approximately in [-1, 1)
    return config.drive_scale * centered


def simulate_state_trajectory(
    engine: MultiplicityCoreEngine,
    x0: list[float],
    *,
    steps: int,
    config: StateTransitionHarnessConfig | None = None,
) -> list[list[float]]:
    """Run the locked K-02 deterministic transition harness for ``steps`` iterations.

    Returns trajectory including x0 as the first element.
    """
    if steps < 0:
        raise ValueError("steps must be >= 0")

    cfg = config or StateTransitionHarnessConfig(dim=len(x0))
    if cfg.dim != len(x0):
        raise ValueError(f"x0 length ({len(x0)}) must match config.dim ({cfg.dim})")

    gamma = cfg.gamma if cfg.gamma is not None else engine.inspect_params().gamma
    if not (0.0 < gamma < 1.0):
        raise ValueError("harness gamma must be in (0, 1)")

    x_t = [float(v) for v in x0]
    trajectory: list[list[float]] = [x_t.copy()]

    for t in range(steps):
        x_next = [0.0] * cfg.dim
        for i in range(cfg.dim):
            u_t = _drive_signal(engine, step_idx=t, coord_idx=i, config=cfg)
            x_next[i] = gamma * x_t[i] + (1.0 - gamma) * u_t
        trajectory.append(x_next)
        x_t = x_next

    return trajectory


def empirical_contraction_report(
    engine: MultiplicityCoreEngine,
    x0_a: list[float],
    x0_b: list[float],
    *,
    steps: int,
    config: StateTransitionHarnessConfig | None = None,
) -> dict[str, float | int]:
    """Empirically certify trajectory contraction under the locked harness.

    Both trajectories share the exact same deterministic drive sequence.  Their
    distance therefore evolves according to the contractive part only, and the
    per-step ratio should be bounded by gamma (modulo floating-point noise).
    """
    if len(x0_a) != len(x0_b):
        raise ValueError("x0_a and x0_b must have the same dimension")

    cfg = config or StateTransitionHarnessConfig(dim=len(x0_a))
    traj_a = simulate_state_trajectory(engine, x0_a, steps=steps, config=cfg)
    traj_b = simulate_state_trajectory(engine, x0_b, steps=steps, config=cfg)

    gamma = cfg.gamma if cfg.gamma is not None else engine.inspect_params().gamma

    def _dist(v1: list[float], v2: list[float]) -> float:
        acc = 0.0
        for a, b in zip(v1, v2):
            acc += (a - b) ** 2
        return sqrt(acc)

    max_ratio = 0.0
    ratio_count = 0
    initial_dist = _dist(traj_a[0], traj_b[0])
    final_dist = _dist(traj_a[-1], traj_b[-1])

    for t in range(steps):
        d_t = _dist(traj_a[t], traj_b[t])
        d_next = _dist(traj_a[t + 1], traj_b[t + 1])
        if d_t > 0.0:
            ratio = d_next / d_t
            max_ratio = max(max_ratio, ratio)
            ratio_count += 1

    return {
        "steps": steps,
        "gamma": float(gamma),
        "ratio_count": ratio_count,
        "max_ratio": float(max_ratio),
        "initial_distance": float(initial_dist),
        "final_distance": float(final_dist),
    }

# Convenience shim aligned with the "multiplicity core" naming.
def make_multiplicity_engine(params: MultiplicityParams, *, seed: bytes | None = None) -> MultiplicityCoreEngine:
    """Create a Multiplicity Core engine for deterministic public sampling."""
    if seed is not None:
        return MultiplicityCoreEngine(params=params, _seed=seed)
    return MultiplicityCoreEngine(params=params)

__all__ = [
    "MultiplicityCoreEngine",
    "ProtectedEngine",
    "StateTransitionHarnessConfig",
    "simulate_state_trajectory",
    "empirical_contraction_report",
    "make_multiplicity_engine",
    "MultiplicityParams",
    "load_multiplicity_params",
    "validate_multiplicity_contractivity",
]
