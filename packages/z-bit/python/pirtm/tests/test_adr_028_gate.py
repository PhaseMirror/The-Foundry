"""ADR-028 gate tests for meta-ensemble policy and logging surfaces."""

import json
import tempfile
from pathlib import Path

from meta_ensembles.core import EnsembleLedger
import pirtm.tools.pirtm_iag as pirtm_iag


REPO_ROOT = Path(__file__).resolve().parents[2]


class TestGate1MetaEnsembleObjectiveExists:
    """The policy note must exist and state the core refusal policy."""

    def test_meta_ensemble_objective_contains_required_constraints(self):
        path = REPO_ROOT / "pirtm" / "docs" / "META_ENSEMBLE_OBJECTIVE.md"
        assert path.exists()

        content = path.read_text(encoding="utf-8")
        assert "PIRTM-conformant modules and tests" in content
        assert "not free-form code generation" in content
        assert "INV-1" in content
        assert "INV-5" in content
        assert "PFP" in content
        assert "must not commit its output" in content


class TestGate2MetaEnsembleLogExists:
    """The experiment log must define MEX-001 and require assembly steps."""

    def test_meta_ensemble_log_contains_first_experiment_scaffold(self):
        path = REPO_ROOT / "pirtm" / "docs" / "META_ENSEMBLE_LOG.md"
        assert path.exists()

        content = path.read_text(encoding="utf-8")
        assert "Experiment MEX-001" in content
        assert "Invariant-to-Artifact Generator (IAG v0.1)" in content
        assert "### Assembly Steps" in content
        assert "Partial PASS" in content


class TestGate3IAGSpecExists:
    """The tool spec must capture the invariant input and output contract."""

    def test_iag_spec_contains_cli_and_contract(self):
        path = REPO_ROOT / "pirtm" / "tools" / "iag_v0_spec.md"
        assert path.exists()

        content = path.read_text(encoding="utf-8")
        assert "Input Contract" in content
        assert "Output Contract" in content
        assert "pirtm iag --spec invariant.json" in content
        assert "--generate-invariant invariant.json" in content
        assert "Determinism and Idempotence" in content


class TestGate4IntegritySuiteLinksMetaEnsembleDocs:
    """The integrity suite should point readers to the ADR-028 backstop files."""

    def test_integrity_suite_mentions_meta_ensemble_backstop(self):
        path = REPO_ROOT / "pirtm" / "docs" / "PRIME_FREQUENCY_INTEGRITY_SUITE.md"
        content = path.read_text(encoding="utf-8")

        assert "META_ENSEMBLE_OBJECTIVE.md" in content
        assert "META_ENSEMBLE_LOG.md" in content
        assert "iag_v0_spec.md" in content


class TestGate5IAGEmitsStructuredAssemblyRecord:
    """IAG must emit a structured assembly record and update the log automatically."""

    def test_iag_writes_assembly_record_and_log_entry(self):
        sample_spec = {
            "id": "INV-6",
            "name": "Sigma Channel Norm Bound",
            "statement": "||Sigma_p|| <= sqrt(p)",
            "prime_index": 7,
            "module": "pirtm/sigma",
            "tuning_fork_test": "compute sigma norm after 100-step iteration",
            "falsification": "norm exceeds sqrt(p)",
        }

        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            spec_path = root / "spec.json"
            registry_path = root / "registry.md"
            spec_path.write_text(json.dumps(sample_spec), encoding="utf-8")
            registry_path.write_text("# Registry\n", encoding="utf-8")

            rv = pirtm_iag.main([
                "--spec",
                str(spec_path),
                "--registry",
                "registry.md",
                "--output-root",
                str(root),
                "--meta-ensemble-log",
                "pirtm/docs/META_ENSEMBLE_LOG.md",
                "--assembly-record",
                "pirtm/docs/meta_ensemble_records/inv-6.json",
            ])
            assert rv == 0

            record_path = root / "pirtm" / "docs" / "meta_ensemble_records" / "inv-6.json"
            log_path = root / "pirtm" / "docs" / "META_ENSEMBLE_LOG.md"
            assert record_path.exists()
            assert log_path.exists()

            record = json.loads(record_path.read_text(encoding="utf-8"))
            assert record["experiment_id"] == "MEX-AUTO-INV-6"
            assert len(record["assembly_steps"]) >= 5
            coverage_ids = {entry["id"] for entry in record["invariant_coverage"]}
            assert coverage_ids == {"INV-1", "INV-2", "INV-3", "INV-4", "INV-5", "PFP"}

            log_content = log_path.read_text(encoding="utf-8")
            assert "Experiment MEX-AUTO-INV-6" in log_content
            assert "### Assembly Steps" in log_content
            assert "Assembly record" in log_content


