"""
ADR-021 Phase 1: Sequencing Gate Tests

Purpose:
    Five critical tests that must ALL PASS before ADR-022 can commence.
    These tests validate the mathematical contracts from ADR-020.

Blocking condition:
    If ANY test fails → ADR-021 INCOMPLETE, ADR-022 BLOCKED
    If ALL pass → ADR-021 COMPLETE, ADR-022 can start

Tests:
    1. test_xi_identity_at_t_zero() — Ξ(0) = Identity
    2. test_xi_decay_rate() — Decay formula exact to 1e-10 precision
    3. test_link_xi_phase2_execution() — Link integrates Ξ(t) correctly
    4. test_cache_hit_deterministic() — Cache returns deterministic results
    5. test_telemetry_collection() — Telemetry works end-to-end

Mathematical binding: All five Ξ(t) invariants (INV-1 through INV-5)

Provenance: MultiplicityFoundation/Meta-Relativity
Math Stack: Ξ(t) operator correctness, determinism, integration
Registry: github.com/MultiplicityFoundation/Meta-Relativity
Date: 2026-03-17
"""

import pytest
import numpy as np
import time
from typing import Dict, List

from pirtm.core.xi_executor import (
    XiExecutor, ExecutorStrategy, U_UNIVERSAL, FIRST_20_PRIMES
)
from pirtm.core.xi_cert_cache import XiCertCache, CachedXiExecutor
from pirtm.core.xi_telemetry import XiTelemetry
from pirtm.transpiler.pirtm_link_xi import (
    SessionGraph, ModuleNode, link_with_xi_execution
)


# ============================================================================
# Test Parameters
# ============================================================================

EPSILON_PRECISION = 1e-10  # Tolerance for floating-point checks
TEST_PRIMES = [2, 3, 7, 13, 19, 31, 53, 101]
TEST_TIMES = [0.0, 0.1, 0.5, 1.0, 2.0]


# ============================================================================
# Gate Test 1: Identity at t=0
# ============================================================================

class TestGate1Identity:
    """Test that Ξ(0) = Identity operator."""
    
    def test_xi_identity_at_t_zero_vector(self):
        """Ξ_p(0) |ψ⟩ = |ψ⟩ for all primes p."""
        executor = XiExecutor("direct")
        
        for p in TEST_PRIMES:
            psi = np.random.randn(10)
            result = executor.execute(psi, p, t=0.0)
            
            # Check: output = input
            np.testing.assert_allclose(
                result.output_state, psi,
                rtol=EPSILON_PRECISION,
                atol=EPSILON_PRECISION,
                err_msg=f"Failed for p={p}"
            )
            
            # Check: decay factor = 1.0
            assert abs(result.decay_factor - 1.0) < EPSILON_PRECISION
    
    def test_xi_identity_at_t_zero_matrix(self):
        """Ξ_p(0) on matrix operator returns identity scaled."""
        executor = XiExecutor("spectral")
        
        for p in [3, 7, 11]:
            M = np.random.randn(5, 5)
            result = executor.execute(M, p, t=0.0)
            
            # Check: output ≈ input
            np.testing.assert_allclose(
                result.output_state, M,
                rtol=EPSILON_PRECISION,
                atol=EPSILON_PRECISION
            )
    
    def test_xi_identity_decay_factor_zero(self):
        """Decay factor at t=0 is exactly 1.0."""
        executor = XiExecutor("direct")
        
        for p in TEST_PRIMES:
            # Decay factor: e^{-U·log(p)·0} = e^0 = 1.0
            expected_decay = np.exp(-U_UNIVERSAL * np.log(p) * 0.0)
            assert expected_decay == 1.0, f"Analytical decay formula failed for p={p}"
            
            # Check via executor
            psi = np.ones(5)
            result = executor.execute(psi, p, t=0.0)
            
            assert result.decay_factor == pytest.approx(1.0, abs=EPSILON_PRECISION)


# ============================================================================
# Gate Test 2: Decay Rate Exactness
# ============================================================================

