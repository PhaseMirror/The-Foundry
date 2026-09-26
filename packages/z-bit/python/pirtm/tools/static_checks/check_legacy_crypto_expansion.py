"""Static guardrail for legacy crypto expansion during PIRTM-native migration.

This check does not ban the repo's existing legacy crypto surfaces outright.
Instead, it freezes the current baseline and fails only when new uses spread
outside the known migration boundary.

Blocked expansion surfaces:
- new Python imports of packages.zk outside the existing legacy package/tests
- new package.json entries for snarkjs / Circom-era dependencies outside the
  current allowlisted manifests
- new direct script usage of snarkjs / circom outside known legacy script paths
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[3]

PACKAGE_ZK_IMPORT_PATTERN = re.compile(
    r"^\s*(?:from\s+packages\.zk(?:\.|\s)|import\s+packages\.zk(?:\.|\s|$))"
)
LEGACY_SCRIPT_USAGE_PATTERN = re.compile(r"\b(?:snarkjs|circom)\b", re.IGNORECASE)

LEGACY_MANIFEST_DEPS = {
    "snarkjs",
    "@types/snarkjs",
    "circom_runtime",
    "circomlib",
    "circomlibjs",
    "circom_tester",
}

KNOWN_PACKAGE_ZK_IMPORT_PATHS = {
    Path("tests/test_gate_i.py"),
}

KNOWN_LEGACY_MANIFEST_ENTRIES: dict[Path, set[str]] = {
    Path("packages/security/ace/ace-zk/package.json"): {"circomlib"},
    Path("packages/lambda/package.json"): {
        "snarkjs",
        "@types/snarkjs",
        "circom_runtime",
        "circomlib",
        "circomlibjs",
        "circom_tester",
    },
    Path("packages/lambda/apps/relay/package.json"): {"snarkjs", "circomlibjs"},
    Path("packages/lambda/packages/proof-manager/package.json"): {"snarkjs"},
    Path("packages/lambda/packages/poseidon/package.json"): {"circomlibjs"},
    Path("packages/lambda/packages/policy/package.json"): {"circomlibjs"},
    Path("packages/lambda/packages/canonical/package.json"): {"circomlibjs"},
    Path("packages/lambda/packages/mtpi-contracts/package.json"): {"snarkjs"},
    Path("packages/lambda/packages/proof-core/package.json"): {"snarkjs", "circomlibjs"},
    Path("packages/lambda/packages/health-sdk/package.json"): {"snarkjs", "circomlibjs"},
}

DEPENDENCY_SECTION_KEYS = {
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
    "overrides",
    "resolutions",
}

SKIP_DIR_NAMES = {
    ".git",
    ".venv",
    "node_modules",
    "__pycache__",
    "dist",
    "build",
    "site-packages",
}

SCRIPT_SUFFIXES = {".sh", ".bash", ".zsh", ".js", ".cjs", ".mjs", ".ts", ".mts", ".py"}

KNOWN_LEGACY_SCRIPT_USAGE_PATHS = {
    Path("scripts/phase_experiments/phase_iii_groth_integration.py"),
}

KNOWN_LEGACY_SCRIPT_USAGE_PREFIXES = {
    Path("packages/security/ace/ace-zk/scripts"),
    Path("packages/lambda/scripts"),
    Path("packages/lambda/mtpi/scripts"),
    Path("packages/lambda/packages/mtpi-contracts/scripts"),
}


def _iter_python_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*.py"):
        if any(part in SKIP_DIR_NAMES for part in path.parts):
            continue
        if path.is_file():
            yield path


def _iter_package_json_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("package.json"):
        if any(part in SKIP_DIR_NAMES for part in path.parts):
            continue
        if path.is_file():
            yield path


def _iter_script_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if any(part in SKIP_DIR_NAMES for part in path.parts):
            continue
        if not path.is_file() or path.suffix.lower() not in SCRIPT_SUFFIXES:
            continue

        rel_path = path.relative_to(root)
        if path.suffix.lower() in {".sh", ".bash", ".zsh"} or "scripts" in rel_path.parts:
            yield path


def _is_known_packages_zk_path(rel_path: Path) -> bool:
    if rel_path in KNOWN_PACKAGE_ZK_IMPORT_PATHS:
        return True
    return rel_path.parts[:2] == ("packages", "zk")


def _is_known_legacy_script_usage_path(rel_path: Path) -> bool:
    if rel_path in KNOWN_LEGACY_SCRIPT_USAGE_PATHS:
        return True
    return any(prefix in rel_path.parents for prefix in KNOWN_LEGACY_SCRIPT_USAGE_PREFIXES)


def collect_packages_zk_import_violations(root: Path) -> list[str]:
    violations: list[str] = []

    for py_file in _iter_python_files(root):
        rel_path = py_file.relative_to(root)
        if _is_known_packages_zk_path(rel_path):
            continue

        try:
            content = py_file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        for line_no, line in enumerate(content.splitlines(), start=1):
            if PACKAGE_ZK_IMPORT_PATTERN.search(line):
                violations.append(
                    f"{rel_path}:{line_no}: new packages.zk import is blocked during migration | line='{line.strip()}'"
                )

    return violations


def _collect_legacy_manifest_deps(payload: object) -> set[str]:
    matches: set[str] = set()

    if isinstance(payload, dict):
        for key, value in payload.items():
            if key in DEPENDENCY_SECTION_KEYS and isinstance(value, dict):
                matches.update(dep for dep in value if dep in LEGACY_MANIFEST_DEPS)
            matches.update(_collect_legacy_manifest_deps(value))
    elif isinstance(payload, list):
        for item in payload:
            matches.update(_collect_legacy_manifest_deps(item))

    return matches


def collect_manifest_entry_violations(root: Path) -> list[str]:
    violations: list[str] = []

    for package_json in _iter_package_json_files(root):
        rel_path = package_json.relative_to(root)
        payload = json.loads(package_json.read_text(encoding="utf-8"))
        found = _collect_legacy_manifest_deps(payload)
        allowed = KNOWN_LEGACY_MANIFEST_ENTRIES.get(rel_path, set())

        unexpected = sorted(found - allowed)
        if unexpected:
            violations.append(
                f"{rel_path}: new legacy crypto manifest entries are blocked during migration | entries={unexpected}"
            )

    return violations


def collect_script_usage_violations(root: Path) -> list[str]:
    violations: list[str] = []

    for script_file in _iter_script_files(root):
        rel_path = script_file.relative_to(root)
        if _is_known_legacy_script_usage_path(rel_path):
            continue

        try:
            content = script_file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        for line_no, line in enumerate(content.splitlines(), start=1):
            if LEGACY_SCRIPT_USAGE_PATTERN.search(line):
                violations.append(
                    f"{rel_path}:{line_no}: direct snarkjs/circom script usage is blocked during migration | line='{line.strip()}'"
                )

    return violations


def main() -> int:
    violations = [
        *collect_packages_zk_import_violations(ROOT),
        *collect_manifest_entry_violations(ROOT),
        *collect_script_usage_violations(ROOT),
    ]

    if not violations:
        print("Legacy crypto migration guardrails passed: no new packages.zk imports, manifest entries, or direct script usage found.")
        return 0

    print("Legacy crypto migration guardrails failed:")
    for violation in violations:
        print(f"  - {violation}")
    return 1


if __name__ == "__main__":
    sys.exit(main())