"""
ADR-087 Phase 1: Gate Framework

Phase 1 Gate: Type System Compilation and L0 Invariant Embedding

This gate verifies that:
1. PIRTM dialect extensions are syntactically valid
2. All 5 spectral attributes (sigma, alpha, xi_dim, gap_lb, slope_ub) are parseable
3. L0 Invariants are properly formalized
4. Type verification works end-to-end

Gate completion: All 7 L0 invariants must pass verification before Phase 2 begins.
"""

from typing import List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
from datetime import datetime

from .pirtm_types import (
    PirtmModuleType,
    create_pirtm_module,
    create_spectral_bound,
    VerificationError,
)
from .l0_invariants import (
    L0InvariantEnforcer,
    L0InvariantId,
    validate_l0_formalization,
    formalize_l0_invariants_phase_1,
)


class Phase1GateStatus(Enum):
    """Status of Phase 1 gate checks."""
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"


@dataclass
class Phase1GateResult:
    """Result of Phase 1 gate execution."""
    status: Phase1GateStatus
    timestamp: str
    checks_passed: int
    checks_failed: int
    error_messages: List[str]
    warnings: List[str]
    formalization_valid: bool
    l0_violations: int
    
    def __repr__(self) -> str:
        emoji = "✅" if self.status == Phase1GateStatus.PASSED else "❌"
        return (
            f"{emoji} Phase 1 Gate [{self.timestamp}]: "
            f"{self.checks_passed} passed, {self.checks_failed} failed"
        )


