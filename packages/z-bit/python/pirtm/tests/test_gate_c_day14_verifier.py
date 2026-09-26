"""
C-03: Day 14 Contractivity Check Verifier and CI Integration

Gate requirement (ADR-007, Day 14):
  mlir-opt --verify-diagnostics pirtm-types-basic.mlir passes all four lines.

This test simulates the mlir-opt --verify-diagnostics workflow using the
Python verifier to validate that:
  1. Prime cert (mod=7) passes without errors
  2. Non-prime composite cert (mod=7921 = 89*89) fails with verbatim diagnostic
  3. Non-prime perfect-square cert (mod=49 = 7*7) fails with verbatim diagnostic
  4. Valid session graph (mod=210, squarefree) passes without errors

Additionally verifies:
  5. Full contractivity pipeline (transpile-time check) for contractive modules
  6. Pipeline rejects non-contractive modules (r(Λ) ≥ 1 - ε)

Mathematical anchor:
  Day 14 gate: r(Λ) < 1 − ε verified at compile time (Banach FPT).

Reference: ADR-007, ADR-008, Gate C C-03
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from pirtm.dialect.pirtm_types import (
    CertType,
    SessionGraphType,
    CouplingType,
    VerificationError,
)
from pirtm.mlir.verification_pass import (
    ContractivityVerifier,
    verify_mlir_contractivity,
)

# Path to the canonical MLIR test file
_MLIR_FILE = Path(__file__).parent / "pirtm-types-basic.mlir"


# ---------------------------------------------------------------------------
# Helper: run the dialect-level diagnostic verifier on a type construction
# ---------------------------------------------------------------------------

def _try_cert(mod: int) -> tuple[bool, str]:
    """Try to create CertType(mod). Return (success, error_msg)."""
    try:
        CertType(mod=mod)
        return True, ""
    except VerificationError as e:
        return False, str(e)


def _try_session_graph(mod: int) -> tuple[bool, str]:
    """Try to create SessionGraphType(mod). Return (success, error_msg)."""
    try:
        SessionGraphType(mod=mod, coupling=CouplingType.UNRESOLVED)
        return True, ""
    except VerificationError as e:
        return False, str(e)


# ---------------------------------------------------------------------------
# Test 1-4: Correspond to the four cases in pirtm-types-basic.mlir
# ---------------------------------------------------------------------------

class TestMLIRDiagnosticVerifier:
    """
    MLIR --verify-diagnostics simulation for pirtm-types-basic.mlir.

    Each test corresponds to one of the four test cases in the .mlir file.
    Error messages must match spec verbatim (they are spec-stable API).
    """

    def test_case1_prime_cert_passes(self):
        """
        Test 1 (pirtm-types-basic.mlir): Prime cert mod=7 → PASS.

        %t1 = "test.op"() {type = !pirtm.cert(mod=7)} : () -> !pirtm.cert(mod=7)
        No expected-error annotation → must succeed.
        """
        ok, msg = _try_cert(7)
        assert ok, f"Expected PASS for mod=7 but got error: {msg}"

    def test_case2_composite_7921_fails_verbatim(self):
        """
        Test 2 (pirtm-types-basic.mlir): Non-prime mod=7921 → FAIL with exact text.

        // expected-error@+1 {{mod=7921 is not prime (89^2)}}
        %t2 = "test.op"() {type = !pirtm.cert(mod=7921)} : () -> !pirtm.cert(mod=7921)

        The error message must contain "mod=7921 is not prime (89^2)" verbatim.
        This string is spec-stable API (changing it requires ADR amendment).
        """
        ok, msg = _try_cert(7921)
        assert not ok, "Expected FAIL for mod=7921 (89²) but verification passed"
        assert "mod=7921 is not prime" in msg, (
            f"Error message prefix missing. Got: {msg!r}"
        )
        assert "89^2" in msg, (
            f"Factorization '89^2' missing from error. Got: {msg!r}"
        )

    def test_case3_perfect_square_49_fails_verbatim(self):
        """
        Test 3 (pirtm-types-basic.mlir): Non-prime mod=49 → FAIL with exact text.

        // expected-error@+1 {{mod=49 is not prime (7^2)}}
        %t3 = "test.op"() {type = !pirtm.cert(mod=49)} : () -> !pirtm.cert(mod=49)

        The error message must contain "mod=49 is not prime (7^2)" verbatim.
        """
        ok, msg = _try_cert(49)
        assert not ok, "Expected FAIL for mod=49 (7²) but verification passed"
        assert "mod=49 is not prime" in msg, (
            f"Error message prefix missing. Got: {msg!r}"
        )
        assert "7^2" in msg, (
            f"Factorization '7^2' missing from error. Got: {msg!r}"
        )

    def test_case4_valid_session_graph_passes(self):
        """
        Test 4 (pirtm-types-basic.mlir): Valid session graph mod=210 → PASS.

        %t4 = "test.op"() {
          type = !pirtm.session_graph(mod=210, coupling=#pirtm.unresolved_coupling)
        } : () -> !pirtm.session_graph(mod=210, coupling=#pirtm.unresolved_coupling)

        mod=210 = 2 × 3 × 5 × 7 is squarefree → PASS.
        """
        ok, msg = _try_session_graph(210)
        assert ok, f"Expected PASS for mod=210 (squarefree) but got: {msg}"

    def test_all_four_cases_in_sequence(self):
        """
        CI gate: Run all four test cases and assert all expectations match.
        Simulates: mlir-opt --verify-diagnostics pirtm-types-basic.mlir
        """
        # Case 1: mod=7 → PASS
        ok1, _ = _try_cert(7)
        assert ok1

        # Case 2: mod=7921 → FAIL with "mod=7921 is not prime (89^2)"
        ok2, msg2 = _try_cert(7921)
        assert not ok2
        assert "mod=7921 is not prime" in msg2
        assert "89^2" in msg2

        # Case 3: mod=49 → FAIL with "mod=49 is not prime (7^2)"
        ok3, msg3 = _try_cert(49)
        assert not ok3
        assert "mod=49 is not prime" in msg3
        assert "7^2" in msg3

        # Case 4: session_graph(mod=210) → PASS
        ok4, _ = _try_session_graph(210)
        assert ok4


# ---------------------------------------------------------------------------
# Contractivity pipeline (Day 14 acceptance gate)
# ---------------------------------------------------------------------------

class TestDay14ContractivityPipeline:
    """
    Full Day 14 gate: r(Λ) < 1 − ε verified at transpile time.
    """

    def test_contractive_module_passes(self):
        """
        r(Λ) = 0.90 < 1 - 0.05 = 0.95 → verification PASS.
        """
        mlir = """
        pirtm.module {
          @epsilon = 0.05 : f64
          @confidence = 0.9999 : f64
          @spectral_radius = 0.90 : f64
          @op_norm_T = 1.0 : f64
          @prime_index = 17 : i64
        }
        """
        is_valid, _, errors, _ = verify_mlir_contractivity(mlir)
        assert is_valid, f"Expected PASS but got errors: {errors}"
        assert errors == []

    def test_marginally_stable_module_fails(self):
        """
        r(Λ) = 0.95 = 1 - 0.05 (not strictly less) → verification FAIL.
        Banach FPT requires strict inequality r(Λ) < 1 - ε.
        """
        mlir = """
        pirtm.module {
          @epsilon = 0.05 : f64
          @confidence = 0.9999 : f64
          @spectral_radius = 0.95 : f64
        }
        """
        is_valid, _, errors, _ = verify_mlir_contractivity(mlir)
        assert not is_valid, "Marginal case (r = 1 - ε) must fail strict inequality"
        assert len(errors) > 0

    def test_divergent_module_fails(self):
        """
        r(Λ) = 1.1 > 1.0 → divergent system, verification FAIL.
        """
        mlir = """
        pirtm.module {
          @epsilon = 0.05 : f64
          @confidence = 0.9999 : f64
          @spectral_radius = 1.1 : f64
        }
        """
        is_valid, _, errors, _ = verify_mlir_contractivity(mlir)
        assert not is_valid
        assert len(errors) > 0

    def test_error_message_includes_spectral_radius(self):
        """
        Failure diagnostic must include r(Λ) value and 1-ε threshold.
        """
        mlir = """
        pirtm.module {
          @epsilon = 0.05 : f64
          @spectral_radius = 0.96 : f64
        }
        """
        is_valid, _, errors, _ = verify_mlir_contractivity(mlir)
        assert not is_valid
        assert any("0.96" in e for e in errors), "Error must cite actual r(Λ)=0.96"
        assert any("0.95" in e for e in errors), "Error must cite threshold 1-ε=0.95"

    def test_module_with_projection_op_passes(self):
        """
        Module containing pirtm.clip (projection) without spectral_radius → PASS.
        Projection always produces contractivity<0.0, 1.0>.
        """
        mlir = """
        pirtm.module {
          @epsilon = 0.05 : f64
          @confidence = 0.9999 : f64
        }
        %out = "pirtm.clip"(%X_t) : (tensor<?xf64>) -> tensor<?xf64>
        """
        is_valid, types, errors, _ = verify_mlir_contractivity(mlir)
        assert is_valid, f"Expected PASS but errors: {errors}"
        # Projection type must be contractivity<0.0, 1.0>
        for op_id, ct in types.items():
            assert ct.epsilon == 0.0
            assert ct.confidence == 1.0

    def test_day14_gate_passes_on_mlir_file(self):
        """
        CI gate: Read the canonical pirtm-types-basic.mlir and validate
        the four expected behaviors match the --verify-diagnostics annotations.

        This test simulates:
          mlir-opt --verify-diagnostics pirtm-types-basic.mlir
        """
        if not _MLIR_FILE.exists():
            pytest.skip(f"MLIR test file not found: {_MLIR_FILE}")

        content = _MLIR_FILE.read_text()

        # The file contains expected-error annotations for cases 2 and 3.
        # Verify the Python verifier agrees with the annotations:

        # Case 2: mod=7921 must fail (check via dialect)
        ok2, msg2 = _try_cert(7921)
        assert not ok2
        assert "89^2" in msg2 or "89 * 89" in msg2 or "89^2" in content

        # Case 3: mod=49 must fail (check via dialect)
        ok3, msg3 = _try_cert(49)
        assert not ok3
        assert "7^2" in msg3 or "7 * 7" in msg3 or "7^2" in content

        # Case 4: mod=210 must pass
        ok4, _ = _try_session_graph(210)
        assert ok4

        # The MLIR file must contain the verbatim expected-error strings
        assert "mod=7921 is not prime (89^2)" in content, (
            "pirtm-types-basic.mlir missing expected-error for 7921"
        )
        assert "mod=49 is not prime (7^2)" in content, (
            "pirtm-types-basic.mlir missing expected-error for 49"
        )


if __name__ == "__main__":
    import subprocess
    sys.exit(subprocess.call([sys.executable, "-m", "pytest", __file__, "-v"]))
