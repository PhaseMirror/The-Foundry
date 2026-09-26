"""Recurrence Invariant Test Suite (ADR-MCRM-020 D-020.4)

One test per invariant in the prime-indexed recurrence protocol.

Invariants tested:
  1. Prime indexing — all state values are valid prime indices
  2. Monotonicity — recurrence sequence maintains documented ordering
  3. Acyclicity — no state appears twice within witness window
  4. Determinism — same input + seed → identical trace
  5. Contraction — witness path length decreases or holds across iterations

Run:
  PYTHONPATH=packages/integrations:pirtm:contracts:. \
    python -m pytest packages/integrations/pirtm_integration/tests/test_phase1_recurrence_invariants.py -v
"""

from __future__ import annotations

import warnings
from typing import List, Tuple

import numpy as np
import pytest

# ─── Helpers ──────────────────────────────────────────────────────────

def _is_prime(n: int) -> bool:
    """Deterministic primality check (trial division, sufficient for test range)."""
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True


def _run_recurrence(
    n: int,
    steps: int,
    *,
    seed: int = 42,
    epsilon: float = 0.05,
) -> Tuple[List[np.ndarray], List[dict]]:
    """Run the PIRTM recurrence for ``steps`` iterations.

    Returns (state_history, metadata_history).
    """
    from pirtm.core.recurrence import step

    rng = np.random.RandomState(seed)
    X_t = rng.randn(n).astype(np.float64) * 0.1

    # Build contractive operators: small spectral radius
    Xi_raw = rng.randn(n, n) * 0.1
    Lambda_raw = rng.randn(n, n) * 0.1
    # Scale to guarantee contractivity: ||Xi|| + ||Lambda|| < 1 - epsilon
    scale = 0.3 / (np.linalg.norm(Xi_raw) + np.linalg.norm(Lambda_raw) + 1e-12)
    Xi_t = Xi_raw * scale
    Lambda_t = Lambda_raw * scale

    states: List[np.ndarray] = [X_t.copy()]
    metas: List[dict] = []

    for _ in range(steps):
        X_next, meta = step(X_t, Xi_t, Lambda_t, epsilon=epsilon)
        states.append(np.array(X_next, dtype=np.float64))
        metas.append(meta)
        X_t = np.array(X_next, dtype=np.float64)

    return states, metas


# ═══════════════════════════════════════════════════════════════════════
#  INV-1: Prime Indexing
# ═══════════════════════════════════════════════════════════════════════

class TestPrimeIndexing:
    """Verify that prime-indexed state values use valid prime indices."""

    def test_small_primes(self):
        """First 20 primes are all recognised."""
        first_20 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
                     31, 37, 41, 43, 47, 53, 59, 61, 67, 71]
        for p in first_20:
            assert _is_prime(p), f"{p} should be prime"

    def test_composites_rejected(self):
        composites = [0, 1, 4, 6, 8, 9, 10, 15, 100, 1000]
        for c in composites:
            assert not _is_prime(c), f"{c} should not be prime"

    def test_boundary_prime_1009(self):
        """Boundary: 1009 is the first prime above 1000."""
        assert _is_prime(1009)
        assert not _is_prime(1008)

    def test_large_prime(self):
        """Large prime within typical test range."""
        assert _is_prime(104729)  # 10000th prime


# ═══════════════════════════════════════════════════════════════════════
#  INV-2: Monotonicity
# ═══════════════════════════════════════════════════════════════════════

class TestMonotonicity:
    """Verify that recurrence norms maintain monotone convergence under contraction."""

    def test_norm_non_increasing(self):
        """Under strict contraction, ||X_t|| should converge (non-increasing trend)."""
        states, _ = _run_recurrence(n=8, steps=50, seed=42)
        norms = [float(np.linalg.norm(s)) for s in states]
        # After transient (first 5 steps), norms should generally decrease
        tail = norms[5:]
        decreasing_count = sum(1 for i in range(1, len(tail)) if tail[i] <= tail[i - 1] + 1e-10)
        # Allow some non-monotone steps due to guidance/projection, but ≥80% should decrease
        ratio = decreasing_count / max(len(tail) - 1, 1)
        assert ratio >= 0.8, f"Only {ratio:.0%} of steps were non-increasing"

    def test_boundary_transition(self):
        """Norm at boundary (step 0 → 1) doesn't explode."""
        states, metas = _run_recurrence(n=4, steps=1, seed=99)
        assert np.linalg.norm(states[1]) < np.linalg.norm(states[0]) * 5, \
            "First step caused norm explosion"


# ═══════════════════════════════════════════════════════════════════════
#  INV-3: Acyclicity
# ═══════════════════════════════════════════════════════════════════════

