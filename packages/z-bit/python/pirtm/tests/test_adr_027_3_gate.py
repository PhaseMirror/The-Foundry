"""ADR-027.3 Gate Tests: Certification pipeline integration with IAG."""

import json
import os
import tempfile

from pirtm.transpiler.cli import PirtmCLI


SAMPLE_SPEC = {
    "id": "INV-6",
    "name": "Sigma Channel Norm Bound",
    "statement": "||Σ_p|| ≤ sqrt(p)",
    "prime_index": 7,
    "module": "pirtm/sigma",
    "tuning_fork_test": "compute sigma norm after 100-step iteration",
    "falsification": "norm exceeds sqrt(p)",
}


class TestGate1CertifyOptionallyRunsIAG:
    """Certification can optionally invoke pirtm iag and emit an audit event."""

    def test_certify_generates_invariant_artifacts(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            cand_path = os.path.join(tmpdir, "cand.py")
            ref_path = os.path.join(tmpdir, "ref.py")
            audit_path = os.path.join(tmpdir, "certify.audit.jsonl")
            registry_path = os.path.join(tmpdir, "badges.json")
            suite_registry_path = os.path.join(tmpdir, "suite.md")
            spec_path = os.path.join(tmpdir, "spec.json")

            with open(cand_path, "w", encoding="utf-8") as handle:
                handle.write("def foo():\n    return sum(range(10))\n")
            with open(ref_path, "w", encoding="utf-8") as handle:
                handle.write("def bar(x):\n    r = 1\n    for i in range(x):\n        r *= i + 1\n    return r\n")
            with open(suite_registry_path, "w", encoding="utf-8") as handle:
                handle.write("# Registry\n")
            with open(spec_path, "w", encoding="utf-8") as handle:
                json.dump(SAMPLE_SPEC, handle)

            cli = PirtmCLI()
            rv = cli.cmd_certify(
                type("A", (), {
                    "candidate": cand_path,
                    "reference": ref_path,
                    "audit_trace": audit_path,
                    "registry": registry_path,
                    "module": "xi_operator",
                    "prime": 17,
                    "issuer": "test",
                    "certificate_id": "cert-1",
                    "metadata": None,
                    "strict": False,
                    "generate_invariant": spec_path,
                    "iag_registry": "suite.md",
                    "iag_output_root": tmpdir,
                })
            )

            assert rv == 0
            assert os.path.exists(os.path.join(tmpdir, "pirtm", "tests", "test_inv-6_sigma_channel_norm_bound.py"))
            assert os.path.exists(os.path.join(tmpdir, "pirtm", "bindings", "sigma_channel_norm_bound_stub.py"))

            with open(suite_registry_path, "r", encoding="utf-8") as handle:
                suite_registry = handle.read()
            assert "INV-6" in suite_registry

            with open(audit_path, "r", encoding="utf-8") as handle:
                audit_lines = [json.loads(line) for line in handle if line.strip()]

            iag_events = [entry for entry in audit_lines if entry.get("event") == "generate_invariant"]
            assert len(iag_events) == 1
            iag_event = iag_events[0]
            assert iag_event["component"] == "pirtm_iag"
            assert iag_event["details"]["invariant_id"] == "INV-6"
            assert iag_event["details"]["generated_test_path"].endswith("test_inv-6_sigma_channel_norm_bound.py")
            assert iag_event["details"]["generated_stub_path"].endswith("sigma_channel_norm_bound_stub.py")


class TestGate2CertifyIAGRemainsIdempotent:
    """Repeated certify runs must not duplicate IAG outputs under the pipeline."""

    def test_certify_rerun_keeps_iag_outputs_idempotent(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            cand_path = os.path.join(tmpdir, "cand.py")
            ref_path = os.path.join(tmpdir, "ref.py")
            audit_path = os.path.join(tmpdir, "certify.audit.jsonl")
            registry_path = os.path.join(tmpdir, "badges.json")
            suite_registry_path = os.path.join(tmpdir, "suite.md")
            spec_path = os.path.join(tmpdir, "spec.json")

            with open(cand_path, "w", encoding="utf-8") as handle:
                handle.write("def foo():\n    return sum(range(10))\n")
            with open(ref_path, "w", encoding="utf-8") as handle:
                handle.write("def bar(x):\n    r = 1\n    for i in range(x):\n        r *= i + 1\n    return r\n")
            with open(suite_registry_path, "w", encoding="utf-8") as handle:
                handle.write("# Registry\n")
            with open(spec_path, "w", encoding="utf-8") as handle:
                json.dump(SAMPLE_SPEC, handle)

            cli = PirtmCLI()
            for _ in range(2):
                rv = cli.cmd_certify(
                    type("A", (), {
                        "candidate": cand_path,
                        "reference": ref_path,
                        "audit_trace": audit_path,
                        "registry": registry_path,
                        "module": "xi_operator",
                        "prime": 17,
                        "issuer": "test",
                        "certificate_id": "cert-1",
                        "metadata": None,
                        "strict": False,
                        "generate_invariant": spec_path,
                        "iag_registry": "suite.md",
                        "iag_output_root": tmpdir,
                    })
                )
                assert rv == 0

            with open(suite_registry_path, "r", encoding="utf-8") as handle:
                suite_lines = [line.strip() for line in handle if line.strip()]
            generated_rows = [line for line in suite_lines if "INV-6" in line]
            assert len(generated_rows) == 1

            with open(registry_path, "r", encoding="utf-8") as handle:
                badge_registry = json.load(handle)
            entries = badge_registry.get("entries", [])
            assert len(entries) == 1
            assert entries[0]["certificate_id"] == "cert-1"

            with open(audit_path, "r", encoding="utf-8") as handle:
                audit_lines = [json.loads(line) for line in handle if line.strip()]
            iag_events = [entry for entry in audit_lines if entry.get("event") == "generate_invariant"]
            assert len(iag_events) == 1


class TestGate3CertifyStrictModeWithIAG:
    """Strict mode must accept an existing deterministic audit trace with IAG integration."""

    def test_certify_strict_mode_with_generate_invariant_is_deterministic(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            cand_path = os.path.join(tmpdir, "cand.py")
            ref_path = os.path.join(tmpdir, "ref.py")
            audit_path = os.path.join(tmpdir, "certify.audit.jsonl")
            registry_path = os.path.join(tmpdir, "badges.json")
            suite_registry_path = os.path.join(tmpdir, "suite.md")
            spec_path = os.path.join(tmpdir, "spec.json")

            with open(cand_path, "w", encoding="utf-8") as handle:
                handle.write("def foo():\n    return sum(range(10))\n")
            with open(ref_path, "w", encoding="utf-8") as handle:
                handle.write("def bar(x):\n    r = 1\n    for i in range(x):\n        r *= i + 1\n    return r\n")
            with open(suite_registry_path, "w", encoding="utf-8") as handle:
                handle.write("# Registry\n")
            with open(spec_path, "w", encoding="utf-8") as handle:
                json.dump(SAMPLE_SPEC, handle)

            cli = PirtmCLI()
            initial_rv = cli.cmd_certify(
                type("A", (), {
                    "candidate": cand_path,
                    "reference": ref_path,
                    "audit_trace": audit_path,
                    "registry": registry_path,
                    "module": "xi_operator",
                    "prime": 17,
                    "issuer": "test",
                    "certificate_id": "cert-1",
                    "metadata": None,
                    "strict": False,
                    "generate_invariant": spec_path,
                    "iag_registry": "suite.md",
                    "iag_output_root": tmpdir,
                })
            )
            assert initial_rv == 0

            strict_rv = cli.cmd_certify(
                type("A", (), {
                    "candidate": cand_path,
                    "reference": ref_path,
                    "audit_trace": audit_path,
                    "registry": registry_path,
                    "module": "xi_operator",
                    "prime": 17,
                    "issuer": "test",
                    "certificate_id": "cert-1",
                    "metadata": None,
                    "strict": True,
                    "generate_invariant": spec_path,
                    "iag_registry": "suite.md",
                    "iag_output_root": tmpdir,
                })
            )
            assert strict_rv == 0

            with open(suite_registry_path, "r", encoding="utf-8") as handle:
                suite_lines = [line.strip() for line in handle if line.strip()]
            generated_rows = [line for line in suite_lines if "INV-6" in line]
            assert len(generated_rows) == 1

            with open(registry_path, "r", encoding="utf-8") as handle:
                badge_registry = json.load(handle)
            entries = badge_registry.get("entries", [])
            assert len(entries) == 1

            with open(audit_path, "r", encoding="utf-8") as handle:
                audit_lines = [json.loads(line) for line in handle if line.strip()]
            iag_events = [entry for entry in audit_lines if entry.get("event") == "generate_invariant"]
            assert len(iag_events) == 1
            assert iag_events[0]["details"]["invariant_id"] == "INV-6"


class TestGate4CertifyStrictModeRejectsMismatchedIAGTrace:
    """Strict mode must fail with a deterministic diff when the IAG-aware audit trace mismatches."""

    def test_certify_strict_mode_with_generate_invariant_detects_mismatch(self, capsys):
        with tempfile.TemporaryDirectory() as tmpdir:
            cand_path = os.path.join(tmpdir, "cand.py")
            ref_path = os.path.join(tmpdir, "ref.py")
            audit_path = os.path.join(tmpdir, "certify.audit.jsonl")
            registry_path = os.path.join(tmpdir, "badges.json")
            suite_registry_path = os.path.join(tmpdir, "suite.md")
            spec_path = os.path.join(tmpdir, "spec.json")

            with open(cand_path, "w", encoding="utf-8") as handle:
                handle.write("def foo():\n    return sum(range(10))\n")
            with open(ref_path, "w", encoding="utf-8") as handle:
                handle.write("def bar(x):\n    r = 1\n    for i in range(x):\n        r *= i + 1\n    return r\n")
            with open(suite_registry_path, "w", encoding="utf-8") as handle:
                handle.write("# Registry\n")
            with open(spec_path, "w", encoding="utf-8") as handle:
                json.dump(SAMPLE_SPEC, handle)
            with open(audit_path, "w", encoding="utf-8") as handle:
                handle.write('{"unexpected":"trace"}\n')

            cli = PirtmCLI()
            rv = cli.cmd_certify(
                type("A", (), {
                    "candidate": cand_path,
                    "reference": ref_path,
                    "audit_trace": audit_path,
                    "registry": registry_path,
                    "module": "xi_operator",
                    "prime": 17,
                    "issuer": "test",
                    "certificate_id": "cert-1",
                    "metadata": None,
                    "strict": True,
                    "generate_invariant": spec_path,
                    "iag_registry": "suite.md",
                    "iag_output_root": tmpdir,
                })
            )

            assert rv != 0

            captured = capsys.readouterr()
            assert "existing audit trace does not match expected deterministic trace" in captured.err
            assert "Diff at line 1:" in captured.err
            assert 'expected:' in captured.err
            assert 'actual:   {"unexpected":"trace"}' in captured.err