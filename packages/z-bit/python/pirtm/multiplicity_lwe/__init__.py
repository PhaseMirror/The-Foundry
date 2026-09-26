"""Multiplicity-LWE primitive engine for PIRTM.

This module provides a small deterministic LWE sampler based on the "Toy A"
parameter set. It is intended as a stable, auditable dependency for Gate K.

The public API is intentionally minimal: callers may only load parameters,
construct an engine, and request public samples / digests. Secret material
is never exposed.

The corresponding ADR is: docs/adr/gates/gate k/K-01-MULTIPLICITY-LWE-MODULE.md
"""

from __future__ import annotations

from .api import (
    MultiplicityParams,
    ToyAEngine,
    load_params,
    load_multiplicity_params,
    make_toy_a_engine,
    validate_multiplicity_contractivity,
)
from .types import PrimeSet, ScaleSet, SCALES

__all__ = [
    "MultiplicityParams",
    "PrimeSet",
    "ScaleSet",
    "SCALES",
    "ToyAEngine",
    "load_params",
    "load_multiplicity_params",
    "make_toy_a_engine",
    "validate_multiplicity_contractivity",
]

__version__ = "0.1.0"
