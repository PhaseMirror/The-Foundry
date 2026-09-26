"""
test_false_xi.py — False Ξ(t) Rapid Falsification Test Suite
Multiplicity Foundation | Meta-Relativity v1.0
Provenance: MultiplicityFoundation/Meta-Relativity

Five invariants that any genuine Ξ(t) implementation must satisfy.
A claimed system failing ANY single test is disqualified from
PMD-Certified: Ξ(t)-Core status.

Extends: test_day_14_contractivity.py (INV-1 overlap)
"""

import math
import unittest
import numpy as np

UNIVERSAL_CONSTANT_U = 1.0  # Replace with repo-canonical value when locked

FIRST_20_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
                   31, 37, 41, 43, 47, 53, 59, 61, 67, 71]

def is_prime(n):
    if n < 2: return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0: return False
    return True

def xi_evolve(psi: np.ndarray, t: float, prime_index: int) -> np.ndarray:
    """Reference Ξ(t) — pure prime-contractive evolution on a single fiber."""
    decay = math.exp(-UNIVERSAL_CONSTANT_U * math.log(prime_index) * t)
    return decay * psi

class TestFalseXi(unittest.TestCase):

    # INV-1: Contractive Spectral Bound
    def test_inv1_contractive(self):
        """||Ξ(t)ψ|| < ||ψ|| for all t > 0."""
        for p in FIRST_20_PRIMES:
            psi = np.random.randn(p)
            norm_before = np.linalg.norm(psi)
            norm_after = np.linalg.norm(xi_evolve(psi, t=0.1, prime_index=p))
            self.assertLess(norm_after, norm_before,
                msg=f"INV-1 FAIL at prime {p}: norm did not contract.")

    # INV-2: Prime-Field Dimensionality Preservation
    def test_inv2_prime_dimension(self):
        """State space dimension must be prime at every step."""
        for p in FIRST_20_PRIMES:
            psi = np.random.randn(p)
            out = xi_evolve(psi, t=0.5, prime_index=p)
            dim = len(out)
            self.assertTrue(is_prime(dim),
                msg=f"INV-2 FAIL: output dimension {dim} is not prime.")

    # INV-3: Kaluza-Klein 5D Spectral Gap
    def test_inv3_kk_spectral_gap(self):
        """
        Frequency content must not appear at the first composite above p_max.
        Uses a superposition signal across all active primes.
        """
        t = np.linspace(0, 1, 1024)
        signal = sum(
            math.exp(-UNIVERSAL_CONSTANT_U * math.log(p)) * np.sin(2 * math.pi * p * t)
            for p in FIRST_20_PRIMES
        )
        fft_mag = np.abs(np.fft.rfft(signal))
        freqs = np.fft.rfftfreq(len(t), d=1/1024)

        # First composite integer above p_max=71 is 72
        composite_above = 72
        idx = np.argmin(np.abs(freqs - composite_above))
        composite_energy = fft_mag[idx]

        # Energy at first composite should be negligible vs. prime peaks
        prime_peak_energy = max(
            fft_mag[np.argmin(np.abs(freqs - p))] for p in FIRST_20_PRIMES
        )
        self.assertLess(composite_energy / prime_peak_energy, 0.05,
            msg=f"INV-3 FAIL: KK spectral gap violated. "
                f"Composite energy ratio: {composite_energy/prime_peak_energy:.4f}")

    # INV-4: Universal Constant Residue
    def test_inv4_universal_constant_decay_rate(self):
        """
        Distance decay rate must equal U*log(p), not an arbitrary lambda.
        """
        for p in [7, 13, 31]:  # sample of primes
            psi_x = np.ones(p)
            psi_y = np.zeros(p)
            t_vals = [0.1, 0.5, 1.0, 2.0]
            for t in t_vals:
                dist_before = np.linalg.norm(psi_x - psi_y)
                dist_after = np.linalg.norm(
                    xi_evolve(psi_x, t, p) - xi_evolve(psi_y, t, p)
                )
                expected_bound = math.exp(-UNIVERSAL_CONSTANT_U * math.log(p) * t) * dist_before
                self.assertAlmostEqual(dist_after, expected_bound, places=10,
                    msg=f"INV-4 FAIL at prime {p}, t={t}: "
                        f"decay rate does not match U*log(p).")

    # INV-5: Digital Fingerprint Reproducibility
    def test_inv5_seed_determinism(self):
        """
        Identical prime seed + initial state must produce bit-identical output.
        """
        for p in FIRST_20_PRIMES:
            np.random.seed(p)
            psi_a = np.random.randn(p)
            np.random.seed(p)
            psi_b = np.random.randn(p)

            out_a = xi_evolve(psi_a, t=1.0, prime_index=p)
            out_b = xi_evolve(psi_b, t=1.0, prime_index=p)

            np.testing.assert_array_equal(out_a, out_b,
                err_msg=f"INV-5 FAIL at prime {p}: "
                        f"non-determinism under fixed prime seed.")

if __name__ == "__main__":
    unittest.main()
