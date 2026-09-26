"""
ADR-087 Phase 1: Type System Compilation Tests

Comprehensive test suite for Phase 1 deliverables:
  ✓ PIRTM type extensions (SpectralBoundType, ContractivityBoundType, etc.)
  ✓ L0 Invariant formalization and enforcement
  ✓ Phase 1 gate logic
"""

import pytest
from pirtm.dialect import (
    # New Phase 1 types
    SpectralBoundType,
    ContractivityBoundType,
    InternalBlockType,
    GapLowerBoundType,
    SlopeUpperBoundType,
    PirtmModuleType,
    # Factory functions
    create_spectral_bound,
    create_contractivity_bound,
    create_internal_block,
    create_gap_lower_bound,
    create_slope_upper_bound,
    create_pirtm_module,
    # Legacy types (regression test)
    CertType,
    EpsilonType,
    OpNormTType,
    VerificationError,
)
from pirtm.dialect.l0_invariants import (
    L0InvariantEnforcer,
    L0InvariantId,
    validate_l0_formalization,
    formalize_l0_invariants_phase_1,
)
from pirtm.dialect.phase1_gate import (
    Phase1Gate,
    Phase1GateStatus,
    execute_phase_1_gate,
)


class TestSpectralBoundType:
    """Test !pirtm.spectral_bound(sigma=σ)"""
    
    def test_valid_construction(self):
        """Valid sigma in (0, 1) should succeed."""
        sb = create_spectral_bound(0.8)
        assert sb.sigma == 0.8
        assert "spectral_bound" in repr(sb)
    
    def test_sigma_zero_fails(self):
        """sigma=0 should fail (not strictly positive)."""
        with pytest.raises(VerificationError):
            create_spectral_bound(0.0)
    
    def test_sigma_one_fails(self):
        """sigma=1.0 should fail (not strict < 1)."""
        with pytest.raises(VerificationError):
            create_spectral_bound(1.0)
    
    def test_sigma_greater_than_one_fails(self):
        """sigma > 1 should fail."""
        with pytest.raises(VerificationError):
            create_spectral_bound(1.5)
    
    def test_repr_format(self):
        """__repr__ should follow !pirtm.spectral_bound format."""
        sb = SpectralBoundType(sigma=0.75)
        assert "0.750000" in repr(sb)


class TestContractivityBoundType:
    """Test !pirtm.contractivity(alpha=α)"""
    
    def test_valid_construction(self):
        """Valid alpha >= 0.05 should succeed."""
        cb = create_contractivity_bound(0.1)
        assert cb.alpha == 0.1
        assert "contractivity" in repr(cb)
    
    def test_minimum_margin(self):
        """alpha=0.05 should succeed (minimum allowed)."""
        cb = create_contractivity_bound(0.05)
        assert cb.alpha == 0.05
    
    def test_alpha_below_minimum_fails(self):
        """alpha < 0.05 should fail."""
        with pytest.raises(VerificationError):
            create_contractivity_bound(0.04)
    
    def test_alpha_too_large_fails(self):
        """alpha >= 1.0 should fail."""
        with pytest.raises(VerificationError):
            create_contractivity_bound(1.0)


class TestInternalBlockType:
    """Test !pirtm.internal_block(xi_dim=d, xi_norm=‖Ξ‖)"""
    
    def test_valid_construction(self):
        """Valid dim and norm should succeed."""
        ib = create_internal_block(xi_dim=3, xi_norm=0.5)
        assert ib.xi_dim == 3
        assert ib.xi_norm == 0.5
        assert "internal_block" in repr(ib)
    
    def test_dimension_one_valid(self):
        """xi_dim=1 should succeed (valid Hilbert space)."""
        ib = create_internal_block(1, 0.2)
        assert ib.xi_dim == 1
    
    def test_zero_dimension_fails(self):
        """xi_dim=0 should fail."""
        with pytest.raises(VerificationError):
            create_internal_block(0, 0.5)
    
    def test_negative_norm_fails(self):
        """Negative norm should fail."""
        with pytest.raises(VerificationError):
            create_internal_block(2, -0.1)


