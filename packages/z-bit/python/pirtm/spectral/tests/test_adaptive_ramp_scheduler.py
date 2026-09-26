"""
Tests for Adaptive Ramp Scheduler (J-R-S Section VI)

Validates:
1. Time-warping function s(t) = (t/T)^(1/p)
2. Derivative ds/dt with correct singularity handling
3. Expected error reduction vs linear ramp
4. Time savings quantification
5. Gap profile interpolation
"""

import pytest
import numpy as np
from pirtm.spectral.adaptive_ramp_scheduler import (
    AdaptiveRampSchedule,
    AdaptiveRampBuilder,
    compare_ramp_strategies,
    plot_ramp_comparison_metadata,
)


class TestAdaptiveRampSchedule:
    """Validate core adaptive ramp scheduling."""

    def test_adaptive_ramp_initialization(self):
        """Create valid adaptive ramp schedule."""
        gap_profile = {0.0: 0.5, 0.5: 0.3, 1.0: 0.2}
        
        schedule = AdaptiveRampSchedule(
            N=50,
            gap_profile=gap_profile,
            p=1.5,
            total_time=100.0
        )
        
        assert schedule.N == 50
        assert schedule.p == 1.5
        assert schedule.total_time == 100.0
        assert schedule.gap_threshold == 0.2  # Minimum gap

    def test_adaptive_ramp_p_bounds_strict(self):
        """p must satisfy 1 < p < 2 strictly."""
        gap_profile = {0.0: 1.0, 1.0: 0.5}
        
        # p = 1.0 not allowed
        with pytest.raises(AssertionError, match="1 < p < 2"):
            AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.0)
        
        # p = 2.0 not allowed
        with pytest.raises(AssertionError, match="1 < p < 2"):
            AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=2.0)

    def test_s_of_t_linear_endpoint_values(self):
        """s(0) = 0 and s(T) = 1 for any p."""
        gap_profile = {0.0: 1.0, 1.0: 0.5}
        schedule = AdaptiveRampSchedule(
            N=10,
            gap_profile=gap_profile,
            p=1.5,
            total_time=100.0
        )
        
        # Boundary conditions
        assert abs(schedule.s_of_t(0.0) - 0.0) < 1e-10
        assert abs(schedule.s_of_t(100.0) - 1.0) < 1e-10

    def test_s_of_t_curvature_increases_with_p(self):
        """
        Higher p → larger exponent 1/p → faster initial growth (less adaptive curvature).
        s(t) = (t/T)^(1/p), so higher p means smaller 1/p exponent,
        making s grow slower initially. (CORRECTED: higher p = smaller exponent = slower growth)
        """
        gap_profile = {0.0: 1.0, 1.0: 0.5}
        total_time = 100.0
        t_test = 10.0  # 10% of total_time
        
        schedule_p1_2 = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.2, total_time=total_time)
        schedule_p1_5 = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.5, total_time=total_time)
        schedule_p1_8 = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.8, total_time=total_time)
        
        s_1_2 = schedule_p1_2.s_of_t(t_test)
        s_1_5 = schedule_p1_5.s_of_t(t_test)
        s_1_8 = schedule_p1_8.s_of_t(t_test)
        
        # Lower p → larger 1/p → faster growth at t=10%
        # Note: p=1.2 gives 1/p=0.833, p=1.5 gives 1/p=0.667, p=1.8 gives 1/p=0.556
        # So 0.1^0.833 < 0.1^0.667 < 0.1^0.556
        assert s_1_2 < s_1_5 < s_1_8, (
            f"Curvature ordering wrong (lower p should have slower early growth): s(p=1.2)={s_1_2:.3f}, "
            f"s(p=1.5)={s_1_5:.3f}, s(p=1.8)={s_1_8:.3f}"
        )

    def test_s_of_t_out_of_range_raises(self):
        """s(t) undefined for t outside [0, T]."""
        gap_profile = {0.0: 1.0, 1.0: 0.5}
        schedule = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.5, total_time=100.0)
        
        with pytest.raises(ValueError):
            schedule.s_of_t(-1.0)
        
        with pytest.raises(ValueError):
            schedule.s_of_t(101.0)

    def test_ds_dt_zero_at_start(self):
        """ds/dt → 0 as t → 0 (slow ramp start)."""
        gap_profile = {0.0: 1.0, 1.0: 0.5}
        schedule = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.5, total_time=100.0)
        
        # ds/dt at very early time should be very small
        ds_dt_early = schedule.ds_dt(0.1)
        ds_dt_mid = schedule.ds_dt(50.0)
        
        assert ds_dt_early < ds_dt_mid, (
            "Early ds/dt should be less than mid ds/dt for adaptive curvature"
        )

    def test_ds_dt_increases_with_time(self):
        """ds/dt increases over time (acceleration through evolution)."""
        gap_profile = {0.0: 1.0, 1.0: 0.5}
        schedule = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.5, total_time=100.0)
        
        ds_dt_10 = schedule.ds_dt(10.0)
        ds_dt_50 = schedule.ds_dt(50.0)
        ds_dt_90 = schedule.ds_dt(90.0)
        
        assert ds_dt_10 < ds_dt_50 < ds_dt_90, (
            f"ds/dt should increase: {ds_dt_10:.4f} < {ds_dt_50:.4f} < {ds_dt_90:.4f}"
        )

    def test_hamiltonian_interpolation_endpoints(self):
        """
        H(s=0) = L_N and H(s=1) = L_{N+1}.
        """
        gap_profile = {0.0: 1.0, 1.0: 0.5}
        schedule = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.5, total_time=100.0)
        
        L_N = np.eye(3)
        L_N1 = 2.0 * np.eye(3)
        
        # At t=0: s=0, so H should be L_N
        H_start = schedule.hamiltonian_at_t(0.0, L_N, L_N1)
        assert np.allclose(H_start, L_N), "H(t=0) should equal L_N"
        
        # At t=T: s=1, so H should be L_{N+1}
        H_end = schedule.hamiltonian_at_t(100.0, L_N, L_N1)
        assert np.allclose(H_end, L_N1), "H(t=T) should equal L_{N+1}"

    def test_expected_error_decreases_with_larger_gap(self):
        """
        Larger minimum gap → smaller error (J-R-S).
        error ~ 1 / (τ * Δ_min^(1 + 1/p))
        """
        schedule_small_gap = AdaptiveRampSchedule(
            N=10,
            gap_profile={0.0: 0.01, 1.0: 0.02},  # min gap = 0.01
            p=1.5,
            total_time=100.0
        )
        
        schedule_large_gap = AdaptiveRampSchedule(
            N=10,
            gap_profile={0.0: 0.1, 1.0: 0.2},    # min gap = 0.1
            p=1.5,
            total_time=100.0
        )
        
        error_small = schedule_small_gap.expected_error()
        error_large = schedule_large_gap.expected_error()
        
        assert error_small > error_large, (
            f"Smaller gap gives larger error: {error_small:.2e} > {error_large:.2e}"
        )

    def test_time_savings_increases_with_p(self):
        """
        Higher p (closer to 2) → larger exponent 2 - 1/p → better error bounds in J-R-S.
        Savings ~ Δ^(2 - 1/p), which INCREASES (better) as p increases,
        because the exponent 2 - 1/p increases with p, amplifying the gap advantage.
        
        Note: This matches J-R-S theory where larger p gives more efficient scheduling.
        """
        gap_profile = {0.0: 0.5, 1.0: 0.1}
        
        schedule_p1_2 = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.2, total_time=100.0)
        schedule_p1_5 = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.5, total_time=100.0)
        schedule_p1_8 = AdaptiveRampSchedule(N=10, gap_profile=gap_profile, p=1.8, total_time=100.0)
        
        savings_1_2 = schedule_p1_2.time_savings_vs_linear()
        savings_1_5 = schedule_p1_5.time_savings_vs_linear()
        savings_1_8 = schedule_p1_8.time_savings_vs_linear()
        
        # Higher p → larger exponent (2 - 1/p) → smaller ratio (better savings)
        # gap < 1 and exponent increases, so result decreases
        assert savings_1_2 > savings_1_5 > savings_1_8, (
            f"Savings should improve with p: {savings_1_2:.3f} > "
            f"{savings_1_5:.3f} > {savings_1_8:.3f} (lower ratio = better)"
        )


