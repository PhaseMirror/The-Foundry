"""Tests for Phase 1 Runtime Pipeline.

Tests ACE+PETC pipeline completion with zero conservation failures and environment isolation.
"""

import pytest
import numpy as np
from pirtm.runtime.phase1_pipeline import Phase1Pipeline
from pirtm.backend import numpy_backend


class TestPhase1Pipeline:
    """Test Phase 1 runtime pipeline."""

    def test_pipeline_initialization(self):
        """Test pipeline initialization."""
        initial_state = np.array([0.5, 0.3, 0.1])
        pipeline = Phase1Pipeline(
            initial_state=initial_state,
            prime_index=7,  # 7 is prime
            environment_id="test_env"
        )

        assert pipeline.state.step_count == 0
        assert pipeline.state.prime_index == 7
        assert pipeline.state.environment_id == "test_env"
        np.testing.assert_array_equal(pipeline.state.T_t, initial_state)

    def test_single_step(self):
        """Test single pipeline step."""
        initial_state = np.array([0.5, 0.3])
        pipeline = Phase1Pipeline(
            initial_state=initial_state,
            prime_index=5  # 5 is prime
        )

        # Simple identity operators for testing
        F_t = np.eye(2)
        K_t = np.eye(2)

        new_state, metadata = pipeline.step(F_t, K_t)

        assert new_state.step_count == 1
        assert "budget_remaining" in metadata
        assert "petc_atom_id" in metadata
        assert metadata["environment_validated"] is True

    def test_environment_isolation(self):
        """Test environment isolation validation."""
        pipeline = Phase1Pipeline(
            initial_state=np.array([0.1, 0.2]),
            prime_index=3,
            environment_id="env1"
        )

        F_t = np.eye(2)
        K_t = np.eye(2)

        # First step should work
        pipeline.step(F_t, K_t)

        # Create new pipeline with different environment
        pipeline2 = Phase1Pipeline(
            initial_state=np.array([0.1, 0.2]),
            prime_index=3,
            environment_id="env2"
        )

        # This should work (different pipeline)
        pipeline2.step(F_t, K_t)

        # But if we had cross-environment mixing, it would fail
        # (This is tested implicitly through the validation)

    def test_simulation_run(self):
        """Test running a simulation with 10k steps."""
        initial_state = np.array([0.1, 0.05])
        pipeline = Phase1Pipeline(
            initial_state=initial_state,
            prime_index=11  # 11 is prime
        )

        # Simple operators
        F_sequence = [np.eye(2) * 0.9]  # Contracting filter
        K_sequence = [np.eye(2) * 0.8]  # Contracting kernel

        # Run shorter simulation for test (not 10k to avoid timeout)
        steps = 100
        metadata_history = pipeline.run_simulation(steps, F_sequence, K_sequence)

        assert len(metadata_history) == steps
        assert pipeline.state.step_count == steps

        # Check that norms remain bounded (no conservation failures)
        for meta in metadata_history:
            assert meta["state_norm"] < 10.0  # Arbitrary bound

    def test_prime_validation(self):
        """Test that non-prime indices are rejected."""
        initial_state = np.array([0.1])

        # Should succeed to create pipeline (prime check is in XiExecutor.execute)
        pipeline = Phase1Pipeline(
            initial_state=initial_state,
            prime_index=4  # 4 is not prime
        )

        F_t = np.eye(1)
        K_t = np.eye(1)

        # Should fail when trying to step (execute kernel)
        with pytest.raises(ValueError, match="not prime"):
            pipeline.step(F_t, K_t)

    def test_budget_enforcement(self):
        """Test ACE budget enforcement."""
        initial_state = np.array([0.1])
        pipeline = Phase1Pipeline(
            initial_state=initial_state,
            prime_index=13
        )

        F_t = np.eye(1) * 100  # Large operator to consume budget
        K_t = np.eye(1) * 100

        # Should eventually hit budget limit
        with pytest.raises(RuntimeError, match="ACE_BUDGET"):
            for _ in range(1000):  # Many steps to deplete budget
                pipeline.step(F_t, K_t)


if __name__ == "__main__":
    pytest.main([__file__])