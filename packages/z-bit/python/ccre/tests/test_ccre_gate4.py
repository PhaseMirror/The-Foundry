"""Gate 4 tests — ECP Pilot Instrumentation and Production Rollout (ADR-007/008)."""

from __future__ import annotations

import copy
import pytest

from ccre.pilot import (
    ACCEPTANCE_THRESHOLDS,
    PILOT_SCHEMA_VERSION,
    PilotValidationError,
    ProductionGateError,
    evaluate_acceptance,
    evaluate_production_gate,
    run_pilot_validation,
    validate_pilot_report,
)


def _valid_report() -> dict:
    return {
        "version": PILOT_SCHEMA_VERSION,
        "pilot_id": "ccre-pilot-001",
        "sample_size": 500,
        "metrics": {
            "contraction_violation_rate": 0.02,
            "drift_exceedance_rate": 0.05,
            "resonance_breach_rate": 0.01,
            "update_acceptance_rate": 0.92,
            "witness_coverage": 0.99,
        },
        "ip_boundaries": {
            "trade_secret_scope": "proprietary/resonance-pro",
            "open_core_modules": ["contraction", "drift_tracker", "resonance_guard", "updater", "witness"],
            "proprietary_modules": ["advanced_calibration", "ensemble_optimizer"],
        },
        "rollout": {
            "governance_approved": True,
            "approval_date": "2026-07-18",
            "approver": "governance-council",
        },
    }


# ── Structure validation ─────────────────────────────────────────────


class TestPilotReportStructure:
    """ADR-007: pilot report schema validation."""

    def test_valid_report_passes(self):
        validate_pilot_report(_valid_report())

    def test_wrong_version_raises(self):
        r = _valid_report()
        r["version"] = "ccre.pilot.v999"
        with pytest.raises(PilotValidationError, match="Unknown version"):
            validate_pilot_report(r)

    def test_missing_pilot_id_raises(self):
        r = _valid_report()
        del r["pilot_id"]
        with pytest.raises(PilotValidationError, match="pilot_id"):
            validate_pilot_report(r)

    def test_missing_sample_size_raises(self):
        r = _valid_report()
        del r["sample_size"]
        with pytest.raises(PilotValidationError, match="sample_size"):
            validate_pilot_report(r)

    def test_zero_sample_size_raises(self):
        r = _valid_report()
        r["sample_size"] = 0
        with pytest.raises(PilotValidationError, match="positive integer"):
            validate_pilot_report(r)

    def test_missing_metrics_raises(self):
        r = _valid_report()
        del r["metrics"]
        with pytest.raises(PilotValidationError, match="metrics"):
            validate_pilot_report(r)

    def test_missing_contraction_violation_rate_raises(self):
        r = _valid_report()
        del r["metrics"]["contraction_violation_rate"]
        with pytest.raises(PilotValidationError, match="contraction_violation_rate"):
            validate_pilot_report(r)

    def test_non_numeric_metric_raises(self):
        r = _valid_report()
        r["metrics"]["drift_exceedance_rate"] = "high"
        with pytest.raises(PilotValidationError, match="must be numeric"):
            validate_pilot_report(r)

    def test_missing_ip_boundaries_raises(self):
        r = _valid_report()
        del r["ip_boundaries"]
        with pytest.raises(PilotValidationError, match="ip_boundaries"):
            validate_pilot_report(r)

    def test_missing_trade_secret_scope_raises(self):
        r = _valid_report()
        del r["ip_boundaries"]["trade_secret_scope"]
        with pytest.raises(PilotValidationError, match="trade_secret_scope"):
            validate_pilot_report(r)

    def test_missing_rollout_raises(self):
        r = _valid_report()
        del r["rollout"]
        with pytest.raises(PilotValidationError, match="rollout"):
            validate_pilot_report(r)

    def test_missing_governance_approved_raises(self):
        r = _valid_report()
        del r["rollout"]["governance_approved"]
        with pytest.raises(PilotValidationError, match="governance_approved"):
            validate_pilot_report(r)


# ── Statistical acceptance ───────────────────────────────────────────