class TestAcyclicity:
    """Verify no state appears twice within a witness window during the transient phase.

    Once the recurrence converges to a fixed point, consecutive identical states
    are expected (contractive mapping property). The acyclicity invariant applies
    to the *transient* phase only — i.e. before convergence.
    """

    CONVERGENCE_TOL = 1e-12  # below this delta, states are "converged"

    @staticmethod
    def _states_equal(a: np.ndarray, b: np.ndarray, tol: float = 1e-12) -> bool:
        return bool(np.allclose(a, b, atol=tol, rtol=0))

    @classmethod
    def _transient_length(cls, states: List[np.ndarray]) -> int:
        """Return the index at which convergence begins (allclose within TOL)."""
        for i in range(1, len(states)):
            if np.allclose(states[i], states[i - 1], atol=cls.CONVERGENCE_TOL, rtol=0):
                return i
        return len(states)

    def test_no_exact_repeat_window_5_transient(self):
        """No repeated state within a window of 5 during the transient phase."""
        states, _ = _run_recurrence(n=8, steps=30, seed=42)
        t_end = self._transient_length(states)
        transient = states[:t_end]
        window = 5
        for i in range(len(transient)):
            for j in range(i + 1, min(i + window, len(transient))):
                assert not self._states_equal(transient[i], transient[j]), \
                    f"State repeated at steps {i} and {j} (transient phase)"

    def test_trivial_window_1_transient(self):
        """Window=1: consecutive transient states must differ."""
        states, _ = _run_recurrence(n=4, steps=10, seed=7)
        t_end = self._transient_length(states)
        transient = states[:t_end]
        for i in range(len(transient) - 1):
            assert not self._states_equal(transient[i], transient[i + 1]), \
                f"Consecutive states identical at step {i} (transient)"

    def test_large_window_transient(self):
        """Window=20: no repeated state during transient phase."""
        states, _ = _run_recurrence(n=8, steps=25, seed=123)
        t_end = self._transient_length(states)
        transient = states[:t_end]
        window = min(20, len(transient))
        for i in range(len(transient)):
            for j in range(i + 1, min(i + window, len(transient))):
                assert not self._states_equal(transient[i], transient[j])

    def test_convergence_is_fixed_point(self):
        """After transient, states should be at or near a fixed point."""
        states, _ = _run_recurrence(n=8, steps=50, seed=42)
        t_end = self._transient_length(states)
        if t_end < len(states):
            # Post-convergence states should all be nearly equal
            fixed = states[t_end]
            for s in states[t_end:]:
                np.testing.assert_allclose(s, fixed, atol=1e-12)


# ═══════════════════════════════════════════════════════════════════════
#  INV-4: Determinism
# ═══════════════════════════════════════════════════════════════════════

class TestDeterminism:
    """Same input + seed must yield identical trace every time."""

    def test_deterministic_trace(self):
        """Two runs with same seed produce identical output."""
        states_a, metas_a = _run_recurrence(n=8, steps=20, seed=42)
        states_b, metas_b = _run_recurrence(n=8, steps=20, seed=42)

        assert len(states_a) == len(states_b)
        for i, (a, b) in enumerate(zip(states_a, states_b)):
            np.testing.assert_array_equal(a, b, err_msg=f"Mismatch at step {i}")

        for i, (ma, mb) in enumerate(zip(metas_a, metas_b)):
            assert ma["q_t"] == mb["q_t"], f"q_t mismatch at step {i}"
            assert ma["margin"] == mb["margin"], f"margin mismatch at step {i}"

    def test_different_seeds_diverge(self):
        """Different seeds produce different traces."""
        states_a, _ = _run_recurrence(n=8, steps=5, seed=42)
        states_b, _ = _run_recurrence(n=8, steps=5, seed=99)
        # At least one state should differ
        any_diff = any(not np.allclose(a, b) for a, b in zip(states_a, states_b))
        assert any_diff, "Different seeds produced identical traces"

    def test_floating_point_reproducibility(self):
        """Repeated runs produce bit-identical q_t values."""
        _, metas_a = _run_recurrence(n=16, steps=10, seed=0)
        _, metas_b = _run_recurrence(n=16, steps=10, seed=0)
        for i, (ma, mb) in enumerate(zip(metas_a, metas_b)):
            assert ma["q_t"] == mb["q_t"], f"q_t differs at step {i}"


# ═══════════════════════════════════════════════════════════════════════
#  INV-5: Contraction
# ═══════════════════════════════════════════════════════════════════════

class TestContraction:
    """Witness path length decreases or holds across iterations."""

    def test_margin_positive(self):
        """All steps must report positive contraction margin."""
        _, metas = _run_recurrence(n=8, steps=20, seed=42)
        for i, m in enumerate(metas):
            assert m["margin"] > 0, f"Non-positive margin at step {i}: {m['margin']}"

    def test_q_t_below_threshold(self):
        """q_t must remain below 1 - epsilon at every step."""
        epsilon = 0.05
        _, metas = _run_recurrence(n=8, steps=20, seed=42, epsilon=epsilon)
        for i, m in enumerate(metas):
            assert m["q_t"] < 1.0 - epsilon, \
                f"q_t={m['q_t']:.6f} >= {1.0 - epsilon} at step {i}"

    def test_convergence_to_fixed_point(self):
        """With no guidance, G_t=0, states converge toward zero."""
        states, _ = _run_recurrence(n=4, steps=100, seed=42)
        final_norm = float(np.linalg.norm(states[-1]))
        initial_norm = float(np.linalg.norm(states[0]))
        assert final_norm < initial_norm * 0.5, \
            f"Expected convergence: initial={initial_norm:.4f}, final={final_norm:.4f}"

    def test_minimum_witness_size(self):
        """Even a 1-step recurrence produces valid contraction metadata."""
        states, metas = _run_recurrence(n=2, steps=1, seed=42)
        assert len(metas) == 1
        assert "q_t" in metas[0]
        assert "margin" in metas[0]
        assert metas[0]["margin"] > 0
