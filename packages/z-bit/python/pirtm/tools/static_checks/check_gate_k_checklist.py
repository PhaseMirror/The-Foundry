"""Conformance gate for Gate K execution checklist.

This script validates that required evidence lines exist in the checklist and
that referenced local test/script paths are present.
"""

from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
CHECKLIST = REPO_ROOT / "docs" / "adr" / "gates" / "gate k" / "GATE-K-EXECUTION-CHECKLIST.md"
RISK_REGISTER = REPO_ROOT / "docs" / "adr" / "gates" / "gate k" / "GATE-K-RISK-REGISTER.md"

REQUIRED_EVIDENCE_LINES = [
    "- [ ] Evidence: `pytest -q pirtm/tests/test_multiplicity_lwe_params.py pirtm/tests/test_multiplicity_lwe_api.py`",
    "- [ ] Evidence: `pytest -q pirtm/tests/test_k02_multiplicity_core.py`",
    "- [ ] Evidence: `pytest -q pirtm/tests/test_k03_boundary_contract.py`",
    "- [ ] Evidence: `python pirtm/tools/static_checks/forbidden_imports.py`",
    "- [ ] Evidence (matrix): `pytest -q pirtm/tests/test_k04_csl_gate.py`",
    "- [ ] Evidence: `pytest -q pirtm/tests/test_k05_rate_limiter.py`",
    "- [ ] Evidence: `docs/adr/gates/gate k/GATE-K-RISK-REGISTER.md`",
    "- [ ] Evidence: `python pirtm/tools/static_checks/check_gate_k_checklist.py`",
    "- [ ] Evidence (smoke): `pytest -q pirtm/tests/test_gate_k_integration_smoke.py`",
]


def _extract_backtick_payloads(line: str) -> list[str]:
    return re.findall(r"`([^`]+)`", line)


def _validate_local_paths(cmd_or_path: str) -> list[str]:
    """Return missing paths inferred from evidence payload."""
    tokens = cmd_or_path.split()
    missing: list[str] = []

    # Handle plain markdown path evidence.
    if cmd_or_path.endswith(".md") and "/" in cmd_or_path:
        path = REPO_ROOT / cmd_or_path
        if not path.exists():
            missing.append(cmd_or_path)
        return missing

    # Heuristic for command payloads: validate python/pytest path arguments.
    for tok in tokens:
        if tok.startswith("pirtm/") or tok.startswith("docs/"):
            path = REPO_ROOT / tok
            if not path.exists():
                missing.append(tok)
    return missing


def main() -> int:
    errors: list[str] = []

    if not CHECKLIST.exists():
        print(f"Gate K checklist missing: {CHECKLIST}")
        return 2

    text = CHECKLIST.read_text(encoding="utf-8")

    for required in REQUIRED_EVIDENCE_LINES:
        if required not in text:
            errors.append(f"Missing evidence line: {required}")

    # Validate that paths referenced inside evidence backticks exist locally.
    for line in text.splitlines():
        if "Evidence" not in line:
            continue
        payloads = _extract_backtick_payloads(line)
        for payload in payloads:
            for missing in _validate_local_paths(payload):
                errors.append(f"Missing referenced path in checklist evidence: {missing}")

    if not RISK_REGISTER.exists():
        errors.append(f"Risk register file missing: {RISK_REGISTER.relative_to(REPO_ROOT)}")

    if errors:
        print("Gate K checklist conformance failed:")
        for err in errors:
            print(f"- {err}")
        return 1

    print("Gate K checklist conformance passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
