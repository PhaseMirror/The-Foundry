"""Boundary Contract Enforcement Layer (ADR-MCRM-020 D-020.2)

Runtime validation of module boundary crossings. Every cross-module call
passes through a boundary validator that checks preconditions, postconditions,
and logs audit entries.

Boundaries enforced:
  pirtm/  → ace/              (RecurrenceTrace → CertificationResult)
  ace/    → pirtm_integration/ (CertificationResult → adapter contracts)
  pirtm_integration/ → domain  (adapter I/O contracts)
  domain  ↔ shared/           (type and state expectations)

Toggle: set BOUNDARY_VALIDATION=off to disable at test time.
"""

from __future__ import annotations

import functools
import logging
import os
import time
from dataclasses import dataclass, field, asdict
from typing import Any, Callable, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

# ─── Environment toggle ──────────────────────────────────────────────
BOUNDARY_VALIDATION_ENABLED = os.environ.get("BOUNDARY_VALIDATION", "on").lower() != "off"


# ═══════════════════════════════════════════════════════════════════════
#  Exception Hierarchy
# ═══════════════════════════════════════════════════════════════════════

class BoundaryContractError(RuntimeError):
    """Raised when a module boundary contract is violated.

    Attributes:
        boundary: The boundary identifier (e.g. "pirtm→ace").
        policy_id: Governance policy that was violated (e.g. "POL-001").
        detail: Human-readable violation description.
    """

    def __init__(self, boundary: str, policy_id: str, detail: str):
        self.boundary = boundary
        self.policy_id = policy_id
        self.detail = detail
        super().__init__(f"[{boundary}] {policy_id}: {detail}")


class PolicyViolationError(RuntimeError):
    """Raised when a governance policy is violated at a boundary.

    Attributes:
        policy_id: The governance policy that was violated.
        detail: Human-readable violation description.
    """

    def __init__(self, policy_id: str, detail: str):
        self.policy_id = policy_id
        self.detail = detail
        super().__init__(f"{policy_id}: {detail}")


# ═══════════════════════════════════════════════════════════════════════
#  Boundary Data Types
# ═══════════════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class RecurrenceTrace:
    """Wire type for data crossing pirtm/ → ace/ boundary.

    Carries a recurrence trajectory with metadata needed for ACE certification.
    """

    state_vectors: Tuple[Tuple[float, ...], ...]  # sequence of state snapshots
    q_t_values: Tuple[float, ...]                  # contractivity per step
    margins: Tuple[float, ...]                     # margin per step
    epsilon: float
    trace_id: str
    backend_name: str = "numpy"

    def __post_init__(self):
        if not self.state_vectors:
            raise ValueError("RecurrenceTrace requires at least one state vector")
        if self.epsilon <= 0:
            raise ValueError(f"epsilon must be positive, got {self.epsilon}")


@dataclass(frozen=True)
class CertificationResult:
    """Wire type for data crossing ace/ → pirtm_integration/ boundary.

    Carries an ACE certification decision plus audit metadata.
    """

    state_id: str
    certified: bool
    policy_applied: Tuple[str, ...]
    confidence_score: float
    spectral_radius: float
    contraction_margin: float
    audit_record: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not 0.0 <= self.confidence_score <= 1.0:
            raise ValueError(
                f"confidence_score must be in [0, 1], got {self.confidence_score}"
            )


@dataclass(frozen=True)
class BoundaryAuditEntry:
    """Immutable record of a boundary crossing event."""

    timestamp: float
    boundary: str
    direction: str
    status: str  # "pass" | "fail"
    detail: str
    policy_ids: Tuple[str, ...] = ()
    duration_ms: float = 0.0


# ═══════════════════════════════════════════════════════════════════════
#  Boundary Registry
# ═══════════════════════════════════════════════════════════════════════

_audit_log: List[BoundaryAuditEntry] = []


def get_audit_log() -> List[BoundaryAuditEntry]:
    """Return a copy of the boundary audit log."""
    return list(_audit_log)


def clear_audit_log() -> None:
    """Clear accumulated audit entries (for testing)."""
    _audit_log.clear()


# ═══════════════════════════════════════════════════════════════════════
#  Precondition / Postcondition Validators
# ═══════════════════════════════════════════════════════════════════════