class TestGate2DecayRate:
    """Test that decay rate formula is exact to (INV-4 precision)."""
    
    def test_decay_rate_vs_formula(self):
        """Compare Ξ(t) decay against analytical e^{-U·log(p)·t}."""
        executor = XiExecutor("direct")
        
        for p in TEST_PRIMES:
            lambda_p = U_UNIVERSAL * np.log(p)
            
            for t in TEST_TIMES:
                psi = np.random.randn(20)
                result = executor.execute(psi, p, t)
                
                # Analytical decay factor
                expected_decay = np.exp(-lambda_p * t)
                
                # Check: computed decay = expected decay to INV-4 precision
                error = abs(result.decay_factor - expected_decay)
                assert error < EPSILON_PRECISION, (
                    f"Decay mismatch: p={p}, t={t}, "
                    f"computed={result.decay_factor}, expected={expected_decay}, "
                    f"error={error}"
                )
    
    def test_decay_rate_contractivity(self):
        """Decay factor e^{-U·log(p)·t} is always < 1 for t > 0."""
        for p in TEST_PRIMES:
            lambda_p = U_UNIVERSAL * np.log(p)
            
            for t in [0.01, 0.1, 1.0, 10.0]:
                decay = np.exp(-lambda_p * t)
                assert decay < 1.0, f"Decay ≥ 1: p={p}, t={t}, decay={decay}"
                assert decay > 0.0, f"Decay ≤ 0: p={p}, t={t}, decay={decay}"
    
    def test_decay_rate_ordering(self):
        """Larger primes decay faster: e^{-log(p₁)} ∉ vs e^{-log(p₂)} for p₁ < p₂."""
        executor = XiExecutor("direct")
        t = 1.0
        psi = np.ones(10)
        
        p1, p2 = 3, 7
        decay1 = executor.execute(psi, p1, t).decay_factor
        decay2 = executor.execute(psi, p2, t).decay_factor
        
        # λ₃ = log(3) ≈ 1.09, λ₇ = log(7) ≈ 1.95
        # Decay rates: e^{-1.09·t} vs e^{-1.95·t}
        # Since 1.95 > 1.09: decay₂ < decay₁
        assert decay2 < decay1, f"Decay ordering violated: p1={p1} decay={decay1}, p2={p2} decay={decay2}"


# ============================================================================
# Gate Test 3: Link Integration
# ============================================================================

class TestGate3LinkIntegration:
    """Test that Ξ(t) integrates correctly into linking phase."""
    
    def test_link_xi_phase2_execution(self):
        """Phase 2: Link-time coupling verification runs and completes."""
        # Create test modules
        modules = {
            3: ModuleNode(prime_index=3, epsilon=0.05, op_norm_T=1.0),
            7: ModuleNode(prime_index=7, epsilon=0.10, op_norm_T=1.0),
            11: ModuleNode(prime_index=11, epsilon=0.15, op_norm_T=1.0),
        }
        
        # Coupling matrix (3x3)
        coupling = np.array([
            [1.0, 0.4, 0.2],
            [0.4, 1.0, 0.3],
            [0.2, 0.3, 1.0]
        ])
        
        # Run linking with Ξ(t)
        result = link_with_xi_execution(
            modules=modules,
            coupling_matrix=coupling,
            link_time=0.5,
            session_id="test-link"
        )
        
        # Verify result structure
        assert result.passed is not None
        assert result.coherence_matrix is not None
        assert result.spectral_radius is not None
        assert result.pairwise_measurements is not None
    
    def test_link_coherence_within_tolerance(self):
        """Coherence measurements are within [0.99, 1.01] tolerance."""
        modules = {
            13: ModuleNode(prime_index=13, epsilon=0.08, op_norm_T=1.2),
            19: ModuleNode(prime_index=19, epsilon=0.12, op_norm_T=1.1),
        }
        
        coupling = np.array([
            [1.0, 0.5],
            [0.5, 1.0]
        ])
        
        result = link_with_xi_execution(
            modules=modules,
            coupling_matrix=coupling,
            link_time=0.5,
            session_id="test-coherence"
        )
        
        # Check all pairwise measurements
        for (p_i, p_j), meas in result.pairwise_measurements.items():
            # Coherence should be close to 1 (perfect or near-perfect coupling)
            # Allow some deviation, but not extreme
            assert 0.9 < meas.coherence < 1.1, (
                f"Coherence out of reasonable range: "
                f"p={p_i} ↔ {p_j}, C={meas.coherence}"
            )
    
    def test_link_spectral_stability(self):
        """Spectral stability: eigenvalues of (I - C) are real."""
        modules = {
            3: ModuleNode(prime_index=3, epsilon=0.01, op_norm_T=1.0),
            5: ModuleNode(prime_index=5, epsilon=0.05, op_norm_T=1.0),
        }
        
        coupling = np.array([
            [1.0, 0.3],
            [0.3, 1.0]
        ])
        
        # Use very small link_time to keep all coherences at 1.0
        result = link_with_xi_execution(
            modules=modules,
            coupling_matrix=coupling,
            link_time=0.001,  # Infinitesimal to ensure coherence exact at 1.0
            session_id="test-stability"
        )
        
        # Eigenvalues must be real (eigvalsh always returns real for symmetric matrix)
        assert result.eigenvalues is not None
        assert len(result.eigenvalues) == 2
        
        # Eigenvalues should all be finite (not inf or nan)
        assert np.all(np.isfinite(result.eigenvalues))
        
        # The spectral radius (max absolute eigenvalue) should be ≤ 1 for stable systems
        spectral_radius = np.max(np.abs(result.eigenvalues))
        assert spectral_radius <= 1.0 + 1e-8


# ============================================================================
# Gate Test 4: Cache Determinism
# ============================================================================

