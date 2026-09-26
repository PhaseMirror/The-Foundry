#!/usr/bin/env python3
"""Invariant-to-Artifact Generator (IAG) Prototype.

Generates deterministic test and binding artifacts from a structured invariant spec.
"""

import argparse
import hashlib
import json
import re
import sys
from datetime import date
from pathlib import Path


REQUIRED_SPEC_FIELDS = (
    "id",
    "name",
    "statement",
    "prime_index",
    "module",
    "tuning_fork_test",
    "falsification",
)

ACCOUNTED_INVARIANTS = (
    ("INV-1", "Contractive spectral bound", "enforced", "Generated harness asserts INV-1_contractive."),
    ("INV-2", "Prime-field dimensionality", "enforced", "Generated harness asserts INV-2_prime_dim."),
    ("INV-3", "KK 5D spectral gap", "not-yet-enforced", "IAG v0.1 records this invariant but does not emit a KK spectral-gap assertion."),
    ("INV-4", "Universal constant residue", "enforced", "Generated harness asserts INV-4_decay_rate using XiOperator.false_xi_test()."),
    ("INV-5", "Digital fingerprint reproducibility", "enforced", "Generated harness asserts INV-5_deterministic."),
    ("PFP", "Prime period stability", "not-yet-enforced", "IAG v0.1 records prime-period stability as pending explicit binding-loop enforcement."),
)


def _slugify(text: str) -> str:
    text = text.replace(" ", "_")
    text = re.sub(r"[^0-9a-zA-Z_]+", "", text)
    return text.lower()


def _load_spec(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _validate_spec(spec: dict) -> None:
    missing = [field for field in REQUIRED_SPEC_FIELDS if spec.get(field) in (None, "")]
    if missing:
        raise ValueError(f"IAG spec missing required fields: {', '.join(missing)}")

    prime = spec["prime_index"]
    if not isinstance(prime, int) or prime <= 1:
        raise ValueError("IAG spec requires prime_index to be an integer greater than 1")


def _write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content)


def _test_function_name(identifier: str, slug: str) -> str:
    clean_identifier = identifier.lower().replace("-", "_")
    return f"test_{clean_identifier}_{slug}_false_xi_harness"


def planned_artifact_paths(spec: dict, output_root: Path, registry: str) -> dict[str, Path]:
    slug = _slugify(spec["name"])
    test_path = output_root / "pirtm" / "tests" / f"test_{spec['id'].lower()}_{slug}.py"
    stub_path = output_root / "pirtm" / "bindings" / f"{slug}_stub.py"

    registry_path = Path(registry)
    if not registry_path.is_absolute():
        registry_path = output_root / registry_path

    return {
        "test_path": test_path,
        "stub_path": stub_path,
        "registry_path": registry_path,
    }


def planned_record_paths(
    spec: dict,
    output_root: Path,
    meta_ensemble_log: str,
    assembly_record: str | None,
) -> dict[str, Path]:
    slug = _slugify(spec["name"])

    meta_log_path = Path(meta_ensemble_log)
    if not meta_log_path.is_absolute():
        meta_log_path = output_root / meta_log_path

    if assembly_record is None:
        assembly_record_path = output_root / "pirtm" / "docs" / "meta_ensemble_records" / f"{spec['id'].lower()}_{slug}.json"
    else:
        assembly_record_path = Path(assembly_record)
        if not assembly_record_path.is_absolute():
            assembly_record_path = output_root / assembly_record_path

    return {
        "meta_log_path": meta_log_path,
        "assembly_record_path": assembly_record_path,
    }


def _display_path(path: Path, output_root: Path) -> str:
    try:
        return path.relative_to(output_root).as_posix()
    except ValueError:
        return str(path)


