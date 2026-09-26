"""Regression tests for pirtm/tools/static_checks/render_gate_k_status.py.

These tests lock the derivation rules so checklist changes cannot silently
regress status labelling.  The test is structured in three layers:

  1. Unit – _evaluate_evidence_item derivation rules
  2. Unit – _evaluate_structural_item derivation rules
  3. Integration – render_status() against the real checklist, checking
     known items by text fragment.
"""

from __future__ import annotations

import importlib.util
import re
import sys
from pathlib import Path
from typing import Any
from unittest.mock import patch

import pytest
from pytest import MonkeyPatch


# ---------------------------------------------------------------------------
# Import the renderer module without requiring it to be on sys.path
# ---------------------------------------------------------------------------

_RENDERER_PATH = (
    Path(__file__).resolve().parents[1]
    / "tools"
    / "static_checks"
    / "render_gate_k_status.py"
)

spec = importlib.util.spec_from_file_location("render_gate_k_status", _RENDERER_PATH)
_mod = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
sys.modules["render_gate_k_status"] = _mod  # needed for @dataclass __module__ resolution
spec.loader.exec_module(_mod)  # type: ignore[union-attr]

ChecklistItem = _mod.ChecklistItem
_evaluate_evidence_item = _mod._evaluate_evidence_item
_evaluate_structural_item = _mod._evaluate_structural_item
render_status = _mod.render_status
REPO_ROOT = _mod.REPO_ROOT


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _item(
    text: str,
    *,
    is_evidence: bool = False,
    section: str = "K-99: Test",
) -> ChecklistItem:
    payloads = re.findall(r"`([^`]+)`", text)
    return ChecklistItem(
        section=section,
        text=text,
        is_evidence=is_evidence,
        payloads=payloads,
    )


# ---------------------------------------------------------------------------
# 1. _evaluate_evidence_item derivation rules
# ---------------------------------------------------------------------------


class TestEvaluateEvidenceItem:
    def test_docs_path_present_is_evidenced(self, tmp_path: Path) -> None:
        target = "docs/adr/gates/gate k/GATE-K-RISK-REGISTER.md"
        with patch.object(_mod, "_path_exists", return_value=True):
            item = _item(f"Evidence: `{target}`", is_evidence=True)
            status, detail = _evaluate_evidence_item(item)
        assert status == "evidenced"
        assert target in detail

    def test_docs_path_missing_is_pending(self) -> None:
        target = "docs/adr/gates/gate k/DOES-NOT-EXIST.md"
        with patch.object(_mod, "_path_exists", return_value=False):
            item = _item(f"Evidence: `{target}`", is_evidence=True)
            status, detail = _evaluate_evidence_item(item)
        assert status == "pending"
        assert "missing" in detail

    def test_passing_pytest_command_is_evidenced(self) -> None:
        with patch.object(_mod, "_run_evidence_command", return_value=(True, "1 passed")):
            item = _item("Evidence: `pytest -q pirtm/tests/test_k02_multiplicity_core.py`", is_evidence=True)
            status, detail = _evaluate_evidence_item(item)
        assert status == "evidenced"
        assert "passed" in detail

    def test_failing_pytest_command_is_pending(self) -> None:
        with patch.object(_mod, "_run_evidence_command", return_value=(False, "1 failed")):
            item = _item("Evidence: `pytest -q pirtm/tests/test_k02_multiplicity_core.py`", is_evidence=True)
            status, detail = _evaluate_evidence_item(item)
        assert status == "pending"

    def test_passing_python_command_is_evidenced(self) -> None:
        with patch.object(_mod, "_run_evidence_command", return_value=(True, "check passed.")):
            item = _item("Evidence: `python pirtm/tools/static_checks/check_gate_k_checklist.py`", is_evidence=True)
            status, detail = _evaluate_evidence_item(item)
        assert status == "evidenced"

    def test_ci_link_reference_is_pending(self) -> None:
        item = _item("Evidence (full): link to CI job / audit log sample.", is_evidence=True)
        status, detail = _evaluate_evidence_item(item)
        assert status == "pending"
        assert "manual" in detail

    def test_no_payload_is_pending(self) -> None:
        item = _item("Evidence: run some unspecified thing", is_evidence=True)
        status, detail = _evaluate_evidence_item(item)
        assert status == "pending"


