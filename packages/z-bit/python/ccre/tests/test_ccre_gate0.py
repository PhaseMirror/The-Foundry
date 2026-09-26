"""Gate 0 runtime tests for CCRE — module identity, symbol registry, certification pipeline.

Tests cover:
  - Module identity and governance boundaries (ADR-001)
  - Symbol registry and canonical definitions (ADR-002)
  - Certification pipeline guard sequence (ADR-004)
  - Update result types and witness emission
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import pytest

CCRE_ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = CCRE_ROOT / "docs"
REGISTRY_PATH = DOCS_DIR / "ccre-registry.json"


# ── Registry integrity ───────────────────────────────────────────────


class TestRegistryIntegrity:
    def test_registry_file_exists(self):
        assert REGISTRY_PATH.is_file(), f"Registry not found: {REGISTRY_PATH}"

    def test_registry_is_valid_json(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        assert isinstance(data, dict)

    def test_registry_has_schema_version(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        assert data["schema_version"] == "ccre.registry.v1"

    def test_registry_modules_match_disk(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        registered = {e["module_id"] for e in data["modules"]}
        on_disk = {
            f.replace(".py", "")
            for f in os.listdir(CCRE_ROOT)
            if f.endswith(".py") and f != "__init__.py"
        }
        assert registered == on_disk, f"Mismatch: registered={registered}, disk={on_disk}"

    def test_registry_entries_have_required_fields(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        for entry in data["modules"]:
            assert entry.get("module_id"), "missing module_id"
            assert entry.get("path"), "missing path"
            assert entry.get("role"), "missing role"
            assert entry.get("governing_adr"), "missing governing_adr"


# ── Symbol registry (ADR-002) ────────────────────────────────────────


class TestSymbolRegistry:
    def test_symbol_registry_has_required_symbols(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        symbols = data["symbol_registry"]
        required = {"kappa", "delta", "alpha", "R_t", "J", "FREEZE_RESONANCE"}
        assert required.issubset(symbols.keys())

    def test_kappa_constraint(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        kappa = data["symbol_registry"]["kappa"]
        assert kappa["constraint"] == "kappa < 1.0"

    def test_delta_constraint(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        delta = data["symbol_registry"]["delta"]
        assert delta["constraint"] == "delta < 0.3"

    def test_alpha_constraint(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        alpha = data["symbol_registry"]["alpha"]
        assert alpha["constraint"] == "alpha > 0.0"

    def test_symbols_have_governing_adr(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        for sym_name, sym_data in data["symbol_registry"].items():
            assert sym_data.get("governing_adr"), f"Symbol {sym_name}: missing governing_adr"

    def test_constants_module_has_runtime_symbols(self):
        from ccre.constants import (
            CONTRACTION_THRESHOLD,
            DRIFT_GUARD_DEFAULT,
            LIPSCHITZ_ALPHA_DEFAULT,
            RESONANCE_MAX_DEFAULT,
            RESONANCE_MIN_DEFAULT,
        )
        assert CONTRACTION_THRESHOLD == 1.0
        assert DRIFT_GUARD_DEFAULT == 0.3
        assert LIPSCHITZ_ALPHA_DEFAULT > 0.0
        assert RESONANCE_MIN_DEFAULT < RESONANCE_MAX_DEFAULT


# ── Governance boundary (ADR-001) ────────────────────────────────────


class TestGovernanceBoundary:
    def test_governance_boundary_defined(self):
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        boundary = data["governance_boundary"]
        assert boundary["may_update"] == "parameters_within_fixed_structure"
        assert "model_architecture" in boundary["may_not_change"]
        assert "operator_class" in boundary["may_not_change"]
        assert "gate_thresholds" in boundary["may_not_change"]

    def test_modules_do_not_reference_proprietary(self):
        for fname in os.listdir(CCRE_ROOT):
            if not fname.endswith(".py"):
                continue
            content = (CCRE_ROOT / fname).read_text(encoding="utf-8")
            assert "proprietary/" not in content, f"{fname} references proprietary/"


# ── Certification pipeline (ADR-004) ────────────────────────────────


class TestCertificationPipeline:
    def test_apply_update_accepts_valid_parameters(self):
        from ccre import apply_update
        result = apply_update(
            {"w1": 0.5, "w2": 0.3},
            {"w1": 0.01},
            kappa=0.9,
            drift=0.1,
            resonance=0.5,
            transform_id="t1",
        )
        assert result.accepted is True
        assert result.reason == "accepted"
        assert result.witness is not None
        assert result.parameters["w1"] == pytest.approx(0.51)
        assert result.parameters["w2"] == pytest.approx(0.3)

    def test_apply_update_rejects_contraction_violation(self):
        from ccre import apply_update
        result = apply_update(
            {"w1": 0.5},
            {"w1": 0.01},
            kappa=1.5,  # violates kappa < 1.0
            drift=0.1,
            resonance=0.5,
            transform_id="t2",
        )
        assert result.accepted is False
        assert result.reason == "contraction_violation"
        assert result.witness is None

    def test_apply_update_rejects_drift_violation(self):
        from ccre import apply_update
        result = apply_update(
            {"w1": 0.5},
            {"w1": 0.01},
            kappa=0.9,
            drift=0.5,  # violates drift < 0.3
            resonance=0.5,
            transform_id="t3",
        )
        assert result.accepted is False
        assert result.reason == "drift_violation"

    def test_apply_update_rejects_resonance_violation(self):
        from ccre import apply_update
        result = apply_update(
            {"w1": 0.5},
            {"w1": 0.01},
            kappa=0.9,
            drift=0.1,
            resonance=0.1,  # violates 0.3 <= R(t) <= 0.7
            transform_id="t4",
        )
        assert result.accepted is False
        assert result.reason == "resonance_violation"

    def test_apply_update_rejects_invalid_alpha(self):
        from ccre import apply_update
        result = apply_update(
            {"w1": 0.5},
            {"w1": 0.01},
            kappa=0.9,
            drift=0.1,
            resonance=0.5,
            transform_id="t5",
            alpha=-1.0,
        )
        assert result.accepted is False
        assert result.reason == "invalid_alpha"


# ── Guard modules (ADR-003 pre-check) ───────────────────────────────


class TestGuardModules:
    def test_contraction_holds(self):
        from ccre import contraction_holds
        assert contraction_holds(0.9) is True
        assert contraction_holds(1.0) is False
        assert contraction_holds(1.5) is False

    def test_drift_holds(self):
        from ccre import drift_holds
        assert drift_holds(0.1) is True
        assert drift_holds(0.3) is False  # boundary: must be < 0.3
        assert drift_holds(0.5) is False

    def test_resonance_holds(self):
        from ccre import resonance_holds
        assert resonance_holds(0.5) is True
        assert resonance_holds(0.3) is True  # boundary
        assert resonance_holds(0.7) is True  # boundary
        assert resonance_holds(0.1) is False
        assert resonance_holds(0.9) is False


# ── Witness emission ────────────────────────────────────────────────


class TestWitnessEmission:
    def test_emit_witness_returns_dict(self):
        from ccre import emit_witness
        witness = emit_witness(transform_id="t1", parameters={"w": 0.5})
        assert isinstance(witness, dict)
        assert witness["transform_id"] == "t1"
        assert len(witness["parameters_hash"]) == 64  # SHA-256

    def test_emit_witness_is_deterministic(self):
        from ccre import emit_witness
        w1 = emit_witness(transform_id="t1", parameters={"w": 0.5, "b": 0.1})
        w2 = emit_witness(transform_id="t1", parameters={"w": 0.5, "b": 0.1})
        assert w1["parameters_hash"] == w2["parameters_hash"]

    def test_emit_witness_different_for_different_params(self):
        from ccre import emit_witness
        w1 = emit_witness(transform_id="t1", parameters={"w": 0.5})
        w2 = emit_witness(transform_id="t1", parameters={"w": 0.6})
        assert w1["parameters_hash"] != w2["parameters_hash"]
