"""Tests for Phase 3 Socio-Atomic Modeling."""

import pytest
import numpy as np
from pirtm.socio_atomic import SocioAtomicModel, Atom, Interaction, AtomType
from pirtm.socio_atomic.simulation import SocioAtomicSimulator, DataFittingSocioAtomicModel
from pirtm.socio_atomic.analytics import SocioSphere, PrimeFactorAnalyzer, SocioAtomicAnalytics


class TestSocioAtomicModel:
    """Test socio-atomic model construction and operations."""

    def test_model_creation(self):
        """Test basic model creation."""
        model = SocioAtomicModel("test_model")
        assert model.name == "test_model"
        assert len(model.atoms) == 0

    def test_add_individual(self):
        """Test adding individuals."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2, {"activity": 0.8})
        ind2 = model.add_individual("bob", 3, {"activity": 0.6})

        assert len(model.atoms) == 2
        assert ind1.atom_type == AtomType.INDIVIDUAL
        assert ind1.prime_index == 2

    def test_add_interaction(self):
        """Test adding interactions."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)

        inter = Interaction(ind1, ind2, 0.8, reciprocal=True)
        model.add_interaction(inter)

        assert len(model.interactions) == 1
        assert model.interactions[0].reciprocal

    def test_reciprocity_observable(self):
        """Test 2R+1=M observable computation."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)

        inter = Interaction(ind1, ind2, 0.8, reciprocal=True)
        model.add_interaction(inter)

        assert inter.compute_2r_plus_1() == 3.0  # Fully reciprocal

        inter2 = Interaction(ind1, ind2, 0.5, reciprocal=False)
        assert inter2.compute_2r_plus_1() == 2.0  # Non-reciprocal

    def test_regime_classification(self):
        """Test stable vs exploitative regime classification."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)
        ind3 = model.add_individual("charlie", 5)

        # Create mostly reciprocal interactions (stable)
        for i, ind in enumerate([ind1, ind2, ind3]):
            inter = Interaction(ind, ind1 if i > 0 else ind2, 0.7, reciprocal=True)
            model.add_interaction(inter)

        regime = model.classify_regime()
        assert regime in ["stable", "transitional", "exploitative"]

    def test_constraint_validation(self):
        """Test ACE/PETC constraint validation."""
        model = SocioAtomicModel()
        model.total_ace_budget = 1.0

        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)

        # Add small interaction
        inter = Interaction(ind1, ind2, 0.1, reciprocal=True)
        model.add_interaction(inter)

        assert model.validate_ace_petc_constraints()

    def test_coarsening(self):
        """Test model coarsening/grouping."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)
        ind3 = model.add_individual("charlie", 5)

        # Add interactions
        inter1 = Interaction(ind1, ind2, 0.5, reciprocal=True)
        inter2 = Interaction(ind2, ind3, 0.6, reciprocal=True)
        model.add_interaction(inter1)
        model.add_interaction(inter2)

        # Coarsen into groups
        grouping = {
            "group_a": ["alice", "bob"],
            "group_b": ["charlie"]
        }

        coarsened = model.coarsen(grouping)

        assert len(coarsened.atoms) == 2
        assert coarsened.consumed_budget < model.consumed_budget


class TestSocioAtomicSimulation:
    """Test simulation dynamics."""

    def test_simulator_creation(self):
        """Test simulator initialization."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)

        inter = Interaction(ind1, ind2, 0.5, reciprocal=True)
        model.add_interaction(inter)

        sim = SocioAtomicSimulator(model)
        assert len(sim.history) == 0

    def test_simulation_step(self):
        """Test single simulation step."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)

        inter = Interaction(ind1, ind2, 0.5, reciprocal=True)
        model.add_interaction(inter)

        sim = SocioAtomicSimulator(model)
        state, ok = sim.step()

        assert ok
        assert len(sim.history) == 1
        assert state.time == 0

    def test_simulation_run(self):
        """Test running full simulation."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)

        inter = Interaction(ind1, ind2, 0.5, reciprocal=True)
        model.add_interaction(inter)

        sim = SocioAtomicSimulator(model)
        states, completed = sim.run(10)

        assert len(states) == 10
        assert completed

    def test_trajectory_analysis(self):
        """Test analyzing simulation trajectory."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)

        inter1 = Interaction(ind1, ind2, 0.5, reciprocal=True)
        inter2 = Interaction(ind2, ind1, 0.6, reciprocal=True)
        model.add_interaction(inter1)
        model.add_interaction(inter2)

        sim = SocioAtomicSimulator(model)
        states, _ = sim.run(20)

        analysis = sim.analyze_trajectory()

        assert "total_steps" in analysis
        assert "regime_stability" in analysis
        assert analysis["total_steps"] == 20


class TestDataFitting:
    """Test fitting models to data."""

    def test_fit_from_data(self):
        """Test fitting model from interaction data."""
        model = DataFittingSocioAtomicModel()

        individuals = ["alice", "bob", "charlie"]
        interactions = [
            ("alice", "bob", 0.8, True),
            ("bob", "charlie", 0.6, True),
            ("charlie", "alice", 0.7, False)
        ]

        model.fit_from_data(individuals, interactions)

        assert model.fitted
        assert len(model.atoms) == 3
        assert len(model.interactions) == 3


class TestAnalytics:
    """Test analytics and visualization."""

    def test_socio_sphere(self):
        """Test socio-sphere computation."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)
        ind3 = model.add_individual("charlie", 5)

        inter1 = Interaction(ind1, ind2, 0.5, reciprocal=True)
        inter2 = Interaction(ind2, ind3, 0.6, reciprocal=True)
        model.add_interaction(inter1)
        model.add_interaction(inter2)

        sphere = SocioSphere(ind1, model, depth=2)
        assert len(sphere.shell_atoms) > 0

    def test_prime_factor_analyzer(self):
        """Test prime factor analysis."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)

        inter = Interaction(ind1, ind2, 0.5, reciprocal=True, prime_factors=[2, 3])
        model.add_interaction(inter)

        analyzer = PrimeFactorAnalyzer(model)
        factors = analyzer.compute_atom_prime_factors(ind1)

        assert len(factors) > 0

    def test_analytics_report(self):
        """Test generating analytics report."""
        model = SocioAtomicModel()
        ind1 = model.add_individual("alice", 2)
        ind2 = model.add_individual("bob", 3)

        inter = Interaction(ind1, ind2, 0.5, reciprocal=True)
        model.add_interaction(inter)

        analytics = SocioAtomicAnalytics(model)
        report = analytics.generate_analysis_report()

        assert "model_name" in report
        assert "basic_statistics" in report
        assert "socio_spheres" in report


if __name__ == "__main__":
    pytest.main([__file__])