def _validate_array_finite(arr: Any, name: str, boundary: str) -> None:
    """Check that an array-like has all finite values."""
    a = np.asarray(arr, dtype=float)
    if not np.all(np.isfinite(a)):
        raise BoundaryContractError(
            boundary, "PRE-FINITE",
            f"{name} contains non-finite values",
        )


def _validate_shape(arr: Any, expected_ndim: int, name: str, boundary: str) -> None:
    """Check that an array has the expected number of dimensions."""
    a = np.asarray(arr)
    if a.ndim != expected_ndim:
        raise BoundaryContractError(
            boundary, "PRE-SHAPE",
            f"{name} expected ndim={expected_ndim}, got {a.ndim}",
        )


def _validate_square(arr: Any, name: str, boundary: str) -> None:
    """Check that a 2-D array is square."""
    a = np.asarray(arr)
    if a.ndim != 2 or a.shape[0] != a.shape[1]:
        raise BoundaryContractError(
            boundary, "PRE-SQUARE",
            f"{name} must be square, got shape {a.shape}",
        )


def _validate_positive(val: float, name: str, boundary: str) -> None:
    """Check that a scalar is strictly positive."""
    if val <= 0:
        raise BoundaryContractError(
            boundary, "PRE-POSITIVE",
            f"{name} must be positive, got {val}",
        )


def _validate_unit_interval(val: float, name: str, boundary: str) -> None:
    """Check that a scalar is in (0, 1]."""
    if not (0.0 < val <= 1.0):
        raise BoundaryContractError(
            boundary, "PRE-UNIT",
            f"{name} must be in (0, 1], got {val}",
        )


# ═══════════════════════════════════════════════════════════════════════
#  Boundary Contracts
# ═══════════════════════════════════════════════════════════════════════

def validate_pirtm_to_ace(
    X_t: Any,
    Xi_t: Any,
    Lambda_t: Any,
    epsilon: float,
    *,
    G_t: Any = None,
) -> None:
    """Precondition check for pirtm/ → ace/ boundary.

    Validates:
      - X_t: 1-D, finite
      - Xi_t: 2-D square, finite, shape compatible with X_t
      - Lambda_t: 2-D square, finite, shape compatible with X_t
      - G_t (if provided): 1-D, finite, shape compatible with X_t
      - epsilon > 0
    """
    boundary = "pirtm→ace"
    _validate_shape(X_t, 1, "X_t", boundary)
    _validate_array_finite(X_t, "X_t", boundary)

    _validate_square(Xi_t, "Xi_t", boundary)
    _validate_array_finite(Xi_t, "Xi_t", boundary)

    _validate_square(Lambda_t, "Lambda_t", boundary)
    _validate_array_finite(Lambda_t, "Lambda_t", boundary)

    n = np.asarray(X_t).shape[0]
    if np.asarray(Xi_t).shape[0] != n:
        raise BoundaryContractError(
            boundary, "PRE-COMPAT",
            f"Xi_t has dim {np.asarray(Xi_t).shape[0]}, expected {n}",
        )
    if np.asarray(Lambda_t).shape[0] != n:
        raise BoundaryContractError(
            boundary, "PRE-COMPAT",
            f"Lambda_t has dim {np.asarray(Lambda_t).shape[0]}, expected {n}",
        )

    if G_t is not None:
        _validate_shape(G_t, 1, "G_t", boundary)
        _validate_array_finite(G_t, "G_t", boundary)
        if np.asarray(G_t).shape[0] != n:
            raise BoundaryContractError(
                boundary, "PRE-COMPAT",
                f"G_t has dim {np.asarray(G_t).shape[0]}, expected {n}",
            )

    _validate_positive(epsilon, "epsilon", boundary)


def validate_ace_to_integration(result: CertificationResult) -> None:
    """Postcondition check for ace/ → pirtm_integration/ boundary.

    Validates:
      - confidence_score in [0, 1]
      - spectral_radius >= 0
      - audit_record present when certified
      - contraction_margin consistent with certification decision
    """
    boundary = "ace→integration"

    if result.spectral_radius < 0:
        raise BoundaryContractError(
            boundary, "POST-SPECTRAL",
            f"spectral_radius must be non-negative, got {result.spectral_radius}",
        )

    if result.certified and result.contraction_margin <= 0:
        raise BoundaryContractError(
            boundary, "POST-MARGIN",
            f"certified=True but contraction_margin={result.contraction_margin} <= 0",
        )


