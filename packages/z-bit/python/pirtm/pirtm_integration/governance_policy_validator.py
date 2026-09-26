"""Governance Policy Validation Hooks (ADR-MCRM-020 D-020.3)

Runtime enforcement hooks for each policy in the Phase 0 governance
policy inventory (D-010.3).  Every hook follows the same four-step
pattern:

  1. Applicability check — does this policy apply?
  2. Condition evaluation — is the policy satisfied?
  3. Violation signal — raise ``PolicyViolationError`` on failure
  4. Audit log entry — append to the boundary audit chain

Toggle: set GOVERNANCE_POLICY_VALIDATION=off to disable globally.
"""

from __future__ import annotations

import hashlib
import logging
import math
import os
import time
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple

import numpy as np

from .boundary_validation import PolicyViolationError

logger = logging.getLogger(__name__)

# ─── Toggle ───────────────────────────────────────────────────────────
GOVERNANCE_POLICY_VALIDATION_ENABLED = (
    os.environ.get("GOVERNANCE_POLICY_VALIDATION", "on").lower() != "off"
)


# ═══════════════════════════════════════════════════════════════════════
#  Audit Entry for Policy Enforcement Events
# ═══════════════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class PolicyAuditEntry:
    """Immutable audit record for a governance policy evaluation."""

    policy_id: str
    status: str  # "enforced" | "violated" | "skipped"
    timestamp: float
    trace_id: str
    detail: str = ""


_policy_audit_log: List[PolicyAuditEntry] = []


def get_policy_audit_log() -> List[PolicyAuditEntry]:
    """Return a copy of the policy audit log."""
    return list(_policy_audit_log)


def clear_policy_audit_log() -> None:
    """Clear accumulated policy audit entries (for testing)."""
    _policy_audit_log.clear()


def _emit(policy_id: str, status: str, trace_id: str, detail: str = "") -> None:
    """Append a policy audit entry."""
    _policy_audit_log.append(PolicyAuditEntry(
        policy_id=policy_id,
        status=status,
        timestamp=time.time(),
        trace_id=trace_id,
        detail=detail,
    ))


# ═══════════════════════════════════════════════════════════════════════
#  POL-001: Operator Contractivity Bound
# ═══════════════════════════════════════════════════════════════════════

def enforce_pol001_contractivity(
    q_t: float,
    epsilon: float,
    *,
    trace_id: str = "",
    margin_warning_threshold: float = 0.05,
) -> None:
    """POL-001 — Operator Contractivity Bound.

    Rule: ``q_t = ||Ξ|| + ||Λ|| · L_T < 1.0 - ε``

    Enforcement: SOFT — emits UserWarning at margin < threshold,
    but always logs to audit.
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    margin = (1.0 - epsilon) - q_t
    if margin < 0:
        _emit("POL-001", "violated", trace_id,
               f"contractivity violated: q_t={q_t:.6f}, ε={epsilon}, margin={margin:.6f}")
        raise PolicyViolationError(
            "POL-001",
            f"Operator contractivity violated: q_t={q_t:.6f} >= 1 - ε ({1.0 - epsilon:.6f})",
        )

    if margin < margin_warning_threshold:
        import warnings
        warnings.warn(
            f"POL-001: margin {margin:.4f} < {margin_warning_threshold}",
            stacklevel=2,
        )
        _emit("POL-001", "enforced", trace_id,
               f"margin warning: {margin:.6f} < {margin_warning_threshold}")
    else:
        _emit("POL-001", "enforced", trace_id, f"margin={margin:.6f}")


# ═══════════════════════════════════════════════════════════════════════
#  POL-002: Circuit-Aware Epsilon Floor
# ═══════════════════════════════════════════════════════════════════════

def enforce_pol002_epsilon_floor(
    epsilon: float,
    *,
    trace_id: str = "",
    initial_norm: float = 1.0,
    target_delta: float = 0.01,
    max_circuit_steps: int = 128,
) -> None:
    """POL-002 — Circuit-Aware Epsilon Floor.

    Rule: ``ε ≥ max(0.01, ln(||X_0||/δ) / N)``
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    epsilon_floor = max(0.01, math.log(initial_norm / target_delta) / max_circuit_steps)

    if epsilon < epsilon_floor:
        _emit("POL-002", "violated", trace_id,
               f"epsilon={epsilon} < floor={epsilon_floor:.6f}")
        raise PolicyViolationError(
            "POL-002",
            f"Epsilon {epsilon} below circuit-aware floor {epsilon_floor:.6f}",
        )

    _emit("POL-002", "enforced", trace_id, f"epsilon={epsilon} >= floor={epsilon_floor:.6f}")


