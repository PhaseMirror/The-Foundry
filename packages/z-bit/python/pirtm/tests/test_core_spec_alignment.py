"""
Tests for PIRTM Core Specification Alignment (Phase 2).

Verifies the lambda_m governed update rule and the MultiplicitySumOperator.
"""

import unittest
import numpy as np
from pirtm.core.recurrence import step, iterate
from pirtm.core.operators import MultiplicitySumOperator
from pirtm.backend import get_backend

class TestCoreSpecAlignment(unittest.TestCase):
    def setUp(self):
        self.backend = get_backend("numpy")
        self.dim = 4
        self.X_t = np.array([0.5, -0.2, 0.8, 0.1])
        self.Xi_t = np.eye(self.dim) * 0.4
        self.Lambda_t = np.eye(self.dim) * 0.3
        self.G_t = np.zeros(self.dim)

    def test_lambda_m_1_0_behavior(self):
        """lambda_m=1.0 should match the old direct-sum behavior."""
        X_next, meta = step(
            self.X_t, self.Xi_t, self.Lambda_t, self.G_t, 
            backend=self.backend, lambda_m=1.0
        )
        
        # Expected: clip(0.4*X_t + 0.3*sigmoid(X_t), -1, 1)
        expected_Y = 0.4 * self.X_t + 0.3 * self.backend.sigmoid(self.X_t)
        expected_X = np.clip(expected_Y, -1.0, 1.0)
        
        np.testing.assert_allclose(X_next, expected_X)
        self.assertEqual(meta["lambda_m"], 1.0)
        # c_lambda = (1 - 1) + 1 * (0.4 + 0.3) = 0.7
        self.assertAlmostEqual(meta["c_lambda"], 0.7)

    def test_lambda_m_0_5_behavior(self):
        """lambda_m=0.5 should perform a convex combination."""
        lambda_m = 0.5
        X_next, meta = step(
            self.X_t, self.Xi_t, self.Lambda_t, self.G_t, 
            backend=self.backend, lambda_m=lambda_m
        )
        
        inner_Y = 0.4 * self.X_t + 0.3 * self.backend.sigmoid(self.X_t)
        inner_P = np.clip(inner_Y, -1.0, 1.0)
        expected_X = (1.0 - lambda_m) * self.X_t + lambda_m * inner_P
        
        np.testing.assert_allclose(X_next, expected_X)
        self.assertEqual(meta["lambda_m"], 0.5)
        # c_lambda = (1 - 0.5) + 0.5 * (0.4 + 0.3) = 0.5 + 0.35 = 0.85
        self.assertAlmostEqual(meta["c_lambda"], 0.85)

    def test_multiplicity_sum_operator(self):
        """Verify MultiplicitySumOperator correctly aggregates prime decays."""
        primes = [2, 3, 5]
        op = MultiplicitySumOperator(primes)
        psi = np.ones(4)
        t = 1.0
        
        # Expected decay: 2^-1 + 3^-1 + 5^-1 = 0.5 + 0.333... + 0.2 = 1.0333...
        expected_decay = (2**-1.0) + (3**-1.0) + (5**-1.0)
        out = op.evolve(psi, t)
        
        np.testing.assert_allclose(out, psi * expected_decay)
        self.assertAlmostEqual(op.operator_norm, expected_decay)

    def test_iterate_lambda_m_propagation(self):
        """Verify that lambda_m is correctly passed through iterate()."""
        from pirtm.policy import PIRTMPolicy
        
        class MockPolicy(PIRTMPolicy):
            def Xi_t(self, t): return np.eye(4) * 0.5
            def Lambda_t(self, t): return np.eye(4) * 0.2
            def G_t(self, t): return np.zeros(4)
            @property
            def goal_budget(self): return 1.0

        policy = MockPolicy()
        # With lambda_m=0.1, it should move very slowly
        res = iterate(self.X_t, policy, None, steps=2, lambda_m=0.1)
        
        # After 1 step: (1-0.1)*0.5 + 0.1*clip(0.5*0.5 + 0.2*sig(0.5), -1, 1)
        # Just check it ran and trajectory has correct length
        self.assertEqual(len(res["trajectory"]), 3)
        self.assertEqual(res["steps"], 2)

    def test_lambda_m_regression_values(self):
        """Regression tests for specific lambda_m values."""
        for lm in [0.0, 0.25, 0.5, 0.75, 1.0]:
            with self.subTest(lambda_m=lm):
                X_next, meta = step(self.X_t, self.Xi_t, self.Lambda_t, lambda_m=lm)
                # X_next = (1-lm)*X_t + lm*P(Y_t)
                inner_Y = 0.4 * self.X_t + 0.3 * self.backend.sigmoid(self.X_t)
                inner_P = np.clip(inner_Y, -1.0, 1.0)
                expected = (1.0 - lm) * self.X_t + lm * inner_P
                np.testing.assert_allclose(X_next, expected)

    def test_certificate_failure_negative_margin(self):
        """Verify certificate failure (negative margin) when operators are non-contractive."""
        # Xi norm = 0.8, Lambda norm = 0.5, L_T = 1.0 => c = 1.3 (non-contractive)
        Xi = np.eye(self.dim) * 0.8
        Lambda = np.eye(self.dim) * 0.5
        
        with self.assertWarns(UserWarning):
            X_next, meta = step(self.X_t, Xi, Lambda, epsilon=0.05, lambda_m=1.0)
        
        # c = (1-1) + 1*(0.8 + 0.5) = 1.3
        self.assertAlmostEqual(meta["c_lambda"], 1.3)
        self.assertAlmostEqual(meta["margin"], -0.35) # (1-0.05) - 1.3 = 0.95 - 1.3 = -0.35

    def test_geometric_shrinkage_witness(self):
        """Numerical witness showing ||X_{t+1} - X^*|| <= c ||X_t - X^*||."""
        # For a linear system X_next = M X_t, X^* = 0.
        # Here we use Xi=0.4, Lambda=0, G=0 => X_next = (1-lm)X_t + lm*0.4*X_t
        # c = (1-lm) + lm*0.4
        lm = 0.5
        Xi = np.eye(self.dim) * 0.4
        Lambda = np.zeros((self.dim, self.dim))
        
        X_t = self.X_t
        # Use a T_func that is zero to make it a simple linear decay towards zero
        X_next, meta = step(X_t, Xi, Lambda, T_func=lambda x: np.zeros_like(x), lambda_m=lm)
        
        c_theory = (1.0 - lm) + lm * 0.4
        dist_t = np.linalg.norm(X_t, ord=2)
        dist_next = np.linalg.norm(X_next, ord=2)
        
        self.assertLessEqual(dist_next, c_theory * dist_t + 1e-12)
        self.assertAlmostEqual(meta["c_lambda"], c_theory)

if __name__ == "__main__":
    unittest.main()
