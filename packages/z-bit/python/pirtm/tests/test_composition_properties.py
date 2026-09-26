"""
C-02: ContractivityType Composition Rule Verification

Property-based tests for the ContractivityType composition algebra.
Validates the mathematical contract:

  compose(T1, T2) = (min(ε₁, ε₂), δ₁ · δ₂)

Tested properties:
  1. Epsilon follows worst-case rule: ε' = min(ε₁, ε₂)
  2. Confidence multiplies: δ' = δ₁ · δ₂
  3. Associativity: T1 ∘ (T2 ∘ T3) = (T1 ∘ T2) ∘ T3
  4. Monotone weakening: composed type never stronger than either input
  5. Depth-20 chains stay above float underflow threshold
  6. 100+ randomly generated chains satisfy all properties

Mathematical anchor (Banach Fixed-Point Theorem):
  The composition rule preserves the contractivity invariant r(Λ) < 1 - ε
  through the operation chain if and only if ε' = min(ε_i) and δ' = Π δ_i.

Reference: ADR-008, Gate C C-02
"""

from __future__ import annotations

import math
import random
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from pirtm.mlir.verification_pass import ContractivityType


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_SEED = 42
_RNG = random.Random(_SEED)


def _rand_type(rng: random.Random = _RNG) -> ContractivityType:
    """Sample a valid ContractivityType at random."""
    epsilon = rng.uniform(0.001, 0.999)
    confidence = rng.uniform(0.5, 1.0)
    return ContractivityType(epsilon=epsilon, confidence=confidence)


def _chain_compose(types: list[ContractivityType]) -> ContractivityType:
    """Left-fold compose: T1 ∘ T2 ∘ ... ∘ Tn."""
    result = types[0]
    for t in types[1:]:
        result = result.compose(t)
    return result


_EPS = 1e-12  # floating-point tolerance


# ---------------------------------------------------------------------------
# C-02 Tests
# ---------------------------------------------------------------------------

class TestEpsilonMinRule:
    """ε' = min(ε₁, ε₂) — worst-case epsilon propagation."""

    def test_epsilon_min_basic(self):
        t1 = ContractivityType(epsilon=0.3, confidence=0.9)
        t2 = ContractivityType(epsilon=0.1, confidence=0.8)
        result = t1.compose(t2)
        assert abs(result.epsilon - 0.1) < _EPS

    def test_epsilon_min_symmetric(self):
        t1 = ContractivityType(epsilon=0.5, confidence=0.9)
        t2 = ContractivityType(epsilon=0.2, confidence=0.9)
        assert abs(t1.compose(t2).epsilon - t2.compose(t1).epsilon) < _EPS

    def test_epsilon_min_equal(self):
        """When ε₁ = ε₂, result is the same."""
        t = ContractivityType(epsilon=0.25, confidence=0.9)
        result = t.compose(t)
        assert abs(result.epsilon - 0.25) < _EPS

    def test_epsilon_min_zero(self):
        """Zero epsilon (perfect contraction) dominates any non-zero."""
        t_perfect = ContractivityType(epsilon=0.0, confidence=1.0)
        t_other = ContractivityType(epsilon=0.5, confidence=0.9)
        result = t_perfect.compose(t_other)
        assert result.epsilon == 0.0

    def test_epsilon_min_100_random_pairs(self):
        """100 random pairs: composed epsilon equals min(ε₁, ε₂)."""
        rng = random.Random(1234)
        for _ in range(100):
            t1 = _rand_type(rng)
            t2 = _rand_type(rng)
            result = t1.compose(t2)
            expected_eps = min(t1.epsilon, t2.epsilon)
            assert abs(result.epsilon - expected_eps) < _EPS, (
                f"Failed: min({t1.epsilon}, {t2.epsilon}) != {result.epsilon}"
            )


