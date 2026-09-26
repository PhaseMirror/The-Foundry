"""Socio-Atomic Model for PIRTM Phase 3.

Implements social physics concepts using typed boundary models and socio-atomic
simulations with reciprocity observables and prime-factorized interactions.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Set, Tuple, Union
from dataclasses import dataclass, field
import numpy as np
from enum import Enum


class AtomType(Enum):
    """Types of atoms in socio-atomic model."""
    INDIVIDUAL = "individual"
    ROLE = "role"
    SECTOR = "sector"
    RECIPROCITY = "reciprocity"


@dataclass
class Atom:
    """Basic atom in socio-atomic space."""
    id: str
    atom_type: AtomType
    prime_index: int  # Associated prime for prime-factor tracking
    attributes: Dict[str, Any] = field(default_factory=dict)

    def __hash__(self):
        return hash(self.id)


@dataclass
class Interaction:
    """Interaction between two atoms."""
    source: Atom
    target: Atom
    strength: float  # 0.0 to 1.0
    reciprocal: bool  # Whether reciprocal
    prime_factors: List[int] = field(default_factory=list)

    def reciprocity_factor(self) -> float:
        """Compute reciprocity component (R)."""
        return 1.0 if self.reciprocal else 0.5

    def compute_2r_plus_1(self) -> float:
        """Compute the 2R+1=M reciprocity observable."""
        # M = 2R + 1, where R is reciprocity factor
        R = self.reciprocity_factor()
        return 2 * R + 1  # Ranges from 2 (non-reciprocal) to 3 (reciprocal)


class SocioAtomicModel:
    """Complete socio-atomic model with individuals, roles, and reciprocity."""

    def __init__(self, name: str = "SocioModel"):
        self.name = name
        self.atoms: Dict[str, Atom] = {}
        self.interactions: List[Interaction] = []
        self.sectors: Dict[str, Set[Atom]] = {}

        # ACE/PETC tracking
        self.total_ace_budget = 1.0
        self.consumed_budget = 0.0

    def add_atom(self, atom: Atom) -> None:
        """Add an atom to the model."""
        if atom.id in self.atoms:
            raise ValueError(f"Atom {atom.id} already exists")
        self.atoms[atom.id] = atom

    def add_interaction(self, interaction: Interaction) -> None:
        """Add an interaction to the model."""
        # Consume ACE budget based on interaction strength
        budget_cost = interaction.strength * 0.001  # Small cost per interaction
        if self.consumed_budget + budget_cost > self.total_ace_budget:
            raise RuntimeError(f"ACE budget exceeded: {self.consumed_budget + budget_cost} > {self.total_ace_budget}")

        self.consumed_budget += budget_cost
        self.interactions.append(interaction)

    def add_individual(self, id: str, prime_index: int, attributes: Optional[Dict[str, Any]] = None) -> Atom:
        """Add an individual atom."""
        atom = Atom(id, AtomType.INDIVIDUAL, prime_index, attributes or {})
        self.add_atom(atom)
        return atom

    def add_role(self, id: str, prime_index: int) -> Atom:
        """Add a role atom."""
        atom = Atom(id, AtomType.ROLE, prime_index)
        self.add_atom(atom)
        return atom

    def add_sector(self, sector_name: str, atoms: Set[Atom]) -> None:
        """Add a sector grouping."""
        self.sectors[sector_name] = atoms

    def compute_reciprocity_observable(self, atom: Atom) -> float:
        """Compute 2R+1=M observable for an atom (average across interactions)."""

        outgoing_interactions = [i for i in self.interactions if i.source.id == atom.id]

        if not outgoing_interactions:
            return 1.0  # Neutral value

        m_values = [i.compute_2r_plus_1() for i in outgoing_interactions]
        return np.mean(m_values)

    def classify_regime(self) -> str:
        """Classify overall model regime: stable vs exploitative."""

        if len(self.atoms) < 2:
            return "undefined"

        # Compute average reciprocity observable
        individual_atoms = [a for a in self.atoms.values() if a.atom_type == AtomType.INDIVIDUAL]

        if not individual_atoms:
            return "undefined"

        observables = [self.compute_reciprocity_observable(a) for a in individual_atoms]
        avg_observable = np.mean(observables)

        # Stability thresholds based on theoretical prediction
        # M=3 (fully reciprocal) -> stable
        # M=2 (non-reciprocal) -> exploitative
        # M~2.5 -> transitional

        if avg_observable >= 2.85:
            return "stable"
        elif avg_observable <= 2.15:
            return "exploitative"
        else:
            return "transitional"

    def compute_prime_factor_signature(self) -> Dict[int, int]:
        """Compute overall prime factor signature from all interactions."""

        signature = {}

        for interaction in self.interactions:
            for prime in interaction.prime_factors:
                signature[prime] = signature.get(prime, 0) + 1

        return signature

    def validate_ace_petc_constraints(self) -> bool:
        """Validate ACE and PETC constraints."""

        # Constraint 1: Total budget not exceeded
        if self.consumed_budget > self.total_ace_budget:
            return False

        # Constraint 2: No depletion rate anomalies
        depletion_rate = self.consumed_budget / self.total_ace_budget if self.total_ace_budget > 0 else 0
        if depletion_rate > 0.95:  # Alert at 95% consumption
            return False

        # Constraint 3: Reciprocity observables within theoretical bounds (2 to 3)
        # Only check atoms with at least one outgoing interaction
        for atom in self.atoms.values():
            if atom.atom_type == AtomType.INDIVIDUAL:
                outgoing = [i for i in self.interactions if i.source.id == atom.id]
                if outgoing:  # Only validate interactive atoms
                    obs = self.compute_reciprocity_observable(atom)
                    if obs < 1.8 or obs > 3.2:  # Allow some tolerance
                        return False

        return True

    def coarsen(self, grouping: Dict[str, List[str]]) -> SocioAtomicModel:
        """Coarsen model by grouping atoms."""

        coarsened = SocioAtomicModel(f"{self.name}_coarsened")

        # Create grouped atoms
        group_mapping = {}
        for group_id, atom_ids in grouping.items():
            # Create super-atom representing the group
            primes = [self.atoms[aid].prime_index for aid in atom_ids if aid in self.atoms]
            avg_prime = int(np.mean(primes)) if primes else 2

            group_atom = Atom(group_id, AtomType.ROLE, avg_prime)
            coarsened.add_atom(group_atom)
            group_mapping[group_id] = group_atom

        # Aggregate interactions
        for source_group, source_atoms in grouping.items():
            for target_group, target_atoms in grouping.items():
                if source_group == target_group:
                    continue

                # Sum interactions between groups
                total_strength = 0.0
                reciprocal_count = 0

                for s_atom_id in source_atoms:
                    for t_atom_id in target_atoms:
                        for inter in self.interactions:
                            if inter.source.id == s_atom_id and inter.target.id == t_atom_id:
                                total_strength += inter.strength
                                if inter.reciprocal:
                                    reciprocal_count += 1

                if total_strength > 0:
                    reciprocal = reciprocal_count >= len(source_atoms)
                    aggregated_inter = Interaction(
                        group_mapping[source_group],
                        group_mapping[target_group],
                        total_strength / len(source_atoms),
                        reciprocal
                    )
                    coarsened.add_interaction(aggregated_inter)

        coarsened.consumed_budget = self.consumed_budget * (len(grouping) / len(self.atoms))

        return coarsened

    def get_statistics(self) -> Dict[str, Any]:
        """Compute model statistics."""

        individual_count = len([a for a in self.atoms.values() if a.atom_type == AtomType.INDIVIDUAL])
        interaction_count = len(self.interactions)
        reciprocal_count = len([i for i in self.interactions if i.reciprocal])
        avg_reciprocity = np.mean([self.compute_reciprocity_observable(a) for a in self.atoms.values()
                                   if a.atom_type == AtomType.INDIVIDUAL]) if individual_count > 0 else 1.0

        return {
            "individuals": individual_count,
            "interactions": interaction_count,
            "reciprocal_interactions": reciprocal_count,
            "average_reciprocity_observable": avg_reciprocity,
            "regime": self.classify_regime(),
            "ace_budget_consumed": self.consumed_budget,
            "prime_signature": self.compute_prime_factor_signature(),
            "constraints_satisfied": self.validate_ace_petc_constraints()
        }