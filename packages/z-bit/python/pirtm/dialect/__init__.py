"""
PIRTM Dialect Package

Python implementation of the PIRTM MLIR dialect.

ADR-006: Dialect Type-Layer Gate (Day 0-3)
ADR-087: Meta-Relativity × Spin-Foam Operationalization (Phase 1+)
Spec: PIRTM ADR-004
"""

from .pirtm_types import (
    # ADR-004 / ADR-006 Legacy Types
    CertType,
    EpsilonType,
    OpNormTType,
    SessionGraphType,
    CouplingType,
    VerificationError,
    # ADR-087 Phase 1+ Spectral Types
    SpectralBoundType,
    ContractivityBoundType,
    InternalBlockType,
    GapLowerBoundType,
    SlopeUpperBoundType,
    PirtmModuleType,
    # ADR-004 / ADR-006 Factory Functions
    create_cert,
    create_epsilon,
    create_op_norm_t,
    create_session_graph,
    is_prime,
    factorize,
    # ADR-087 Factory Functions
    create_spectral_bound,
    create_contractivity_bound,
    create_internal_block,
    create_gap_lower_bound,
    create_slope_upper_bound,
    create_pirtm_module,
)

__all__ = [
    # ADR-004 / ADR-006
    "CertType",
    "EpsilonType",
    "OpNormTType",
    "SessionGraphType",
    "CouplingType",
    "VerificationError",
    "create_cert",
    "create_epsilon",
    "create_op_norm_t",
    "create_session_graph",
    "is_prime",
    "factorize",
    # ADR-087 Phase 1+
    "SpectralBoundType",
    "ContractivityBoundType",
    "InternalBlockType",
    "GapLowerBoundType",
    "SlopeUpperBoundType",
    "PirtmModuleType",
    "create_spectral_bound",
    "create_contractivity_bound",
    "create_internal_block",
    "create_gap_lower_bound",
    "create_slope_upper_bound",
    "create_pirtm_module",
]