class TestStatisticalAcceptance:
    """ADR-007: statistical acceptance protocol with CCRE-domain thresholds."""

    def test_passing_report_accepted(self):
        r = _valid_report()
        result = evaluate_acceptance(r)
        assert result["pass"] is True
        assert result["blockers"] == []

    def test_high_contraction_violation_rate_blocks(self):
        r = _valid_report()
        r["metrics"]["contraction_violation_rate"] = 0.10
        result = evaluate_acceptance(r)
        assert result["pass"] is False
        assert any("contraction_violation_rate" in b for b in result["blockers"])

    def test_high_drift_exceedance_rate_blocks(self):
        r = _valid_report()
        r["metrics"]["drift_exceedance_rate"] = 0.15
        result = evaluate_acceptance(r)
        assert result["pass"] is False
        assert any("drift_exceedance_rate" in b for b in result["blockers"])

    def test_high_resonance_breach_rate_blocks(self):
        r = _valid_report()
        r["metrics"]["resonance_breach_rate"] = 0.10
        result = evaluate_acceptance(r)
        assert result["pass"] is False
        assert any("resonance_breach_rate" in b for b in result["blockers"])

    def test_low_update_acceptance_rate_blocks(self):
        r = _valid_report()
        r["metrics"]["update_acceptance_rate"] = 0.60
        result = evaluate_acceptance(r)
        assert result["pass"] is False
        assert any("update_acceptance_rate" in b for b in result["blockers"])

    def test_low_witness_coverage_blocks(self):
        r = _valid_report()
        r["metrics"]["witness_coverage"] = 0.80
        result = evaluate_acceptance(r)
        assert result["pass"] is False
        assert any("witness_coverage" in b for b in result["blockers"])

    def test_multiple_blockers_all_listed(self):
        r = _valid_report()
        r["metrics"]["contraction_violation_rate"] = 0.20
        r["metrics"]["drift_exceedance_rate"] = 0.30
        r["metrics"]["resonance_breach_rate"] = 0.20
        result = evaluate_acceptance(r)
        assert result["pass"] is False
        assert len(result["blockers"]) == 3

    def test_recommendations_populated_on_failure(self):
        r = _valid_report()
        r["metrics"]["witness_coverage"] = 0.50
        result = evaluate_acceptance(r)
        assert len(result["recommendations"]) > 0

    def test_custom_thresholds_applied(self):
        r = _valid_report()
        r["metrics"]["contraction_violation_rate"] = 0.04
        custom = {**ACCEPTANCE_THRESHOLDS, "contraction_violation_rate_max": 0.03}
        result = evaluate_acceptance(r, thresholds=custom)
        assert result["pass"] is False
        assert any("contraction_violation_rate" in b for b in result["blockers"])

    def test_acceptance_written_to_report(self):
        r = _valid_report()
        evaluate_acceptance(r)
        assert "acceptance" in r
        assert r["acceptance"]["pass"] is True


# ── Production gate ──────────────────────────────────────────────────


class TestProductionGate:
    """ADR-008: IP boundaries and production rollout governance."""

    def test_production_ready_when_all_pass(self):
        r = _valid_report()
        evaluate_acceptance(r)
        result = evaluate_production_gate(r)
        assert result["production_ready"] is True
        assert result["blockers"] == []

    def test_failed_acceptance_blocks_production(self):
        r = _valid_report()
        r["metrics"]["contraction_violation_rate"] = 0.50
        evaluate_acceptance(r)
        result = evaluate_production_gate(r)
        assert result["production_ready"] is False
        assert "statistical_acceptance_failed" in result["blockers"]

    def test_missing_trade_secret_scope_blocks(self):
        r = _valid_report()
        evaluate_acceptance(r)
        r["ip_boundaries"]["trade_secret_scope"] = ""
        result = evaluate_production_gate(r)
        assert result["production_ready"] is False
        assert "trade_secret_scope_undefined" in result["blockers"]

    def test_empty_open_core_modules_blocks(self):
        r = _valid_report()
        evaluate_acceptance(r)
        r["ip_boundaries"]["open_core_modules"] = []
        result = evaluate_production_gate(r)
        assert result["production_ready"] is False
        assert "open_core_modules_empty" in result["blockers"]

    def test_governance_not_approved_blocks(self):
        r = _valid_report()
        evaluate_acceptance(r)
        r["rollout"]["governance_approved"] = False
        result = evaluate_production_gate(r)
        assert result["production_ready"] is False
        assert "governance_not_approved" in result["blockers"]

    def test_multiple_production_blockers(self):
        r = _valid_report()
        r["metrics"]["contraction_violation_rate"] = 0.50
        evaluate_acceptance(r)
        r["ip_boundaries"]["trade_secret_scope"] = ""
        r["rollout"]["governance_approved"] = False
        result = evaluate_production_gate(r)
        assert result["production_ready"] is False
        assert len(result["blockers"]) == 3


# ── End-to-end run_pilot_validation ──────────────────────────────────


class TestRunPilotValidation:
    """ADR-007/008: end-to-end pilot validation pipeline."""

    def test_passing_report_end_to_end(self):
        r = _valid_report()
        result = run_pilot_validation(r)
        assert result["acceptance"]["pass"] is True
        assert result["production_gate"]["production_ready"] is True

    def test_failing_report_end_to_end(self):
        r = _valid_report()
        r["metrics"]["contraction_violation_rate"] = 0.50
        result = run_pilot_validation(r)
        assert result["acceptance"]["pass"] is False
        assert result["production_gate"]["production_ready"] is False

    def test_structural_error_raises(self):
        with pytest.raises(PilotValidationError):
            run_pilot_validation({"version": "wrong"})

    def test_thresholds_are_versioned(self):
        assert "version" in ACCEPTANCE_THRESHOLDS
        assert ACCEPTANCE_THRESHOLDS["version"] == "v1"

    def test_custom_thresholds_in_run(self):
        r = _valid_report()
        strict = {**ACCEPTANCE_THRESHOLDS, "update_acceptance_rate_min": 0.99}
        result = run_pilot_validation(r, thresholds=strict)
        assert result["acceptance"]["pass"] is False
