"""Static checker for Gate K boundary contract violations.

Scans gate-relevant modules for forbidden imports and internal engine access
that bypasses the K-03 boundary methods.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCAN_DIRS = [
    ROOT / "pirtm" / "core",
    ROOT / "pirtm" / "gate",
    ROOT / "pirtm" / "sigma",
]

# Pattern, explanation
FORBIDDEN_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (
        re.compile(r"from\s+pirtm\.multiplicity_lwe\.engine\s+import\s+ToyAEngine"),
        "gate code must use pirtm.core.multiplicity_core.MultiplicityCoreEngine",
    ),
    (
        re.compile(r"\bToyAEngine\s*\("),
        "direct ToyAEngine construction is forbidden; use make_multiplicity_engine",
    ),
    (
        re.compile(r"\._secret\s*\("),
        "secret extraction API is forbidden",
    ),
    (
        re.compile(r"\._derive_seed\s*\("),
        "seed derivation internals are forbidden",
    ),
    (
        re.compile(r"\bengine\.state_vector\b"),
        "direct engine.state_vector access is forbidden across the boundary",
    ),
]


def _iter_python_files(scan_dir: Path) -> list[Path]:
    if not scan_dir.exists():
        return []
    return [p for p in scan_dir.rglob("*.py") if p.is_file()]


def _is_exempt(file_path: Path) -> bool:
    # Core boundary module is allowed to reference implementation details.
    if file_path == ROOT / "pirtm" / "core" / "multiplicity_core.py":
        return True
    # Internal multiplicity implementation is out of scanner scope.
    if "pirtm/multiplicity_lwe" in file_path.as_posix():
        return True
    return False


def check_forbidden_patterns() -> list[str]:
    violations: list[str] = []

    for scan_dir in SCAN_DIRS:
        for py_file in _iter_python_files(scan_dir):
            if _is_exempt(py_file):
                continue

            try:
                content = py_file.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue

            for idx, line in enumerate(content.splitlines(), start=1):
                for pattern, message in FORBIDDEN_PATTERNS:
                    if pattern.search(line):
                        rel = py_file.relative_to(ROOT)
                        violations.append(
                            f"{rel}:{idx}: {message} | line='{line.strip()}'"
                        )

    return violations


def main() -> int:
    violations = check_forbidden_patterns()
    if not violations:
        print("Gate K boundary static check passed: no forbidden imports/access patterns found.")
        return 0

    print("Gate K boundary static check failed:")
    for violation in violations:
        print(f"  - {violation}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
