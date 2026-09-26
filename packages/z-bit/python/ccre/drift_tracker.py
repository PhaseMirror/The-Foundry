"""Semantic drift checks for CCRE update proposals."""

from __future__ import annotations

from .constants import DRIFT_GUARD_DEFAULT


def drift_holds(drift: float, bound: float = DRIFT_GUARD_DEFAULT) -> bool:
    return float(drift) < float(bound)