# ═══════════════════════════════════════════════════════════════════════
#  POL-003: Governance Merkle Root Immutability
# ═══════════════════════════════════════════════════════════════════════

def enforce_pol003_merkle_root(
    computed_root: str,
    expected_root: str,
    *,
    trace_id: str = "",
) -> None:
    """POL-003 — Governance Merkle Root Immutability.

    Rule: live Merkle root must match ledger entry.
    Enforcement: KILL-level.
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    if computed_root != expected_root:
        _emit("POL-003", "violated", trace_id,
               f"root mismatch: computed={computed_root[:16]}... expected={expected_root[:16]}...")
        raise PolicyViolationError(
            "POL-003",
            f"Governance Merkle root mismatch — kill-switch engagement required",
        )

    _emit("POL-003", "enforced", trace_id, "merkle root verified")


# ═══════════════════════════════════════════════════════════════════════
#  POL-005: Löbian Guard
# ═══════════════════════════════════════════════════════════════════════

VERIFICATION_LAYER_PARAMETERS = frozenset({
    "lobian_guard_enabled",
    "verification_staleness_window",
    "kill_switch_below_governance",
    "merkle_root_tx_id_source",
    "self_modification_phase_count",
})


def enforce_pol005_lobian_guard(
    proposed_changes: Dict[str, Any],
    *,
    trace_id: str = "",
) -> None:
    """POL-005 — Löbian Guard: Verification Layer Protection.

    Rule: frozen parameters cannot be modified by any governance proposal.
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    violations = VERIFICATION_LAYER_PARAMETERS & set(proposed_changes.keys())
    if violations:
        _emit("POL-005", "violated", trace_id,
               f"attempted modification of frozen params: {violations}")
        raise PolicyViolationError(
            "POL-005",
            f"Löbian Guard: cannot modify frozen parameters {violations}",
        )

    _emit("POL-005", "enforced", trace_id, "no frozen params modified")


# ═══════════════════════════════════════════════════════════════════════
#  POL-006: Validation Gate State Machine
# ═══════════════════════════════════════════════════════════════════════

VALID_GATE_TRANSITIONS = {
    "PROPOSED": {"AUDITED", "KILLED"},
    "AUDITED": {"APPROVED", "KILLED"},
    "APPROVED": {"EXECUTING", "KILLED"},
    "EXECUTING": {"VERIFIED", "KILLED"},
    "VERIFIED": {"KILLED"},
    "KILLED": set(),  # terminal state
}


