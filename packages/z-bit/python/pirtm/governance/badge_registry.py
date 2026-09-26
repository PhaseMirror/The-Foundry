"""Badge Registry System (ADR-025)

Provides a registry for PMD certification badges, including issuance,
revocation, and metadata tracking.

The badge registry is intended to support:
- badge issuance after audit/clone-check success
- revocation when the badge owner violates Transparency Clause
- deterministic, machine-readable metadata for badges
- integration into badge rendering and governance UI

Badge registry is stored as a JSON file containing a list of badge entries.
"""

from __future__ import annotations

import json
import hashlib
import uuid
from dataclasses import dataclass, asdict, fields
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


# ==========================================================================
# Badge Registry Data Model
# ==========================================================================

@dataclass
class BadgeEntry:
    """Single badge entry."""
    badge_id: str
    module_name: str
    prime_index: int
    status: str  # ACTIVE, REVOKED, PENDING

    issued_at: str
    issued_by: str

    certificate_id: str
    clone_check_id: Optional[str] = None
    audit_trace: Optional[str] = None

    revocation_reason: Optional[str] = None
    revoked_at: Optional[str] = None

    metadata: Dict[str, Any] = None

    ALLOWED_STATUSES = {"ACTIVE", "REVOKED", "PENDING"}

    def __post_init__(self):
        # Normalize and validate required fields
        if not self.module_name:
            raise ValueError("BadgeEntry requires non-empty module_name")
        if not isinstance(self.prime_index, int) or self.prime_index <= 1:
            raise ValueError("BadgeEntry requires a valid prime_index (>1)")
        if not self.issued_by:
            raise ValueError("BadgeEntry requires issued_by")
        if not self.certificate_id:
            raise ValueError("BadgeEntry requires certificate_id")

        if self.status not in self.ALLOWED_STATUSES:
            raise ValueError(f"Invalid badge status: {self.status}")

        # Ensure metadata is always a dict
        if self.metadata is None:
            self.metadata = {}

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "BadgeEntry":
        # Allow schema evolution: ignore unknown fields (forward-compatibility)
        allowed = {f.name for f in fields(BadgeEntry)}
        filtered = {k: v for k, v in data.items() if k in allowed}
        return BadgeEntry(**filtered)

    def is_active(self) -> bool:
        return self.status == "ACTIVE"

    def fingerprint(self) -> str:
        """Deterministic fingerprint of the badge entry.

        This fingerprint is stable across reloads and does not depend on
        randomly generated fields like `badge_id`.
        """
        m = hashlib.sha256()
        for field in (
            "module_name",
            "prime_index",
            "certificate_id",
            "clone_check_id",
            "audit_trace",
            "issued_by",
        ):
            value = getattr(self, field)
            m.update(str(value or "").encode("utf-8"))
            m.update(b"\0")
        return m.hexdigest()


@dataclass
class BadgeRegistry:
    """Registry of PMD badges."""
    version: str
    entries: List[BadgeEntry]

    @staticmethod
    def new(version: str = "1.0") -> "BadgeRegistry":
        return BadgeRegistry(version=version, entries=[])

    @staticmethod
    def load(path: Path) -> "BadgeRegistry":
        if not path.exists():
            return BadgeRegistry.new()

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        entries = [BadgeEntry.from_dict(e) for e in data.get("entries", [])]
        return BadgeRegistry(version=data.get("version", "1.0"), entries=entries)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"version": self.version, "entries": [e.to_dict() for e in self.entries]}, f, indent=2)

    def issue_badge(
        self,
        module_name: str,
        prime_index: int,
        issued_by: str,
        certificate_id: Optional[str] = None,
        clone_check_id: Optional[str] = None,
        audit_trace: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> BadgeEntry:
        """Issue a new badge entry.

        The badge issuance is only allowed when tied to a successful
        clone-check and an audit trace. These are required to satisfy
        governance policy.

        Issuance is idempotent: repeated certification with the same
        inputs returns the previously issued badge instead of creating
        duplicates.
        """

        if not clone_check_id:
            raise ValueError("Badge issuance requires clone_check_id (clone-check result identifier)")
        if not audit_trace:
            raise ValueError("Badge issuance requires audit_trace (path/URL of audit log)")

        if certificate_id is None:
            # Use clone_check_id as a stable fallback identifier when none is provided.
            certificate_id = clone_check_id

        # Build a temporary entry for fingerprint calculation.
        # The fingerprint does not depend on badge_id or issued_at.
        candidate = BadgeEntry(
            badge_id="<candidate>",
            module_name=module_name,
            prime_index=prime_index,
            status="ACTIVE",
            issued_at="<now>",
            issued_by=issued_by,
            certificate_id=certificate_id,
            clone_check_id=clone_check_id,
            audit_trace=audit_trace,
            metadata=metadata or {},
        )
        candidate_fp = candidate.fingerprint()

        # If an existing badge has the same deterministic fingerprint, return it.
        for entry in self.entries:
            if entry.fingerprint() == candidate_fp:
                return entry

        badge_id = str(uuid.uuid4())
        entry = BadgeEntry(
            badge_id=badge_id,
            module_name=module_name,
            prime_index=prime_index,
            status="ACTIVE",
            issued_at=datetime.now(timezone.utc).isoformat(),
            issued_by=issued_by,
            certificate_id=certificate_id,
            clone_check_id=clone_check_id,
            audit_trace=audit_trace,
            metadata=metadata or {},
        )

        self.entries.append(entry)
        return entry

    def revoke_badge(self, badge_id: str, reason: str, revoked_by: str) -> Optional[BadgeEntry]:
        """Revoke an existing badge."""
        entry = self.get(badge_id)
        if entry is None:
            return None

        entry.status = "REVOKED"
        entry.revocation_reason = f"{reason} (revoked by {revoked_by})"
        entry.revoked_at = datetime.now(timezone.utc).isoformat()
        return entry

    def get(self, badge_id: str) -> Optional[BadgeEntry]:
        for e in self.entries:
            if e.badge_id == badge_id:
                return e
        return None

    def list_active(self) -> List[BadgeEntry]:
        return [e for e in self.entries if e.is_active()]

    def list_all(self) -> List[BadgeEntry]:
        return list(self.entries)