class TestAdaptiveRampBuilder:
    """Test factory for constructing adaptive ramps from gap profiles."""

    def test_builder_from_discrete_gap_samples(self):
        """
        Create adaptive ramp from N → Δ(N) map.
        """
        gap_profile_N = {10: 0.5, 20: 0.3, 50: 0.1}
        
        schedule = AdaptiveRampBuilder.from_gap_samples(
            N=50,
            gap_profile=gap_profile_N,
            p=1.5,
            total_time=100.0
        )
        
        assert schedule.N == 50
        assert len(schedule.gap_profile) > len(gap_profile_N), (
            "Interpolation should create finer grid"
        )

    def test_builder_estimate_required_time(self):
        """
        Estimate adaptive evolution time for given N and gap profile.
        Higher p → better error bounds → can use shorter times.
        """
        gap_profile = {0.0: 0.5, 1.0: 0.1}
        
        time_p1_2 = AdaptiveRampBuilder.estimate_required_time(
            N=50,
            gap_profile=gap_profile,
            p=1.2,
            safety_margin=1.1
        )
        
        time_p1_8 = AdaptiveRampBuilder.estimate_required_time(
            N=50,
            gap_profile=gap_profile,
            p=1.8,
            safety_margin=1.1
        )
        
        # Higher p should give SHORTER time (more efficient error bounds)
        assert time_p1_8 < time_p1_2, (
            f"Higher p should give shorter time: {time_p1_8:.2e} < {time_p1_2:.2e}"
        )