class TestGate6IAGFailsWithoutAssemblyAccounting:
    """IAG must fail if it cannot account for assembly steps or invariant coverage."""

    def test_iag_rejects_invalid_assembly_record(self, monkeypatch, capsys):
        sample_spec = {
            "id": "INV-6",
            "name": "Sigma Channel Norm Bound",
            "statement": "||Sigma_p|| <= sqrt(p)",
            "prime_index": 7,
            "module": "pirtm/sigma",
            "tuning_fork_test": "compute sigma norm after 100-step iteration",
            "falsification": "norm exceeds sqrt(p)",
        }

        def broken_record(spec, artifact_paths, record_paths, output_root):
            return {
                "experiment_id": "MEX-AUTO-INV-6",
                "assembly_steps": [],
                "invariant_coverage": [],
            }

        monkeypatch.setattr(pirtm_iag, "_build_assembly_record", broken_record)

        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            spec_path = root / "spec.json"
            registry_path = root / "registry.md"
            spec_path.write_text(json.dumps(sample_spec), encoding="utf-8")
            registry_path.write_text("# Registry\n", encoding="utf-8")

            rv = pirtm_iag.main([
                "--spec",
                str(spec_path),
                "--registry",
                "registry.md",
                "--output-root",
                str(root),
            ])

            assert rv != 0
            captured = capsys.readouterr()
            assert "cannot account for its assembly steps" in captured.err


