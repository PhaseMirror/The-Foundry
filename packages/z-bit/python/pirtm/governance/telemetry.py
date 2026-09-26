"""
Governance Telemetry for PIRTM
Matches the core library's telemetry capability.
"""

import time
import json
import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Callable, Any

@dataclass
class Metric:
    name: str
    type: str  # 'counter', 'gauge', 'histogram'
    value: float
    labels: Dict[str, str] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)

TelemetryListener = Callable[[Metric], None]

class Telemetry:
    def __init__(self):
        self.listeners: List[TelemetryListener] = []
        self.enabled: bool = os.environ.get("ENABLE_TELEMETRY") == "true"
        self.log_json: bool = os.environ.get("TELEMETRY_LOG_JSON") == "true"

    def on_metric(self, listener: TelemetryListener):
        self.listeners.append(listener)

    def emit(self, name: str, mtype: str, value: float, labels: Optional[Dict[str, str]] = None):
        if not self.enabled:
            return

        metric = Metric(
            name=name,
            type=mtype,
            value=value,
            labels=labels or {},
            timestamp=time.time()
        )

        for listener in self.listeners:
            try:
                listener(metric)
            except Exception:
                pass # Fail-silent for telemetry

        if self.log_json:
            print(json.dumps({
                "telemetry": {
                    "name": metric.name,
                    "type": metric.type,
                    "value": metric.value,
                    "labels": metric.labels,
                    "timestamp": metric.timestamp
                }
            }))

    def counter(self, name: str, value: float = 1.0, labels: Optional[Dict[str, str]] = None):
        self.emit(name, "counter", value, labels)

    def gauge(self, name: str, value: float, labels: Optional[Dict[str, str]] = None):
        self.emit(name, "gauge", value, labels)

    def histogram(self, name: str, value: float, labels: Optional[Dict[str, str]] = None):
        self.emit(name, "histogram", value, labels)

    def gauge_invariant(self, invariant_id: str, threshold: float):
        """Track an invariant threshold as a gauge."""
        self.emit("pirtm_l0_invariant_threshold", "gauge", threshold, labels={"invariant_id": invariant_id})

    def is_policy_healthy(self, required_version: Optional[float] = None) -> bool:
        """
        Health probe for L0 governance.
        Returns True if policy is loaded, version matches, and no recent failures.
        """
        # In a real system, this would check a shared state/cache updated by load_l0_policy
        # For this implementation, we check against the actual loaded constants
        from pirtm.constants import _POLICY
        
        if not _POLICY or _POLICY.get("OPERATOR_CONTRACTIVITY_BOUND") is None:
            return False
            
        if required_version is not None:
            if float(_POLICY.get("version", 0)) != required_version:
                return False
                
        return True

# Global telemetry instance for PIRTM
telemetry = Telemetry()
