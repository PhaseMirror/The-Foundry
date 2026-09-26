"""CCRE standalone package exports."""

from .contraction import contraction_holds
from .drift_tracker import drift_holds
from .resonance_guard import resonance_holds
from .updater import CCREUpdateResult, apply_update
from .witness import emit_witness

__all__ = [
    "CCREUpdateResult",
    "apply_update",
    "contraction_holds",
    "drift_holds",
    "emit_witness",
    "resonance_holds",
]