# ---------------------------------------------------------------------------
# 2. _evaluate_structural_item derivation rules
# ---------------------------------------------------------------------------


class TestEvaluateStructuralItem:
    def test_local_path_present_is_implemented(self) -> None:
        item = _item("`pirtm/core/multiplicity_core.py` is the canonical engine.")
        with patch.object(_mod, "_path_exists", return_value=True):
            status, detail = _evaluate_structural_item(item, section_evidenced=False)
        assert status == "implemented"
        assert "referenced path" in detail

    def test_local_path_missing_is_pending(self) -> None:
        item = _item("`pirtm/core/does_not_exist.py` must exist.")
        with patch.object(_mod, "_path_exists", return_value=False):
            status, detail = _evaluate_structural_item(item, section_evidenced=False)
        assert status == "pending"
        assert "missing path" in detail

    def test_cross_cutting_approval_is_always_pending(self) -> None:
        item = ChecklistItem(
            section="Cross‑Cutting",
            text="Gate K completion criteria met and approved by gate reviewers.",
            is_evidence=False,
            payloads=[],
        )
        for evidenced in (True, False):
            status, detail = _evaluate_structural_item(item, section_evidenced=evidenced)
            assert status == "pending", f"Must stay pending when section_evidenced={evidenced}"
            assert "manual reviewer" in detail

    def test_cross_cutting_docs_updated_is_always_implemented(self) -> None:
        item = ChecklistItem(
            section="Cross‑Cutting",
            text="Documentation updated (`docs/adr/gates/gate k/*`).",
            is_evidence=False,
            payloads=["docs/adr/gates/gate k/*"],
        )
        with patch.object(_mod, "_path_exists", return_value=True):
            status, detail = _evaluate_structural_item(item, section_evidenced=False)
        assert status == "implemented"

    def test_no_payload_section_evidenced_is_implemented(self) -> None:
        item = ChecklistItem(
            section="K-04: CSL Gate",
            text="Gate unit tests cover all failure modes.",
            is_evidence=False,
            payloads=[],
        )
        status, detail = _evaluate_structural_item(item, section_evidenced=True)
        assert status == "implemented"
        assert "section evidence" in detail

    def test_no_payload_section_not_evidenced_is_pending(self) -> None:
        item = ChecklistItem(
            section="K-04: CSL Gate",
            text="Gate unit tests cover all failure modes.",
            is_evidence=False,
            payloads=[],
        )
        status, detail = _evaluate_structural_item(item, section_evidenced=False)
        assert status == "pending"
        assert "awaiting" in detail


# ---------------------------------------------------------------------------
# 3. render_status() integration: known rows in the real checklist
# ---------------------------------------------------------------------------


