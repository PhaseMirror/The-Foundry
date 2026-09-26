import unittest
import os
import yaml
from pathlib import Path
import importlib
import pirtm.constants

class TestPolicyIntegration(unittest.TestCase):
    def setUp(self):
        # Path to the real policy file
        self.repo_root = Path(__file__).resolve().parent.parent.parent.parent
        self.policy_path = self.repo_root / "governance" / "policies" / "l0-invariants.yaml"
        
        # Original values for restoration
        with open(self.policy_path, 'r') as f:
            self.original_policy_content = f.read()

    def tearDown(self):
        # Restore original policy content
        with open(self.policy_path, 'w') as f:
            f.write(self.original_policy_content)
        # Force reload constants
        importlib.reload(pirtm.constants)

    def test_threshold_load_from_yaml(self):
        """Verify that constants.py reflects the values in l0-invariants.yaml."""
        with open(self.policy_path, 'r') as f:
            policy = yaml.safe_load(f)
        
        # Force reload to ensure it reads the file
        importlib.reload(pirtm.constants)
        
        # Find expected values in YAML
        expected_drift = next(r["condition"]["value"] for r in policy["rules"] if r["name"] == "L0-003")
        expected_nonce = next(r["condition"]["value"] for r in policy["rules"] if r["name"] == "L0-004")
        expected_contractivity = next(r["condition"]["value"] for r in policy["rules"] if r["name"] == "contraction-condition")
        
        self.assertEqual(pirtm.constants.DRIFT_THRESHOLD, expected_drift)
        self.assertEqual(pirtm.constants.NONCE_LIFETIME_MS, expected_nonce)
        self.assertEqual(pirtm.constants.OPERATOR_CONTRACTIVITY_BOUND, expected_contractivity)

    def test_threshold_update_propagation(self):
        """Verify that changing the YAML actually changes the PIRTM constant."""
        with open(self.policy_path, 'r') as f:
            policy = yaml.safe_load(f)
        
        # Modify a value in the local policy file
        for rule in policy["rules"]:
            if rule["name"] == "L0-003":
                rule["condition"]["value"] = 0.99 # Unlikely high value for testing
        
        with open(self.policy_path, 'w') as f:
            yaml.dump(policy, f)
            
        # Force reload constants
        importlib.reload(pirtm.constants)
        
        self.assertEqual(pirtm.constants.DRIFT_THRESHOLD, 0.99)
        print("✅ Propagation verified: YAML change reflected in Python runtime.")

if __name__ == "__main__":
    unittest.main()
