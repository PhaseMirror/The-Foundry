"""
ACE (Asymmetric Convergence Envelope) sub-package.

Provides multi-level contractivity certification (L0–L2),
budget tracking, and witness production for ETP coupling.

See ADR-006 for design rationale.
"""
from .types import AceCertificate, CertLevel, AceBudgetState
from .protocol import AceProtocol
from .budget import AceBudget
from .witness import AceWitness

__all__ = [
    "AceCertificate",
    "CertLevel",
    "AceBudgetState",
    "AceProtocol",
    "AceBudget",
    "AceWitness",
]
