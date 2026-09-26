"""Audit utilities for CSL gate decisions."""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json


@dataclass(frozen=True)
class GateAuditEvent:
    """Deterministic record of one gate decision."""

    t: int
    reason: str
    allowed: bool
    state_digest: str
    event_hash: str


def _compute_gate_event_hash(*, t: int, reason: str, allowed: bool, state_digest: str) -> str:
    payload = {
        "allowed": bool(allowed),
        "reason": reason,
        "state_digest": state_digest,
        "t": int(t),
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.blake2b(encoded, digest_size=16).hexdigest()


def build_gate_event(*, t: int, reason: str, allowed: bool, state_digest: str) -> GateAuditEvent:
    """Create a deterministic gate audit event with stable hashing."""
    event_hash = _compute_gate_event_hash(
        t=t,
        reason=reason,
        allowed=allowed,
        state_digest=state_digest,
    )
    return GateAuditEvent(
        t=t,
        reason=reason,
        allowed=allowed,
        state_digest=state_digest,
        event_hash=event_hash,
    )