def _build_assembly_record(
    spec: dict,
    artifact_paths: dict[str, Path],
    record_paths: dict[str, Path],
    output_root: Path,
) -> dict:
    assembly_steps = [
        "Parse invariant spec into deterministic identifiers, paths, and metadata.",
        "Account for invariant coverage across INV-1 through INV-5 plus PFP before artifact generation.",
        "Emit a runnable false_xi-style harness tied to the prime index from the spec.",
        "Emit a XiOperator-style binding stub with a populated tuning_fork() entry.",
        "Append a deterministic registry row for the generated test and stub paths.",
        "Persist the structured assembly record and update the meta-ensemble experiment log.",
    ]

    invariant_coverage = [
        {
            "id": invariant_id,
            "description": description,
            "status": status,
            "evidence": evidence,
        }
        for invariant_id, description, status, evidence in ACCOUNTED_INVARIANTS
    ]

    return {
        "record_version": "1.0",
        "experiment_id": f"MEX-AUTO-{spec['id']}",
        "date": date.today().isoformat(),
        "target": "Invariant-to-Artifact Generator (IAG v0.1)",
        "status": "GENERATED",
        "spec": {
            "id": spec["id"],
            "name": spec["name"],
            "statement": spec["statement"],
            "prime_index": spec["prime_index"],
            "module": spec["module"],
            "tuning_fork_test": spec["tuning_fork_test"],
            "falsification": spec["falsification"],
        },
        "generated_paths": {
            "test_path": _display_path(artifact_paths["test_path"], output_root),
            "stub_path": _display_path(artifact_paths["stub_path"], output_root),
            "registry_path": _display_path(artifact_paths["registry_path"], output_root),
            "meta_ensemble_log_path": _display_path(record_paths["meta_log_path"], output_root),
            "assembly_record_path": _display_path(record_paths["assembly_record_path"], output_root),
        },
        "assembly_steps": assembly_steps,
        "invariant_coverage": invariant_coverage,
        "notes": {
            "delta": "IAG v0.1 emits deterministic harness, stub, registry linkage, assembly record, and log entry from the invariant spec.",
            "unexplained_assembly_decisions": [],
        },
    }


def _validate_assembly_record(record: dict) -> None:
    assembly_steps = record.get("assembly_steps", [])
    if not assembly_steps:
        raise ValueError("IAG cannot account for its assembly steps")

    invariant_coverage = record.get("invariant_coverage", [])
    if not invariant_coverage:
        raise ValueError("IAG cannot account for invariant coverage")

    coverage_ids = {entry.get("id") for entry in invariant_coverage}
    expected_ids = {entry[0] for entry in ACCOUNTED_INVARIANTS}
    missing_ids = sorted(expected_ids - coverage_ids)
    if missing_ids:
        raise ValueError(
            "IAG cannot account for invariant coverage: missing " + ", ".join(missing_ids)
        )

    for step in assembly_steps:
        if not str(step).strip():
            raise ValueError("IAG cannot account for its assembly steps")

    for entry in invariant_coverage:
        if not entry.get("status") or not entry.get("evidence"):
            raise ValueError("IAG cannot account for invariant coverage")


