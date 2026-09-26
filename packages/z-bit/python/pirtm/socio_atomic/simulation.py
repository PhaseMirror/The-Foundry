"""Socio-Atomic Simulation Engine for PIRTM Phase 3.

Implements time-stepping dynamics for socio-atomic models with stability analysis.
"""

from __future__ import annotations

from typing import Any, Callable, Dict, List, Optional, Tuple
from dataclasses import dataclass
import numpy as np

from . import SocioAtomicModel, Atom, Interaction, AtomType


@dataclass
class SimulationState:
    """State of a socio-atomic simulation at a timestep."""
    time: int
    model: SocioAtomicModel
    regime: str
    reciprocity_observables: Dict[str, float]
    constraint_satisfied: bool


class SocioAtomicSimulator:
    """Simulator for socio-atomic dynamics."""

    def __init__(self, model: SocioAtomicModel, update_rule: Optional[Callable] = None):
        self.model = model
        self.update_rule = update_rule or self._default_update
        self.history: List[SimulationState] = []

    def _default_update(self, interaction: Interaction) -> None:
        """Default update rule: adjust strength based on reciprocity."""
        # Increase strength if reciprocal, decrease if not
        if interaction.reciprocal:
            interaction.strength = min(1.0, interaction.strength * 1.05)
        else:
            interaction.strength = max(0.01, interaction.strength * 0.95)

    def step(self) -> Tuple[SimulationState, bool]:
        """Execute one simulation step."""

        # Update interactions
        for interaction in self.model.interactions:
            self.update_rule(interaction)

        # Check constraints
        constraints_ok = self.model.validate_ace_petc_constraints()

        # Compute observables
        reciprocity_obs = {}
        individuals = [a for a in self.model.atoms.values() if a.atom_type == AtomType.INDIVIDUAL]

        for atom in individuals:
            reciprocity_obs[atom.id] = self.model.compute_reciprocity_observable(atom)

        regime = self.model.classify_regime()

        state = SimulationState(
            time=len(self.history),
            model=self.model,
            regime=regime,
            reciprocity_observables=reciprocity_obs,
            constraint_satisfied=constraints_ok
        )

        self.history.append(state)

        return state, constraints_ok

    def run(self, num_steps: int) -> Tuple[List[SimulationState], bool]:
        """Run simulation for specified number of steps."""

        states = []
        for _ in range(num_steps):
            state, constraints_ok = self.step()
            states.append(state)

            if not constraints_ok:
                return states, False

        return states, True

    def analyze_trajectory(self) -> Dict[str, Any]:
        """Analyze simulation trajectory."""

        if not self.history:
            return {"error": "No history"}

        regimes = [s.regime for s in self.history]
        regime_transitions = sum(1 for i in range(1, len(regimes)) if regimes[i] != regimes[i-1])

        # Compute stability metric
        regime_stability = 1.0 - (regime_transitions / len(self.history)) if len(self.history) > 1 else 1.0

        # Track reciprocity observable evolution
        final_observables = self.history[-1].reciprocity_observables if self.history else {}
        avg_final_observable = np.mean(list(final_observables.values())) if final_observables else 1.0

        return {
            "total_steps": len(self.history),
            "regime_transitions": regime_transitions,
            "regime_stability": regime_stability,
            "final_regime": self.history[-1].regime if self.history else "undefined",
            "avg_final_reciprocity_observable": avg_final_observable,
            "constraints_always_satisfied": all(s.constraint_satisfied for s in self.history)
        }


class DataFittingSocioAtomicModel(SocioAtomicModel):
    """Socio-atomic model that can be fit to social interaction data."""

    def __init__(self, name: str = "FittedSocioModel"):
        super().__init__(name)
        self.fitted = False

    def fit_from_data(
        self,
        individuals: List[str],
        interactions: List[Tuple[str, str, float, bool]],
        prime_sequence: Optional[List[int]] = None
    ) -> None:
        """Fit model from social interaction data.

        Args:
            individuals: List of individual IDs
            interactions: List of (source, target, strength, reciprocal) tuples
            prime_sequence: Optional list of primes for individuals
        """

        # Use default primes if not provided
        if prime_sequence is None:
            primes = self._generate_primes(len(individuals))
        else:
            primes = prime_sequence

        # Add individuals
        for ind_id, prime in zip(individuals, primes):
            self.add_individual(ind_id, prime, {"active": True})

        # Add interactions
        for source_id, target_id, strength, reciprocal in interactions:
            if source_id in self.atoms and target_id in self.atoms:
                inter = Interaction(
                    self.atoms[source_id],
                    self.atoms[target_id],
                    strength,
                    reciprocal
                )
                self.add_interaction(inter)

        self.fitted = True

    def _generate_primes(self, count: int) -> List[int]:
        """Generate list of first N primes."""

        def is_prime(n):
            if n < 2:
                return False
            for i in range(2, int(n**0.5) + 1):
                if n % i == 0:
                    return False
            return True

        primes = []
        n = 2
        while len(primes) < count:
            if is_prime(n):
                primes.append(n)
            n += 1

        return primes