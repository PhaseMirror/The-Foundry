"""Gate 2 runtime tests for CCRE — Core Runtime + Monitoring.

Tests cover:
  - Update-certification pipeline end-to-end (ADR-004)
  - Monitoring hierarchy: contraction → drift → resonance layering (ADR-005)
  - Clonal selection governance: multi-step parameter evolution (ADR-005)
  - Witness chain integrity across updates (ADR-004)

Gate condition: core runtime architecture implements the full update-certification
pipeline; monitoring hierarchy enforces layered checks; clonal selection governance
rules are active.
"""

from __future__ import annotations

import hashlib
import json

import pytest

from ccre.contraction import contraction_holds
from ccre.drift_tracker import drift_holds
from ccre.resonance_guard import resonance_holds
from ccre.updater import CCREUpdateResult, apply_update
from ccre.witness import emit_witness
from ccre.constants import (
    CONTRACTION_THRESHOLD,
    DRIFT_GUARD_DEFAULT,
    LIPSCHITZ_ALPHA_DEFAULT,
    RESONANCE_MAX_DEFAULT,
    RESONANCE_MIN_DEFAULT,
)


# ── ADR-004: Update-Certification Pipeline ──────────────────────────


class TestUpdateCertificationPipeline:
    """End-to-end pipeline: parameters + delta → check → certify → witness."""

    def test_accepted_update_produces_witness(self):
        result = apply_update(
            {"x": 1.0}, {"x": 0.1},
            kappa=0.5, drift=0.1, resonance=0.5, transform_id="T1",
        )
        assert result.accepted is True
        assert result.reason == "accepted"
        assert result.witness is not None
        assert result.witness["transform_id"] == "T1"
        assert len(result.witness["parameters_hash"]) == 64

    def test_result_parameters_include_delta(self):
        result = apply_update(
            {"x": 1.0, "y": 2.0}, {"x": 0.5},
            kappa=0.5, drift=0.1, resonance=0.5, transform_id="T2",
        )
        assert result.parameters["x"] == pytest.approx(1.5)
        assert result.parameters["y"] == pytest.approx(2.0)

    def test_delta_adds_new_key(self):
        result = apply_update(
            {"x": 1.0}, {"z": 3.0},
            kappa=0.5, drift=0.1, resonance=0.5, transform_id="T3",
        )
        assert result.accepted is True
        assert result.parameters["z"] == pytest.approx(3.0)
        assert result.parameters["x"] == pytest.approx(1.0)

    def test_rejected_returns_original_parameters(self):
        result = apply_update(
            {"x": 1.0}, {"x": 0.5},
            kappa=2.0,  # violates contraction
            drift=0.1, resonance=0.5, transform_id="T4",
        )
        assert result.accepted is False
        assert result.parameters["x"] == pytest.approx(1.0)
        assert result.witness is None

    def test_invalid_alpha_rejects(self):
        result = apply_update(
            {"x": 1.0}, {"x": 0.1},
            kappa=0.5, drift=0.1, resonance=0.5,
            transform_id="T5", alpha=0.0,
        )
        assert result.accepted is False
        assert result.reason == "invalid_alpha"

    def test_negative_alpha_rejects(self):
        result = apply_update(
            {"x": 1.0}, {"x": 0.1},
            kappa=0.5, drift=0.1, resonance=0.5,
            transform_id="T6", alpha=-0.1,
        )
        assert result.accepted is False
        assert result.reason == "invalid_alpha"

    def test_result_is_frozen(self):
        result = apply_update(
            {"x": 1.0}, {"x": 0.1},
            kappa=0.5, drift=0.1, resonance=0.5, transform_id="T7",
        )
        with pytest.raises(AttributeError):
            result.accepted = False


# ── ADR-005: Monitoring Hierarchy (Layered Checks) ──────────────────


class TestMonitoringHierarchy:
    """Verify contraction → drift → resonance check ordering."""

    def test_contraction_violation_blocks_first(self):
        result = apply_update(
            {"x": 1.0}, {"x": 0.1},
            kappa=CONTRACTION_THRESHOLD + 0.1,  # fails
            drift=DRIFT_GUARD_DEFAULT + 0.1,      # also fails
            resonance=0.0,                         # also fails
            transform_id="H1",
        )
        assert result.accepted is False
        assert result.reason == "contraction_violation"

    def test_drift_violation_after_contraction_passes(self):
        result = apply_update(
            {"x": 1.0}, {"x": 0.1},
            kappa=CONTRACTION_THRESHOLD - 0.1,  # passes
            drift=DRIFT_GUARD_DEFAULT + 0.1,     # fails
            resonance=0.0,                        # also fails
            transform_id="H2",
        )
        assert result.accepted is False
        assert result.reason == "drift_violation"

    def test_resonance_violation_after_drift_passes(self):
        result = apply_update(
            {"x": 1.0}, {"x": 0.1},
            kappa=CONTRACTION_THRESHOLD - 0.1,  # passes
            drift=DRIFT_GUARD_DEFAULT - 0.1,     # passes
            resonance=RESONANCE_MAX_DEFAULT + 0.1,  # fails
            transform_id="H3",
        )
        assert result.accepted is False
        assert result.reason == "resonance_violation"

    def test_all_checks_pass(self):
        result = apply_update(
            {"x": 1.0}, {"x": 0.1},
            kappa=CONTRACTION_THRESHOLD - 0.1,
            drift=DRIFT_GUARD_DEFAULT - 0.1,
            resonance=(RESONANCE_MIN_DEFAULT + RESONANCE_MAX_DEFAULT) / 2,
            transform_id="H4",
        )
        assert result.accepted is True


