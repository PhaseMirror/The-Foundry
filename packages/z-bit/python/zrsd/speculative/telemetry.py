"""
ZRSD Phase 1: Telemetry
Provides standard schema for tracking speculative evolution.
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Any
import json

@dataclass
class TelemetryFrame:
    t: float
    trace: float
    exp_M: float
    exp_N: float
    purity: float
    min_eig: float
    entropy: float = 0.0

class TelemetryTracker:
    def __init__(self):
        self.frames: List[TelemetryFrame] = []

    def record(self, frame: TelemetryFrame):
        self.frames.append(frame)

    def to_dict(self) -> List[Dict[str, Any]]:
        return [asdict(f) for f in self.frames]

    def save_json(self, filepath: str):
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
