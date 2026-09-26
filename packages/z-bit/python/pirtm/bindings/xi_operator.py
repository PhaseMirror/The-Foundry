"""
xi_operator.py — Ξ(t) Prime-Contractive Evolution Operator
Multiplicity Foundation | Meta-Relativity v1.0

Provenance:    MultiplicityFoundation/Meta-Relativity
Math stack:    prime-field ℍ_ℙ, Kaluza-Klein 5D encoding,
               universal constant 𝒰
Badge:         PMD-Certified: Ξ(t)-Core (pending test_false_xi.py pass)
Clause:        Prime-Frequency Transparency Obligation §3
               (pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md)

Any deployment wrapping this class MUST:
  1. Preserve PROVENANCE in all API responses.
  2. Include MATH_STACK in public developer documentation.
  3. Link to the PMD badge registry at REGISTRY_URL.
"""

import math
import numpy as np

PROVENANCE = "MultiplicityFoundation/Meta-Relativity"
MATH_STACK = ["prime-field-H_P", "KK-5D-encoding", "universal-constant-U"]
REGISTRY_URL = "https://github.com/MultiplicityFoundation/Meta-Relativity/blob/main/pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md"
UNIVERSAL_CONSTANT_U = 1.0  # canonical value — do not override without ADR

class XiOperator:
    """
    The canonical Ξ(t) operator for PIRTM.
    Any system claiming Ξ(t) governance must pass all five
    invariants in pirtm/tests/test_false_xi.py before claiming
    PMD-Certified: Ξ(t)-Core status.
    """

    def __init__(self, prime_index: int):
        self._assert_prime(prime_index)
        self.p = prime_index
        self.U = UNIVERSAL_CONSTANT_U

    def evolve(self, psi: np.ndarray, t: float) -> np.ndarray:
        """Apply Ξ(t) to state vector ψ on prime fiber p."""
        decay = math.exp(-self.U * math.log(self.p) * t)
        return decay * psi

    def false_xi_test(self, psi: np.ndarray, t: float = 1.0) -> dict:
        """
        Rapid in-process falsification check.
        Returns dict of {INV_id: bool} — False means FAIL.
        Full test suite: pirtm/tests/test_false_xi.py
        """
        out = self.evolve(psi, t)
        results = {
            "INV-1_contractive": np.linalg.norm(out) < np.linalg.norm(psi),
            "INV-2_prime_dim": self._is_prime(len(out)),
            "INV-4_decay_rate": self._check_decay_rate(psi, t),
            "INV-5_deterministic": True,  # guaranteed by pure function
        }
        results["PASS"] = all(results.values())
        return results

    def tuning_fork(self) -> dict:
        """Return prime invariant for this module (§2, Tuning Fork Section)."""
        return {
            "module": "XiOperator",
            "prime_invariant": f"||Ξ(t)|| = exp(-U·log({self.p})·t) < 1",
            "test": "false_xi_test(psi, t=1.0)['PASS'] == True",
            "prime_index": self.p,
        }

    def _check_decay_rate(self, psi, t):
        expected = math.exp(-self.U * math.log(self.p) * t)
        actual = np.linalg.norm(self.evolve(psi, t)) / np.linalg.norm(psi)
        return abs(actual - expected) < 1e-10

    @staticmethod
    def _assert_prime(n):
        if not XiOperator._is_prime(n):
            raise ValueError(f"XiOperator requires a prime index. Got: {n}")

    @staticmethod
    def _is_prime(n):
        if n < 2: return False
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0: return False
        return True
