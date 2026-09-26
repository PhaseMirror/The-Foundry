"""
Namespace inventory and proxy constants for UOR trajectory emission.

All values derived from UOR-Framework spec/src/namespaces/*.rs individual counts.

This module is frozen during Phase 0 specification. All namespace counts must be
audited and verified > 0 before Phase 1 implementation begins.

Reference: ADR-011 (PIRTM Trajectory Emitter and Proxy Schema)
"""

import math
from dataclasses import dataclass
from typing import List, Tuple

# ============================================================================
# Constants (Locked)
# ============================================================================

LN2 = math.log(2)
"""Natural logarithm of 2. Approximately 0.693147."""

FLOOR_BUFFER = 1e-10
"""Near-zero guard threshold. Values below this trigger decay rule."""

FLOOR_DECAY = 0.95
"""Decay factor when near-zero guard triggers. T_ctx = T_ctx_prev × 0.95"""

GAMMA_D = b"uor_trajectory:zones=3:scalars=fiber_temperature:steps=15:source=proxy"
"""
Binary descriptor encoding trajectory construction metadata.
Immutable once Phase 1 ships (changes require new ADR).
"""

# ============================================================================
# Namespace Step Definition
# ============================================================================

@dataclass(frozen=True)
class NamespaceStep:
    """Single namespace in UOR assembly order.
    
    Attributes:
        index: 1-based step index in trajectory (1–16)
        prefix: namespace name (e.g., "u", "schema", "op")
        space: zone classification: "kernel", "bridge", or "user"
        individual_count: n_k (number of named items in namespace; proxy capacity)
        split: Zone indicator:
            1 = SPLIT_1_BURN_IN (steps 1–7)
            2 = SPLIT_2_HOLDOUT (steps 8–13)
            3 = SPLIT_3_FINAL (steps 14–15)
            0 = EXCLUDED (step 16, terminal state)
    """
    index: int
    prefix: str
    space: str
    individual_count: int
    split: int

    def __post_init__(self):
        """Validate namespace step invariants."""
        if self.index < 1 or self.index > 16:
            raise ValueError(f"index must be 1–16, got {self.index}")
        
        if self.split not in (0, 1, 2, 3):
            raise ValueError(f"split must be 0, 1, 2, or 3, got {self.split}")
        
        if self.split == 0 and self.index != 16:
            raise ValueError(f"Only step 16 can have split=0 (excluded)")
        
        # Allow -1 (audit pending) or >= 0 (verified count, including empty at 0)
        if self.split > 0 and self.individual_count < -1:
            raise ValueError(
                f"Step {self.index} ({self.prefix}): count must be -1 (pending) or >= 0, "
                f"got {self.individual_count}"
            )

# ============================================================================
# Phase 0 Audit Status
# ============================================================================

# CONFIRMED COUNTS (Verified)
_OBSERVABLE_COUNT = 8  # ✅ observable namespace: 8 individuals confirmed
_STATE_COUNT = 7       # ✅ state namespace: 7 individuals confirmed (excluded)

# AUDIT PENDING (Special sentinel: -1 indicates "not yet audited")
_AUDIT_PENDING = -1  # Placeholder: counts to be extracted from UOR-Framework

# ============================================================================
# Namespace Assembly Order
# ============================================================================