class TestGapLowerBoundType:
    """Test !pirtm.gap_lower_bound(gap_lb=λ_min)"""
    
    def test_valid_positive_gap(self):
        """Positive gap should succeed."""
        glb = create_gap_lower_bound(0.01)
        assert glb.gap_lb == 0.01
        assert "gap_lower_bound" in repr(glb)
    
    def test_zero_gap_fails(self):
        """gap_lb=0 should fail (not positive)."""
        with pytest.raises(VerificationError):
            create_gap_lower_bound(0.0)
    
    def test_negative_gap_fails(self):
        """Negative gap should fail."""
        with pytest.raises(VerificationError):
            create_gap_lower_bound(-0.01)


class TestSlopeUpperBoundType:
    """Test !pirtm.slope_upper_bound(slope_ub=M)"""
    
    def test_valid_finite_slope(self):
        """Finite positive slope should succeed."""
        sub = create_slope_upper_bound(100.0)
        assert sub.slope_ub == 100.0
        assert "slope_upper_bound" in repr(sub)
    
    def test_very_large_finite_slope(self):
        """Very large but finite slope should succeed."""
        sub = create_slope_upper_bound(1e10)
        assert sub.slope_ub == 1e10
    
    def test_zero_slope_fails(self):
        """slope_ub=0 should fail."""
        with pytest.raises(VerificationError):
            create_slope_upper_bound(0.0)
    
    def test_infinite_slope_fails(self):
        """slope_ub=infinity should fail."""
        with pytest.raises(VerificationError):
            create_slope_upper_bound(float('inf'))


class TestPirtmModuleType:
    """Test !pirtm.module(...) full descriptor"""
    
    def test_minimal_construction(self):
        """Module with no attributes should succeed."""
        mod = create_pirtm_module()
        assert mod.prime_index is None
        assert mod.sigma is None
    
    def test_legacy_attributes(self):
        """Legacy ADR-004 attributes should verify."""
        mod = create_pirtm_module(
            prime_index=7,
            epsilon=0.5,
            op_norm_t=0.3
        )
        assert mod.prime_index == 7
        assert mod.epsilon == 0.5
    
    def test_spectral_attributes(self):
        """Spectral attributes should be storable."""
        mod = create_pirtm_module(
            sigma=create_spectral_bound(0.8),
            alpha=create_contractivity_bound(0.15),
            xi_block=create_internal_block(2, 0.4)
        )
        assert mod.sigma.sigma == 0.8
        assert mod.alpha.alpha == 0.15
    
    def test_full_module(self):
        """Complete module with all attributes."""
        mod = create_pirtm_module(
            prime_index=11,
            epsilon=0.3,
            op_norm_t=0.2,
            sigma=create_spectral_bound(0.75),
            alpha=create_contractivity_bound(0.20),
            xi_block=create_internal_block(3, 0.35),
            gap_lb_val=create_gap_lower_bound(1e-6),
            slope_ub_val=create_slope_upper_bound(50.0)
        )
        assert "pirtm.module" in repr(mod)
        assert "prime_index=11" in repr(mod)
        assert "sigma=0.750000" in repr(mod)
    
    def test_invalid_prime_fails(self):
        """Non-prime prime_index should fail."""
        with pytest.raises(VerificationError):
            create_pirtm_module(prime_index=4)
    
    def test_invalid_epsilon_fails(self):
        """epsilon > 1 should fail."""
        with pytest.raises(VerificationError):
            create_pirtm_module(epsilon=1.5)