class TestGate7CertifyIntegratesAssemblyRecordEmission:
    """Certification-integrated IAG runs must write the assembly record and meta-ensemble log."""

    def test_certify_generate_invariant_updates_meta_ensemble_artifacts(self):
        sample_spec = {
            "id": "INV-6",
            "name": "Sigma Channel Norm Bound",
            "statement": "||Sigma_p|| <= sqrt(p)",
            "prime_index": 7,
            "module": "pirtm/sigma",
            "tuning_fork_test": "compute sigma norm after 100-step iteration",
            "falsification": "norm exceeds sqrt(p)",
        }

        from pirtm.transpiler.cli import PirtmCLI

        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            cand_path = root / "cand.py"
            ref_path = root / "ref.py"
            audit_path = root / "audit.jsonl"
            badge_registry = root / "badges.json"
            suite_registry = root / "suite.md"
            spec_path = root / "spec.json"
            meta_log_path = root / "logs" / "META_ENSEMBLE_LOG.md"
            assembly_record_path = root / "logs" / "records" / "inv-6.json"

            cand_path.write_text("def foo():\n    return sum(range(10))\n", encoding="utf-8")
            ref_path.write_text(
                "def bar(x):\n    r = 1\n    for i in range(x):\n        r *= i + 1\n    return r\n",
                encoding="utf-8",
            )
            suite_registry.write_text("# Registry\n", encoding="utf-8")
            spec_path.write_text(json.dumps(sample_spec), encoding="utf-8")

            cli = PirtmCLI()
            rv = cli.cmd_certify(
                type("A", (), {
                    "candidate": str(cand_path),
                    "reference": str(ref_path),
                    "audit_trace": str(audit_path),
                    "registry": str(badge_registry),
                    "module": "xi_operator",
                    "prime": 17,
                    "issuer": "test",
                    "certificate_id": "cert-1",
                    "metadata": None,
                    "strict": False,
                    "generate_invariant": str(spec_path),
                    "iag_registry": "suite.md",
                    "iag_output_root": str(root),
                    "iag_meta_ensemble_log": "logs/META_ENSEMBLE_LOG.md",
                    "iag_assembly_record": "logs/records/inv-6.json",
                })
            )

            assert rv == 0
            assert meta_log_path.exists()
            assert assembly_record_path.exists()

            record = json.loads(assembly_record_path.read_text(encoding="utf-8"))
            assert record["generated_paths"]["assembly_record_path"] == "logs/records/inv-6.json"
            assert record["generated_paths"]["meta_ensemble_log_path"] == "logs/META_ENSEMBLE_LOG.md"
            expected_hash = pirtm_iag.assembly_record_hash(record)

            log_content = meta_log_path.read_text(encoding="utf-8")
            assert "Experiment MEX-AUTO-INV-6" in log_content
            assert "### Assembly Steps" in log_content
            assert "1. Parse invariant spec into deterministic identifiers, paths, and metadata." in log_content
            assert "### Invariants Enforced" in log_content
            assert "INV-1: Contractive spectral bound" in log_content
            assert "PFP: Prime period stability" in log_content

            audit_lines = [json.loads(line) for line in audit_path.read_text(encoding="utf-8").splitlines() if line.strip()]
            iag_events = [entry for entry in audit_lines if entry.get("event") == "generate_invariant"]
            assert len(iag_events) == 1
            assert iag_events[0]["details"]["meta_ensemble_log_path"].endswith("logs/META_ENSEMBLE_LOG.md")
            assert iag_events[0]["details"]["assembly_record_path"].endswith("logs/records/inv-6.json")

            badge_data = json.loads(badge_registry.read_text(encoding="utf-8"))
            entries = badge_data.get("entries", [])
            assert len(entries) == 1
            badge_metadata = entries[0]["metadata"]
            assert badge_metadata["meta_ensemble"]["assembly_record_path"] == str(assembly_record_path)
            assert badge_metadata["meta_ensemble"]["meta_ensemble_log_path"] == str(meta_log_path)
            assert badge_metadata["meta_ensemble"]["assembly_record_hash"] == expected_hash