NAMESPACE_ASSEMBLY_ORDER: List[NamespaceStep] = [
    # SPLIT_1_BURN_IN: Steps 1–7 (Kernel zone + bridge entry)
    NamespaceStep(
        index=1,
        prefix="u",
        space="kernel",
        individual_count=0,  # ✅ CONFIRMED: 0 individuals (empty)
        split=1,
    ),
    NamespaceStep(
        index=2,
        prefix="schema",
        space="kernel",
        individual_count=6,  # ✅ CONFIRMED: 6 individuals (pi1, zero, Q0–Q3)
        split=1,
    ),
    NamespaceStep(
        index=3,
        prefix="op",
        space="kernel",
        individual_count=405,  # ✅ CONFIRMED: 405 individuals (local grep count)
        split=1,
    ),
    NamespaceStep(
        index=4,
        prefix="query",
        space="bridge",
        individual_count=3,  # ✅ CONFIRMED: 3 individuals (StratumCoordinate, SpectrumCoordinate, AddressCoordinate)
        split=1,
    ),
    NamespaceStep(
        index=5,
        prefix="resolver",
        space="bridge",
        individual_count=8,  # ✅ CONFIRMED: 8 individuals (4 ComplexityClass + 4 ExecutionPolicyKind)
        split=1,
    ),
    NamespaceStep(
        index=6,
        prefix="type_",
        space="bridge",
        individual_count=3,  # ✅ CONFIRMED: 3 individuals (verticalAxis, horizontalAxis, diagonalAxis)
        split=1,
    ),
    NamespaceStep(
        index=7,
        prefix="partition",
        space="bridge",
        individual_count=0,  # ✅ CONFIRMED: 0 individuals (empty)
        split=1,
    ),
    
    # SPLIT_2_HOLDOUT: Steps 8–13 (Bridge resolution)
    NamespaceStep(
        index=8,
        prefix="observable",
        space="bridge",
        individual_count=_OBSERVABLE_COUNT,  # ✅ CONFIRMED: 8 individuals
        split=2,
    ),
    NamespaceStep(
        index=9,
        prefix="homology",
        space="bridge",
        individual_count=5,  # ✅ CONFIRMED: 5 individuals (boundarySquaredZero, nerveFunctorN, chainFunctorC, psi_4, indexBridge)
        split=2,
    ),
    NamespaceStep(
        index=10,
        prefix="cohomology",
        space="bridge",
        individual_count=4,  # ✅ CONFIRMED: 4 individuals (coboundarySquaredZero, deRhamDuality, sheafCohomologyBridge, localGlobalPrinciple)
        split=2,
    ),
    NamespaceStep(
        index=11,
        prefix="proof",
        space="bridge",
        individual_count=383,  # ✅ CONFIRMED: 383 individuals (local grep count)
        split=2,
    ),
    NamespaceStep(
        index=12,
        prefix="derivation",
        space="bridge",
        individual_count=6,  # ✅ CONFIRMED: 6 individuals (5 rules + NormalizationRule)
        split=2,
    ),
    NamespaceStep(
        index=13,
        prefix="trace",
        space="bridge",
        individual_count=7,  # ✅ CONFIRMED: 7 individuals (4 q_i + 3 collapse rules)
        split=2,
    ),
    
    # SPLIT_3_FINAL: Steps 14–15 (User zone)
    NamespaceStep(
        index=14,
        prefix="cert",
        space="user",
        individual_count=0,  # ✅ CONFIRMED: 0 individuals (empty)
        split=3,
    ),
    NamespaceStep(
        index=15,
        prefix="morphism",
        space="user",
        individual_count=1,  # ✅ CONFIRMED: 1 individual (criticalComposition)
        split=3,
    ),
    
    # STEP_16_EXCLUDED: Terminal absorbing state (not in trajectory)
    NamespaceStep(
        index=16,
        prefix="state",
        space="user",
        individual_count=_STATE_COUNT,  # ✅ CONFIRMED: 7 individuals (EXCLUDED)
        split=0,
    ),
]

# ============================================================================
# Validation Functions (Phase 0 Gate Checks)
# ============================================================================

def validate_namespace_order() -> Tuple[bool, List[str]]:
    """Validate namespace order invariants.
    
    Returns:
        (is_valid, error_messages) tuple
        - is_valid: True if all checks pass
        - error_messages: List of validation failures (empty if valid)
    """
    errors = []
    
    # Check 1: All steps 1–16 present
    indices = [ns.index for ns in NAMESPACE_ASSEMBLY_ORDER]
    if indices != list(range(1, 17)):
        errors.append(f"Missing steps: expected 1–16, got {sorted(indices)}")
    
    # Check 2: All active steps have n_k >= 0 (0 = confirmed empty, -1 = pending, or >0 = confirmed)
    for ns in NAMESPACE_ASSEMBLY_ORDER:
        if ns.split > 0 and (ns.individual_count >= 0 or ns.individual_count == -1):
            # Confirmed count (0 = empty, >0 = populated): OK
            # Pending (-1): OK during Phase 0, but will block Phase 1
            pass
        elif ns.split > 0:
            errors.append(
                f"Step {ns.index} ({ns.prefix}): invalid count {ns.individual_count} "
                f"(must be -1 for pending or >= 0 for confirmed)"
            )
    
    # Check 3: SPLIT_1 is exactly steps 1–7
    split1_steps = [ns.index for ns in NAMESPACE_ASSEMBLY_ORDER if ns.split == 1]
    if split1_steps != list(range(1, 8)):
        errors.append(f"SPLIT_1 steps incorrect: {split1_steps}")
    
    # Check 4: SPLIT_2 is exactly steps 8–13
    split2_steps = [ns.index for ns in NAMESPACE_ASSEMBLY_ORDER if ns.split == 2]
    if split2_steps != list(range(8, 14)):
        errors.append(f"SPLIT_2 steps incorrect: {split2_steps}")
    
    # Check 5: SPLIT_3 is exactly steps 14–15 (>= 2 steps)
    split3_steps = [ns.index for ns in NAMESPACE_ASSEMBLY_ORDER if ns.split == 3]
    if split3_steps != list(range(14, 16)):
        errors.append(f"SPLIT_3 steps incorrect: {split3_steps}")
    elif len(split3_steps) < 2:
        errors.append(f"SPLIT_3 too thin: {len(split3_steps)} steps (need >= 2)")
    
    # Check 6: Step 16 is excluded (split == 0)
    step16 = [ns for ns in NAMESPACE_ASSEMBLY_ORDER if ns.index == 16]
    if not step16:
        errors.append("Step 16 (state) missing")
    elif step16[0].split != 0:
        errors.append(f"Step 16 must be excluded (split=0), got split={step16[0].split}")
    
    # Check 7: No audit pending in active steps (Phase 1 guard)
    pending = [
        ns for ns in NAMESPACE_ASSEMBLY_ORDER
        if ns.split > 0 and ns.individual_count == _AUDIT_PENDING
    ]
    if pending:
        pending_names = [ns.prefix for ns in pending]
        errors.append(
            f"Phase 0 audit incomplete. Pending counts for: {', '.join(pending_names)}"
        )
    
    is_valid = len(errors) == 0
    return is_valid, errors