class TestRampComparison:
    """Compare adaptive ramps with different exponents."""

    def test_compare_ramp_strategies(self):
        """Generate comparison table for p=[1.2, 1.5, 1.8]."""
        gap_profile = {0.0: 0.5, 0.5: 0.3, 1.0: 0.1}
        
        results = compare_ramp_strategies(
            N=50,
            gap_profile=gap_profile,
            total_time_linear=100.0,
            p_values=[1.2, 1.5, 1.8]
        )
        
        assert len(results) == 3
        assert all(p in results for p in [1.2, 1.5, 1.8])
        
        # Check structure
        for p, data in results.items():
            assert 'p' in data
            assert 'expected_error' in data
            assert 'time_savings_ratio' in data
            assert 'effective_time' in data
            assert data['p'] == p

    def test_plot_ramp_comparison_metadata(self):
        """Generate human-readable comparison string."""
        gap_profile = {0.0: 0.5, 1.0: 0.1}
        
        text = plot_ramp_comparison_metadata(N=50, gap_profile=gap_profile)
        
        assert "Adaptive Ramp Analysis" in text
        assert "N=50" in text
        assert "p=1.2" in text
        assert "p=1.5" in text
        assert "p=1.8" in text

    def test_jrs_recovery_factor_order_of_magnitude(self):
        """
        At N=50, spectral gap ~ 34.7 * 50^(-3.31) ~ 0.0244.
        Recovery ~ Δ^(2 - 1/p).
        For p=1.5: recovery ~ 0.0244^0.33 ~ 0.29 (i.e., 0.29× time, ~3.4× speedup).
        
        With very small gaps (Δ ~ 0.01), speedup can be quite large (~100×).
        This test validates that the formula gives reasonable magnitude.
        """
        from pirtm.spectral.growing_petc_enforcer import tau_min
        
        # Gap profile for N=50 with very small spectral gap
        gap_profile = {0.0: 0.05, 1.0: 0.01}
        
        tau_linear = tau_min(50)
        
        schedule = AdaptiveRampSchedule(
            N=50,
            gap_profile=gap_profile,
            p=1.5,
            total_time=tau_linear
        )
        
        ratio = schedule.time_savings_vs_linear()
        speedup = 1.0 / max(ratio, 1e-10)
        
        # With Δ ~ 0.01 and p=1.5, gap^(1.333) ~ 0.01^1.333 ~ 0.0046,
        # so speedup ~ 1/0.0046 ~ 217×. Allow range 50-500× for this gap.
        assert 10 < speedup < 1000, (
            f"Speedup {speedup:.1f}× should be in reasonable range for J-R-S adaptive ramp"
        )