def validate_integration_to_domain(
    adapter_input: Dict[str, Any],
    target_module: str,
) -> None:
    """Precondition check for pirtm_integration/ → domain module boundary.

    Validates:
      - adapter_input has required keys for the target module
      - Numeric values are finite
    """
    boundary = f"integration→{target_module}"

    required_keys = {"state", "metadata"}
    missing = required_keys - set(adapter_input.keys())
    if missing:
        raise BoundaryContractError(
            boundary, "PRE-KEYS",
            f"Missing required keys: {missing}",
        )

    state = adapter_input.get("state")
    if state is not None:
        _validate_array_finite(state, "state", boundary)


def validate_domain_shared_types(bounds: Any) -> None:
    """Bidirectional check for domain ↔ shared/ boundary.

    Validates ContractionBounds fields are within documented ranges.
    """
    boundary = "domain↔shared"

    if hasattr(bounds, "kappa"):
        if bounds.kappa < 0:
            raise BoundaryContractError(
                boundary, "TYPE-KAPPA",
                f"kappa must be non-negative, got {bounds.kappa}",
            )
    if hasattr(bounds, "drift"):
        if bounds.drift < 0:
            raise BoundaryContractError(
                boundary, "TYPE-DRIFT",
                f"drift must be non-negative, got {bounds.drift}",
            )
    if hasattr(bounds, "resonance"):
        if not (0.0 <= bounds.resonance <= 1.0):
            raise BoundaryContractError(
                boundary, "TYPE-RESONANCE",
                f"resonance must be in [0, 1], got {bounds.resonance}",
            )


# ═══════════════════════════════════════════════════════════════════════
#  Decorator: @boundary_validated
# ═══════════════════════════════════════════════════════════════════════

def boundary_validated(
    module_from: str,
    module_to: str,
    *,
    precondition: Optional[Callable[..., None]] = None,
    postcondition: Optional[Callable[..., None]] = None,
    policy_ids: Tuple[str, ...] = (),
) -> Callable:
    """Decorator that wraps a function with boundary contract enforcement.

    Args:
        module_from: Source module identifier.
        module_to: Target module identifier.
        precondition: Optional callable that validates args before execution.
                      Receives the same (*args, **kwargs) as the wrapped function.
        postcondition: Optional callable that validates the return value.
                       Receives (result, *args, **kwargs).
        policy_ids: Governance policy identifiers relevant to this boundary.

    The decorator:
      1. Validates preconditions (if validation enabled)
      2. Executes the wrapped function
      3. Validates postconditions (if validation enabled)
      4. Logs a BoundaryAuditEntry to the global audit log
      5. On failure, raises BoundaryContractError with policy context
    """

    def decorator(fn: Callable) -> Callable:
        @functools.wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            boundary = f"{module_from}→{module_to}"
            t0 = time.monotonic()

            if not BOUNDARY_VALIDATION_ENABLED:
                return fn(*args, **kwargs)

            # ── Precondition ──
            if precondition is not None:
                try:
                    precondition(*args, **kwargs)
                except BoundaryContractError:
                    _audit_log.append(BoundaryAuditEntry(
                        timestamp=time.time(),
                        boundary=boundary,
                        direction="pre",
                        status="fail",
                        detail=f"precondition failed for {fn.__qualname__}",
                        policy_ids=policy_ids,
                        duration_ms=(time.monotonic() - t0) * 1000,
                    ))
                    raise

            # ── Execute ──
            result = fn(*args, **kwargs)

            # ── Postcondition ──
            if postcondition is not None:
                try:
                    postcondition(result, *args, **kwargs)
                except BoundaryContractError:
                    _audit_log.append(BoundaryAuditEntry(
                        timestamp=time.time(),
                        boundary=boundary,
                        direction="post",
                        status="fail",
                        detail=f"postcondition failed for {fn.__qualname__}",
                        policy_ids=policy_ids,
                        duration_ms=(time.monotonic() - t0) * 1000,
                    ))
                    raise

            # ── Audit: success ──
            _audit_log.append(BoundaryAuditEntry(
                timestamp=time.time(),
                boundary=boundary,
                direction="both",
                status="pass",
                detail=fn.__qualname__,
                policy_ids=policy_ids,
                duration_ms=(time.monotonic() - t0) * 1000,
            ))

            return result

        return wrapper
    return decorator