def enforce_pol006_gate_transition(
    current_state: str,
    target_state: str,
    *,
    trace_id: str = "",
) -> None:
    """POL-006 — Validation Gate State Machine.

    Rule: Only forward transitions allowed; kill-switch from any state.
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    allowed = VALID_GATE_TRANSITIONS.get(current_state, set())
    if target_state not in allowed:
        _emit("POL-006", "violated", trace_id,
               f"invalid transition: {current_state} → {target_state}")
        raise PolicyViolationError(
            "POL-006",
            f"Invalid gate transition: {current_state} → {target_state}. "
            f"Allowed: {allowed or 'none (terminal state)'}",
        )

    _emit("POL-006", "enforced", trace_id, f"{current_state} → {target_state}")


# ═══════════════════════════════════════════════════════════════════════
#  POL-009: Post-Execution Spectral Watchdog
# ═══════════════════════════════════════════════════════════════════════

def enforce_pol009_spectral_watchdog(
    spectral_radius: float,
    *,
    trace_id: str = "",
    safety_threshold: float = 0.95,
) -> None:
    """POL-009 — Post-Execution Spectral Watchdog.

    Rule: ``r(Λ') < safety_threshold`` after self-modification.
    Enforcement: KILL-level.
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    if spectral_radius >= safety_threshold:
        _emit("POL-009", "violated", trace_id,
               f"spectral_radius={spectral_radius:.6f} >= threshold={safety_threshold}")
        raise PolicyViolationError(
            "POL-009",
            f"Spectral watchdog: r(Λ')={spectral_radius:.6f} >= {safety_threshold}",
        )

    _emit("POL-009", "enforced", trace_id,
           f"spectral_radius={spectral_radius:.6f} < {safety_threshold}")


# ═══════════════════════════════════════════════════════════════════════
#  POL-010: Parameter Snapshot Integrity
# ═══════════════════════════════════════════════════════════════════════

def enforce_pol010_snapshot_integrity(
    current_snapshot_hash: str,
    proposal_binding_hash: str,
    *,
    trace_id: str = "",
) -> None:
    """POL-010 — Parameter Snapshot Integrity.

    Rule: proposal must bind to the current snapshot hash (no stale proposals).
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    if current_snapshot_hash != proposal_binding_hash:
        _emit("POL-010", "violated", trace_id,
               f"stale proposal: current={current_snapshot_hash[:16]}... "
               f"proposal={proposal_binding_hash[:16]}...")
        raise PolicyViolationError(
            "POL-010",
            "Parameter snapshot mismatch — proposal is stale",
        )

    _emit("POL-010", "enforced", trace_id, "snapshot hashes match")


# ═══════════════════════════════════════════════════════════════════════
#  POL-011: CCRE Update Contract
# ═══════════════════════════════════════════════════════════════════════

def enforce_pol011_ccre_update(
    kappa: float,
    resonance: float,
    drift: float,
    *,
    trace_id: str = "",
    max_kappa: float = 1.0,
    max_resonance: float = 0.7,
    max_drift: float = 0.9,
) -> None:
    """POL-011 — CCRE Update Contract.

    Rule: Updates accepted only when kappa < 1.0, resonance ≤ 0.7, drift < 0.9.
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    violations: List[str] = []
    if kappa >= max_kappa:
        violations.append(f"kappa={kappa:.4f} >= {max_kappa}")
    if resonance > max_resonance:
        violations.append(f"resonance={resonance:.4f} > {max_resonance}")
    if drift >= max_drift:
        violations.append(f"drift={drift:.4f} >= {max_drift}")

    if violations:
        detail = "; ".join(violations)
        _emit("POL-011", "violated", trace_id, detail)
        raise PolicyViolationError("POL-011", f"CCRE update rejected: {detail}")

    _emit("POL-011", "enforced", trace_id,
           f"kappa={kappa:.4f}, resonance={resonance:.4f}, drift={drift:.4f}")


# ═══════════════════════════════════════════════════════════════════════
#  POL-015: Typed Phase Mirror Modes
# ═══════════════════════════════════════════════════════════════════════

def enforce_pol015_type_safety(value: Any, *, trace_id: str = "") -> None:
    """POL-015 — Typed Phase Mirror Modes.

    Rule: PIRTMExpr cannot be coerced to StateSnapshot.
    Type system prevents this at construction; this hook detects bypass attempts.
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    type_name = type(value).__name__
    # Detect raw bytes/dict masquerading as typed values
    if isinstance(value, (bytes, bytearray)) and len(value) >= 8:
        try:
            import json
            json.loads(value)
            _emit("POL-015", "violated", trace_id,
                   "raw bytes containing JSON passed where PIRTMExpr expected")
            raise PolicyViolationError(
                "POL-015",
                "Type safety violation: JSON bytes cannot substitute for PIRTMExpr",
            )
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass

    _emit("POL-015", "enforced", trace_id, f"type={type_name}")


# ═══════════════════════════════════════════════════════════════════════
#  POL-017: L0 Invariant Enforcement
# ═══════════════════════════════════════════════════════════════════════

def _is_prime(n: int) -> bool:
    """Miller-Rabin-like quick primality check for small integers."""
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True


def enforce_pol017_l0_invariants(
    *,
    prime_index: int,
    epsilon: float,
    sigma: float,
    alpha: float,
    xi_dim: int,
    gap_lb: float,
    slope_ub: float,
    trace_id: str = "",
) -> None:
    """POL-017 — L0 Invariant Enforcement (7 invariants).

    INV-1: prime_index must be prime
    INV-2: epsilon in [0, 1]
    INV-3: sigma < 1.0 (strict contraction)
    INV-4: alpha >= 0.05
    INV-5: xi_dim >= 1
    INV-6: gap_lb > 0
    INV-7: slope_ub < inf
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    violations: List[str] = []

    if not _is_prime(prime_index):
        violations.append(f"INV-1: {prime_index} is not prime")
    if not (0.0 <= epsilon <= 1.0):
        violations.append(f"INV-2: epsilon={epsilon} not in [0, 1]")
    if sigma >= 1.0:
        violations.append(f"INV-3: sigma={sigma:.6f} >= 1.0")
    if alpha < 0.05:
        violations.append(f"INV-4: alpha={alpha:.6f} < 0.05")
    if xi_dim < 1:
        violations.append(f"INV-5: xi_dim={xi_dim} < 1")
    if gap_lb <= 0:
        violations.append(f"INV-6: gap_lb={gap_lb:.6f} <= 0")
    if not math.isfinite(slope_ub):
        violations.append(f"INV-7: slope_ub={slope_ub} is not finite")

    if violations:
        detail = "; ".join(violations)
        _emit("POL-017", "violated", trace_id, detail)
        raise PolicyViolationError("POL-017", f"L0 invariant violations: {detail}")

    _emit("POL-017", "enforced", trace_id, "all 7 L0 invariants satisfied")


# ═══════════════════════════════════════════════════════════════════════
#  POL-020: DCGF 11-Constraint Taxonomy
# ═══════════════════════════════════════════════════════════════════════

REQUIRED_DCGF_CONSTRAINTS = frozenset({
    f"C{i:02d}" for i in range(1, 12)
})
VALID_CONSTRAINT_STATUSES = {"inactive", "watch", "active", "critical"}


def enforce_pol020_dcgf_constraints(
    constraint_scores: Dict[str, Dict[str, Any]],
    *,
    trace_id: str = "",
) -> None:
    """POL-020 — DCGF 11-Constraint Taxonomy.

    Rule: All 11 constraints (C01–C11) must be present and correctly scored.
    """
    if not GOVERNANCE_POLICY_VALIDATION_ENABLED:
        return

    present = set(constraint_scores.keys())
    missing = REQUIRED_DCGF_CONSTRAINTS - present
    if missing:
        _emit("POL-020", "violated", trace_id, f"missing constraints: {sorted(missing)}")
        raise PolicyViolationError(
            "POL-020",
            f"Missing DCGF constraints: {sorted(missing)}",
        )

    for cid, data in constraint_scores.items():
        status = data.get("status", "")
        if status not in VALID_CONSTRAINT_STATUSES:
            _emit("POL-020", "violated", trace_id,
                   f"{cid}: invalid status '{status}'")
            raise PolicyViolationError(
                "POL-020",
                f"Constraint {cid} has invalid status '{status}'. "
                f"Expected one of {VALID_CONSTRAINT_STATUSES}",
            )

    _emit("POL-020", "enforced", trace_id,
           f"all {len(REQUIRED_DCGF_CONSTRAINTS)} constraints valid")


# ═══════════════════════════════════════════════════════════════════════
#  Aggregate Runner
# ═══════════════════════════════════════════════════════════════════════

ALL_POLICY_ENFORCERS: Dict[str, Callable[..., None]] = {
    "POL-001": enforce_pol001_contractivity,
    "POL-002": enforce_pol002_epsilon_floor,
    "POL-003": enforce_pol003_merkle_root,
    "POL-005": enforce_pol005_lobian_guard,
    "POL-006": enforce_pol006_gate_transition,
    "POL-009": enforce_pol009_spectral_watchdog,
    "POL-010": enforce_pol010_snapshot_integrity,
    "POL-011": enforce_pol011_ccre_update,
    "POL-015": enforce_pol015_type_safety,
    "POL-017": enforce_pol017_l0_invariants,
    "POL-020": enforce_pol020_dcgf_constraints,
}
