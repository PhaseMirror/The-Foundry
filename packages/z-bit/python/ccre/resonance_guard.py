"""Resonance safety checks for CCRE update proposals."""

from __future__ import annotations

from .constants import RESONANCE_MAX_DEFAULT, RESONANCE_MIN_DEFAULT


def resonance_holds(
    resonance: float,
    lower: float = RESONANCE_MIN_DEFAULT,
    upper: float = RESONANCE_MAX_DEFAULT,
) -> bool:
    value = float(resonance)
    return float(lower) <= value <= float(upper)
