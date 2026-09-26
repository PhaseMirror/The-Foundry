"""
ADR-010: System-Wide Constants for Contractivity and Fidelity Thresholds

This module provides the single source of truth for all conservation thresholds.
Changes to these values require cross-team review and ADR approval.

DO NOT modify without explicit decision record (ADR).
"""

import os
import yaml
import time
from pathlib import Path
from pirtm.governance.telemetry import telemetry

def _load_l0_policy():
    """Load L0 thresholds from the shared constitutional policy artifact."""
    start_time = time.perf_counter()
    # Find repo root (assuming standard location within PhaseMirror-HQ)
    current_path = Path(__file__).resolve()
    # Ascend to packages/, then to repo root
    repo_root = current_path.parent.parent.parent
    policy_path = repo_root / "governance" / "policies" / "l0-invariants.yaml"
    
    defaults = {
        "DRIFT_THRESHOLD": 0.3,
        "NONCE_LIFETIME_MS": 3600000,
        "OPERATOR_CONTRACTIVITY_BOUND": 1.0,
        "DEFAULT_EPSILON": 0.05
    }
    
    if not policy_path.exists():
        telemetry.counter("pirtm_l0_policy_load_total", labels={"status": "not_found"})
        print(f"⚠️  WARNING: L0 policy not found at {policy_path}. Using safe defaults.")
        return defaults

    try:
        with open(policy_path, 'r') as f:
            policy = yaml.safe_load(f)
            rules = policy.get("rules", [])
            
            telemetry.gauge("pirtm_l0_policy_version", float(policy.get("version", "1.0")))
            
            for rule in rules:
                if rule["name"] == "L0-003":
                    defaults["DRIFT_THRESHOLD"] = rule["condition"]["value"]
                    telemetry.gauge_invariant("L0-003", rule["condition"]["value"])
                if rule["name"] == "L0-004":
                    defaults["NONCE_LIFETIME_MS"] = rule["condition"]["value"]
                    telemetry.gauge_invariant("L0-004", rule["condition"]["value"])
                if rule["name"] == "contraction-condition":
                    defaults["OPERATOR_CONTRACTIVITY_BOUND"] = rule["condition"]["value"]
                    telemetry.gauge_invariant("contraction-condition", rule["condition"]["value"])
            
            defaults["_source_path"] = str(policy_path)
            defaults["version"] = policy.get("version", "1.0")
            
            duration_ms = (time.perf_counter() - start_time) * 1000
            telemetry.counter("pirtm_l0_policy_load_total", labels={"status": "success"})
            telemetry.histogram("pirtm_l0_policy_load_latency_ms", duration_ms)
    except Exception as e:
        telemetry.counter("pirtm_l0_policy_load_total", labels={"status": "failure"})
        print(f"❌ CRITICAL: Failed to parse L0 policy: {e}")
        
    return defaults

_POLICY = _load_l0_policy()

# ============================================================================
# L0: Operator-Level Thresholds (Loaded from Policy)
# ============================================================================

OPERATOR_CONTRACTIVITY_BOUND = _POLICY["OPERATOR_CONTRACTIVITY_BOUND"]
DEFAULT_EPSILON = _POLICY["DEFAULT_EPSILON"]
DRIFT_THRESHOLD = _POLICY["DRIFT_THRESHOLD"]
NONCE_LIFETIME_MS = _POLICY["NONCE_LIFETIME_MS"]

MARGIN_WARNING_THRESHOLD = 0.05 # Diagnostic constant

# ============================================================================
# L1: Economic (Marshalling) Thresholds (pirtm.sigma)
# ============================================================================

MARSHALLING_FIDELITY_THRESHOLD = 0.95
"""
Marshalling operation fidelity threshold: economic acceptability.

Economic condition: numeric_score >= MARSHALLING_FIDELITY_THRESHOLD

Where numeric_score = 1 - (round_trip_error / original_norm)
    ≥ 0.95  means error ≤ 5%

Usage:
    - kernel.cross_kernel_marshaller.FidelityReport.is_acceptable()
    - pirtm.sigma.ledger_systems.ConservationLedger.resolve_discrepancy()
    - All 6 marshal paths (atomic<->pi<->tensor)

Semantics:
    Round-trip communication cost is acceptable for business logic.
    Perfect fidelity is impossible; 5% loss is engineering tradeoff.

Rationale (ADR-006, ADR-009):
    - Pragmatic: real-world systems cannot achieve zero loss
    - Tunable: smaller systems may use stricter thresholds (e.g., 0.98)
    - Overridable: SemanticCheck.on_failure="warn" allows cost-benefit override

History:
    - Introduced: ADR-006 (Contractivity in marshalling)
    - Activated: ADR-009 (Semantic checks use this for gating)

See: docs/adr/ADR-006-contractivity-marshalling.md
     docs/adr/ADR-009-semantic-check-activation.md
     docs/thresholds-explained.md (user guide)
"""

