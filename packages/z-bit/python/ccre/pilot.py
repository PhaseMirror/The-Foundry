"""ADR-007/008: ECP Pilot Instrumentation and Production Rollout for CCRE."""

from __future__ import annotations

from typing import Any

PILOT_SCHEMA_VERSION = "ccre.pilot.v1"

# Statistical acceptance thresholds — tuneable by governance council, must be versioned.
ACCEPTANCE_THRESHOLDS: dict[str, Any] = {
    "version": "v1",
    "contraction_violation_rate_max": 0.05,
    "drift_exceedance_rate_max": 0.10,
    "resonance_breach_rate_max": 0.05,
    "update_acceptance_rate_min": 0.80,
    "witness_coverage_min": 0.95,
}


class PilotValidationError(Exception):
    """Raised when a pilot report is structurally invalid."""


class ProductionGateError(Exception):
    """Raised when a production rollout gate check fails structurally."""


def _require_field(doc: dict, key: str, context: str) -> Any:
    """Extract a required field, raising PilotValidationError if absent."""
    if key not in doc:
        raise PilotValidationError(f"{context}.{key} is required")
    return doc[key]


def _require_numeric(doc: dict, key: str, context: str) -> float:
    """Extract a numeric field, raising PilotValidationError if absent or wrong type."""
    val = _require_field(doc, key, context)
    if not isinstance(val, (int, float)):
        raise PilotValidationError(
            f"{context}.{key} must be numeric, got {type(val).__name__}"
        )
    return float(val)


def validate_pilot_report(report: dict[str, Any]) -> None:
    """Validate structure of an ECP pilot instrumentation report.

    Required structure::

        {
            "version": "ccre.pilot.v1",
            "pilot_id": "...",
            "sample_size": int,
            "metrics": {
                "contraction_violation_rate": float,
                "drift_exceedance_rate": float,
                "resonance_breach_rate": float,
                "update_acceptance_rate": float,
                "witness_coverage": float
            },
            "ip_boundaries": {
                "trade_secret_scope": str,
                "open_core_modules": [str],
                "proprietary_modules": [str]
            },
            "rollout": {
                "governance_approved": bool,
                "approval_date": str,
                "approver": str
            }
        }
    """
    if report.get("version") != PILOT_SCHEMA_VERSION:
        raise PilotValidationError(
            f"Unknown version '{report.get('version')}', expected '{PILOT_SCHEMA_VERSION}'"
        )

    _require_field(report, "pilot_id", "report")
    _require_field(report, "sample_size", "report")

    sample = report.get("sample_size")
    if not isinstance(sample, int) or sample < 1:
        raise PilotValidationError("report.sample_size must be a positive integer")

    metrics = report.get("metrics")
    if not isinstance(metrics, dict):
        raise PilotValidationError("report.metrics is required and must be a dict")

    _require_numeric(metrics, "contraction_violation_rate", "metrics")
    _require_numeric(metrics, "drift_exceedance_rate", "metrics")
    _require_numeric(metrics, "resonance_breach_rate", "metrics")
    _require_numeric(metrics, "update_acceptance_rate", "metrics")
    _require_numeric(metrics, "witness_coverage", "metrics")

    ip = report.get("ip_boundaries")
    if not isinstance(ip, dict):
        raise PilotValidationError("report.ip_boundaries is required and must be a dict")
    _require_field(ip, "trade_secret_scope", "ip_boundaries")
    _require_field(ip, "open_core_modules", "ip_boundaries")
    _require_field(ip, "proprietary_modules", "ip_boundaries")

    rollout = report.get("rollout")
    if not isinstance(rollout, dict):
        raise PilotValidationError("report.rollout is required and must be a dict")
    _require_field(rollout, "governance_approved", "rollout")
    _require_field(rollout, "approval_date", "rollout")
    _require_field(rollout, "approver", "rollout")


def evaluate_acceptance(
    report: dict[str, Any],
    thresholds: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Evaluate a structurally-valid pilot report against statistical acceptance thresholds.

    Returns an acceptance block with keys: pass, blockers, recommendations.
    """
    t = thresholds if thresholds is not None else ACCEPTANCE_THRESHOLDS
    blockers: list[str] = []
    recommendations: list[str] = []

    m = report.get("metrics", {})

    cvr = float(m.get("contraction_violation_rate", 1))
    if cvr > t["contraction_violation_rate_max"]:
        blockers.append(
            f"contraction_violation_rate {cvr:.3f} > threshold {t['contraction_violation_rate_max']:.3f}"
        )
        recommendations.append(
            "Reduce contraction violations — review kappa parameter tuning."
        )

    der = float(m.get("drift_exceedance_rate", 1))
    if der > t["drift_exceedance_rate_max"]:
        blockers.append(
            f"drift_exceedance_rate {der:.3f} > threshold {t['drift_exceedance_rate_max']:.3f}"
        )
        recommendations.append(
            "Drift exceedance above limit — tighten drift bounds or reduce update frequency."
        )

    rbr = float(m.get("resonance_breach_rate", 1))
    if rbr > t["resonance_breach_rate_max"]:
        blockers.append(
            f"resonance_breach_rate {rbr:.3f} > threshold {t['resonance_breach_rate_max']:.3f}"
        )
        recommendations.append(
            "Resonance breach rate too high — recalibrate resonance guard boundaries."
        )

    uar = float(m.get("update_acceptance_rate", 0))
    if uar < t["update_acceptance_rate_min"]:
        blockers.append(
            f"update_acceptance_rate {uar:.3f} < threshold {t['update_acceptance_rate_min']:.3f}"
        )
        recommendations.append(
            "Too many updates rejected — ease contraction/drift/resonance thresholds or improve input quality."
        )

    wc = float(m.get("witness_coverage", 0))
    if wc < t["witness_coverage_min"]:
        blockers.append(
            f"witness_coverage {wc:.3f} < threshold {t['witness_coverage_min']:.3f}"
        )
        recommendations.append(
            "Witness emission incomplete — ensure all accepted updates produce witnesses."
        )

    acceptance = {
        "pass": len(blockers) == 0,
        "blockers": blockers,
        "recommendations": recommendations,
    }
    report["acceptance"] = acceptance
    return acceptance


def evaluate_production_gate(report: dict[str, Any]) -> dict[str, Any]:
    """Evaluate whether a pilot report meets production rollout requirements.

    Checks:
    - Statistical acceptance must pass
    - IP boundaries must be fully specified
    - Governance approval must be granted
    """
    blockers: list[str] = []

    acceptance = report.get("acceptance", {})
    if not acceptance.get("pass", False):
        blockers.append("statistical_acceptance_failed")

    ip = report.get("ip_boundaries", {})
    if not ip.get("trade_secret_scope"):
        blockers.append("trade_secret_scope_undefined")
    if not ip.get("open_core_modules"):
        blockers.append("open_core_modules_empty")

    rollout = report.get("rollout", {})
    if not rollout.get("governance_approved"):
        blockers.append("governance_not_approved")

    return {
        "production_ready": len(blockers) == 0,
        "blockers": blockers,
    }


def run_pilot_validation(
    report: dict[str, Any],
    thresholds: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Full pilot validation: structure check, acceptance evaluation, production gate.

    Returns the completed report with acceptance and production_gate blocks.
    Raises PilotValidationError on structural problems.
    """
    validate_pilot_report(report)
    evaluate_acceptance(report, thresholds)
    report["production_gate"] = evaluate_production_gate(report)
    return report
