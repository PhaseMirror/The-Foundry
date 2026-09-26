"""Gate 1 runtime tests for CCRE — Mathematical Preservation Proof Obligations.

Tests cover:
  - Contraction preservation: kappa < 1.0 always (ADR-003)
  - Drift bounds: drift < bound (ADR-003)
  - Resonance preservation: lower <= R(t) <= upper (ADR-003)
  - Update pipeline preserves all three invariants (ADR-003)
  - Witness chain integrity (ADR-003)
  - Fail-closed behaviour on boundary violations

Gate condition: mathematical preservation proofs documented and tested.
"""

from __future__ import annotations

import hashlib
import json

import pytest

from ccre.constants import (
    CONTRACTION_THRESHOLD,
    DRIFT_GUARD_DEFAULT,
    RESONANCE_MAX_DEFAULT,
    RESONANCE_MIN_DEFAULT,
)
from ccre.contraction import contraction_holds
from ccre.drift_tracker import drift_holds
from ccre.resonance_guard import resonance_holds
from ccre.updater import CCREUpdateResult, apply_update
from ccre.witness import emit_witness


# ── Contraction preservation (ADR-003 §1) ───────────────────────────


class TestContractionPreservation:
    def test_kappa_below_threshold_holds(self):
        assert contraction_holds(0.5) is True

    def test_kappa_at_zero_holds(self):
        assert contraction_holds(0.0) is True

    def test_kappa_at_boundary_fails(self):
        """kappa must be strictly less than threshold."""
        assert contraction_holds(CONTRACTION_THRESHOLD) is False

    def test_kappa_above_threshold_fails(self):
        assert contraction_holds(1.5) is False

    def test_negative_kappa_holds(self):
        assert contraction_holds(-0.1) is True

    def test_kappa_just_below_threshold_holds(self):
        assert contraction_holds(CONTRACTION_THRESHOLD - 1e-12) is True

    def test_kappa_just_above_threshold_fails(self):
        assert contraction_holds(CONTRACTION_THRESHOLD + 1e-12) is False


# ── Drift bound preservation (ADR-003 §2) ───────────────────────────


class TestDriftPreservation:
    def test_drift_below_bound_holds(self):
        assert drift_holds(0.1, DRIFT_GUARD_DEFAULT) is True

    def test_drift_at_zero_holds(self):
        assert drift_holds(0.0, DRIFT_GUARD_DEFAULT) is True

    def test_drift_at_bound_fails(self):
        """Drift must be strictly less than bound."""
        assert drift_holds(DRIFT_GUARD_DEFAULT, DRIFT_GUARD_DEFAULT) is False

    def test_drift_above_bound_fails(self):
        assert drift_holds(0.5, DRIFT_GUARD_DEFAULT) is False

    def test_custom_bound(self):
        assert drift_holds(0.09, 0.1) is True
        assert drift_holds(0.11, 0.1) is False


# ── Resonance safe band preservation (ADR-003 §3) ───────────────────


class TestResonancePreservation:
    def test_resonance_in_band_holds(self):
        assert resonance_holds(0.5, RESONANCE_MIN_DEFAULT, RESONANCE_MAX_DEFAULT) is True

    def test_resonance_at_lower_bound_holds(self):
        assert resonance_holds(RESONANCE_MIN_DEFAULT, RESONANCE_MIN_DEFAULT, RESONANCE_MAX_DEFAULT) is True

    def test_resonance_at_upper_bound_holds(self):
        assert resonance_holds(RESONANCE_MAX_DEFAULT, RESONANCE_MIN_DEFAULT, RESONANCE_MAX_DEFAULT) is True

    def test_resonance_below_band_fails(self):
        assert resonance_holds(0.1, RESONANCE_MIN_DEFAULT, RESONANCE_MAX_DEFAULT) is False

    def test_resonance_above_band_fails(self):
        assert resonance_holds(0.9, RESONANCE_MIN_DEFAULT, RESONANCE_MAX_DEFAULT) is False

    def test_resonance_just_below_lower_fails(self):
        assert resonance_holds(RESONANCE_MIN_DEFAULT - 1e-12, RESONANCE_MIN_DEFAULT, RESONANCE_MAX_DEFAULT) is False

    def test_resonance_just_above_upper_fails(self):
        assert resonance_holds(RESONANCE_MAX_DEFAULT + 1e-12, RESONANCE_MIN_DEFAULT, RESONANCE_MAX_DEFAULT) is False


