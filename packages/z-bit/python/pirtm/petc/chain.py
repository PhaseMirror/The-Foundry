"""
PETC chain with SHA-256 atomId and prevHash linking.
Provides the Merkle-ready chain that ETP's Jubilee checkpoint seals.
"""
from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class PETCAtom:
    atom_id: str            # SHA-256 of canonical JSON
    prev_hash: str          # previous atom's atom_id (or '0x0' for genesis)
    prime: int
    timestamp: str          # ISO-8601
    payload: dict[str, Any]
    outcome: str            # 'AUTHORIZED' | 'DENIED'


def _canonical_json(d: dict[str, Any]) -> str:
    return json.dumps(d, sort_keys=True, separators=(",", ":"))


def _sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


class PETCChain:
    """
    Append-only, hash-linked chain of PETCAtoms.
    Each atom's atom_id commits to its content AND its predecessor.
    Chain integrity = every atom.prev_hash == chain[i-1].atom_id
    """

    def __init__(self) -> None:
        self._atoms: list[PETCAtom] = []

    def append(
        self,
        prime: int,
        payload: dict[str, Any],
        outcome: str = "AUTHORIZED",
    ) -> PETCAtom:
        prev_hash = self._atoms[-1].atom_id if self._atoms else "0x0"
        ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        raw = _canonical_json({
            "prev_hash": prev_hash,
            "prime": prime,
            "timestamp": ts,
            "payload": payload,
            "outcome": outcome,
        })
        atom_id = _sha256(raw)
        atom = PETCAtom(
            atom_id=atom_id,
            prev_hash=prev_hash,
            prime=prime,
            timestamp=ts,
            payload=payload,
            outcome=outcome,
        )
        self._atoms.append(atom)
        return atom

    def verify_integrity(self) -> tuple[bool, list[int]]:
        """Returns (is_valid, list_of_broken_link_indices)."""
        broken: list[int] = []
        for i in range(1, len(self._atoms)):
            if self._atoms[i].prev_hash != self._atoms[i - 1].atom_id:
                broken.append(i)
        return (len(broken) == 0, broken)

    def atoms(self) -> list[PETCAtom]:
        return list(self._atoms)

    def __len__(self) -> int:
        return len(self._atoms)
