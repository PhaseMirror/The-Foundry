"""K-07: Governance audit ledger extension for post-quantum proof references.

Extends the ACE governance audit ledger to accept post-quantum proof
references.  Proof bytes (45–100 KB per Plonky3 FRI proof) are too large
to inline in the hash-chained ledger — instead they are stored in blob
storage and the ledger records only:

  - ``proof_store_ref``: blob URI (``local:///path`` or ``s3://bucket/key``)
  - ``proof_hash``:      BLAKE3-equivalent (SHA3-256) hex of the proof bytes

The ``validate_proof_ref()`` method on ``AuditLedger`` fetches the proof
from blob storage and verifies that its hash matches the ledger record.

Non-negotiable invariants (K-07)
---------------------------------
1. Inline proof bytes in ``AuditEntry`` are rejected — callers must provide
   ``proof_store_ref`` + ``proof_hash`` instead.
2. Old entries without ``proof_store_ref`` are still valid (backward compat).
3. The hash chain formula is unchanged: only a new optional field is added.
4. ``validate_proof_ref()`` detects a single-byte tampered proof in blob
   storage (tamper → hash mismatch → error).

Hash chain formula (unchanged from mcp_server/audit.py)
---------------------------------------------------------
  h_i = SHA256(seq | ts | event | actor | payload_hash | proof_hash | h_{i-1})

where ``|`` is field-separator-delimited concatenation and ``proof_hash``
is ``""`` for entries without proof references.

References
----------
- ADR K-07-LEDGER-AND-TRUSTED-SETUP-ELIMINATION.md
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Optional

from packages.ace_zk.blob_store import BlobStore, LocalBlobStore, blake3_hash


# ---------------------------------------------------------------------------
# AuditEntry — extended with proof_store_ref + proof_hash (K-07)
# ---------------------------------------------------------------------------

@dataclass
class AuditEntry:
    """An immutable governance audit record with optional PQ proof reference.

    Core fields (unchanged from the pre-K-07 format):
      seq, timestamp, event, actor, payload_hash, previous_hash, entry_hash

    New optional fields (K-07):
      proof_store_ref: Blob URI pointing to the full Plonky3 proof bytes.
                       Use ``""`` (empty string) for non-PQ entries.
      proof_hash:      BLAKE3-equivalent hex of the proof bytes.
                       Use ``""`` for non-PQ entries.
                       Inline proof bytes are REJECTED — always use a ref.

    Hash chain: the ``entry_hash`` is recomputed over all fields including
    ``proof_hash`` (but not proof bytes — those live in blob storage).

    Args:
        seq:             Sequential entry number (0 for genesis).
        timestamp:       ISO 8601 UTC timestamp.
        event:           Event type (e.g., ``"convergence_cert"``, ``"commit"``).
        actor:           Actor identifier (session ID or agent ID).
        payload_hash:    SHA-256 hex of the JSON-serialised payload.
        previous_hash:   ``entry_hash`` of the previous entry (``"0"`` for genesis).
        proof_store_ref: Blob URI for the PQ proof (empty string if not applicable).
        proof_hash:      BLAKE3-equivalent hex of the PQ proof (empty if N/A).
        entry_hash:      Computed; empty until :meth:`finalise` is called.
    """

    seq: int
    timestamp: str
    event: str
    actor: str
    payload_hash: str
    previous_hash: str
    proof_store_ref: str = ""   # K-07: blob URI for proof archival
    proof_hash: str = ""        # K-07: BLAKE3 hex of proof bytes
    entry_hash: str = ""        # computed by finalise()

    _SEPARATOR: str = field(default="|", init=False, repr=False, compare=False)

    def compute_hash(self) -> str:
        """Return the canonical SHA-256 hash for this entry.

        Hash input (UTF-8 encoded, separator-delimited):
          seq|timestamp|event|actor|payload_hash|proof_hash|previous_hash
        """
        parts = [
            str(self.seq),
            self.timestamp,
            self.event,
            self.actor,
            self.payload_hash,
            self.proof_hash,      # K-07: included in hash chain
            self.previous_hash,
        ]
        raw = "|".join(parts)
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def finalise(self) -> "AuditEntry":
        """Return a new entry with ``entry_hash`` computed from all fields."""
        import dataclasses
        return dataclasses.replace(self, entry_hash=self.compute_hash())

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d.pop("_SEPARATOR", None)
        return d

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "AuditEntry":
        d = {k: v for k, v in d.items() if k in cls.__dataclass_fields__}
        return cls(**d)


# ---------------------------------------------------------------------------
# AuditLedger — hash-chained, with proof_ref validation (K-07)
# ---------------------------------------------------------------------------

class AuditLedger:
    """Immutable, hash-chained governance audit ledger (K-07 extension).

    Supports mixing old entries (without ``proof_store_ref``) and new PQ
    entries (with ``proof_store_ref`` + ``proof_hash``) in the same chain.

    Args:
        location:   Optional path to persist entries as JSONL.
        blob_store: Optional :class:`~packages.ace_zk.blob_store.BlobStore`
                    for proof retrieval in :meth:`validate_proof_ref`.
                    Defaults to a ``LocalBlobStore`` in ``/tmp/ace_proofs``.
    """

    def __init__(
        self,
        location: Optional[Path] = None,
        blob_store: Optional[BlobStore] = None,
    ) -> None:
        self._entries: list[AuditEntry] = []
        self._location = location
        self._blob_store = blob_store or LocalBlobStore(Path("/tmp/ace_proofs"))

        if location and Path(location).exists():
            self._load(location)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @property
    def entries(self) -> list[AuditEntry]:
        return list(self._entries)

    def append(
        self,
        event: str,
        actor: str,
        payload: Any = None,
        proof_store_ref: str = "",
        proof_hash: str = "",
    ) -> AuditEntry:
        """Append a new entry to the ledger.

        Args:
            event:           Event type string.
            actor:           Actor identifier.
            payload:         JSON-serialisable payload (hashed before storage).
            proof_store_ref: Blob URI for the PQ proof (empty if not applicable).
            proof_hash:      BLAKE3 hex of the proof bytes (empty if not applicable).

        Returns:
            The finalised :class:`AuditEntry`.

        Raises:
            ValueError: If ``proof_hash`` is provided without ``proof_store_ref``.
        """
        if proof_hash and not proof_store_ref:
            raise ValueError(
                "proof_hash provided without proof_store_ref — inline proof bytes "
                "are rejected; always provide a blob store reference (K-07)"
            )

        payload_hash = _hash_payload(payload)
        previous_hash = self._entries[-1].entry_hash if self._entries else "0"
        ts = _utc_now()
        seq = len(self._entries)

        entry = AuditEntry(
            seq=seq,
            timestamp=ts,
            event=event,
            actor=actor,
            payload_hash=payload_hash,
            previous_hash=previous_hash,
            proof_store_ref=proof_store_ref,
            proof_hash=proof_hash,
        ).finalise()

        self._entries.append(entry)

        if self._location:
            self._persist(entry)

        return entry

    def validate_chain(self) -> bool:
        """Verify the integrity of the entire hash chain.

        Returns:
            ``True`` if the chain is intact; ``False`` if any entry's hash
            does not match its computed value or if the previous-hash links
            are broken.
        """
        for i, entry in enumerate(self._entries):
            expected_hash = entry.compute_hash()
            if entry.entry_hash != expected_hash:
                return False
            if i > 0:
                expected_prev = self._entries[i - 1].entry_hash
                if entry.previous_hash != expected_prev:
                    return False
        return True

    def validate_proof_ref(self, entry: AuditEntry) -> bool:
        """Verify that the blob at ``entry.proof_store_ref`` matches ``entry.proof_hash``.

        Fetches the proof bytes from the blob store and recomputes the
        BLAKE3-equivalent hash.  Detects single-byte tampering.

        Args:
            entry: An :class:`AuditEntry` with a non-empty ``proof_store_ref``.

        Returns:
            ``True`` if ``blake3_hash(fetch(proof_store_ref)) == proof_hash``.

        Raises:
            ValueError: If ``entry.proof_store_ref`` is empty.
            KeyError:   If the blob is not found in the store.
        """
        if not entry.proof_store_ref:
            raise ValueError(
                f"validate_proof_ref: entry seq={entry.seq} has no proof_store_ref"
            )
        if not entry.proof_hash:
            raise ValueError(
                f"validate_proof_ref: entry seq={entry.seq} has no proof_hash"
            )

        # Strip the URI scheme to get the storage key
        key = _uri_to_key(entry.proof_store_ref)
        proof_bytes = self._blob_store.get(key)
        actual_hash = blake3_hash(proof_bytes)
        return actual_hash == entry.proof_hash

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def _persist(self, entry: AuditEntry) -> None:
        path = Path(self._location)
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry.to_dict()) + "\n")

    def _load(self, location: Path) -> None:
        path = Path(location)
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    self._entries.append(AuditEntry.from_dict(json.loads(line)))

    @classmethod
    def load(cls, location: Path, **kwargs: Any) -> "AuditLedger":
        """Load an existing ledger from *location*."""
        return cls(location=location, **kwargs)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _hash_payload(payload: Any) -> str:
    if payload is None:
        return hashlib.sha256(b"").hexdigest()
    raw = json.dumps(payload, sort_keys=True, default=str).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def _utc_now() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def _uri_to_key(uri: str) -> str:
    """Strip the URI scheme from a blob URI to obtain the storage key."""
    if uri.startswith("local:///"):
        return str(Path(uri[len("local:///"):]).name)
    if uri.startswith("s3://"):
        # s3://bucket/prefix/key → strip bucket and prefix
        parts = uri[len("s3://"):].split("/", 2)
        return parts[-1] if len(parts) > 1 else uri
    return uri
