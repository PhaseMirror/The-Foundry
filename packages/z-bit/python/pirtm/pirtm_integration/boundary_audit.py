"""Boundary & Governance Audit Chain (ADR-MCRM-020 D-020.6)

Unified append-only audit chain that aggregates:
  - Boundary crossing events (from boundary_validation.py)
  - Governance policy enforcement events (from governance_policy_validator.py)

Features:
  - Cryptographic hash chaining (SHA-256, tamper-evident)
  - JSON / JSONL export
  - Summary report generation for Phase 1 conformance review

Design follows the existing MCP AuditChain (mcp_server/audit.py) and
PIRTM AuditTrail (pirtm/governance/audit_trail.py) patterns.
"""

from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Any, Dict, List, Optional


# ═══════════════════════════════════════════════════════════════════════
#  Audit Entry
# ═══════════════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class GovernanceAuditEntry:
    """Immutable, hashable audit record for governance events.

    Mirrors the MCP AuditEntry pattern with sequential numbering and
    cryptographic hash chaining.
    """

    seq: int
    timestamp: float
    event_type: str         # "boundary" | "policy" | "invariant" | "gate"
    source: str             # module or policy ID
    status: str             # "pass" | "fail" | "enforced" | "violated" | "skipped"
    detail: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    previous_hash: str = ""
    entry_hash: str = ""

    def compute_hash(self) -> str:
        """Compute SHA-256 hash of entry contents (excluding entry_hash)."""
        payload = (
            f"{self.seq}|{self.timestamp}|{self.event_type}|"
            f"{self.source}|{self.status}|{self.detail}|"
            f"{json.dumps(self.metadata, sort_keys=True)}|{self.previous_hash}"
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _finalize_entry(
    seq: int,
    timestamp: float,
    event_type: str,
    source: str,
    status: str,
    detail: str,
    metadata: Dict[str, Any],
    previous_hash: str,
) -> GovernanceAuditEntry:
    """Create an entry and compute its hash."""
    entry = GovernanceAuditEntry(
        seq=seq,
        timestamp=timestamp,
        event_type=event_type,
        source=source,
        status=status,
        detail=detail,
        metadata=metadata,
        previous_hash=previous_hash,
    )
    h = entry.compute_hash()
    # Replace entry_hash via frozen-dataclass trick (object.__setattr__)
    object.__setattr__(entry, "entry_hash", h)
    return entry


# ═══════════════════════════════════════════════════════════════════════
#  GovernanceAuditChain
# ═══════════════════════════════════════════════════════════════════════

class GovernanceAuditChain:
    """Append-only governance audit chain with cryptographic hash linking.

    Usage::

        chain = GovernanceAuditChain()
        chain.record_boundary_event("pirtm→ace", "pass", "step() invocation")
        chain.record_policy_event("POL-001", "enforced", "margin=0.12")
        chain.export_jsonl(Path("audit_trail.jsonl"))
        report = chain.summary_report()
    """

    def __init__(self) -> None:
        self._entries: List[GovernanceAuditEntry] = []
        self._next_seq: int = 0

    @property
    def length(self) -> int:
        return len(self._entries)

    def _previous_hash(self) -> str:
        if not self._entries:
            return hashlib.sha256(b"genesis").hexdigest()
        return self._entries[-1].entry_hash

    def _append(
        self,
        event_type: str,
        source: str,
        status: str,
        detail: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GovernanceAuditEntry:
        entry = _finalize_entry(
            seq=self._next_seq,
            timestamp=time.time(),
            event_type=event_type,
            source=source,
            status=status,
            detail=detail,
            metadata=metadata or {},
            previous_hash=self._previous_hash(),
        )
        self._entries.append(entry)
        self._next_seq += 1
        return entry

    # ── Public recording methods ──────────────────────────────────────

    def record_boundary_event(
        self,
        boundary: str,
        status: str,
        detail: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GovernanceAuditEntry:
        """Record a boundary crossing event."""
        return self._append("boundary", boundary, status, detail, metadata)

    def record_policy_event(
        self,
        policy_id: str,
        status: str,
        detail: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GovernanceAuditEntry:
        """Record a governance policy enforcement event."""
        return self._append("policy", policy_id, status, detail, metadata)

    def record_invariant_event(
        self,
        invariant_id: str,
        status: str,
        detail: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GovernanceAuditEntry:
        """Record an invariant verification event."""
        return self._append("invariant", invariant_id, status, detail, metadata)

    def record_gate_event(
        self,
        gate_id: str,
        status: str,
        detail: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GovernanceAuditEntry:
        """Record a CI quality gate event."""
        return self._append("gate", gate_id, status, detail, metadata)

    # ── Query ─────────────────────────────────────────────────────────

    def get_entries(
        self,
        *,
        event_type: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[GovernanceAuditEntry]:
        """Filter entries by event_type and/or status."""
        result = self._entries
        if event_type is not None:
            result = [e for e in result if e.event_type == event_type]
        if status is not None:
            result = [e for e in result if e.status == status]
        return result

    def verify_chain_integrity(self) -> bool:
        """Verify that every entry's hash is consistent and chain links are valid."""
        prev_hash = hashlib.sha256(b"genesis").hexdigest()
        for entry in self._entries:
            if entry.previous_hash != prev_hash:
                return False
            if entry.entry_hash != entry.compute_hash():
                return False
            prev_hash = entry.entry_hash
        return True

    # ── Export ─────────────────────────────────────────────────────────

    def export_jsonl(self, path: Path) -> None:
        """Write all entries as newline-delimited JSON."""
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            for entry in self._entries:
                f.write(json.dumps(asdict(entry), sort_keys=True) + "\n")

    def export_json(self, path: Path) -> None:
        """Write all entries as a JSON array."""
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump([asdict(e) for e in self._entries], f, indent=2)

    # ── Summary Report ────────────────────────────────────────────────

    def summary_report(self) -> Dict[str, Any]:
        """Generate a Phase 1 conformance summary report.

        Returns a dict suitable for JSON export or CI gate evaluation.
        """
        total = len(self._entries)

        by_type: Dict[str, int] = {}
        by_status: Dict[str, int] = {}
        violations: List[Dict[str, Any]] = []

        for e in self._entries:
            by_type[e.event_type] = by_type.get(e.event_type, 0) + 1
            by_status[e.status] = by_status.get(e.status, 0) + 1
            if e.status in ("fail", "violated"):
                violations.append({
                    "seq": e.seq,
                    "source": e.source,
                    "detail": e.detail,
                    "timestamp": e.timestamp,
                })

        return {
            "total_events": total,
            "events_by_type": by_type,
            "events_by_status": by_status,
            "chain_integrity": self.verify_chain_integrity(),
            "violation_count": len(violations),
            "violations": violations,
            "phase": 1,
            "adr": "ADR-MCRM-020",
        }
