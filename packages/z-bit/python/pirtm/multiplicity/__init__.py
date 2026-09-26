"""Multiplicity Library for PIRTM Phase 1.

Provides algebraic multiplicity theory for UFD/Dedekind-domain valuations,
Hilbert-Samuel style multiplicity, descent/gluing operations, and inversion gates.

This module implements the mathematical foundations for Rank 1 & 2 kernel semantics.
"""

from __future__ import annotations

__version__ = "0.1.0"

__all__ = [
    "valuations",
    "hilbert_samuel",
    "descent_gluing",
    "inversion_gate",
]