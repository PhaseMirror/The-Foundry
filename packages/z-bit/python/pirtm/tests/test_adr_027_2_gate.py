"""ADR-027.2 Gate Tests: Invariant-to-Artifact Generator (IAG)."""

import importlib.util
import json
import os
import tempfile

from pirtm.tools.pirtm_iag import main as iag_main


SAMPLE_SPEC = {
    "id": "INV-6",
    "name": "Sigma Channel Norm Bound",
    "statement": "||Σ_p|| ≤ sqrt(p)",
    "prime_index": 7,
    "module": "pirtm/sigma",
    "tuning_fork_test": "compute sigma norm after 100-step iteration",
    "falsification": "norm exceeds sqrt(p)",
}


class TestGate1IAGGeneratesArtifacts:
    """Generator should create test + stub + registry entry."""

    def test_iag_creates_expected_files(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            spec_path = os.path.join(tmpdir, "spec.json")
            with open(spec_path, "w") as f:
                json.dump(SAMPLE_SPEC, f)

            registry_path = os.path.join(tmpdir, "registry.md")
            # Seed registry doc so it exists
            with open(registry_path, "w") as f:
                f.write("# Registry\n")

            rv = iag_main([
                "--spec",
                spec_path,
                "--registry",
                "registry.md",
                "--output-root",
                tmpdir,
            ])
            assert rv == 0

            # Generated artifact paths
            slug = "sigma_channel_norm_bound"
            test_path = os.path.join(tmpdir, "pirtm", "tests", f"test_inv-6_{slug}.py")
            stub_path = os.path.join(tmpdir, "pirtm", "bindings", f"{slug}_stub.py")

            assert os.path.exists(test_path)
            assert os.path.exists(stub_path)

            with open(registry_path, "r") as f:
                content = f.read()
            assert "INV-6" in content
            assert f"pirtm/tests/test_inv-6_{slug}.py" in content
            assert f"pirtm/bindings/{slug}_stub.py" in content


class TestGate2IAGExecutesGeneratedHarness:
    """Generator must emit a directly executable false_xi harness."""

    def test_generated_harness_executes(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            spec_path = os.path.join(tmpdir, "spec.json")
            with open(spec_path, "w") as f:
                json.dump(SAMPLE_SPEC, f)

            registry_path = os.path.join(tmpdir, "registry.md")
            with open(registry_path, "w") as f:
                f.write("# Registry\n")

            rv = iag_main([
                "--spec",
                spec_path,
                "--registry",
                "registry.md",
                "--output-root",
                tmpdir,
            ])
            assert rv == 0

            slug = "sigma_channel_norm_bound"
            test_path = os.path.join(tmpdir, "pirtm", "tests", f"test_inv-6_{slug}.py")

            module_name = "generated_inv_6_sigma_channel_norm_bound"
            module_spec = importlib.util.spec_from_file_location(module_name, test_path)
            assert module_spec is not None
            assert module_spec.loader is not None

            module = importlib.util.module_from_spec(module_spec)
            module_spec.loader.exec_module(module)

            harness = getattr(module, "test_inv_6_sigma_channel_norm_bound_false_xi_harness")
            harness()


class TestGate3IAGExecutesGeneratedStub:
    """Generated binding stub must import and expose a working tuning fork."""

    def test_generated_stub_executes(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            spec_path = os.path.join(tmpdir, "spec.json")
            with open(spec_path, "w") as f:
                json.dump(SAMPLE_SPEC, f)

            registry_path = os.path.join(tmpdir, "registry.md")
            with open(registry_path, "w") as f:
                f.write("# Registry\n")

            rv = iag_main([
                "--spec",
                spec_path,
                "--registry",
                "registry.md",
                "--output-root",
                tmpdir,
            ])
            assert rv == 0

            slug = "sigma_channel_norm_bound"
            stub_path = os.path.join(tmpdir, "pirtm", "bindings", f"{slug}_stub.py")

            module_name = "generated_stub_inv_6_sigma_channel_norm_bound"
            module_spec = importlib.util.spec_from_file_location(module_name, stub_path)
            assert module_spec is not None
            assert module_spec.loader is not None

            module = importlib.util.module_from_spec(module_spec)
            module_spec.loader.exec_module(module)

            stub_class = getattr(module, "SigmaChannelNormBoundStub")
            stub = stub_class()

            result = {key: bool(value) for key, value in stub.build_false_xi_sample().items()}
            assert result["PASS"] is True

            tuning_fork = stub.tuning_fork()
            assert tuning_fork["prime_index"] == SAMPLE_SPEC["prime_index"]
            assert tuning_fork["module"] == SAMPLE_SPEC["module"]


class TestGate4IAGIdempotentRegistry:
    """Generator must not duplicate registry row on repeat runs."""

    def test_registry_row_is_idempotent(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            spec_path = os.path.join(tmpdir, "spec.json")
            with open(spec_path, "w") as f:
                json.dump(SAMPLE_SPEC, f)

            registry_path = os.path.join(tmpdir, "registry.md")
            with open(registry_path, "w") as f:
                f.write("# Registry\n")

            rv = iag_main([
                "--spec",
                spec_path,
                "--registry",
                "registry.md",
                "--output-root",
                tmpdir,
            ])
            assert rv == 0
            rv = iag_main([
                "--spec",
                spec_path,
                "--registry",
                "registry.md",
                "--output-root",
                tmpdir,
            ])
            assert rv == 0

            with open(registry_path, "r") as f:
                lines = [l.strip() for l in f if l.strip()]
            # There should be exactly one generated row containing INV-6
            generated_rows = [l for l in lines if "INV-6" in l]
            assert len(generated_rows) == 1
