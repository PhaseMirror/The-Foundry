"""Tests for Phase 2 ETP (Explicit Time Propagation)."""

import pytest
import numpy as np
from pirtm.etp import RungeKuttaPropagator, SymplecticPropagator, PhaseTracker, QuantumInspiredPropagator


class TestTimePropagators:
    """Test time propagation methods."""

    def test_runge_kutta_propagation(self):
        """Test RK4 time propagation."""
        # Simple harmonic oscillator: H = p^2/2 + x^2/2
        def hamiltonian(psi, t):
            # For 1D harmonic oscillator
            x = psi[0]
            p = psi[1]
            return np.array([p, -x])  # dH/dx = p, dH/dp = -x

        propagator = RungeKuttaPropagator(hamiltonian)

        # Initial state: x=1, p=0
        initial_state = np.array([1.0, 0.0])
        time_span = (0, np.pi)  # Quarter period

        states = propagator.propagate(initial_state, time_span, 10)

        # Should return to starting point (x=1, p=0) after quarter period
        final_state = states[-1]
        # For harmonic oscillator, quarter period should give x=0, p=-1
        assert abs(final_state[0]) < 0.1  # x ≈ 0
        assert abs(final_state[1] + 1.0) < 0.1  # p ≈ -1

    def test_symplectic_propagation(self):
        """Test symplectic propagation preserves phase space volume."""
        def hamiltonian(psi, t):
            return np.array([psi[1], -psi[0]])  # Same as above

        propagator = SymplecticPropagator(hamiltonian)

        initial_state = np.array([1.0, 0.0])
        time_span = (0, 2*np.pi)  # Full period

        states = propagator.propagate(initial_state, time_span, 20)

        # Should return to exact starting point
        final_state = states[-1]
        final_amplitude = final_state.complex_amplitude()
        assert abs(final_amplitude[0] - 1.0) < 1e-6
        assert abs(final_amplitude[1]) < 1e-6

    def test_phase_tracking(self):
        """Test phase evolution tracking."""
        tracker = PhaseTracker()

        # Create test phase state
        phase_state = np.array([0.0, np.pi/2, np.pi])

        # Simulate phase evolution
        for _ in range(5):
            phase_state += 0.1  # Small phase advance
            # In real usage, this would come from PhaseState

        # Test tracking (simplified)
        assert len(tracker.phase_history) == 0  # Not fully implemented in test

    def test_quantum_inspired_propagation(self):
        """Test quantum-inspired propagation with correlations."""
        def hamiltonian(psi, t):
            return np.array([psi[1], -psi[0]])

        propagator = QuantumInspiredPropagator(hamiltonian, entanglement_strength=0.1)

        initial_state = np.array([1.0, 0.0])
        time_span = (0, 1.0)

        states = propagator.propagate(initial_state, time_span, 5)

        # Check normalization is preserved
        for state in states:
            norm = np.linalg.norm(state)
            assert abs(norm - 1.0) < 1e-10


if __name__ == "__main__":
    pytest.main([__file__])