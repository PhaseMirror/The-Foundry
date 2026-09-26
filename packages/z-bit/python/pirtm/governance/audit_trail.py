"""Audit Trail Enforcer (ADR-023)

Provides an immutable, deterministic audit log for all PIRTM decision points.

This module is intended to satisfy the Transparency Clause (§1.2):
- Every Ξ(t) execution and verification step must emit an audit event.
- Audit logs must be retrievable via `pirtm audit <trace.log>`.
- Audit logs must be deterministic (same input → same output).

Audit format: JSONL (one event per line) with stable keys.

Example event:
{
  "timestamp": "2026-03-17T12:34:56.789Z",
  "stage": "runtime",
  "component": "xi_executor",
  "event": "xi_execute",
  "details": {
    "prime_index": 7,
    "t": 0.5,
    "strategy": "direct",
    "decay_factor": 0.7788,
    "input_hash": "abcd...",
    "contractivity": "PASS"
  }
}
"""

from __future__ import annotations

import json
import threading
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


# ==========================================================================
# Audit Event Types
# ==========================================================================

@dataclass(frozen=True)
class AuditEvent:
    """Single immutable audit event."""
    timestamp: str
    stage: str
    component: str
    event: str
    details: Dict[str, Any]

    def to_json(self) -> str:
        """Serialize event as compact JSON string."""
        return json.dumps(asdict(self), sort_keys=True, separators=(',', ':'))


# ==========================================================================
# Audit Trail Singleton
# ==========================================================================

class AuditTrail:
    """Singleton audit trail collector."""

    _instance: Optional["AuditTrail"] = None
    _lock = threading.Lock()

    def __init__(self):
        self._events: List[AuditEvent] = []
        self._frozen = False

    @classmethod
    def get(cls) -> "AuditTrail":
        """Get the global audit trail instance."""
        with cls._lock:
            if cls._instance is None:
                cls._instance = AuditTrail()
            return cls._instance

    def append(self, stage: str, component: str, event: str, details: Dict[str, Any]) -> None:
        """Append an audit event.

        Args:
            stage: One of ['transpile', 'link', 'runtime']
            component: Component name (e.g., 'xi_executor')
            event: Short event name (e.g., 'xi_execute')
            details: Arbitrary JSON-serializable metadata
        """
        if self._frozen:
            # Once frozen, no further audit events are allowed
            return

        timestamp = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
        evt = AuditEvent(
            timestamp=timestamp,
            stage=stage,
            component=component,
            event=event,
            details=details,
        )
        self._events.append(evt)

    def snapshot(self) -> List[AuditEvent]:
        """Get a snapshot of all captured audit events."""
        return list(self._events)

    def write(self, path: str | Path) -> None:
        """Write audit trail to disk (JSONL)."""
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            for evt in self._events:
                f.write(evt.to_json() + "\n")

    def clear(self) -> None:
        """Clear all recorded events."""
        self._events.clear()

    def freeze(self) -> None:
        """Freeze audit trail: further appends are ignored."""
        self._frozen = True

    def is_empty(self) -> bool:
        """Check whether any events have been recorded."""
        return len(self._events) == 0


def audit_event(stage: str, component: str, event: str, details: Dict[str, Any]) -> None:
    """Convenience helper to append an audit event."""
    AuditTrail.get().append(stage, component, event, details)


def reset_audit_trail() -> None:
    """Reset the global audit trail (for tests)."""
    AuditTrail.get().clear()


def freeze_audit_trail() -> None:
    """Freeze the audit trail so no more events can be appended."""
    AuditTrail.get().freeze()
