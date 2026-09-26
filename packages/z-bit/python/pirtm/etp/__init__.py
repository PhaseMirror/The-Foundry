"""Explicit Time Propagation (ETP) for PIRTM Phase 2.

Implements time evolution with phase tracking, symplectic integrators,
and quantum-inspired time propagation methods.
"""

from __future__ import annotations

from typing import Any, Callable, List, Optional, Tuple, Union
from dataclasses import dataclass
import numpy as np
import cmath


@dataclass
class PhaseState:
    """State with phase information for time propagation."""
    amplitude: np.ndarray
    phase: np.ndarray
    time: float

    def complex_amplitude(self) -> np.ndarray:
        """Convert amplitude and phase to complex representation."""
        return self.amplitude * np.exp(1j * self.phase)

    @classmethod
    def from_complex(cls, psi: np.ndarray, time: float) -> PhaseState:
        """Create PhaseState from complex amplitude array."""
        amplitude = np.abs(psi)
        phase = np.angle(psi)
        return cls(amplitude, phase, time)


class TimePropagator:
    """Base class for time propagation methods."""

    def __init__(self, hamiltonian: Callable[[np.ndarray, float], np.ndarray]):
        self.hamiltonian = hamiltonian

    def propagate(
        self,
        initial_state: Union[np.ndarray, PhaseState],
        time_span: Tuple[float, float],
        num_steps: int = 100
    ) -> List[Union[np.ndarray, PhaseState]]:
        """Propagate state through time."""
        raise NotImplementedError


class RungeKuttaPropagator(TimePropagator):
    """4th-order Runge-Kutta time propagation."""

    def propagate(
        self,
        initial_state: Union[np.ndarray, PhaseState],
        time_span: Tuple[float, float],
        num_steps: int = 100
    ) -> List[np.ndarray]:

        if isinstance(initial_state, PhaseState):
            psi = initial_state.complex_amplitude()
        else:
            psi = initial_state

        t_start, t_end = time_span
        dt = (t_end - t_start) / num_steps

        states = [psi.copy()]
        t = t_start

        for _ in range(num_steps):
            # RK4 integration for iℏ ∂ψ/∂t = H ψ
            # Convert to Schrödinger equation form
            k1 = -1j * self.hamiltonian(psi, t)
            k2 = -1j * self.hamiltonian(psi + 0.5 * dt * k1, t + 0.5 * dt)
            k3 = -1j * self.hamiltonian(psi + 0.5 * dt * k2, t + 0.5 * dt)
            k4 = -1j * self.hamiltonian(psi + dt * k3, t + dt)

            psi = psi + (dt / 6) * (k1 + 2*k2 + 2*k3 + k4)
            t += dt
            states.append(psi.copy())

        return states


class SymplecticPropagator(TimePropagator):
    """Symplectic integrator preserving phase space volume."""

    def propagate(
        self,
        initial_state: Union[np.ndarray, PhaseState],
        time_span: Tuple[float, float],
        num_steps: int = 100
    ) -> List[PhaseState]:

        if isinstance(initial_state, PhaseState):
            state = initial_state
        else:
            state = PhaseState.from_complex(initial_state, time_span[0])

        t_start, t_end = time_span
        dt = (t_end - t_start) / num_steps

        states = [state]
        t = t_start

        for _ in range(num_steps):
            # Symplectic Euler method for phase space
            # Update momentum (phase) first, then position (amplitude)

            # Compute forces (Hamiltonian gradients)
            H = self.hamiltonian(state.complex_amplitude(), t)

            # Update phase (conjugate momentum)
            phase_derivative = np.real(H)  # Simplified
            state.phase += dt * phase_derivative

            # Update amplitude (position)
            amplitude_derivative = -np.imag(H)  # Simplified
            state.amplitude += dt * amplitude_derivative

            state.time = t + dt
            t = state.time

            states.append(PhaseState(state.amplitude.copy(), state.phase.copy(), state.time))

        return states


class PhaseTracker:
    """Tracks phase evolution and detects phase transitions."""

    def __init__(self, phase_threshold: float = np.pi):
        self.phase_threshold = phase_threshold
        self.phase_history: List[np.ndarray] = []

    def track_phase(self, state: PhaseState) -> Dict[str, Any]:
        """Track phase changes and detect transitions."""

        self.phase_history.append(state.phase.copy())

        if len(self.phase_history) < 2:
            return {"phase_change": 0.0, "transition_detected": False}

        # Compute phase difference
        phase_diff = self.phase_history[-1] - self.phase_history[-2]
        phase_change = np.abs(phase_diff)

        # Detect phase transitions (unwrap phase jumps)
        transition_detected = np.any(phase_change > self.phase_threshold)

        return {
            "phase_change": float(np.max(phase_change)),
            "transition_detected": bool(transition_detected),
            "total_phase_accumulation": float(np.sum(self.phase_history[-1]))
        }

    def get_phase_velocity(self) -> np.ndarray:
        """Compute instantaneous phase velocity."""
        if len(self.phase_history) < 2:
            return np.zeros_like(self.phase_history[0])

        return self.phase_history[-1] - self.phase_history[-2]


class QuantumInspiredPropagator(TimePropagator):
    """Quantum-inspired time propagation with entanglement-like correlations."""

    def __init__(self, hamiltonian: Callable[[np.ndarray, float], np.ndarray], entanglement_strength: float = 0.1):
        super().__init__(hamiltonian)
        self.entanglement_strength = entanglement_strength

    def propagate(
        self,
        initial_state: Union[np.ndarray, PhaseState],
        time_span: Tuple[float, float],
        num_steps: int = 100
    ) -> List[np.ndarray]:

        if isinstance(initial_state, PhaseState):
            psi = initial_state.complex_amplitude()
        else:
            psi = initial_state

        t_start, t_end = time_span
        dt = (t_end - t_start) / num_steps

        states = [psi.copy()]
        t = t_start

        for _ in range(num_steps):
            # Standard Schrödinger evolution
            H_psi = self.hamiltonian(psi, t)
            psi = psi - 1j * dt * H_psi

            # Add quantum-inspired entanglement correlations
            psi = self._apply_entanglement_correlation(psi, dt)

            # Normalize to preserve probability
            psi = psi / np.linalg.norm(psi)

            t += dt
            states.append(psi.copy())

        return states

    def _apply_entanglement_correlation(self, psi: np.ndarray, dt: float) -> np.ndarray:
        """Apply entanglement-like correlations between components."""

        n = len(psi)
        correlated_psi = psi.copy()

        # Create correlations between neighboring components
        for i in range(n):
            for j in range(i + 1, min(i + 3, n)):  # Local correlations
                # Entanglement-like phase correlation
                phase_correlation = self.entanglement_strength * dt * np.angle(psi[i] * np.conj(psi[j]))
                correlated_psi[i] *= cmath.exp(1j * phase_correlation)
                correlated_psi[j] *= cmath.exp(-1j * phase_correlation)

        return correlated_psi


def create_time_dependent_hamiltonian(
    base_hamiltonian: np.ndarray,
    time_dependence: Callable[[float], float]
) -> Callable[[np.ndarray, float], np.ndarray]:
    """Create time-dependent Hamiltonian."""

    def H_t(psi: np.ndarray, t: float) -> np.ndarray:
        time_factor = time_dependence(t)
        return time_factor * base_hamiltonian @ psi

    return H_t