class TestContractionModule:
    def test_below_threshold(self):
        assert contraction_holds(CONTRACTION_THRESHOLD - 0.1) is True

    def test_at_threshold(self):
        assert contraction_holds(CONTRACTION_THRESHOLD) is False

    def test_above_threshold(self):
        assert contraction_holds(CONTRACTION_THRESHOLD + 0.5) is False


class TestDriftModule:
    def test_below_bound(self):
        assert drift_holds(DRIFT_GUARD_DEFAULT - 0.1) is True

    def test_at_bound(self):
        assert drift_holds(DRIFT_GUARD_DEFAULT) is False

    def test_custom_bound(self):
        assert drift_holds(0.4, bound=0.5) is True
        assert drift_holds(0.6, bound=0.5) is False


class TestResonanceModule:
    def test_in_range(self):
        mid = (RESONANCE_MIN_DEFAULT + RESONANCE_MAX_DEFAULT) / 2
        assert resonance_holds(mid) is True

    def test_below_lower(self):
        assert resonance_holds(RESONANCE_MIN_DEFAULT - 0.01) is False

    def test_above_upper(self):
        assert resonance_holds(RESONANCE_MAX_DEFAULT + 0.01) is False

    def test_at_bounds(self):
        assert resonance_holds(RESONANCE_MIN_DEFAULT) is True
        assert resonance_holds(RESONANCE_MAX_DEFAULT) is True

    def test_custom_bounds(self):
        assert resonance_holds(0.5, lower=0.2, upper=0.8) is True
        assert resonance_holds(0.1, lower=0.2, upper=0.8) is False


# ── ADR-004: Witness Chain Integrity ─────────────────────────────────


class TestWitnessChain:
    """Verify witness integrity across multi-step parameter updates."""

    def test_witness_hash_deterministic(self):
        w1 = emit_witness("T1", {"x": 1.0, "y": 2.0})
        w2 = emit_witness("T1", {"x": 1.0, "y": 2.0})
        assert w1 == w2

    def test_witness_hash_changes_with_parameters(self):
        w1 = emit_witness("T1", {"x": 1.0})
        w2 = emit_witness("T1", {"x": 2.0})
        assert w1["parameters_hash"] != w2["parameters_hash"]

    def test_witness_hash_changes_with_transform(self):
        w1 = emit_witness("T1", {"x": 1.0})
        w2 = emit_witness("T2", {"x": 1.0})
        assert w1["transform_id"] != w2["transform_id"]
        # Same params → same hash (transform_id doesn't affect hash)
        assert w1["parameters_hash"] == w2["parameters_hash"]

    def test_chained_updates_produce_chain(self):
        """Simulate multi-step parameter evolution with witness chain."""
        params = {"x": 1.0, "y": 2.0}
        witnesses = []
        for i in range(5):
            result = apply_update(
                params, {"x": 0.01 * (i + 1)},
                kappa=0.5, drift=0.1, resonance=0.5,
                transform_id=f"step_{i}",
            )
            assert result.accepted is True
            witnesses.append(result.witness)
            params = result.parameters

        # All witnesses should be unique (different parameters at each step)
        hashes = [w["parameters_hash"] for w in witnesses]
        assert len(set(hashes)) == 5

    def test_witness_canonical_json_order(self):
        """Parameters hash should be independent of insertion order."""
        w1 = emit_witness("T1", {"b": 2.0, "a": 1.0})
        w2 = emit_witness("T1", {"a": 1.0, "b": 2.0})
        assert w1["parameters_hash"] == w2["parameters_hash"]


# ── ADR-005: Clonal Selection Governance ─────────────────────────────


class TestClonalSelection:
    """Simulate fitness-based parameter evolution under governance rules."""

    def test_best_candidate_selected(self):
        """Multiple parameter candidates; only those passing all checks survive."""
        base = {"x": 1.0}
        candidates = [
            {"delta": {"x": 0.1}, "kappa": 0.5, "drift": 0.1, "resonance": 0.5},
            {"delta": {"x": 0.2}, "kappa": 1.5, "drift": 0.1, "resonance": 0.5},  # fails contraction
            {"delta": {"x": 0.3}, "kappa": 0.5, "drift": 0.5, "resonance": 0.5},  # fails drift
        ]
        survivors = []
        for i, c in enumerate(candidates):
            result = apply_update(
                base, c["delta"],
                kappa=c["kappa"], drift=c["drift"], resonance=c["resonance"],
                transform_id=f"clone_{i}",
            )
            if result.accepted:
                survivors.append(result)

        assert len(survivors) == 1
        assert survivors[0].parameters["x"] == pytest.approx(1.1)

    def test_no_survivors_preserves_original(self):
        """When all candidates fail, original parameters are preserved."""
        base = {"x": 1.0}
        result = apply_update(
            base, {"x": 0.5},
            kappa=2.0, drift=0.5, resonance=0.0,
            transform_id="doomed",
        )
        assert result.accepted is False
        assert result.parameters == base

    def test_multi_generation_evolution(self):
        """Simulate 10 generations of accepted updates."""
        params = {"x": 0.0}
        for gen in range(10):
            result = apply_update(
                params, {"x": 0.1},
                kappa=0.5, drift=0.1, resonance=0.5,
                transform_id=f"gen_{gen}",
            )
            assert result.accepted is True
            params = result.parameters
        assert params["x"] == pytest.approx(1.0)
