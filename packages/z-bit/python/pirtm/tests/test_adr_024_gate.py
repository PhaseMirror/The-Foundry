"""ADR-024 Phase 1: Clone-Check Automation Gate Tests

Purpose:
    Verify clone-check automation detects copies/derivatives and produces deterministic results.

Blocking condition:
    If any test fails → ADR-024 incomplete.

Tests:
    1. Token similarity detects trivial copy (FAIL)
    2. Token similarity passes for novel code (PASS)
    3. Clone-check CLI runs and outputs JSON report
    4. Clone-check results deterministic (fingerprint stable)

Provenance: MultiplicityFoundation/Meta-Relativity
"""

import json
import os
import tempfile

from pirtm.governance.clone_check import clone_check, token_similarity
from pirtm.tools.pirtm_clone_check import main as clone_check_cli


# Sample candidate/reference code snippets
REFERENCE_CODE = """def xi_decay(psi, p, t):\n    return [x * math.exp(-math.log(p)*t) for x in psi]\n"""

COPY_CODE = """def xi_decay(psi, p, t):\n    # copied from reference\n    return [x * math.exp(-math.log(p)*t) for x in psi]\n"""

NOVEL_CODE = """def xi_decay_vector(phi, q, tau):\n    # different approach\n    factor = math.exp(-tau * math.log(q))\n    return [v*factor for v in phi]\n"""


class TestGate1TokenSimilarityFail:
    """Token similarity should flag trivial copies as FAIL."""

    def test_token_similarity_detects_copy(self):
        score = token_similarity(REFERENCE_CODE, COPY_CODE)
        assert score >= 0.80, f"Expected high similarity, got {score:.4f}"


class TestGate2TokenSimilarityPass:
    """Token similarity should pass for novel implementations."""

    def test_token_similarity_novel_code(self):
        score = token_similarity(REFERENCE_CODE, NOVEL_CODE)
        assert score < 0.65, f"Expected low similarity, got {score:.4f}"


class TestGate3CloneCheckCLI:
    """Clone-check CLI should run and produce JSON output."""

    def test_clone_check_cli_outputs_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            cand = os.path.join(tmpdir, "cand.py")
            ref = os.path.join(tmpdir, "ref.py")
            out = os.path.join(tmpdir, "out.json")

            with open(cand, "w") as f:
                f.write(COPY_CODE)
            with open(ref, "w") as f:
                f.write(REFERENCE_CODE)

            # Run CLI
            rv = clone_check_cli(["--candidate", cand, "--reference", ref, "--output", out])
            assert rv == 0
            assert os.path.exists(out)

            with open(out, "r") as f:
                data = json.load(f)
            assert data["status"] in ["PASS", "REVIEW", "FAIL"]


class TestGate4Determinism:
    """Clone-check must produce deterministic fingerprint for same inputs."""

    def test_clone_check_fingerprint_stable(self):
        a = clone_check(REFERENCE_CODE, COPY_CODE)
        b = clone_check(REFERENCE_CODE, COPY_CODE)
        assert a.fingerprint == b.fingerprint