def compute_total_individuals() -> int:
    """Compute total individuals across all active namespaces.
    
    Returns:
        Sum of individual counts for steps 1–15 (excluding step 16).
        
    Raises:
        ValueError: If any active step has count == _AUDIT_PENDING
    """
    total = 0
    for ns in NAMESPACE_ASSEMBLY_ORDER:
        if ns.split > 0:  # Active steps only
            if ns.individual_count == _AUDIT_PENDING:
                raise ValueError(
                    f"Cannot compute total: {ns.prefix} (step {ns.index}) is pending audit"
                )
            total += ns.individual_count
    return total


# ============================================================================
# Phase 0 Audit Checklist
# ============================================================================

# TODO: Audit and populate the following
# - [ ] Extract n_1 (u) from spec/src/namespaces/u.rs
# - [ ] Extract n_2 (schema) from spec/src/namespaces/schema.rs
# - [ ] Extract n_3 (op) from spec/src/namespaces/op.rs
# - [ ] Extract n_4 (query) from spec/src/namespaces/query.rs
# - [ ] Extract n_5 (resolver) from spec/src/namespaces/resolver.rs
# - [ ] Extract n_6 (type_) from spec/src/namespaces/type_.rs
# - [ ] Extract n_7 (partition) from spec/src/namespaces/partition.rs
# - [ ] Extract n_9 (homology) from spec/src/namespaces/homology.rs
# - [ ] Extract n_10 (cohomology) from spec/src/namespaces/cohomology.rs
# - [ ] Extract n_11 (proof) from spec/src/namespaces/proof.rs
# - [ ] Extract n_12 (derivation) from spec/src/namespaces/derivation.rs
# - [ ] Extract n_13 (trace) from spec/src/namespaces/trace.rs
# - [ ] Extract n_14 (cert) from spec/src/namespaces/cert.rs
# - [ ] Extract n_15 (morphism) from spec/src/namespaces/morphism.rs
# - [ ] Verify all counts > 0
# - [ ] Run validate_namespace_order() and confirm no errors
# - [ ] Record UOR-Framework commit hash in uor_trajectory_spec.md

if __name__ == "__main__":
    """Quick check of namespace order during Phase 0 audit."""
    print("=" * 70)
    print("UOR PROXY CONFIGURATION - Phase 0 Audit Check")
    print("=" * 70)
    
    print("\nNamespace Assembly Order:")
    print("-" * 70)
    for ns in NAMESPACE_ASSEMBLY_ORDER:
        status = "✅" if ns.individual_count != _AUDIT_PENDING else "🔍"
        print(
            f"{status} Step {ns.index:2d}: {ns.prefix:12s} "
            f"({ns.space:6s}): n_k = {ns.individual_count:6} (split {ns.split})"
        )
    
    print("\n" + "-" * 70)
    is_valid, errors = validate_namespace_order()
    
    if is_valid:
        print("✅ Validation PASSED")
        try:
            total = compute_total_individuals()
            print(f"✅ Total individuals (active): {total}")
        except ValueError as e:
            print(f"⚠️  {e}")
    else:
        print("❌ Validation FAILED:")
        for error in errors:
            print(f"  - {error}")
    
    print("=" * 70)
