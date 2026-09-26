"""Tests for Phase 2 Quantum-Inspired Algorithms."""

import pytest
import numpy as np
from pirtm.quantum_inspired import QuantumWalk, AmplitudeEstimation, EntanglementSimulator, VariationalQuantumOptimizer


class TestQuantumWalk:
    """Test quantum walk implementation."""

    def test_quantum_walk_initialization(self):
        """Test quantum walk setup."""
        graph = {0: [1], 1: [0, 2], 2: [1]}
        walk = QuantumWalk(graph)

        assert len(walk.get_probability_distribution()) == 3

    def test_quantum_walk_step(self):
        """Test single step of quantum walk."""
        graph = {0: [1], 1: [0]}
        walk = QuantumWalk(graph)

        initial_prob = walk.get_probability_distribution()
        walk.step()
        new_prob = walk.get_probability_distribution()

        # Probabilities should sum to 1
        assert abs(np.sum(new_prob) - 1.0) < 1e-10

    def test_quantum_walk_run(self):
        """Test running quantum walk for multiple steps."""
        graph = {0: [1], 1: [0, 2], 2: [1]}
        walk = QuantumWalk(graph)

        probabilities = walk.run(5)

        assert len(probabilities) == 6  # Initial + 5 steps
        for prob in probabilities:
            assert abs(np.sum(prob) - 1.0) < 1e-10


class TestAmplitudeEstimation:
    """Test amplitude estimation."""

    def test_amplitude_estimation(self):
        """Test basic amplitude estimation."""
        def oracle(x):
            return x % 2 == 0  # Even numbers are "good"

        estimator = AmplitudeEstimation(oracle)

        amplitude = estimator.estimate_amplitude([0, 2, 4], 10)

        # Should be close to sqrt(0.5) since half are even
        expected = np.sqrt(0.5)
        assert abs(amplitude - expected) < 0.2  # Statistical variation

    def test_quantum_amplitude_estimation(self):
        """Test quantum-inspired amplitude estimation."""
        # Simple unitary (Pauli-X)
        unitary = np.array([[0, 1], [1, 0]])

        estimator = AmplitudeEstimation(None)

        amplitude = estimator.quantum_amplitude_estimation(unitary)

        # Eigenvalues are ±1, so amplitudes are 1
        assert abs(amplitude - 1.0) < 1e-10


class TestEntanglementSimulator:
    """Test entanglement simulation."""

    def test_entanglement_initialization(self):
        """Test entanglement simulator setup."""
        simulator = EntanglementSimulator(4)

        assert len(simulator.states) == 4

    def test_bell_measurement(self):
        """Test Bell state measurement."""
        simulator = EntanglementSimulator(2)

        bell_type = simulator.bell_measurement(0, 1)

        # Should identify some Bell state
        assert bell_type in ["|Φ+⟩", "|Φ-⟩", "|Ψ+⟩", "|Ψ-⟩", "separable"]

    def test_gate_application(self):
        """Test applying quantum gates."""
        simulator = EntanglementSimulator(2)

        # Pauli-X gate
        pauli_x = np.array([[0, 1], [1, 0]])

        initial_state = simulator.states[0].to_complex().copy()
        simulator.apply_gate(pauli_x, [0])

        # State should be flipped
        final_state = simulator.states[0].to_complex()
        np.testing.assert_array_almost_equal(final_state, 1 - initial_state)


class TestVariationalQuantumOptimizer:
    """Test variational quantum optimization."""

    def test_optimization(self):
        """Test parameter optimization."""
        # Simple quadratic cost function
        def cost(params):
            return params[0]**2 + params[1]**2

        optimizer = VariationalQuantumOptimizer(cost, 2)

        optimal_params = optimizer.optimize(max_iterations=10)

        # Should converge toward (0, 0)
        assert np.linalg.norm(optimal_params) < 0.1


if __name__ == "__main__":
    pytest.main([__file__])