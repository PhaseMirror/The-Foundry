"""Gate 3 runtime tests for CCRE — Safety Validation and Gate Independence.

Tests cover:
  - ADR-006: Safety validation — contraction, drift, resonance gate independence
  - ADR-006: Each gate rejects independently (no cascading masks)
  - ADR-006: Combined update pipeline preserves fail-closed semantics
  - ADR-006: Witness chain integrity across accepted updates
  - ADR-006: Boundary conditions and edge cases for each guard

Gate condition: ADR-006 acceptance tests pass.
"""

from __future__ import annotations

import hashlib
import json

import pytest

from ccre.constants import (
    CONTRACTION_THRESHOLD,
    DRIFT_GUARD_DEFAULT,
    LIPSCHITZ_ALPHA_DEFAULT,
    RESONANCE_MAX_DEFAULT,
    RESONANCE_MIN_DEFAULT,
)
from ccre.contraction import contraction_holds
from ccre.drift_tracker import drift_holds
from ccre.resonance_guard import resonance_holds
from ccre.updater import CCREUpdateResult, apply_update
from ccre.witness import emit_witness


# ── Helpers ──────────────────────────────────────────────────────────


def _base_params():
    return {"param_a": 1.0, "param_b": 2.0}


def _base_delta():
    return {"param_a": 0.1}


def _safe_update(**overrides):
    """Return kwargs for a safe (all-passing) apply_update call."""
    kwargs = {
        "parameters": _base_params(),
        "delta": _base_delta(),
        "kappa": 0.5,
        "drift": 0.1,
        "resonance": 0.5,
        "transform_id": "T001",
    }
    kwargs.update(overrides)
    return kwargs


# ── ADR-006: Gate independence — contraction ─────────────────────────


class TestContractionGateIndependence:
    """Contraction gate operates independently of drift and resonance."""

    def test_contraction_passes_below_threshold(self):
        assert contraction_holds(CONTRACTION_THRESHOLD - 0.01) is True

    def test_contraction_fails_at_threshold(self):
        assert contraction_holds(CONTRACTION_THRESHOLD) is False

    def test_contraction_fails_above_threshold(self):
        assert contraction_holds(CONTRACTION_THRESHOLD + 0.5) is False

    def test_contraction_passes_at_zero(self):
        assert contraction_holds(0.0) is True

    def test_contraction_passes_negative(self):
        assert contraction_holds(-1.0) is True

    def test_contraction_violation_rejects_update(self):
        result = apply_update(**_safe_update(kappa=CONTRACTION_THRESHOLD))
        assert result.accepted is False
        assert result.reason == "contraction_violation"

    def test_contraction_violation_preserves_original_params(self):
        params = _base_params()
        result = apply_update(**_safe_update(kappa=CONTRACTION_THRESHOLD))
        assert result.parameters == params

    def test_contraction_violation_independent_of_drift(self):
        """Even with perfect drift, contraction violation blocks."""
        result = apply_update(**_safe_update(kappa=1.5, drift=0.0))
        assert result.accepted is False
        assert result.reason == "contraction_violation"


# ── ADR-006: Gate independence — drift ───────────────────────────────


class TestDriftGateIndependence:
    """Drift gate operates independently of contraction and resonance."""

    def test_drift_passes_below_bound(self):
        assert drift_holds(DRIFT_GUARD_DEFAULT - 0.01) is True

    def test_drift_fails_at_bound(self):
        assert drift_holds(DRIFT_GUARD_DEFAULT) is False

    def test_drift_fails_above_bound(self):
        assert drift_holds(DRIFT_GUARD_DEFAULT + 0.5) is False

    def test_drift_passes_at_zero(self):
        assert drift_holds(0.0) is True

    def test_drift_custom_bound(self):
        assert drift_holds(0.5, bound=0.6) is True
        assert drift_holds(0.5, bound=0.4) is False

    def test_drift_violation_rejects_update(self):
        result = apply_update(**_safe_update(drift=DRIFT_GUARD_DEFAULT))
        assert result.accepted is False
        assert result.reason == "drift_violation"

    def test_drift_violation_independent_of_contraction(self):
        """Even with perfect contraction, drift violation blocks."""
        result = apply_update(**_safe_update(kappa=0.0, drift=1.0))
        assert result.accepted is False
        assert result.reason == "drift_violation"


# ── ADR-006: Gate independence — resonance ───────────────────────────


class TestResonanceGateIndependence:
    """Resonance gate operates independently of contraction and drift."""

    def test_resonance_passes_in_range(self):
        assert resonance_holds(0.5) is True

    def test_resonance_passes_at_lower_bound(self):
        assert resonance_holds(RESONANCE_MIN_DEFAULT) is True

    def test_resonance_passes_at_upper_bound(self):
        assert resonance_holds(RESONANCE_MAX_DEFAULT) is True

    def test_resonance_fails_below_lower(self):
        assert resonance_holds(RESONANCE_MIN_DEFAULT - 0.01) is False

    def test_resonance_fails_above_upper(self):
        assert resonance_holds(RESONANCE_MAX_DEFAULT + 0.01) is False

    def test_resonance_custom_bounds(self):
        assert resonance_holds(0.1, lower=0.0, upper=0.2) is True
        assert resonance_holds(0.3, lower=0.0, upper=0.2) is False

    def test_resonance_violation_rejects_update(self):
        result = apply_update(**_safe_update(resonance=0.0))
        assert result.accepted is False
        assert result.reason == "resonance_violation"

    def test_resonance_violation_independent_of_drift(self):
        """Even with perfect drift, resonance violation blocks."""
        result = apply_update(**_safe_update(drift=0.0, resonance=0.0))
        assert result.accepted is False
        assert result.reason == "resonance_violation"