class TestRenderStatusIntegration:
    """Run the full render against the real checklist and assert known invariants."""

    _rendered: str | None = None  # class-level cache to avoid re-running pytest N times

    @pytest.fixture(autouse=True)
    def _ensure_rendered(self) -> None:
        if TestRenderStatusIntegration._rendered is None:
            TestRenderStatusIntegration._rendered = render_status()

    @property
    def rendered(self) -> str:
        return TestRenderStatusIntegration._rendered  # type: ignore[return-value]

    # Evidence rows that must be `evidenced`

    def test_k01_evidence_row_is_evidenced(self) -> None:
        assert "test_multiplicity_lwe_params.py" in self.rendered
        matches = re.findall(r"\|\s*(Evidence:.*?test_multiplicity_lwe.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert any(status == "evidenced" for _, status in matches), "K-01 evidence row must be evidenced"

    def test_k02_evidence_row_is_evidenced(self) -> None:
        matches = re.findall(r"\|\s*(Evidence:.*?test_k02.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert any(status == "evidenced" for _, status in matches), "K-02 evidence row must be evidenced"

    def test_k03_evidence_row_is_evidenced(self) -> None:
        matches = re.findall(r"\|\s*(Evidence:.*?test_k03.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert any(status == "evidenced" for _, status in matches), "K-03 evidence row must be evidenced"

    def test_k04_matrix_evidence_row_is_evidenced(self) -> None:
        matches = re.findall(r"\|\s*(Evidence \(matrix\):.*?test_k04.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert any(status == "evidenced" for _, status in matches), "K-04 matrix evidence row must be evidenced"

    def test_k05_evidence_row_is_evidenced(self) -> None:
        matches = re.findall(r"\|\s*(Evidence:.*?test_k05.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert any(status == "evidenced" for _, status in matches), "K-05 evidence row must be evidenced"

    def test_smoke_evidence_row_is_evidenced(self) -> None:
        matches = re.findall(r"\|\s*(Evidence \(smoke\):.*?integration_smoke.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert any(status == "evidenced" for _, status in matches), "Smoke evidence row must be evidenced"

    def test_risk_register_evidence_row_is_evidenced(self) -> None:
        matches = re.findall(r"\|\s*(Evidence:.*?GATE-K-RISK-REGISTER.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert any(status == "evidenced" for _, status in matches), "Risk register evidence row must be evidenced"

    # Manual rows that must stay `pending`

    def test_ci_job_evidence_row_is_pending(self) -> None:
        matches = re.findall(r"\|\s*(Evidence \(full\):.*?CI job.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert matches, "CI job evidence row must appear"
        assert all(status == "pending" for _, status in matches), "CI job evidence row must stay pending"

    def test_gate_reviewer_approval_row_is_pending(self) -> None:
        matches = re.findall(r"\|\s*(Gate K completion criteria.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert matches, "Reviewer approval row must appear"
        assert all(status == "pending" for _, status in matches), "Reviewer approval row must stay pending"

    # Structural rows that must be `implemented` given passing section evidence

    def test_k04_unit_test_row_is_implemented(self) -> None:
        matches = re.findall(r"\|\s*(Gate unit tests cover all failure modes.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert matches, "K-04 unit tests structural row must appear"
        assert all(status == "implemented" for _, status in matches)

    def test_k04_audit_events_row_is_implemented(self) -> None:
        matches = re.findall(r"\|\s*(Audit events are emitted deterministically.*?)\s*\|\s*(\w+)\s*\|", self.rendered)
        assert matches, "K-04 audit events structural row must appear"
        assert all(status == "implemented" for _, status in matches)

    def test_cross_cutting_docs_row_is_implemented(self) -> None:
        matches = re.findall(r"\|\s*(Documentation updated.*?gate k.*?)\s*\|\s*(\w+)\s*\|", self.rendered, re.IGNORECASE)
        assert matches, "Cross-Cutting docs row must appear"
        assert all(status == "implemented" for _, status in matches)

    # Structural sanity

    def test_status_legend_present(self) -> None:
        assert "Status Legend" in self.rendered

    def test_all_k_sections_present(self) -> None:
        for section in ("K-01", "K-02", "K-03", "K-04", "K-05", "Cross"):
            assert section in self.rendered, f"Section {section!r} must appear in rendered output"

    def test_no_unknown_status_values(self) -> None:
        """Every status cell must be one of the three defined values."""
        # Match only lowercase-only words in the second pipe-delimited column so
        # the table header row ("| Item | Status | Detail |") is excluded.
        statuses = re.findall(r"\|\s*\w.*?\|\s*([a-z]+)\s*\|", self.rendered)
        valid = {"implemented", "evidenced", "pending"}
        unknown = {s for s in statuses if s not in valid}
        assert not unknown, f"Unexpected status values: {unknown}"
