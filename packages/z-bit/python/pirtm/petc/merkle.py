"""
Jubilee Merkle root builder.
Seals all PETCAtoms since the last Jubilee into a single Merkle root,
satisfying ETP's EpochJubilee.merkleRoot requirement.
"""
from __future__ import annotations

import hashlib

from .chain import PETCAtom


def _sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


def _merkle_pair(a: str, b: str) -> str:
    return _sha256(a + b)


def build_merkle_root(atoms: list[PETCAtom]) -> str:
    """
    Builds a Merkle root from the atom_id list.
    Empty list -> returns SHA-256 of empty string (sentinel).
    Single atom -> returns its atom_id directly.
    """
    if not atoms:
        return _sha256("")
    leaves = [atom.atom_id for atom in atoms]
    while len(leaves) > 1:
        if len(leaves) % 2 == 1:
            leaves.append(leaves[-1])  # duplicate last for odd-length layer
        leaves = [
            _merkle_pair(leaves[i], leaves[i + 1])
            for i in range(0, len(leaves), 2)
        ]
    return leaves[0]


def verify_merkle_inclusion(
    atom_id: str,
    proof: list[tuple[str, str]],  # (sibling_hash, position: 'L'|'R')
    root: str,
) -> bool:
    """Verify a Merkle inclusion proof for a single atom_id."""
    current = atom_id
    for sibling, position in proof:
        if position == "L":
            current = _merkle_pair(sibling, current)
        else:
            current = _merkle_pair(current, sibling)
    return current == root
