"""
C-06: Tests for gap profile CSV loading and schedule validation.

Validates:
  1. petc_gap_profiles.csv loads correctly
  2. validate_schedule() returns True for valid dwell times
  3. validate_schedule() returns False for insufficient dwell times
  4. Boundary case: dwell_time exactly = tau_min(N) is accepted
  5. N=50 dwell time matches spec (215 seconds at 540K steps/sec)

Reference: ADR-020, Gate C C-06
"""

from __future__ import annotations

import sys
from pathlib import Path
import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from pirtm.spectral.growing_petc_enforcer import (
    GrowingPETCEnforcer,
    tau_min,
    PREFACTOR,
    N_EXPONENT,
)

_CSV_PATH = REPO_ROOT / "pirtm" / "data" / "petc_gap_profiles.csv"


class TestGapProfileCSV:
    """Validate the petc_gap_profiles.csv deliverable (C-06)."""

    def test_csv_exists(self):
        """Gap profile CSV must exist at the expected path."""
        assert _CSV_PATH.exists(), (
            f"petc_gap_profiles.csv not found at {_CSV_PATH}. "
            "C-06 deliverable missing."
        )

    def test_csv_loads_correctly(self):
        """CSV must load into a dict with N=1..100 entries."""
        profile = GrowingPETCEnforcer.load_gap_profile(str(_CSV_PATH))
        assert len(profile) >= 100, (
            f"Expected ≥100 entries, got {len(profile)}"
        )
        assert 10 in profile
        assert 20 in profile
        assert 50 in profile

    def test_gap_values_positive(self):
        """All Δ(N) values must be positive (spectral gap > 0)."""
        profile = GrowingPETCEnforcer.load_gap_profile(str(_CSV_PATH))
        for N, delta in profile.items():
            assert delta > 0, f"Δ({N}) = {delta} ≤ 0 (invalid)"

    def test_gap_decreases_with_n(self):
        """Δ(N) must be non-increasing for N ≥ 2 (gap closes with complexity)."""
        profile = GrowingPETCEnforcer.load_gap_profile(str(_CSV_PATH))
        prev_delta = profile.get(2, float("inf"))
        for N in range(3, 51):
            if N not in profile:
                continue
            delta = profile[N]
            assert delta <= prev_delta * 1.01, (  # 1% tolerance for numeric noise
                f"Δ({N}) = {delta:.6e} > Δ({N-1}) = {prev_delta:.6e}: "
                "gap profile must be non-increasing"
            )
            prev_delta = delta

    def test_load_into_enforcer(self):
        """load_gap_profile_into_enforcer populates _gap_profile."""
        enforcer = GrowingPETCEnforcer()
        enforcer.load_gap_profile_into_enforcer(str(_CSV_PATH))
        assert len(enforcer._gap_profile) >= 100


