"""Contraction verification for CCRE parameter updates."""

from __future__ import annotations

from .constants import CONTRACTION_THRESHOLD


def contraction_holds(kappa: float) -> bool:
    return float(kappa) < CONTRACTION_THRESHOLD