def _write_assembly_record(path: Path, record: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(record, handle, indent=2)
        handle.write("\n")


def serialize_assembly_record(record: dict) -> bytes:
    """Serialize an assembly record deterministically for writing and hashing."""
    return (json.dumps(record, indent=2) + "\n").encode("utf-8")


def assembly_record_hash(record: dict) -> str:
    """Return a tamper-evident SHA-256 hash for the deterministic assembly record payload."""
    return hashlib.sha256(serialize_assembly_record(record)).hexdigest()


def _render_log_entry(record: dict) -> str:
    spec = record["spec"]
    paths = record["generated_paths"]

    invariant_lines = []
    for entry in record["invariant_coverage"]:
        marker = "x" if entry["status"] == "enforced" else " "
        invariant_lines.append(
            f"- [{marker}] {entry['id']}: {entry['description']} ({entry['status']}; {entry['evidence']})"
        )

    assembly_lines = [f"{index}. {step}" for index, step in enumerate(record["assembly_steps"], start=1)]

    return "\n".join([
        f"## Experiment {record['experiment_id']}",
        "",
        f"Date: {record['date']}",
        f"Target: {record['target']}",
        f"Status: {record['status']}",
        "",
        "### Inputs",
        "",
        f"- Invariant spec: `{spec['id']}` ({spec['name']})",
        f"- Statement: `{spec['statement']}`",
        f"- Prime index: `{spec['prime_index']}`",
        f"- Module: `{spec['module']}`",
        f"- Registry: `{paths['registry_path']}`",
        "",
        "### Invariants Enforced",
        "",
        *invariant_lines,
        "",
        "### Outputs",
        "",
        "| Artifact | Path | Status |",
        "|---|---|---|",
        f"| Generated test harness | `{paths['test_path']}` | GENERATED |",
        f"| Generated binding stub | `{paths['stub_path']}` | GENERATED |",
        f"| Registry row | `{paths['registry_path']}` | UPDATED |",
        f"| Assembly record | `{paths['assembly_record_path']}` | GENERATED |",
        "",
        "### Assembly Steps",
        "",
        *assembly_lines,
        "",
        "### What It Assembled vs. What Was Specified",
        "",
        f"- Delta between spec and output: {record['notes']['delta']}",
        "- Unexplained assembly decisions: none",
    ])


def _update_meta_ensemble_log(path: Path, record: dict) -> None:
    marker = record["experiment_id"]
    start_marker = f"<!-- META_ENSEMBLE_RECORD:{marker}:START -->"
    end_marker = f"<!-- META_ENSEMBLE_RECORD:{marker}:END -->"
    block = start_marker + "\n" + _render_log_entry(record) + "\n" + end_marker

    if path.exists():
        content = path.read_text(encoding="utf-8")
    else:
        content = "# Meta-Ensemble Experiment Log\n\nMultiplicity Foundation | Meta-Relativity\n"

    pattern = re.compile(
        re.escape(start_marker) + r".*?" + re.escape(end_marker),
        re.DOTALL,
    )
    if pattern.search(content):
        updated = pattern.sub(block, content)
    else:
        separator = "\n\n" if content and not content.endswith("\n\n") else ""
        updated = content + separator + block + "\n"

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(updated, encoding="utf-8")


def _generate_test(spec: dict, test_path: Path) -> None:
    identifier = spec["id"]
    name = spec["name"]
    prime = spec["prime_index"]
    slug = _slugify(name)
    function_name = _test_function_name(identifier, slug)

    test_code = f'''"""Generated false_xi harness for {identifier}: {name}."""

import numpy as np

from pirtm.bindings.xi_operator import XiOperator


SPEC = {{
    "id": {json.dumps(identifier)},
    "name": {json.dumps(name)},
    "statement": {json.dumps(spec.get("statement", "<none>"))},
    "falsification": {json.dumps(spec.get("falsification", "<none>"))},
    "tuning_fork_test": {json.dumps(spec.get("tuning_fork_test", "<none>"))},
    "prime_index": {prime},
    "module": {json.dumps(spec.get("module", "<unknown>"))},
}}


def build_sample_state() -> np.ndarray:
    rng = np.random.default_rng(SPEC["prime_index"])
    return rng.standard_normal(SPEC["prime_index"])


def {function_name}() -> None:
    operator = XiOperator(SPEC["prime_index"])
    psi = build_sample_state()

    result = operator.false_xi_test(psi, t=1.0)
    normalized = {{key: bool(value) for key, value in result.items()}}

    assert normalized["PASS"] is True, (
        f"{{SPEC['id']}} falsified: {{SPEC['falsification']}}; result={{normalized}}"
    )
    assert normalized["INV-1_contractive"] is True
    assert normalized["INV-2_prime_dim"] is True
    assert normalized["INV-4_decay_rate"] is True
    assert normalized["INV-5_deterministic"] is True

    tuning_fork = operator.tuning_fork()
    assert tuning_fork["prime_index"] == SPEC["prime_index"]
    assert "false_xi_test" in tuning_fork["test"]
'''

    _write_file(test_path, test_code)


def _generate_stub(spec: dict, stub_path: Path) -> None:
    name = spec["name"]
    prime = spec["prime_index"]
    slug = _slugify(name)
    class_name = f"{slug.title().replace('_', '')}Stub"

    stub_code = f'''"""Generated binding stub for {spec["id"]}: {name}."""

import numpy as np

from pirtm.bindings.xi_operator import XiOperator


class {class_name}(XiOperator):
    """Generated binding stub for invariant: {name}."""

    def __init__(self) -> None:
        super().__init__({prime})

    def build_false_xi_sample(self) -> dict:
        psi = np.random.default_rng(self.p).standard_normal(self.p)
        return self.false_xi_test(psi=psi, t=1.0)

    def tuning_fork(self) -> dict:
        return {{
            "module": {json.dumps(spec.get("module", "<unknown>"))},
            "prime_invariant": {json.dumps(spec.get("statement", "<unknown>"))},
            "test": {json.dumps(spec.get("tuning_fork_test", "<none>"))},
            "prime_index": {prime},
        }}
'''

    _write_file(stub_path, stub_code)


def _append_registry(spec: dict, registry_path: Path) -> None:
    identifier = spec["id"]
    name = spec["name"]
    slug = _slugify(name)
    test_path = f"pirtm/tests/test_{identifier.lower()}_{slug}.py"
    stub_path = f"pirtm/bindings/{slug}_stub.py"
    line = f"| {identifier} | {name} | Generated | `{test_path}` | `{stub_path}` |\n"

    if registry_path.exists():
        with open(registry_path, "r", encoding="utf-8") as handle:
            if line in handle.read():
                return

    registry_path.parent.mkdir(parents=True, exist_ok=True)
    with open(registry_path, "a", encoding="utf-8") as handle:
        handle.write(line)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Invariant-to-artifact generator (IAG) for PIRTM meta-ensembles"
    )
    parser.add_argument("--spec", required=True, help="Path to invariant spec JSON")
    parser.add_argument(
        "--registry",
        default="pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md",
        help="Path to suite registry markdown file",
    )
    parser.add_argument(
        "--output-root",
        default=".",
        help="Root directory under which generated pirtm artifacts are written",
    )
    parser.add_argument(
        "--meta-ensemble-log",
        default="pirtm/docs/META_ENSEMBLE_LOG.md",
        help="Path to the meta-ensemble markdown log to update",
    )
    parser.add_argument(
        "--assembly-record",
        help="Optional path to structured assembly record JSON",
    )

    args = parser.parse_args(argv)

    try:
        output_root = Path(args.output_root)
        spec = _load_spec(Path(args.spec))
        _validate_spec(spec)

        planned_paths = planned_artifact_paths(spec, output_root, args.registry)
        record_paths = planned_record_paths(
            spec,
            output_root,
            args.meta_ensemble_log,
            args.assembly_record,
        )
        assembly_record = _build_assembly_record(spec, planned_paths, record_paths, output_root)
        _validate_assembly_record(assembly_record)

        test_path = planned_paths["test_path"]
        stub_path = planned_paths["stub_path"]
        registry_path = planned_paths["registry_path"]

        _generate_test(spec, test_path)
        _generate_stub(spec, stub_path)
        _append_registry(spec, registry_path)
        _write_assembly_record(record_paths["assembly_record_path"], assembly_record)
        _update_meta_ensemble_log(record_paths["meta_log_path"], assembly_record)

        print(f"Generated: {test_path}")
        print(f"Generated: {stub_path}")
        print(f"Updated registry: {registry_path}")
        print(f"Wrote assembly record: {record_paths['assembly_record_path']}")
        print(f"Updated meta-ensemble log: {record_paths['meta_log_path']}")
        return 0
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())