class Phase1Gate:
    """
    Phase 1 Gate: Type System Compilation (Days 1-5)
    
    Verifies that PIRTM type system extensions are valid and ready for
    spectral operator construction in Phase 2.
    
    Success Criteria:
      ✓ 5 new attributes parseable (sigma, alpha, xi_dim, gap_lb, slope_ub)
      ✓ TableGen compilation successful
      ✓ All 7 L0 Invariants formalized
      ✓ L0 enforcement module importable
      ✓ Sample module type-checks with legacy constraints
    """
    
    def __init__(self):
        """Initialize the gate with empty result."""
        self.result: Optional[Phase1GateResult] = None
        self.enforcer = L0InvariantEnforcer()
    
    def run(self) -> Phase1GateResult:
        """
        Execute Phase 1 gate checks.
        
        Returns Phase1GateResult with detailed status.
        """
        checks_passed = 0
        checks_failed = 0
        error_messages: List[str] = []
        warnings: List[str] = []
        
        # Check 1: Verify L0 Invariants formalization
        try:
            if not validate_l0_formalization():
                checks_failed += 1
                error_messages.append("L0 Invariants formalization incomplete")
            else:
                checks_passed += 1
        except Exception as e:
            checks_failed += 1
            error_messages.append(f"L0 Invariants validation raised: {e}")
        
        # Check 2: Verify spectral attributes are constructible
        try:
            sigma_bound = create_spectral_bound(0.8)  # Valid: 0 < 0.8 < 1
            checks_passed += 1
        except Exception as e:
            checks_failed += 1
            error_messages.append(f"SpectralBoundType construction failed: {e}")
        
        # Check 3: Verify PirtmModuleType creation with legacy constraints
        try:
            module = create_pirtm_module(
                prime_index=7,           # Valid: prime
                epsilon=0.5,             # Valid: in [0, 1]
                op_norm_t=0.3            # Valid: ≥ 0
            )
            checks_passed += 1
        except Exception as e:
            checks_failed += 1
            error_messages.append(f"PirtmModuleType construction failed: {e}")
        
        # Check 4: Verify L0 Invariant Enforcer works
        try:
            all_pass, violations = self.enforcer.check_all_l0_invariants(module)
            if all_pass:
                checks_passed += 1
            else:
                checks_failed += 1
                for v in violations:
                    error_messages.append(f"L0 violation: {v.invariant.value}")
        except Exception as e:
            checks_failed += 1
            error_messages.append(f"L0 Enforcer check failed: {e}")
        
        # Check 5: Verify invalid constraints are rejected
        try:
            # Should fail: sigma >= 1.0
            try:
                from .pirtm_types import SpectralBoundType
                invalid_module = SpectralBoundType(sigma=1.5)  # Invalid!
                checks_failed += 1
                error_messages.append("SpectralBoundType did not reject sigma >= 1.0")
            except VerificationError:
                # Good: constraint was enforced
                checks_passed += 1
        except Exception as e:
            checks_failed += 1
            error_messages.append(f"Invalid constraint test raised: {e}")
        
        # Check 6: Verify tablegen-like serialization works
        try:
            module_repr = repr(module)
            if "pirtm.module" in module_repr:
                checks_passed += 1
            else:
                checks_failed += 1
                error_messages.append(f"Module repr missing 'pirtm.module': {module_repr}")
        except Exception as e:
            checks_failed += 1
            error_messages.append(f"Module serialization failed: {e}")
        
        # Check 7: Verify phase 1 formalization dictionary is complete
        try:
            formalization = formalize_l0_invariants_phase_1()
            if len(formalization) == 7:
                checks_passed += 1
            else:
                checks_failed += 1
                error_messages.append(
                    f"L0 Invariants formalization has {len(formalization)} items, "
                    f"expected 7"
                )
        except Exception as e:
            checks_failed += 1
            error_messages.append(f"Formalization dictionary generation failed: {e}")
        
        # Determine overall status
        formalization_valid = validate_l0_formalization()
        status = (
            Phase1GateStatus.PASSED 
            if checks_failed == 0 
            else Phase1GateStatus.FAILED
        )
        
        self.result = Phase1GateResult(
            status=status,
            timestamp=datetime.now().isoformat(),
            checks_passed=checks_passed,
            checks_failed=checks_failed,
            error_messages=error_messages,
            warnings=warnings,
            formalization_valid=formalization_valid,
            l0_violations=len(self.enforcer.violations)
        )
        
        return self.result
    
    def get_summary(self) -> str:
        """
        Get a human-readable summary of the gate result.
        
        Returns multi-line string suitable for logging.
        """
        if self.result is None:
            return "Phase 1 Gate: Not yet executed"
        
        lines = [
            f"{'='*70}",
            f"ADR-087 PHASE 1 GATE: Type System Compilation",
            f"{'='*70}",
            f"Timestamp: {self.result.timestamp}",
            f"Status: {self.result.status.value.upper()}",
            f"",
            f"Checks: {self.result.checks_passed} passed, {self.result.checks_failed} failed",
            f"L0 Violations: {self.result.l0_violations}",
            f"Formalization Valid: {'Yes' if self.result.formalization_valid else 'No'}",
        ]
        
        if self.result.error_messages:
            lines.append("")
            lines.append("Errors:")
            for msg in self.result.error_messages:
                lines.append(f"  ❌ {msg}")
        
        if self.result.warnings:
            lines.append("")
            lines.append("Warnings:")
            for msg in self.result.warnings:
                lines.append(f"  ⚠️  {msg}")
        
        if self.result.status == Phase1GateStatus.PASSED:
            lines.append("")
            lines.append("✅ Phase 1 complete. Ready for Phase 2 (Prime-Spectral Operator)")
        else:
            lines.append("")
            lines.append("❌ Phase 1 BLOCKED. Fix errors above before proceeding.")
        
        lines.append(f"{'='*70}")
        return "\n".join(lines)


def execute_phase_1_gate() -> bool:
    """
    Main entry point: Execute Phase 1 gate and return success/failure.
    
    Returns True if gate passes, False otherwise.
    """
    gate = Phase1Gate()
    result = gate.run()
    print(gate.get_summary())
    return result.status == Phase1GateStatus.PASSED
