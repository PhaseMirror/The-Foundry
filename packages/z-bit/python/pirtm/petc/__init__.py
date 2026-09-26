"""
PETC (Prime-Exponent Tensor Certificate) sub-package.

Provides hash-linked chain, prime-exponent signatures,
and Merkle root construction for ETP Jubilee checkpoints.

See ADR-006 for design rationale.
"""
from .chain import PETCChain, PETCAtom
from .signature import PETCSignature
from .merkle import build_merkle_root, verify_merkle_inclusion

__all__ = [
    "PETCChain",
    "PETCAtom",
    "PETCSignature",
    "build_merkle_root",
    "verify_merkle_inclusion",
]