class TestGate8ReviewerCanTraceBadgeToAssemblyRecord:
    """Certification artifacts must let reviewers trace from badge entry to assembly record."""

    def test_badge_metadata_points_reviewers_to_assembly_record(self):
        sample_spec = {
            "id": "INV-6",
            "name": "Sigma Channel Norm Bound",
            "statement": "||Sigma_p|| <= sqrt(p)",
            "prime_index": 7,
            "module": "pirtm/sigma",
            "tuning_fork_test": "compute sigma norm after 100-step iteration",
            "falsification": "norm exceeds sqrt(p)",
        }

        from pirtm.transpiler.cli import PirtmCLI

        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            cand_path = root / "cand.py"
            ref_path = root / "ref.py"
            audit_path = root / "audit.jsonl"
            badge_registry = root / "badges.json"
            suite_registry = root / "suite.md"
            spec_path = root / "spec.json"
            meta_log_path = root / "logs" / "META_ENSEMBLE_LOG.md"
            assembly_record_path = root / "logs" / "records" / "inv-6.json"

            cand_path.write_text("def foo():\n    return sum(range(10))\n", encoding="utf-8")
            ref_path.write_text(
                "def bar(x):\n    r = 1\n    for i in range(x):\n        r *= i + 1\n    return r\n",
                encoding="utf-8",
            )
            suite_registry.write_text("# Registry\n", encoding="utf-8")
            spec_path.write_text(json.dumps(sample_spec), encoding="utf-8")

            cli = PirtmCLI()
            rv = cli.cmd_certify(
                type("A", (), {
                    "candidate": str(cand_path),
                    "reference": str(ref_path),
                    "audit_trace": str(audit_path),
                    "registry": str(badge_registry),
                    "module": "xi_operator",
                    "prime": 17,
                    "issuer": "test",
                    "certificate_id": "cert-1",
                    "metadata": None,
                    "strict": False,
                    "generate_invariant": str(spec_path),
                    "iag_registry": "suite.md",
                    "iag_output_root": str(root),
                    "iag_meta_ensemble_log": "logs/META_ENSEMBLE_LOG.md",
                    "iag_assembly_record": "logs/records/inv-6.json",
                })
            )

            assert rv == 0

            badge_data = json.loads(badge_registry.read_text(encoding="utf-8"))
            entries = badge_data.get("entries", [])
            assert len(entries) == 1

            entry = entries[0]
            meta = entry["metadata"]["meta_ensemble"]
            assert entry["audit_trace"] == str(audit_path)
            assert meta["assembly_record_path"] == str(assembly_record_path)
            assert meta["meta_ensemble_log_path"] == str(meta_log_path)
            assert Path(meta["assembly_record_path"]).exists()

            assembly_record = json.loads(Path(meta["assembly_record_path"]).read_text(encoding="utf-8"))
            expected_hash = pirtm_iag.assembly_record_hash(assembly_record)
            assert assembly_record["spec"]["id"] == meta["invariant_id"]
            assert assembly_record["generated_paths"]["meta_ensemble_log_path"] == "logs/META_ENSEMBLE_LOG.md"
            assert meta["assembly_record_hash"] == expected_hash

            audit_lines = [json.loads(line) for line in audit_path.read_text(encoding="utf-8").splitlines() if line.strip()]
            iag_events = [entry for entry in audit_lines if entry.get("event") == "generate_invariant"]
            assert len(iag_events) == 1
            audit_meta = iag_events[0]["details"]
            assert audit_meta["assembly_record_path"] == meta["assembly_record_path"]
            assert audit_meta["assembly_record_hash"] == meta["assembly_record_hash"]
            assert audit_meta["assembly_record_hash"] == expected_hash


class TestGate9CertifyFailsBeforeArtifactAcceptance:
    """Certification-integrated IAG failure must stop before badge acceptance."""

    def test_certify_rejects_invalid_assembly_record_before_badge_acceptance(self, monkeypatch, capsys):
        sample_spec = {
            "id": "INV-6",
            "name": "Sigma Channel Norm Bound",
            "statement": "||Sigma_p|| <= sqrt(p)",
            "prime_index": 7,
            "module": "pirtm/sigma",
            "tuning_fork_test": "compute sigma norm after 100-step iteration",
            "falsification": "norm exceeds sqrt(p)",
        }

        def broken_record(spec, artifact_paths, record_paths, output_root):
            return {
                "experiment_id": "MEX-AUTO-INV-6",
                "assembly_steps": [],
                "invariant_coverage": [],
            }

        monkeypatch.setattr(pirtm_iag, "_build_assembly_record", broken_record)

        from pirtm.transpiler.cli import PirtmCLI

        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            cand_path = root / "cand.py"
            ref_path = root / "ref.py"
            audit_path = root / "audit.jsonl"
            badge_registry = root / "badges.json"
            suite_registry = root / "suite.md"
            spec_path = root / "spec.json"

            cand_path.write_text("def foo():\n    return sum(range(10))\n", encoding="utf-8")
            ref_path.write_text(
                "def bar(x):\n    r = 1\n    for i in range(x):\n        r *= i + 1\n    return r\n",
                encoding="utf-8",
            )
            suite_registry.write_text("# Registry\n", encoding="utf-8")
            spec_path.write_text(json.dumps(sample_spec), encoding="utf-8")

            cli = PirtmCLI()
            rv = cli.cmd_certify(
                type("A", (), {
                    "candidate": str(cand_path),
                    "reference": str(ref_path),
                    "audit_trace": str(audit_path),
                    "registry": str(badge_registry),
                    "module": "xi_operator",
                    "prime": 17,
                    "issuer": "test",
                    "certificate_id": "cert-1",
                    "metadata": None,
                    "strict": False,
                    "generate_invariant": str(spec_path),
                    "iag_registry": "suite.md",
                    "iag_output_root": str(root),
                    "iag_meta_ensemble_log": "logs/META_ENSEMBLE_LOG.md",
                    "iag_assembly_record": "logs/records/inv-6.json",
                })
            )

            assert rv != 0
            captured = capsys.readouterr()
            assert "cannot account for its assembly steps" in captured.err
            assert not badge_registry.exists()
            assert not (root / "logs" / "META_ENSEMBLE_LOG.md").exists()
            assert not (root / "logs" / "records" / "inv-6.json").exists()