class TestValidateSchedule:
    """validate_schedule() correctness (C-06 acceptance gate)."""

    def test_valid_schedule_passes(self):
        """
        Schedule with dwell_times ≥ tau_min(N) for all N must return True.
        """
        enforcer = GrowingPETCEnforcer()
        # Provide 2× tau_min for each N
        dwell_times = {N: tau_min(N) * 2.0 for N in [10, 20, 50]}
        ok, diags = enforcer.validate_schedule(dwell_times)
        assert ok, f"Expected True but got violations: {diags}"
        for d in diags:
            assert "VALID" in d

    def test_invalid_schedule_fails(self):
        """
        Schedule with dwell_time < tau_min(N) at N=50 must return False.
        """
        enforcer = GrowingPETCEnforcer()
        tau50 = tau_min(50)
        # Provide only 10% of the required time at N=50
        dwell_times = {N: tau_min(N) * 2.0 for N in [10, 20]}
        dwell_times[50] = tau50 * 0.10  # insufficient
        ok, diags = enforcer.validate_schedule(dwell_times)
        assert not ok, "Expected False (N=50 violation) but got True"
        # Find the N=50 diagnostic
        n50_diag = next((d for d in diags if "N= 50" in d), None)
        assert n50_diag is not None
        assert "VIOLATION" in n50_diag

    def test_boundary_schedule_passes(self):
        """
        Boundary case: dwell_time exactly equal to tau_min(N) must pass.
        (Boundary is OK: τ_min(N) is the minimum, not exclusive lower bound.)
        """
        enforcer = GrowingPETCEnforcer()
        dwell_times = {N: tau_min(N) for N in [10, 20, 50]}
        ok, diags = enforcer.validate_schedule(dwell_times)
        assert ok, f"Boundary case failed: {diags}"

    def test_n50_wallclock_215_seconds(self):
        """
        At N=50 and 540K steps/sec, required dwell time ≈ 215 seconds.
        ADR-020 spec: ~185-215 seconds (PREFACTOR × 50^6.93 / 540000).
        """
        steps_per_sec = 540_000.0
        tau_50 = tau_min(50)
        wallclock = tau_50 / steps_per_sec

        # Spec says ~185-215 seconds
        assert 150 < wallclock < 250, (
            f"tau_min(50) / 540K = {wallclock:.1f}s, "
            "expected 150-250 s range (spec: ~185-215 s)"
        )
        print(f"\n  N=50 required dwell time: {wallclock:.1f}s at 540K steps/sec")

    def test_enforce_schedule_with_wallclock_hints(self):
        """
        Enforcer with steps_per_second set emits wall-clock hints in diagnostics.
        """
        enforcer = GrowingPETCEnforcer(steps_per_second=540_000.0)
        dwell_times = {50: tau_min(50) * 0.5}  # insufficient
        ok, diags = enforcer.validate_schedule(dwell_times)
        assert not ok
        assert len(diags) > 0, "Expected at least one diagnostic line"
        n50_diag = diags[0]
        # Should include wall-clock hint
        assert "s at" in n50_diag or "steps/s" in n50_diag, (
            f"Wall-clock hint missing from diagnostic: {n50_diag!r}"
        )

    def test_empty_schedule_passes(self):
        """Empty schedule has no constraints to violate."""
        enforcer = GrowingPETCEnforcer()
        ok, diags = enforcer.validate_schedule({})
        assert ok
        assert diags == []

    def test_diagnostics_include_n_value(self):
        """Each diagnostic line must cite the N value."""
        enforcer = GrowingPETCEnforcer()
        dwell_times = {N: tau_min(N) * 2 for N in [10, 20, 50]}
        _, diags = enforcer.validate_schedule(dwell_times)
        for d in diags:
            assert "N=" in d, f"N value missing from diagnostic: {d!r}"


class TestC04SpectralEnforcementPass:
    """C-04: Spectral enforcement pass unit tests (via enforcer import)."""

    def test_pass_accepts_contractive(self):
        """r(Λ) = 0.7 < 1 - 0.05 = 0.95 → pass."""
        from pirtm.mlir.spectral_enforcement_pass import SpectralEnforcementPass
        p = SpectralEnforcementPass(epsilon=0.05, spectral_radius=0.7)
        result = p.run()
        assert result.passed
        assert "PASS" in result.diagnostic

    def test_pass_rejects_divergent(self):
        """r(Λ) = 1.1 ≥ 0.95 → fail."""
        from pirtm.mlir.spectral_enforcement_pass import SpectralEnforcementPass
        p = SpectralEnforcementPass(epsilon=0.05, spectral_radius=1.1)
        result = p.run()
        assert not result.passed
        assert "FAILED" in result.diagnostic
        assert "1.100000" in result.diagnostic  # includes actual r(Λ)

    def test_pass_rejects_marginal(self):
        """r(Λ) = 0.95 = 1 - 0.05 (not strictly less) → fail."""
        from pirtm.mlir.spectral_enforcement_pass import SpectralEnforcementPass
        p = SpectralEnforcementPass(epsilon=0.05, spectral_radius=0.95)
        result = p.run()
        assert not result.passed

    def test_network_enforcement_from_matrix(self):
        """enforce_network_spectral_condition works on 2×2 matrix."""
        from pirtm.mlir.spectral_enforcement_pass import enforce_network_spectral_condition
        # [[0, 0.35], [0.35, 0]] has spectral radius 0.35 < 1 - 0.05
        result = enforce_network_spectral_condition(
            [[0.0, 0.35], [0.35, 0.0]],
            epsilon=0.05,
            raise_on_failure=False,
        )
        assert result.passed
        assert abs(result.spectral_radius - 0.35) < 1e-10

    def test_network_enforcement_rejects_high_r(self):
        """[[0, 1.1], [1.0, 0]] has r ≈ 1.048 → fail."""
        from pirtm.mlir.spectral_enforcement_pass import (
            enforce_network_spectral_condition,
            SpectralEnforcementError,
        )
        result = enforce_network_spectral_condition(
            [[0.0, 1.1], [1.0, 0.0]],
            epsilon=0.05,
            raise_on_failure=False,
        )
        assert not result.passed
        assert result.spectral_radius > 1.0


if __name__ == "__main__":
    import subprocess
    sys.exit(subprocess.call([sys.executable, "-m", "pytest", __file__, "-v", "-s"]))