class TestConfidenceMultiplicationRule:
    """δ' = δ₁ · δ₂ — confidence multiplicative weakening."""

    def test_confidence_multiply_basic(self):
        t1 = ContractivityType(epsilon=0.1, confidence=0.9)
        t2 = ContractivityType(epsilon=0.1, confidence=0.8)
        result = t1.compose(t2)
        assert abs(result.confidence - 0.72) < _EPS

    def test_confidence_always_weakens(self):
        """Composed confidence ≤ min(δ₁, δ₂)."""
        rng = random.Random(5678)
        for _ in range(100):
            t1 = _rand_type(rng)
            t2 = _rand_type(rng)
            result = t1.compose(t2)
            assert result.confidence <= min(t1.confidence, t2.confidence) + _EPS

    def test_confidence_unit_identity(self):
        """Composing with δ=1.0 does not change confidence."""
        t = ContractivityType(epsilon=0.1, confidence=0.7)
        identity = ContractivityType(epsilon=0.2, confidence=1.0)
        result = t.compose(identity)
        assert abs(result.confidence - 0.7) < _EPS

    def test_confidence_multiply_100_random_pairs(self):
        """100 random pairs: composed confidence equals δ₁ · δ₂."""
        rng = random.Random(9012)
        for _ in range(100):
            t1 = _rand_type(rng)
            t2 = _rand_type(rng)
            result = t1.compose(t2)
            expected_conf = t1.confidence * t2.confidence
            assert abs(result.confidence - expected_conf) < _EPS, (
                f"Failed: {t1.confidence} * {t2.confidence} != {result.confidence}"
            )


class TestAssociativity:
    """T1 ∘ (T2 ∘ T3) = (T1 ∘ T2) ∘ T3."""

    def test_associativity_three_types(self):
        t1 = ContractivityType(epsilon=0.3, confidence=0.9)
        t2 = ContractivityType(epsilon=0.2, confidence=0.8)
        t3 = ContractivityType(epsilon=0.4, confidence=0.7)
        left = t1.compose(t2).compose(t3)
        right = t1.compose(t2.compose(t3))
        assert abs(left.epsilon - right.epsilon) < _EPS
        assert abs(left.confidence - right.confidence) < _EPS

    def test_associativity_100_random_triples(self):
        """100 random triples: associativity holds to floating-point precision."""
        rng = random.Random(3333)
        for i in range(100):
            t1, t2, t3 = _rand_type(rng), _rand_type(rng), _rand_type(rng)
            left = t1.compose(t2).compose(t3)
            right = t1.compose(t2.compose(t3))
            assert abs(left.epsilon - right.epsilon) < _EPS, (
                f"Associativity epsilon failed at iteration {i}"
            )
            assert abs(left.confidence - right.confidence) < _EPS, (
                f"Associativity confidence failed at iteration {i}"
            )


class TestMonotonicity:
    """Composed type never stronger than either input."""

    def test_monotone_epsilon(self):
        """Composed epsilon ≤ each individual epsilon."""
        rng = random.Random(7777)
        for _ in range(100):
            t1 = _rand_type(rng)
            t2 = _rand_type(rng)
            result = t1.compose(t2)
            assert result.epsilon <= t1.epsilon + _EPS
            assert result.epsilon <= t2.epsilon + _EPS

    def test_monotone_confidence(self):
        """Composed confidence ≤ each individual confidence."""
        rng = random.Random(8888)
        for _ in range(100):
            t1 = _rand_type(rng)
            t2 = _rand_type(rng)
            result = t1.compose(t2)
            assert result.confidence <= t1.confidence + _EPS
            assert result.confidence <= t2.confidence + _EPS


