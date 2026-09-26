"""Public API surface for the Multiplicity-LWE primitive.

This module is the stable entry point used by PIRTM and policy code.

It is intentionally lightweight and does not expose internal implementation details.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from .engine import ToyAEngine
from .params import load_params as _load_params_impl
from .types import MultiplicityParams


def load_multiplicity_params(path: str | Path) -> MultiplicityParams:
    """Load and validate a canonical parameter record."""
    return _load_params_impl(path)


# Backwards-compatible alias
load_params = load_multiplicity_params


def make_toy_a_engine(params: MultiplicityParams, *, seed: Optional[bytes] = None) -> ToyAEngine:
    """Create a ToyAEngine for public sampling.

    The engine is deterministic given the params and optional seed.
    """
    if seed is not None:
        # Seed is currently unused beyond deterministic derivation, but provided
        # as a stable extension point.
        return ToyAEngine(params=params, _seed=seed)
    return ToyAEngine(params=params)


def validate_multiplicity_contractivity(params: MultiplicityParams) -> None:
    """Validate Gate K contractivity properties of the given params.

    This function is intended to be called early in the Gate K pipeline to
    ensure the chosen parameter set respects the multiplicity contraction bounds.
    """
    engine = make_toy_a_engine(params)
    engine.validate_contractivity()


__all__ = [
    "MultiplicityParams",
    "load_params",
    "load_multiplicity_params",
    "make_toy_a_engine",
    "validate_multiplicity_contractivity",
    "ToyAEngine",
]
