import unittest
from pirtm.gate.stability_gate import StabilityGate

class TestStabilityGate(unittest.TestCase):
    def test_base_stability(self):
        # λm=0.5, L_G=0.5 -> c_base = 0.5 + 0.25 = 0.75
        gate = StabilityGate(lambda_m=0.5, L_G=0.5)
        self.assertEqual(gate.c_base, 0.75)
        self.assertTrue(gate.check_admissibility(delta=0.1)) # c_total = 0.75 + 0.05 = 0.8 < 1
        self.assertFalse(gate.check_admissibility(delta=0.6)) # c_total = 0.75 + 0.3 = 1.05 > 1
        
    def test_max_delta(self):
        # λm=1.0, L_G=0.2 -> c_base = 0.2
        gate = StabilityGate(lambda_m=1.0, L_G=0.2, epsilon=0.0)
        self.assertAlmostEqual(gate.max_allowed_delta(), 0.8)
        
    def test_edge_cases(self):
        # λm=0 (pure identity)
        gate = StabilityGate(lambda_m=0.0, L_G=0.5)
        self.assertTrue(gate.check_admissibility(delta=100.0))
        
        # L_G=1.0 (marginal stability)
        gate = StabilityGate(lambda_m=0.5, L_G=1.0, epsilon=0.01)
        self.assertFalse(gate.check_admissibility(delta=0.0)) # c_base = 1.0 >= 1.0 - 0.01

if __name__ == "__main__":
    unittest.main()