class TestChainComposition:
    """Composition chains: depth-20 and associativity at scale."""

    def test_depth_20_chain_no_underflow(self):
        """
        Depth-20 chain with δ = 0.9 per step.
        Minimum confidence = 0.9^20 ≈ 0.122 >> float minimum ~5e-324.
        Must not underflow.
        """
        base = ContractivityType(epsilon=0.1, confidence=0.9)
        result = _chain_compose([base] * 20)
        expected_conf = 0.9 ** 20
        assert abs(result.confidence - expected_conf) < 1e-10
        assert result.confidence > 0.0  # no underflow

    def test_depth_20_epsilon_minimum(self):
        """Depth-20 chain: epsilon is minimum of all chain elements."""
        rng = random.Random(2222)
        types = [_rand_type(rng) for _ in range(20)]
        result = _chain_compose(types)
        expected_eps = min(t.epsilon for t in types)
        assert abs(result.epsilon - expected_eps) < _EPS

    def test_depth_20_confidence_product(self):
        """Depth-20 chain: confidence is product of all confidences."""
        rng = random.Random(4444)
        types = [_rand_type(rng) for _ in range(20)]
        result = _chain_compose(types)
        expected_conf = math.prod(t.confidence for t in types)
        # Floating-point product may accumulate error; use relative tolerance
        rel_err = abs(result.confidence - expected_conf) / (expected_conf + _EPS)
        assert rel_err < 1e-9, f"Confidence product error {rel_err}"

    def test_100_chains_of_random_depth(self):
        """
        100 chains of depth 2–20: epsilon = min, confidence = product.
        All compositions satisfy the mathematical contract.
        """
        rng = random.Random(6666)
        for i in range(100):
            depth = rng.randint(2, 20)
            types = [_rand_type(rng) for _ in range(depth)]
            result = _chain_compose(types)

            # ε' = min(εᵢ)
            expected_eps = min(t.epsilon for t in types)
            assert abs(result.epsilon - expected_eps) < _EPS, (
                f"Chain {i} depth={depth}: epsilon contract violated"
            )

            # δ' = ∏ δᵢ
            expected_conf = math.prod(t.confidence for t in types)
            rel_err = abs(result.confidence - expected_conf) / (expected_conf + _EPS)
            assert rel_err < 1e-9, (
                f"Chain {i} depth={depth}: confidence product contract violated"
            )

    def test_chain_validity_preserved(self):
        """All intermediate types in a chain remain valid."""
        rng = random.Random(9999)
        for _ in range(50):
            depth = rng.randint(2, 10)
            types = [_rand_type(rng) for _ in range(depth)]
            acc = types[0]
            for t in types[1:]:
                acc = acc.compose(t)
                assert acc.is_valid(), (
                    f"Composed type invalid: epsilon={acc.epsilon}, "
                    f"confidence={acc.confidence}"
                )


class TestBoundaryComposition:
    """Edge cases and boundary values."""

    def test_compose_minimum_epsilon_boundary(self):
        """Both epsilon values very close: min applies correctly."""
        t1 = ContractivityType(epsilon=0.1 + 1e-15, confidence=0.9)
        t2 = ContractivityType(epsilon=0.1, confidence=0.9)
        result = t1.compose(t2)
        assert result.epsilon == 0.1  # t2 wins

    def test_compose_very_low_confidence(self):
        """Confidence close to zero but > 0 remains valid after composition."""
        t1 = ContractivityType(epsilon=0.1, confidence=1e-10)
        t2 = ContractivityType(epsilon=0.1, confidence=1e-10)
        result = t1.compose(t2)
        assert result.confidence > 0.0
        assert result.confidence == pytest.approx(1e-20, rel=1e-6)

    def test_high_confidence_chain(self):
        """Chain of δ=1.0 preserves unit confidence."""
        types = [ContractivityType(epsilon=0.05 + i * 0.001, confidence=1.0)
                 for i in range(20)]
        result = _chain_compose(types)
        assert abs(result.confidence - 1.0) < _EPS
        assert abs(result.epsilon - 0.05) < _EPS


if __name__ == "__main__":
    # Allow direct execution for quick validation
    import subprocess
    import sys
    sys.exit(subprocess.call([sys.executable, "-m", "pytest", __file__, "-v"]))