# ── Update pipeline preservation (ADR-003 §4) ───────────────────────


class TestUpdatePipelinePreservation:
    def _safe_update(self, **overrides):
        kwargs = {
            "parameters": {"x": 1.0},
            "delta": {"x": 0.1},
            "kappa": 0.5,
            "drift": 0.1,
            "resonance": 0.5,
            "transform_id": "test-transform",
        }
        kwargs.update(overrides)
        return apply_update(**kwargs)

    def test_all_invariants_pass_yields_accepted(self):
        result = self._safe_update()
        assert isinstance(result, CCREUpdateResult)
        assert result.accepted is True

    def test_contraction_violation_rejects(self):
        result = self._safe_update(kappa=1.5)
        assert result.accepted is False
        assert "contraction" in result.reason.lower()

    def test_drift_violation_rejects(self):
        result = self._safe_update(drift=0.5)
        assert result.accepted is False
        assert "drift" in result.reason.lower()

    def test_resonance_violation_rejects(self):
        result = self._safe_update(resonance=0.9)
        assert result.accepted is False
        assert "resonance" in result.reason.lower()

    def test_accepted_update_emits_witness(self):
        result = self._safe_update()
        assert result.accepted is True
        assert isinstance(result.witness, dict)
        assert "parameters_hash" in result.witness
        assert len(result.witness["parameters_hash"]) == 64  # SHA-256

    def test_rejected_update_has_no_witness(self):
        result = self._safe_update(kappa=1.5)
        assert result.accepted is False
        assert result.witness is None

    def test_result_is_frozen(self):
        result = self._safe_update()
        with pytest.raises(AttributeError):
            result.accepted = False

    def test_pipeline_order_contraction_first(self):
        """Contraction must be checked before drift and resonance."""
        result = self._safe_update(kappa=2.0, drift=1.0, resonance=0.0)
        assert result.accepted is False
        assert "contraction" in result.reason.lower()


# ── Witness chain integrity (ADR-003 §5) ────────────────────────────


class TestWitnessChainIntegrity:
    def test_witness_is_sha256(self):
        witness = emit_witness(transform_id="test", parameters={"x": 0.5})
        assert isinstance(witness, dict)
        assert len(witness["parameters_hash"]) == 64
        int(witness["parameters_hash"], 16)  # must be hex

    def test_witness_deterministic(self):
        w1 = emit_witness(transform_id="test", parameters={"x": 0.5})
        w2 = emit_witness(transform_id="test", parameters={"x": 0.5})
        assert w1 == w2

    def test_witness_changes_with_input(self):
        w1 = emit_witness(transform_id="test", parameters={"x": 0.5})
        w2 = emit_witness(transform_id="test", parameters={"x": 0.6})
        assert w1["parameters_hash"] != w2["parameters_hash"]

    def test_witness_canonical_json(self):
        """Witness should use canonical JSON for reproducibility."""
        params = {"x": 0.5, "y": 0.1}
        witness = emit_witness(transform_id="test", parameters=params)
        canonical = json.dumps(params, sort_keys=True, separators=(",", ":"))
        expected = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
        assert witness["parameters_hash"] == expected


# ── Boundary value analysis ──────────────────────────────────────────


class TestBoundaryValues:
    def test_all_at_safe_limits(self):
        result = apply_update(
            parameters={"x": 1.0},
            delta={"x": 0.01},
            kappa=CONTRACTION_THRESHOLD - 1e-9,
            drift=DRIFT_GUARD_DEFAULT - 1e-9,
            resonance=RESONANCE_MIN_DEFAULT,
            transform_id="boundary-safe",
        )
        assert result.accepted is True

    def test_all_at_violation_limits(self):
        result = apply_update(
            parameters={"x": 1.0},
            delta={"x": 0.01},
            kappa=CONTRACTION_THRESHOLD,
            drift=DRIFT_GUARD_DEFAULT,
            resonance=RESONANCE_MAX_DEFAULT + 1e-9,
            transform_id="boundary-violation",
        )
        assert result.accepted is False