# ============================================================================
# Relationship Between Thresholds
# ============================================================================

"""
Two independent thresholds answer different questions:

┌─────────────────────────────────────────────────────────────┐
│ OPERATOR CONTRACTIVITY (L0): q_t < 1 - ε = 0.95             │
│ Question: Is the module mathematically stable?              │
│ Owner: Core verification team (pirtm.core)                  │
│ Result: Binary (Yes/No); no exceptions                      │
└─────────────────────────────────────────────────────────────┘
              ↓
        (Module passes ADR-002 certification)
              ↓
┌─────────────────────────────────────────────────────────────┐
│ MARSHALLING FIDELITY (L1): numeric_score >= 0.95            │
│ Question: Is the communication cost acceptable?             │
│ Owner: Economic model team (pirtm.sigma)                    │
│ Result: "fail" (rejection) or "warn" (override)             │
└─────────────────────────────────────────────────────────────┘

Case Analysis:

1. Operator stable + fidelity good
   → Proceed ✅ (normal operation)

2. Operator stable + fidelity poor
   → Warn ⚠️ (can override; cost-benefit decision)

3. Operator unstable + fidelity good
   → Fail ❌ (math non-negotiable, good comms can't fix unstable dynamics)

4. Operator unstable + fidelity poor
   → Fail ❌ (both broken)

See: docs/thresholds-explained.md
"""

# ============================================================================
# Spectral Radius Bounds (Supporting Constants)
# ============================================================================

SPECTRAL_CONSERVATION_TOLERANCE = 0.02
"""
Tolerance for spectral radius conservation in pi<->tensor transforms.

Range: [1 - SPECTRAL_CONSERVATION_TOLERANCE, 1 + SPECTRAL_CONSERVATION_TOLERANCE]
      = [0.98, 1.02]

Usage:
    - check_spectral_conservation() semantic check (ADR-009)
    - kernel.cross_kernel_marshaller paths pi_to_tensor, tensor_to_pi

Semantics:
    Principal eigenvalue can degrade by up to ±2% during transforms.
    Beyond this range triggers warning (not failure).

Rationale:
    - ±2% chosen empirically from typical tensor operations
    - Uses "warn" mode (not "fail") to allow monitoring vs blocking
    - Consistent with 5% marshalling fidelity; scales down to eigenvalue level
"""

# ============================================================================
# Validation Functions
# ============================================================================

def validate_operator_contractivity(q_t: float, epsilon: float = DEFAULT_EPSILON) -> bool:
    """
    Check if operator contractivity condition is satisfied.
    
    Args:
        q_t: Spectral radius = ‖Ξ‖ + ‖Λ‖ · L_T
        epsilon: Contraction margin (default: DEFAULT_EPSILON)
    
    Returns:
        True if q_t < OPERATOR_CONTRACTIVITY_BOUND - epsilon
    
    Example:
        >>> validate_operator_contractivity(0.90, epsilon=0.05)
        True  # 0.90 < 1.0 - 0.05 = 0.95
        
        >>> validate_operator_contractivity(0.96, epsilon=0.05)
        False  # 0.96 >= 0.95
    """
    effective_bound = OPERATOR_CONTRACTIVITY_BOUND - epsilon
    return q_t < effective_bound


def validate_marshalling_fidelity(numeric_score: float) -> bool:
    """
    Check if marshalling fidelity is acceptable.
    
    Args:
        numeric_score: Round-trip fidelity score in [0.0, 1.0]
                      where 1.0 = perfect, 0.0 = complete loss
    
    Returns:
        True if numeric_score >= MARSHALLING_FIDELITY_THRESHOLD
    
    Example:
        >>> validate_marshalling_fidelity(0.96)
        True   # 0.96 >= 0.95
        
        >>> validate_marshalling_fidelity(0.94)
        False  # 0.94 < 0.95
    """
    return numeric_score >= MARSHALLING_FIDELITY_THRESHOLD


def error_percent_from_numeric_score(numeric_score: float) -> float:
    """
    Convert numeric_score to relative error percentage.
    
    Args:
        numeric_score: Score in [0.0, 1.0]
    
    Returns:
        Relative error as percentage (e.g., 5.0 for 5%)
    
    Example:
        >>> error_percent_from_numeric_score(0.95)
        5.0  # 5% error is acceptable
        
        >>> error_percent_from_numeric_score(0.90)
        10.0  # 10% error exceeds threshold
    """
    return (1.0 - numeric_score) * 100.0