# ── ADR-006: Combined pipeline — fail-closed semantics ───────────────


class TestFailClosedPipeline:
    """Apply_update enforces fail-closed: any gate failure blocks update."""

    def test_all_gates_pass_accepts_update(self):
        result = apply_update(**_safe_update())
        assert result.accepted is True
        assert result.reason == "accepted"

    def test_accepted_update_applies_delta(self):
        result = apply_update(**_safe_update())
        assert result.parameters["param_a"] == pytest.approx(1.1)
        assert result.parameters["param_b"] == pytest.approx(2.0)

    def test_accepted_update_has_witness(self):
        result = apply_update(**_safe_update())
        assert result.witness is not None
        assert "transform_id" in result.witness
        assert "parameters_hash" in result.witness

    def test_invalid_alpha_blocks_before_gates(self):
        result = apply_update(**_safe_update(alpha=0.0))
        assert result.accepted is False
        assert result.reason == "invalid_alpha"

    def test_negative_alpha_blocks(self):
        result = apply_update(**_safe_update(alpha=-1.0))
        assert result.accepted is False
        assert result.reason == "invalid_alpha"

    def test_gate_check_order_contraction_first(self):
        """When all three gates fail, contraction is checked first."""
        result = apply_update(**_safe_update(kappa=2.0, drift=1.0, resonance=0.0))
        assert result.reason == "contraction_violation"

    def test_gate_check_order_drift_second(self):
        """With contraction OK but drift+resonance failing, drift checked next."""
        result = apply_update(**_safe_update(kappa=0.5, drift=1.0, resonance=0.0))
        assert result.reason == "drift_violation"

    def test_rejected_update_produces_no_witness(self):
        result = apply_update(**_safe_update(kappa=2.0))
        assert result.witness is None


# ── ADR-006: Witness chain integrity ─────────────────────────────────


class TestWitnessChainIntegrity:
    """Witnesses provide tamper-evident audit trail for accepted updates."""

    def test_witness_hash_is_sha256(self):
        witness = emit_witness("T001", {"a": 1.0})
        assert len(witness["parameters_hash"]) == 64
        int(witness["parameters_hash"], 16)  # valid hex

    def test_witness_deterministic(self):
        w1 = emit_witness("T001", {"a": 1.0, "b": 2.0})
        w2 = emit_witness("T001", {"a": 1.0, "b": 2.0})
        assert w1 == w2

    def test_witness_changes_with_parameters(self):
        w1 = emit_witness("T001", {"a": 1.0})
        w2 = emit_witness("T001", {"a": 2.0})
        assert w1["parameters_hash"] != w2["parameters_hash"]

    def test_witness_changes_with_transform_id(self):
        w1 = emit_witness("T001", {"a": 1.0})
        w2 = emit_witness("T002", {"a": 1.0})
        assert w1["transform_id"] != w2["transform_id"]
        # Parameters hash should be the same (only params contribute)
        assert w1["parameters_hash"] == w2["parameters_hash"]

    def test_witness_canonical_key_order(self):
        """Key order doesn't affect hash (canonical JSON sort)."""
        w1 = emit_witness("T001", {"a": 1.0, "b": 2.0})
        w2 = emit_witness("T001", {"b": 2.0, "a": 1.0})
        assert w1["parameters_hash"] == w2["parameters_hash"]

    def test_chained_updates_produce_distinct_witnesses(self):
        """Sequential accepted updates produce distinct witness hashes."""
        params = _base_params()
        witnesses = []
        for i in range(3):
            result = apply_update(
                parameters=params,
                delta={"param_a": 0.1},
                kappa=0.5, drift=0.1, resonance=0.5,
                transform_id=f"T{i:03d}",
            )
            assert result.accepted is True
            witnesses.append(result.witness["parameters_hash"])
            params = result.parameters
        # Each step changes parameters, so hashes differ
        assert len(set(witnesses)) == 3

    def test_witness_hash_matches_manual_computation(self):
        params = {"x": 3.0, "y": 4.0}
        canonical = json.dumps(params, sort_keys=True, separators=(",", ":"))
        expected = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
        witness = emit_witness("T001", params)
        assert witness["parameters_hash"] == expected


# ── ADR-006: Boundary conditions ─────────────────────────────────────


class TestBoundaryConditions:
    """Edge cases at gate boundaries."""

    def test_contraction_just_below_threshold_passes(self):
        result = apply_update(**_safe_update(kappa=CONTRACTION_THRESHOLD - 1e-9))
        assert result.accepted is True

    def test_drift_just_below_bound_passes(self):
        result = apply_update(**_safe_update(drift=DRIFT_GUARD_DEFAULT - 1e-9))
        assert result.accepted is True

    def test_resonance_at_exact_lower_bound_passes(self):
        result = apply_update(**_safe_update(resonance=RESONANCE_MIN_DEFAULT))
        assert result.accepted is True

    def test_resonance_at_exact_upper_bound_passes(self):
        result = apply_update(**_safe_update(resonance=RESONANCE_MAX_DEFAULT))
        assert result.accepted is True

    def test_empty_delta_accepted(self):
        result = apply_update(**_safe_update(delta={}))
        assert result.accepted is True
        assert result.parameters == _base_params()

    def test_new_parameter_in_delta(self):
        result = apply_update(**_safe_update(delta={"new_param": 5.0}))
        assert result.accepted is True
        assert result.parameters["new_param"] == 5.0
