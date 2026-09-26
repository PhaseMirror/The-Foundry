import json
import hashlib
import os

class ZetaBridge:
    """
    Authoritative bridge for spectral invariants (Primes & Zeta Zeros).
    Enforces the Witness Preservation Invariant (ADR-028).
    """

    def __init__(self, basis_path="gov/zeta_basis.json"):
        self._basis_path = basis_path
        self._locked = False
        self.primes = []
        self.zeros = []
        self.metadata = {}
        
        if os.path.exists(basis_path):
            self.load_basis(basis_path)
        
        self._locked = True # Lock to prevent accidental mutation post-init

    def __setattr__(self, name, value):
        if getattr(self, '_locked', False) and name in ['primes', 'zeros', 'metadata']:
            raise AttributeError(f"Mutation of {name} is forbidden on a locked ZetaBridge (ADR-028).")
        super().__setattr__(name, value)

    def load_basis(self, path):
        with open(path, 'r') as f:
            data = json.load(f)
        
        # Merkle Validation (simplified for stub)
        expected_hash = data.get('merkle_root')
        content = json.dumps(data.get('body'), sort_keys=True)
        actual_hash = hashlib.sha256(content.encode()).hexdigest()
        
        if expected_hash and actual_hash != expected_hash:
            raise ValueError(f"Merkle validation failed for {path}. Integrity breach detected.")
        
        body = data.get('body', {})
        self.primes = body.get('primes', [])
        self.zeros = body.get('zeros', [])
        self.metadata = body.get('metadata', {})

    def emit_witness(self):
        """Generates the SpectralWitness shard for UnifiedWitness."""
        zero_spacings = [self.zeros[i+1] - self.zeros[i] for i in range(len(self.zeros)-1)]
        
        # Mock GUE surrogate check
        gue_variance = 0.18 # Authoritative GUE baseline (ADR-028)
        actual_variance = self._calculate_variance(zero_spacings) if zero_spacings else 0
        
        return {
            "component": "ZetaBridge",
            "n_0": len(self.zeros),
            "zero_spacings": zero_spacings,
            "gue_stats": {
                "expected_variance": gue_variance,
                "actual_variance": actual_variance,
                "is_gue_compliant": abs(actual_variance - gue_variance) < 0.08
            },
            "bridge_hashes": {
                "basis": hashlib.sha256(open(self._basis_path, 'rb').read()).hexdigest() if os.path.exists(self._basis_path) else None
            }
        }

    def _calculate_variance(self, data):
        if not data: return 0
        mean = sum(data) / len(data)
        return sum((x - mean) ** 2 for x in data) / len(data)
