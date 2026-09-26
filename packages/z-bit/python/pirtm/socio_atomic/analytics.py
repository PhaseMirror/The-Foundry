"""Analytics and Visualization for Socio-Atomic Models.

Provides tools for analyzing socio-spheres, prime-factor tracking, and visualization.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Set, Tuple
import numpy as np
from . import SocioAtomicModel, Atom, AtomType


class SocioSphere:
    """Represents a sphere of social interaction around an atom."""

    def __init__(self, center: Atom, model: SocioAtomicModel, depth: int = 2):
        self.center = center
        self.model = model
        self.depth = depth
        self.shell_atoms: List[Set[Atom]] = self._compute_shells()

    def _compute_shells(self) -> List[Set[Atom]]:
        """Compute concentric shells around center atom."""
        shells = [set()]
        current_shell = {self.center}

        for _ in range(self.depth):
            next_shell = set()

            for atom in current_shell:
                # Find all neighbors
                for inter in self.model.interactions:
                    if inter.source.id == atom.id:
                        neighbor = inter.target
                        if neighbor not in current_shell:
                            next_shell.add(neighbor)

            if not next_shell:
                break

            shells.append(next_shell)
            current_shell = next_shell

        return shells

    def get_atoms_in_shell(self, shell_index: int) -> Set[Atom]:
        """Get atoms at specified shell distance."""
        if shell_index < len(self.shell_atoms):
            return self.shell_atoms[shell_index]
        return set()

    def compute_shell_density(self, shell_index: int) -> float:
        """Compute interaction density in a shell."""
        atoms = self.get_atoms_in_shell(shell_index)
        if not atoms:
            return 0.0

        interactions = 0
        for atom in atoms:
            interactions += len([i for i in self.model.interactions if i.source.id == atom.id])

        return interactions / len(atoms) if atoms else 0.0


class PrimeFactorAnalyzer:
    """Analyzes prime factor signatures and distributions."""

    def __init__(self, model: SocioAtomicModel):
        self.model = model

    def compute_atom_prime_factors(self, atom: Atom) -> Dict[int, int]:
        """Compute prime factors associated with an atom."""
        factors = {}

        for inter in self.model.interactions:
            if inter.source.id == atom.id or inter.target.id == atom.id:
                for prime in inter.prime_factors:
                    factors[prime] = factors.get(prime, 0) + 1

        # Add atom's own prime
        factors[atom.prime_index] = factors.get(atom.prime_index, 0) + 1

        return factors

    def compute_sector_signature(self, sector_name: str) -> Dict[int, int]:
        """Compute prime signature for a sector."""
        signature = {}

        if sector_name not in self.model.sectors:
            return signature

        for atom in self.model.sectors[sector_name]:
            atom_factors = self.compute_atom_prime_factors(atom)
            for prime, count in atom_factors.items():
                signature[prime] = signature.get(prime, 0) + count

        return signature

    def analyze_prime_distribution(self) -> Dict[str, Any]:
        """Analyze distribution of primes across model."""

        all_primes = {}

        for atom in self.model.atoms.values():
            factors = self.compute_atom_prime_factors(atom)
            for prime, count in factors.items():
                all_primes[prime] = all_primes.get(prime, 0) + count

        if not all_primes:
            return {"error": "No prime factors"}

        prime_values = list(all_primes.values())

        return {
            "distinct_primes": len(all_primes),
            "total_prime_occurrences": sum(prime_values),
            "mean_prime_frequency": np.mean(prime_values),
            "std_prime_frequency": np.std(prime_values),
            "prime_distribution": all_primes
        }


class SocioAtomicAnalytics:
    """Comprehensive analytics suite for socio-atomic models."""

    def __init__(self, model: SocioAtomicModel):
        self.model = model
        self.analyzer = PrimeFactorAnalyzer(model)

    def generate_analysis_report(self) -> Dict[str, Any]:
        """Generate comprehensive analysis report."""

        individuals = [a for a in self.model.atoms.values() if a.atom_type == AtomType.INDIVIDUAL]

        socio_spheres = {}
        for individual in individuals:
            sphere = SocioSphere(individual, self.model)
            shell_densities = [sphere.compute_shell_density(i) for i in range(len(sphere.shell_atoms))]
            socio_spheres[individual.id] = {
                "shell_count": len(sphere.shell_atoms),
                "shell_densities": shell_densities
            }

        stats = self.model.get_statistics()

        return {
            "model_name": self.model.name,
            "basic_statistics": stats,
            "socio_spheres": socio_spheres,
            "prime_analysis": self.analyzer.analyze_prime_distribution(),
            "regime_classification": self.model.classify_regime(),
            "constraints_valid": self.model.validate_ace_petc_constraints()
        }

    def export_for_visualization(self) -> Dict[str, Any]:
        """Export data suitable for external visualization tools."""

        nodes = []
        links = []

        # Export atoms as nodes
        for atom in self.model.atoms.values():
            obs = self.model.compute_reciprocity_observable(atom) if atom.atom_type == AtomType.INDIVIDUAL else 2.5

            nodes.append({
                "id": atom.id,
                "type": atom.atom_type.value,
                "prime_index": atom.prime_index,
                "reciprocity_observable": obs
            })

        # Export interactions as links
        for inter in self.model.interactions:
            links.append({
                "source": inter.source.id,
                "target": inter.target.id,
                "strength": inter.strength,
                "reciprocal": inter.reciprocal
            })

        return {
            "nodes": nodes,
            "links": links,
            "model_metadata": {
                "name": self.model.name,
                "regime": self.model.classify_regime(),
                "budget_consumed": self.model.consumed_budget
            }
        }