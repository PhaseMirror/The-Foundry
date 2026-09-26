"""
Final Verification for PIRTM Layer-II Integration.

Verifies the end-to-end flow: MultiplicityCell -> Fock Embedding -> Stabilization.
"""

import unittest
import torch
import numpy as np
from pirtm.core.fock_multiplicity import FockMultiplicityEngine

class TestLayer2Integration(unittest.TestCase):
    def setUp(self):
        self.primes = [2, 3, 5, 7, 11]
        self.feature_dim = 4
        self.engine = FockMultiplicityEngine(self.primes, self.feature_dim, sigma=1.0)

    def test_engine_step(self):
        """Verify end-to-end engine step."""
        psi_t = torch.randn(len(self.primes), self.feature_dim)
        output = self.engine.step(psi_t)
        
        self.assertIn("psi_next", output)
        self.assertIn("fock_state", output)
        self.assertIn("ace", output)
        self.assertIn("number_exp", output)
        
        # Check shapes and types
        self.assertEqual(output["psi_next"].shape, (len(self.primes), self.feature_dim))
        self.assertTrue(output["ace"] >= 0)
        self.assertTrue(output["number_exp"] >= 0)

    def test_divergence_prevention_end_to_end(self):
        """Verify that stabilization triggers when number expectation is high."""
        # Use a large input to drive state growth
        psi_t = torch.ones(len(self.primes), self.feature_dim) * 5.0
        
        # Force large weights to drive expansion
        with torch.no_grad():
            self.engine.cell.A_p.fill_(2.0)
            
        output = self.engine.step(psi_t)
        
        # Eff lambda_m for these primes with sigma=1.0 is ~0.4
        # Threshold is ~2.5. If N > 2.5, it should be scaled.
        self.assertLessEqual(output["number_exp"], 1.0 / (torch.mean(self.engine.cell.lambda_p).item() + 1e-9) + 0.1)

if __name__ == "__main__":
    unittest.main()
