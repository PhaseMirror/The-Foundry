"""
ADR-087 Phase 2: Prime-Spectral Operator

Phase 2 Gate: Prime-Spectral Operator and Time-Sieve Computation

This gate verifies that:
1. The prime-spectral operator A can be computed.
2. The time-sieve operator B can be computed.
3. The resulting spectral bound sigma is populated in the dialect.
4. L0 Invariant #3 (Spectral Strict Contraction) holds.
"""
import math
from typing import Dict, Any, List
from pirtm.spectral.computation import SpectralComputer
from .pirtm_types import create_spectral_bound, PirtmModuleType
from .l0_invariants import L0InvariantEnforcer, L0InvariantId


class Phase2Gate:
    def __init__(self):
        self.status = "pending"
        self.violations = []
        self.computed_sigma: float | None = None
        self.enforcer = L0InvariantEnforcer()
        self.module = PirtmModuleType(prime_index=7, epsilon=0.05, op_norm_t=0.0) # Dummy module for L0 checks

    def run(self, mock_state: Dict[str, Any] | None = None, mock_time_step: int = 0):
        # Use a mock state and time step for now
        if mock_state is None:
            mock_state = {2: 1.0, 3: 1.0, 5: 1.0}

        dimension = len(mock_state)
        computer = SpectralComputer(dimension)
        self.computed_sigma = computer.compute_sigma(mock_state, mock_time_step)
        
        # Populate sigma into the dummy module and check L0 Invariant #3
        self.module.sigma = create_spectral_bound(self.computed_sigma)
        if self.enforcer.check_l0_invariant_3(self.module):
            self.status = "passed"
        else:
            self.status = "failed"
            self.violations.extend(self.enforcer.violations)
        return self

def execute_phase_2_gate() -> bool:
    print("======================================================================")
    print("ADR-087 PHASE 2 GATE: Prime-Spectral Operator")
    print("======================================================================")
    
    gate = Phase2Gate()
    gate.run()
    

    print(f"Status: {gate.status.upper()}")
    if gate.computed_sigma is not None:
        print(f"Computed Sigma: {gate.computed_sigma:.4f}")
    print(f"L0 Violations: {len(gate.violations)}")

    if gate.status == "passed":
        print("\n✅ Phase 2 complete. Ready for Phase 3 (Type System Mirror)")
        return True
    else:
        print("\n❌ Phase 2 BLOCKED. Fix errors above before proceeding.")
        for violation in gate.violations:
            print(f"  - {violation.violation_message}")
        return False

if __name__ == "__main__":
    execute_phase_2_gate()