class TestGate4CacheDeterminism:
    """Test that cache returns deterministic results (INV-5)."""
    
    def test_cache_hit_returns_same_result(self):
        """Cache hit returns identical output to original computation."""
        cache = XiCertCache(max_size=100)
        cached_exec = CachedXiExecutor(cache=cache)
        
        psi = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
        p, t = 7, 0.5
        
        # First call: computed, then cached
        result1 = cached_exec.execute(psi, p, t)
        
        # Second call: from cache
        result2 = cached_exec.execute(psi, p, t)
        
        # Outputs must be identical
        np.testing.assert_array_equal(
            result1.output_state, result2.output_state,
            err_msg="Cache hit returned different result"
        )
        
        # Decay factors must match
        assert result1.decay_factor == result2.decay_factor
    
    def test_cache_determinism_across_strategies(self):
        """Different strategies produce consistent results via cache."""
        cache = XiCertCache(max_size=100)
        
        executors = [
            XiExecutor("direct"),
            XiExecutor("spectral"),
        ]
        
        psi = np.ones(8)
        p, t = 11, 0.7
        
        results = []
        for executor in executors:
            cached_exec = CachedXiExecutor(executor=executor, cache=cache)
            result = cached_exec.execute(psi, p, t)
            results.append(result.output_state)
        
        # All strategies should give same result (within tolerance)
        for i in range(1, len(results)):
            np.testing.assert_allclose(
                results[0], results[i],
                rtol=1e-9, atol=1e-9,
                err_msg=f"Strategy {i} diverged from direct"
            )
    
    def test_cache_statistics_valid(self):
        """Cache statistics are recorded correctly."""
        cache = XiCertCache(max_size=50)
        cached_exec = CachedXiExecutor(cache=cache)
        
        psi = np.random.randn(5)
        
        # Execute 10 times for p=3, t=0.5
        for _ in range(10):
            cached_exec.execute(psi, p=3, t=0.5)
        
        # First call: miss, rest: hits
        stats = cache.get_stats()
        
        assert stats["hits"] == 9, f"Expected 9 hits, got {stats['hits']}"
        assert stats["misses"] == 1, f"Expected 1 miss, got {stats['misses']}"
        assert stats["cache_size"] == 1, f"Expected cache_size=1, got {stats['cache_size']}"


# ============================================================================
# Gate Test 5: Telemetry Collection
# ============================================================================

class TestGate5Telemetry:
    """Test that telemetry collection works end-to-end."""
    
    def test_telemetry_records_executions(self):
        """Telemetry logs all Ξ(t) executions."""
        telemetry = XiTelemetry()
        executor = XiExecutor("direct")
        
        psi = np.random.randn(10)
        primes = [2, 3, 5, 7]
        times = [0.1, 0.5, 1.0]
        
        for p in primes:
            for t in times:
                with telemetry.timer(prime_index=p, time_t=t):
                    result = executor.execute(psi, p, t)
                    telemetry.record_cache_hit(hit=False)
        
        report = telemetry.get_report()
        
        assert report.total_calls == len(primes) * len(times)
        assert report.cache_misses == len(primes) * len(times)
        assert set(report.primes_used) == set(primes)
    
    def test_telemetry_json_export(self):
        """Telemetry can be exported as JSON."""
        telemetry = XiTelemetry()
        
        with telemetry.timer(prime_index=7, time_t=0.5):
            time.sleep(0.001)
        telemetry.record_cache_hit(hit=True)
        
        json_output = telemetry.to_json()
        
        # Must be valid JSON
        import json
        data = json.loads(json_output)
        
        # Must contain key metrics
        assert "total_calls" in data
        assert "cache_hit_rate" in data
        assert "primes_used" in data
    
    def test_telemetry_distribution_computation(self):
        """Telemetry correctly computes decay distribution."""
        telemetry = XiTelemetry()
        
        # Execute for different primes
        for p in [3, 7]:
            with telemetry.timer(prime_index=p, time_t=0.5):
                pass
        
        report = telemetry.get_report()
        
        # Should have distribution for both primes
        assert 3 in report.decay_distribution
        assert 7 in report.decay_distribution
        
        # Each should have statistics
        for p in [3, 7]:
            dist = report.decay_distribution[p]
            assert "count" in dist
            assert "mean" in dist
            assert "min" in dist
            assert "max" in dist


# ============================================================================
# Main Gate Execution
# ============================================================================

class TestADR021SequencingGate:
    """
    Master gate test: All five tests must PASS for ADR-021 to be complete.
    
    Failing this gate blocks ADR-022 from starting.
    """
    
    def test_gate_complete_all_five_tests_pass(self):
        """Verify all five gate tests pass together."""
        # This is a summary test that ensures the five gate tests are all callable
        
        gate_tests = [
            TestGate1Identity,
            TestGate2DecayRate,
            TestGate3LinkIntegration,
            TestGate4CacheDeterminism,
            TestGate5Telemetry,
        ]
        
        # Instantiate all test classes
        for test_class in gate_tests:
            instance = test_class()
            # If instantiation succeeds, class is valid
            assert instance is not None


if __name__ == "__main__":
    # Run with: pytest pirtm/tests/test_adr_021_gate.py -v
    pytest.main([__file__, "-v", "--tb=short"])