class TestL0InvariantEnforcer:
    """Test L0InvariantEnforcer logic"""
    
    def test_enforcer_initialization(self):
        """Enforcer should initialize with no violations."""
        enforcer = L0InvariantEnforcer()
        assert len(enforcer.violations) == 0
    
    def test_valid_module_passes_all_checks(self):
        """Valid module should pass all 7 L0 checks."""
        module = create_pirtm_module(
            prime_index=7,
            epsilon=0.5,
            op_norm_t=0.3,
            sigma=create_spectral_bound(0.8),
            alpha=create_contractivity_bound(0.2),
            xi_block=create_internal_block(2, 0.4),
            gap_lb_val=create_gap_lower_bound(1e-5),
            slope_ub_val=create_slope_upper_bound(100.0)
        )
        
        enforcer = L0InvariantEnforcer()
        all_pass, violations = enforcer.check_all_l0_invariants(module)
        assert all_pass
        assert len(violations) == 0
    
    def test_check_individual_invariants(self):
        """Individual invariant checks should work."""
        module = create_pirtm_module(prime_index=7)
        enforcer = L0InvariantEnforcer()
        
        assert enforcer.check_l0_invariant_1(module) == True
        assert enforcer.check_l0_invariant_2(module) == True
        assert enforcer.check_l0_invariant_3(module) == True  # sigma is None
    
    def test_violation_report_generation(self):
        """Violation report should be human-readable."""
        enforcer = L0InvariantEnforcer()
        report = enforcer.get_violation_report()
        assert "All L0 invariants satisfied" in report


class TestL0Formalization:
    """Test L0 Invariant formalization"""
    
    def test_formalization_valid(self):
        """Formalization should be complete."""
        assert validate_l0_formalization() == True
    
    def test_formalization_has_all_seven(self):
        """Formalization should have all 7 invariants."""
        formalization = formalize_l0_invariants_phase_1()
        assert len(formalization) == 7
        assert "L0_1_PRIME_INDEX_CONSTRAINT" in formalization
        assert "L0_7_SLOPE_FINITE" in formalization
    
    def test_each_invariant_has_components(self):
        """Each formalization entry should have description, rule, enforcement, consequence."""
        formalization = formalize_l0_invariants_phase_1()
        for key, inv in formalization.items():
            assert "description" in inv
            assert "rule" in inv
            assert "enforcement" in inv
            assert "consequence" in inv


class TestPhase1Gate:
    """Test Phase 1 gate execution"""
    
    def test_gate_execution(self):
        """Gate should execute and pass."""
        gate = Phase1Gate()
        result = gate.run()
        assert result.status == Phase1GateStatus.PASSED
        assert result.checks_passed == 7
        assert result.checks_failed == 0
    
    def test_gate_summary_generation(self):
        """Gate should generate human-readable summary."""
        gate = Phase1Gate()
        gate.run()
        summary = gate.get_summary()
        assert "Phase 1" in summary
        assert "PASSED" in summary
    
    def test_execute_phase_1_gate_function(self):
        """Top-level execute function should return True."""
        result = execute_phase_1_gate()
        assert result == True


class TestLegacyRegression:
    """Regression tests: ADR-004 types should still work"""
    
    def test_cert_type_still_works(self):
        """CertType should not be affected by Phase 1."""
        cert = CertType(mod=7)
        assert cert.mod == 7
        assert "cert" in repr(cert)
    
    def test_epsilon_type_still_works(self):
        """EpsilonType should not be affected."""
        eps = EpsilonType(mod=11, value=0.3)
        assert eps.value == 0.3
    
    def test_op_norm_t_type_still_works(self):
        """OpNormTType should not be affected."""
        norm = OpNormTType(mod=13, norm=0.5)
        assert norm.norm == 0.5


if __name__ == "__main__":
    # Quick smoke test: can run without pytest
    print("Running Phase 1 Type System tests...")
    
    # Test basic construction
    try:
        sb = create_spectral_bound(0.8)
        print("✓ SpectralBoundType works")
    except Exception as e:
        print(f"✗ SpectralBoundType failed: {e}")
    
    # Test enforcer
    try:
        module = create_pirtm_module(prime_index=7)
        enforcer = L0InvariantEnforcer()
        all_pass, _ = enforcer.check_all_l0_invariants(module)
        print(f"✓ L0InvariantEnforcer works (all_pass={all_pass})")
    except Exception as e:
        print(f"✗ L0InvariantEnforcer failed: {e}")
    
    # Test gate
    try:
        result = execute_phase_1_gate()
        print(f"✓ Phase1Gate execution: {'PASSED' if result else 'FAILED'}")
    except Exception as e:
        print(f"✗ Phase1Gate failed: {e}")
    
    print("\nPhase 1 smoke test complete!")
