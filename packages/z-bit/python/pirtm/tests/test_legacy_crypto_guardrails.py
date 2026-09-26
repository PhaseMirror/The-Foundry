from __future__ import annotations

import json
from pathlib import Path

from pirtm.tools.static_checks.check_legacy_crypto_expansion import (
    collect_manifest_entry_violations,
    collect_packages_zk_import_violations,
    collect_script_usage_violations,
)


def test_packages_zk_imports_are_blocked_outside_known_legacy_paths(tmp_path: Path):
    (tmp_path / "src").mkdir()
    target = tmp_path / "src" / "new_usage.py"
    target.write_text("from packages.zk.proof_system import select_backend\n", encoding="utf-8")

    violations = collect_packages_zk_import_violations(tmp_path)

    assert len(violations) == 1
    assert "new_usage.py" in violations[0]


def test_packages_zk_imports_inside_packages_zk_are_allowed(tmp_path: Path):
    target = tmp_path / "packages" / "zk"
    target.mkdir(parents=True)
    module = target / "internal.py"
    module.write_text("from packages.zk.proof_system import select_backend\n", encoding="utf-8")

    violations = collect_packages_zk_import_violations(tmp_path)

    assert violations == []


def test_new_manifest_entries_are_blocked(tmp_path: Path):
    package_json = tmp_path / "package.json"
    package_json.write_text(
        json.dumps({"dependencies": {"snarkjs": "^0.7.6"}}, indent=2),
        encoding="utf-8",
    )

    violations = collect_manifest_entry_violations(tmp_path)

    assert len(violations) == 1
    assert "package.json" in violations[0]
    assert "snarkjs" in violations[0]


def test_allowlisted_manifest_entries_remain_allowed(tmp_path: Path):
    package_json = tmp_path / "packages" / "lambda" / "package.json"
    package_json.parent.mkdir(parents=True)
    package_json.write_text(
        json.dumps(
            {
                "dependencies": {
                    "snarkjs": "^0.7.6",
                    "circomlib": "^2.0.5",
                },
                "devDependencies": {
                    "@types/snarkjs": "^0.7.9",
                },
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    violations = collect_manifest_entry_violations(tmp_path)

    assert violations == []


def test_direct_script_usage_is_blocked_outside_known_legacy_paths(tmp_path: Path):
    target = tmp_path / "scripts" / "new-proof-flow.sh"
    target.parent.mkdir(parents=True)
    target.write_text("npx snarkjs groth16 prove circuit.zkey witness.wtns proof.json public.json\n", encoding="utf-8")

    violations = collect_script_usage_violations(tmp_path)

    assert len(violations) == 1
    assert "new-proof-flow.sh" in violations[0]
    assert "snarkjs/circom" in violations[0]


def test_allowlisted_legacy_script_usage_remains_frozen(tmp_path: Path):
    target = tmp_path / "packages" / "lambda" / "scripts" / "build-circuits.mjs"
    target.parent.mkdir(parents=True)
    target.write_text("const tool = 'circom';\n", encoding="utf-8")

    violations = collect_script_usage_violations(tmp_path)

    assert violations == []