class TestGate10CertifyThreadsMetaEnsembleSidecars:
    """Certification must thread fold/retract sidecar provenance into audit and badge metadata."""

    def test_certify_emits_meta_ensemble_sidecars_and_provenance(self):
        from pirtm.transpiler.cli import PirtmCLI

        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            cand_path = root / "cand.py"
            ref_path = root / "ref.py"
            audit_path = root / "audit.jsonl"
            badge_registry = root / "badges.json"
            ledger_path = root / "ensemble.sqlite"
            sidecar_dir = root / "meta_sidecars"

            cand_path.write_text("def foo():\n    return sum(range(10))\n", encoding="utf-8")
            ref_path.write_text(
                "def bar(x):\n    r = 1\n    for i in range(x):\n        r *= i + 1\n    return r\n",
                encoding="utf-8",
            )

            ledger = EnsembleLedger(str(ledger_path))
            ledger.add_module(2, {"name": "m2"}, 0.8)
            ledger.add_module(3, {"name": "m3"}, 0.7)

            cli = PirtmCLI()
            rv = cli.cmd_certify(
                type("A", (), {
                    "candidate": str(cand_path),
                    "reference": str(ref_path),
                    "audit_trace": str(audit_path),
                    "registry": str(badge_registry),
                    "module": "xi_operator",
                    "prime": 17,
                    "issuer": "test",
                    "certificate_id": "cert-meta-1",
                    "metadata": None,
                    "strict": False,
                    "generate_invariant": None,
                    "iag_registry": "pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md",
                    "iag_output_root": str(root),
                    "iag_meta_ensemble_log": "pirtm/docs/META_ENSEMBLE_LOG.md",
                    "iag_assembly_record": None,
                    "meta_ensemble_ledger": str(ledger_path),
                    "meta_ensemble_sidecar_dir": str(sidecar_dir),
                })
            )

            assert rv == 0

            badge_data = json.loads(badge_registry.read_text(encoding="utf-8"))
            entry = badge_data["entries"][0]
            meta = entry["metadata"]["meta_ensemble"]
            assert meta["ledger_path"] == str(ledger_path.resolve())
            assert Path(meta["fold_summary_path"]).name == "xi_operator_p17_fold_summary.json"
            assert Path(meta["retract_artifact_path"]).name == "xi_operator_p17_retract_artifact.json"
            assert Path(meta["fold_summary_path"]).exists()
            assert Path(meta["retract_artifact_path"]).exists()
            assert len(meta["fold_summary_hash"]) == 64
            assert len(meta["retract_artifact_hash"]) == 64

            audit_lines = [json.loads(line) for line in audit_path.read_text(encoding="utf-8").splitlines() if line.strip()]
            provenance_events = [entry for entry in audit_lines if entry.get("event") == "meta_ensemble_provenance"]
            assert len(provenance_events) == 1
            details = provenance_events[0]["details"]
            assert details["fold_summary_path"] == meta["fold_summary_path"]
            assert details["retract_artifact_path"] == meta["retract_artifact_path"]
            assert details["fold_summary_hash"] == meta["fold_summary_hash"]
            assert details["retract_artifact_hash"] == meta["retract_artifact_hash"]