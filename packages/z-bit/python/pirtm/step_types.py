"""
PIRTM shared types — used across ace/, petc/, and core/.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class StepInfo:
    """Per-step telemetry record from the PIRTM recurrence loop."""
    q: float           # contraction factor q_t = ||Xi|| + ||Lambda|| * L_T
    epsilon: float     # safety margin epsilon
    w: float = 0.0     # optional weight magnitude for budget tracking
