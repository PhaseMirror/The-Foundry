"""
Tests for PIRTM Layer-II Fock Bridge.

Verifies canonical commutation relations (CCR), Fock embedding, 
and Λ-stabilization for divergence prevention.
"""

import unittest
import numpy as np
from pirtm.core.fock import FockSpaceBridge, fock_embedding

class TestFockBridge(unittest.TestCase):
    def setUp(self):
        self.primes = [2, 3, 5]
        self.bridge = FockSpaceBridge(self.primes)

    def test_ccr_identity(self):
        """Verify [a_p, a_p^\dagger] |0> = |0>."""
        p = 2
        vac = self.bridge.vacuum()
        # a_p a_p^\dagger |0> = a_p |1_p> = 1 * |0>
        state = self.bridge.a_dag(p, vac)
        state = self.bridge.a(p, state)
        
        self.assertAlmostEqual(state.occupations[(0, 0, 0)], 1.0)
        self.assertEqual(len(state.occupations), 1)

    def test_ccr_annihilation_vacuum(self):
        """Verify a_p |0> = 0."""
        p = 3
        vac = self.bridge.vacuum()
        state = self.bridge.a(p, vac)
        self.assertEqual(len(state.occupations), 0)

    def test_fock_embedding(self):
        """Verify fock_embedding functor maps single-particle superposition."""
        # psi = 0.6 |2> + 0.8 |3>
        psi = np.array([0.6, 0.8, 0.0])
        state = fock_embedding(psi, self.bridge)
        
        # Expect component |1, 0, 0> with amp 0.6 and |0, 1, 0> with amp 0.8
        self.assertAlmostEqual(state.occupations[(1, 0, 0)], 0.6)
        self.assertAlmostEqual(state.occupations[(0, 1, 0)], 0.8)
        self.assertAlmostEqual(state.norm(), 1.0)

    def test_lambda_stabilization(self):
        """Verify Λ-stabilization prevents number operator divergence."""
        vac = self.bridge.vacuum()
        # Create a state with N=2: a_2^\dagger a_3^\dagger |0>
        state = self.bridge.a_dag(2, vac)
        state = self.bridge.a_dag(3, state)
        self.assertEqual(self.bridge.number_operator(state), 2.0)
        
        # With lambda_m=1.0, threshold is 1.0. N=2 should be scaled down.
        stab_state = self.bridge.stabilized_update(state, lambda_m=1.0)
        self.assertLessEqual(self.bridge.number_operator(stab_state), 1.0)

    def test_many_body_superposition(self):
        """Verify complex many-body state construction."""
        vac = self.bridge.vacuum()
        # |phi> = (a_2^\dagger + a_3^\dagger) |0> / sqrt(2)
        state = (self.bridge.a_dag(2, vac) + self.bridge.a_dag(3, vac)) * (1.0 / np.sqrt(2))
        self.assertAlmostEqual(state.norm(), 1.0)
        self.assertAlmostEqual(self.bridge.number_operator(state), 1.0)

    def test_multiplicity_operator(self):
        """Verify multiplicity operator expectation value."""
        vac = self.bridge.vacuum()
        # |phi> = a_2^\dagger |0>
        state = self.bridge.a_dag(2, vac)
        # E[M] = log(2)
        self.assertAlmostEqual(self.bridge.multiplicity_expectation(state), np.log(2))
        
        # |phi> = a_3^\dagger a_5^\dagger |0>
        state = self.bridge.a_dag(5, self.bridge.a_dag(3, vac))
        # E[M] = log(3) + log(5) = log(15)
        self.assertAlmostEqual(self.bridge.multiplicity_expectation(state), np.log(15))

    def test_multiplicity_diagonal(self):
        """Verify multiplicity operator diagonal elements."""
        diag = self.bridge.multiplicity_operator_diagonal()
        expected = np.log([2, 3, 5])
        np.testing.assert_allclose(diag, expected)

if __name__ == "__main__":
    unittest.main()
