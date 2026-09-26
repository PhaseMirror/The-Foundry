"""Tests for Phase 1 Multiplicity Library.

Tests critical algebraic invariants for UFD valuations, Hilbert-Samuel multiplicity,
descent/gluing, and inversion gates.
"""

import pytest
from fractions import Fraction
from pirtm.multiplicity.valuations import DiscreteValuation, OrderValuation, kronecker_symbol
from pirtm.multiplicity.hilbert_samuel import hilbert_samuel_multiplicity
from pirtm.multiplicity.descent_gluing import GluingData, Stack
from pirtm.multiplicity.inversion_gate import InversionGate


class TestValuations:
    """Test valuation theory implementations."""

    def test_discrete_valuation(self):
        """Test p-adic valuation."""
        v2 = DiscreteValuation(2)
        v5 = DiscreteValuation(5)

        assert v2(8) == 3  # 8 = 2^3
        assert v2(15) == 0  # 15 not divisible by 2
        assert v5(25) == 2  # 25 = 5^2
        assert v2(0) == float('inf')  # valuation of zero

    def test_kronecker_symbol(self):
        """Test Kronecker symbol computation."""
        # Basic cases
        assert kronecker_symbol(1, 1) == 1
        assert kronecker_symbol(1, -1) == 1
        assert kronecker_symbol(-1, 1) == 1

        # Quadratic reciprocity
        assert kronecker_symbol(2, 3) == -1  # (2/3) = -1
        assert kronecker_symbol(3, 5) == -1  # (3/5) = -1
        assert kronecker_symbol(5, 7) == -1  # (5/7) = -1


class TestHilbertSamuel:
    """Test Hilbert-Samuel multiplicity."""

    def test_basic_multiplicity(self):
        """Test basic multiplicity calculations."""
        # Test placeholder implementation
        # In full implementation, would test against known examples

        # For now, test that it returns an integer
        result = hilbert_samuel_multiplicity(None, None, None)
        assert isinstance(result, int)
        assert result >= 0


class TestDescentGluing:
    """Test descent and gluing operations."""

    def test_gluing_data(self):
        """Test gluing data construction."""
        scheme1 = "Spec(k[x])"
        scheme2 = "Spec(k[y])"
        iso = "x -> y"

        gluing = GluingData(scheme1, scheme2, iso)
        assert gluing.scheme1 == scheme1
        assert gluing.scheme2 == scheme2
        assert gluing.isomorphism == iso

    def test_stack_operations(self):
        """Test stack operations."""
        stack = Stack("test_stack")

        stack.add_object("obj1")
        stack.add_object("obj2")
        stack.add_morphism("obj1", "obj2", "morph1")

        assert "obj1" in stack.objects
        assert "obj2" in stack.objects
        assert "obj1" in stack.morphisms


class TestInversionGate:
    """Test inversion gate operations."""

    def test_inversion_examples(self):
        """Test inversion gate on examples."""
        gate = InversionGate()

        # Test known cases
        inv_x2 = gate("x^2")
        assert inv_x2 == Fraction(1, 2)

        inv_x3 = gate("x^3")
        assert inv_x3 == Fraction(1, 3)

    def test_fractional_multiplicity(self):
        """Test fractional multiplicity example."""
        gate = InversionGate()
        equation, mult = gate.fractional_multiplicity_example()

        assert isinstance(equation, str)
        assert isinstance(mult, Fraction)
        assert mult == Fraction(3, 2)

    def test_obstruction_counterexample(self):
        """Test obstruction counterexample."""
        gate = InversionGate()
        example = gate.obstruction_counterexample()

        assert isinstance(example, str)
        assert "Z[sqrt(-5)]" in example


if __name__ == "__main__":
    pytest.main([__file__])