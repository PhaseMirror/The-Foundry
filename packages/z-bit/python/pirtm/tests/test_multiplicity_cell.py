"""
Tests for PIRTM MultiplicityCell.

Verifies channel-resolved λ_p weighting, Lipschitz estimation, 
and contraction verification.
"""

import unittest
import torch
from pirtm.core.multiplicity_cell import MultiplicityCell

class TestMultiplicityCell(unittest.TestCase):
    def setUp(self):
        self.primes = [2, 3, 5, 7, 11]
        self.feature_dim = 8
        self.cell = MultiplicityCell(self.primes, self.feature_dim, sigma=1.0)

    def test_lambda_p_initialization(self):
        """Verify λ_p follows p^-sigma decay."""
        expected = torch.tensor([p**-1.0 for p in self.primes])
        torch.testing.assert_close(self.cell.lambda_p, expected)

    def test_lipschitz_estimates(self):
        """Verify Lipschitz estimates are positive and shape-correct."""
        L_p = self.cell.compute_lipschitz_estimates()
        self.assertEqual(L_p.shape, (len(self.primes),))
        self.assertTrue(torch.all(L_p > 0))

    def test_contraction_verification(self):
        """Verify contraction check correctly identifies contractive state."""
        # Force small weights to ensure contraction
        with torch.no_grad():
            self.cell.A_p.fill_(0.01)
            self.cell.B_p.fill_(0.01)
            self.cell.E_p.fill_(0.01)
        
        self.assertTrue(self.cell.check_contraction(margin=0.05))

    def test_forward_pass_ace(self):
        """Verify ACE is tracked during forward pass."""
        psi_t = torch.randn(len(self.primes), self.feature_dim)
        output = self.cell(psi_t)
        
        self.assertIn("psi_next", output)
        self.assertIn("ace_p", output)
        self.assertIn("total_ace", output)
        
        self.assertEqual(output["ace_p"].shape, (len(self.primes),))
        self.assertTrue(output["total_ace"] >= 0)

    def test_clipping_projection(self):
        """Verify that psi_next is clipped to [-1, 1]."""
        # Use large input to force clipping
        psi_t = torch.ones(len(self.primes), self.feature_dim) * 10.0
        output = self.cell(psi_t)
        
        self.assertTrue(torch.all(output["psi_next"] <= 1.0))
        self.assertTrue(torch.all(output["psi_next"] >= -1.0))

if __name__ == "__main__":
    unittest.main()
