"""Bounded parameter refinement logic for standalone CCRE wiring."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Mapping

from .constants import LIPSCHITZ_ALPHA_DEFAULT

from .contraction import contraction_holds
from .drift_tracker import drift_holds
from .resonance_guard import resonance_holds
from .witness import emit_witness


@dataclass(frozen=True)
class CCREUpdateResult:
    accepted: bool
    parameters: Dict[str, float]
    reason: str
    witness: Dict[str, str] | None


def apply_update(
    parameters: Mapping[str, float],
    delta: Mapping[str, float],
    *,
    kappa: float,
    drift: float,
    resonance: float,
    transform_id: str,
    alpha: float = LIPSCHITZ_ALPHA_DEFAULT,
) -> CCREUpdateResult:
    if float(alpha) <= 0.0:
        return CCREUpdateResult(False, dict(parameters), "invalid_alpha", None)

    if not contraction_holds(kappa):
        return CCREUpdateResult(False, dict(parameters), "contraction_violation", None)

    if not drift_holds(drift):
        return CCREUpdateResult(False, dict(parameters), "drift_violation", None)

    if not resonance_holds(resonance):
        return CCREUpdateResult(False, dict(parameters), "resonance_violation", None)

    next_parameters = {key: float(value) for key, value in parameters.items()}
    for key, value in delta.items():
        next_parameters[key] = next_parameters.get(key, 0.0) + float(value)

    witness = emit_witness(transform_id=transform_id, parameters=next_parameters)
    return CCREUpdateResult(True, next_parameters, "accepted", witness)
