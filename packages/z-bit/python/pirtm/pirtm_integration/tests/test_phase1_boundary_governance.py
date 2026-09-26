"""Boundary Contract & Governance Conformance Tests (ADR-MCRM-020 D-020.7)

Tests cover:
  - Boundary contract violation detection (one test per contract from D-020.1)
  - Governance conformance (one test per policy from D-020.3)
  - Audit chain integrity verification

Run:
  PYTHONPATH=packages/integrations:pirtm:contracts:. \
    python -m pytest packages/integrations/pirtm_integration/tests/test_phase1_boundary_governance.py -v
"""

from __future__ import annotations

import math
import os
import tempfile
from pathlib import Path

import numpy as np
import pytest

from pirtm_integration.boundary_validation import (
    BoundaryContractError,
    PolicyViolationError,
    RecurrenceTrace,
    CertificationResult,
    BoundaryAuditEntry,
    boundary_validated,
    validate_pirtm_to_ace,
    validate_ace_to_integration,
    validate_integration_to_domain,
    validate_domain_shared_types,
    get_audit_log,
    clear_audit_log,
    BOUNDARY_VALIDATION_ENABLED,
)
from pirtm_integration.governance_policy_validator import (
    enforce_pol001_contractivity,
    enforce_pol002_epsilon_floor,
    enforce_pol003_merkle_root,
    enforce_pol005_lobian_guard,
    enforce_pol006_gate_transition,
    enforce_pol009_spectral_watchdog,
    enforce_pol010_snapshot_integrity,
    enforce_pol011_ccre_update,
    enforce_pol015_type_safety,
    enforce_pol017_l0_invariants,
    enforce_pol020_dcgf_constraints,
    get_policy_audit_log,
    clear_policy_audit_log,
    VALID_GATE_TRANSITIONS,
    VERIFICATION_LAYER_PARAMETERS,
    REQUIRED_DCGF_CONSTRAINTS,
)
from pirtm_integration.boundary_audit import GovernanceAuditChain


# ═══════════════════════════════════════════════════════════════════════
#  Fixtures
# ═══════════════════════════════════════════════════════════════════════

@pytest.fixture(autouse=True)
def _clean_audit():
    """Clear audit logs before each test."""
    clear_audit_log()
    clear_policy_audit_log()
    yield


# ═══════════════════════════════════════════════════════════════════════
#  Section 1: Boundary Contract Violation Tests
# ═══════════════════════════════════════════════════════════════════════

class TestPirtmToAceBoundary:
    """Tests for pirtm/ → ace/ boundary preconditions."""

    def test_valid_inputs_pass(self):
        X = np.array([0.1, 0.2, 0.3])
        Xi = np.eye(3) * 0.1
        Lam = np.eye(3) * 0.1
        validate_pirtm_to_ace(X, Xi, Lam, epsilon=0.05)

    def test_nan_in_X_raises(self):
        X = np.array([0.1, float("nan"), 0.3])
        Xi = np.eye(3) * 0.1
        Lam = np.eye(3) * 0.1
        with pytest.raises(BoundaryContractError, match="non-finite"):
            validate_pirtm_to_ace(X, Xi, Lam, epsilon=0.05)

    def test_inf_in_Xi_raises(self):
        X = np.array([0.1, 0.2])
        Xi = np.array([[float("inf"), 0], [0, 0.1]])
        Lam = np.eye(2) * 0.1
        with pytest.raises(BoundaryContractError, match="non-finite"):
            validate_pirtm_to_ace(X, Xi, Lam, epsilon=0.05)

    def test_nonsquare_Xi_raises(self):
        X = np.array([0.1, 0.2])
        Xi = np.array([[0.1, 0.2, 0.3], [0.1, 0.2, 0.3]])
        Lam = np.eye(2) * 0.1
        with pytest.raises(BoundaryContractError, match="square"):
            validate_pirtm_to_ace(X, Xi, Lam, epsilon=0.05)

    def test_dimension_mismatch_raises(self):
        X = np.array([0.1, 0.2])
        Xi = np.eye(3) * 0.1
        Lam = np.eye(2) * 0.1
        with pytest.raises(BoundaryContractError, match="PRE-COMPAT"):
            validate_pirtm_to_ace(X, Xi, Lam, epsilon=0.05)

    def test_negative_epsilon_raises(self):
        X = np.array([0.1])
        Xi = np.array([[0.1]])
        Lam = np.array([[0.1]])
        with pytest.raises(BoundaryContractError, match="positive"):
            validate_pirtm_to_ace(X, Xi, Lam, epsilon=-0.01)

    def test_G_t_shape_mismatch_raises(self):
        X = np.array([0.1, 0.2])
        Xi = np.eye(2) * 0.1
        Lam = np.eye(2) * 0.1
        G = np.array([0.1, 0.2, 0.3])
        with pytest.raises(BoundaryContractError, match="PRE-COMPAT"):
            validate_pirtm_to_ace(X, Xi, Lam, epsilon=0.05, G_t=G)


class TestAceToIntegrationBoundary:
    """Tests for ace/ → pirtm_integration/ boundary postconditions."""

    def test_valid_result_passes(self):
        result = CertificationResult(
            state_id="test",
            certified=True,
            policy_applied=("POL-001",),
            confidence_score=0.99,
            spectral_radius=0.8,
            contraction_margin=0.15,
        )
        validate_ace_to_integration(result)

    def test_negative_spectral_radius_raises(self):
        result = CertificationResult(
            state_id="test",
            certified=False,
            policy_applied=(),
            confidence_score=0.5,
            spectral_radius=-0.1,
            contraction_margin=0.0,
        )
        with pytest.raises(BoundaryContractError, match="non-negative"):
            validate_ace_to_integration(result)

    def test_certified_with_zero_margin_raises(self):
        result = CertificationResult(
            state_id="test",
            certified=True,
            policy_applied=("POL-001",),
            confidence_score=0.95,
            spectral_radius=0.95,
            contraction_margin=0.0,
        )
        with pytest.raises(BoundaryContractError, match="POST-MARGIN"):
            validate_ace_to_integration(result)

    def test_confidence_out_of_range_raises(self):
        with pytest.raises(ValueError, match="confidence_score"):
            CertificationResult(
                state_id="test",
                certified=False,
                policy_applied=(),
                confidence_score=1.5,
                spectral_radius=0.5,
                contraction_margin=0.1,
            )


class TestIntegrationToDomainBoundary:
    """Tests for pirtm_integration/ → domain module boundary."""

    def test_valid_adapter_input_passes(self):
        validate_integration_to_domain(
            {"state": np.array([0.1, 0.2]), "metadata": {}},
            "acfl",
        )

    def test_missing_state_key_raises(self):
        with pytest.raises(BoundaryContractError, match="Missing"):
            validate_integration_to_domain({"metadata": {}}, "crmf")

    def test_nan_state_raises(self):
        with pytest.raises(BoundaryContractError, match="non-finite"):
            validate_integration_to_domain(
                {"state": np.array([float("nan")]), "metadata": {}},
                "ccre",
            )


class TestDomainSharedBoundary:
    """Tests for domain ↔ shared/ boundary type checks."""

    def test_valid_bounds_pass(self):
        from contracts.shared.types import ContractionBounds
        bounds = ContractionBounds(kappa=0.5, drift=0.2, resonance=0.4)
        validate_domain_shared_types(bounds)

    def test_negative_kappa_raises(self):
        from contracts.shared.types import ContractionBounds
        bounds = ContractionBounds(kappa=-0.1, drift=0.2, resonance=0.4)
        with pytest.raises(BoundaryContractError, match="kappa"):
            validate_domain_shared_types(bounds)

    def test_resonance_out_of_range_raises(self):
        from contracts.shared.types import ContractionBounds
        bounds = ContractionBounds(kappa=0.5, drift=0.2, resonance=1.5)
        with pytest.raises(BoundaryContractError, match="resonance"):
            validate_domain_shared_types(bounds)


# ═══════════════════════════════════════════════════════════════════════
#  Section 2: Boundary Decorator Tests
# ═══════════════════════════════════════════════════════════════════════

class TestBoundaryValidatedDecorator:
    """Tests for the @boundary_validated decorator."""

    def test_passes_with_no_checks(self):
        @boundary_validated(module_from="a", module_to="b")
        def noop():
            return 42

        assert noop() == 42
        log = get_audit_log()
        assert len(log) == 1
        assert log[0].status == "pass"

    def test_precondition_failure_logged(self):
        def bad_pre(*args, **kwargs):
            raise BoundaryContractError("a→b", "PRE-TEST", "bad input")

        @boundary_validated(module_from="a", module_to="b", precondition=bad_pre)
        def fn():
            return 1

        with pytest.raises(BoundaryContractError):
            fn()

        log = get_audit_log()
        assert len(log) == 1
        assert log[0].status == "fail"
        assert log[0].direction == "pre"

    def test_postcondition_failure_logged(self):
        def bad_post(result, *args, **kwargs):
            raise BoundaryContractError("a→b", "POST-TEST", "bad output")

        @boundary_validated(module_from="a", module_to="b", postcondition=bad_post)
        def fn():
            return 1

        with pytest.raises(BoundaryContractError):
            fn()

        log = get_audit_log()
        assert len(log) == 1
        assert log[0].status == "fail"
        assert log[0].direction == "post"


# ═══════════════════════════════════════════════════════════════════════
#  Section 3: Governance Policy Conformance Tests
# ═══════════════════════════════════════════════════════════════════════

class TestPOL001Contractivity:
    """POL-001: Operator Contractivity Bound."""

    def test_valid_q_t_passes(self):
        enforce_pol001_contractivity(q_t=0.5, epsilon=0.05, trace_id="t1")
        log = get_policy_audit_log()
        assert log[-1].status == "enforced"

    def test_violated_raises(self):
        with pytest.raises(PolicyViolationError, match="POL-001"):
            enforce_pol001_contractivity(q_t=0.96, epsilon=0.05, trace_id="t2")

    def test_margin_warning(self):
        with pytest.warns(UserWarning, match="POL-001"):
            enforce_pol001_contractivity(q_t=0.92, epsilon=0.05, trace_id="t3")


class TestPOL002EpsilonFloor:
    """POL-002: Circuit-Aware Epsilon Floor."""

    def test_epsilon_above_floor_passes(self):
        enforce_pol002_epsilon_floor(epsilon=0.05, trace_id="t1")

    def test_epsilon_below_floor_raises(self):
        with pytest.raises(PolicyViolationError, match="POL-002"):
            enforce_pol002_epsilon_floor(epsilon=0.005, trace_id="t2")


class TestPOL003MerkleRoot:
    """POL-003: Governance Merkle Root Immutability."""

    def test_matching_roots_pass(self):
        enforce_pol003_merkle_root("abc123", "abc123", trace_id="t1")

    def test_mismatched_roots_raise(self):
        with pytest.raises(PolicyViolationError, match="POL-003"):
            enforce_pol003_merkle_root("abc123", "def456", trace_id="t2")


class TestPOL005LobianGuard:
    """POL-005: Löbian Guard."""

    def test_safe_changes_pass(self):
        enforce_pol005_lobian_guard({"epsilon": 0.1}, trace_id="t1")

    def test_frozen_param_raises(self):
        with pytest.raises(PolicyViolationError, match="POL-005"):
            enforce_pol005_lobian_guard(
                {"lobian_guard_enabled": False}, trace_id="t2"
            )


class TestPOL006GateTransition:
    """POL-006: Validation Gate State Machine."""

    def test_valid_forward_transition(self):
        enforce_pol006_gate_transition("PROPOSED", "AUDITED", trace_id="t1")

    def test_kill_from_any_state(self):
        for state in ["PROPOSED", "AUDITED", "APPROVED", "EXECUTING", "VERIFIED"]:
            enforce_pol006_gate_transition(state, "KILLED", trace_id=f"kill-{state}")

    def test_invalid_backward_transition(self):
        with pytest.raises(PolicyViolationError, match="POL-006"):
            enforce_pol006_gate_transition("AUDITED", "PROPOSED", trace_id="t2")

    def test_transition_from_killed_blocked(self):
        with pytest.raises(PolicyViolationError, match="POL-006"):
            enforce_pol006_gate_transition("KILLED", "PROPOSED", trace_id="t3")


class TestPOL009SpectralWatchdog:
    """POL-009: Post-Execution Spectral Watchdog."""

    def test_safe_radius_passes(self):
        enforce_pol009_spectral_watchdog(spectral_radius=0.8, trace_id="t1")

    def test_dangerous_radius_raises(self):
        with pytest.raises(PolicyViolationError, match="POL-009"):
            enforce_pol009_spectral_watchdog(spectral_radius=0.96, trace_id="t2")


class TestPOL010SnapshotIntegrity:
    """POL-010: Parameter Snapshot Integrity."""

    def test_matching_hashes_pass(self):
        enforce_pol010_snapshot_integrity("hash1", "hash1", trace_id="t1")

    def test_stale_proposal_raises(self):
        with pytest.raises(PolicyViolationError, match="POL-010"):
            enforce_pol010_snapshot_integrity("hash1", "hash_old", trace_id="t2")


class TestPOL011CCREUpdate:
    """POL-011: CCRE Update Contract."""

    def test_valid_update_passes(self):
        enforce_pol011_ccre_update(kappa=0.5, resonance=0.4, drift=0.3, trace_id="t1")

    def test_kappa_violation_raises(self):
        with pytest.raises(PolicyViolationError, match="POL-011"):
            enforce_pol011_ccre_update(kappa=1.0, resonance=0.4, drift=0.3, trace_id="t2")

    def test_resonance_violation_raises(self):
        with pytest.raises(PolicyViolationError, match="POL-011"):
            enforce_pol011_ccre_update(kappa=0.5, resonance=0.8, drift=0.3, trace_id="t3")

    def test_drift_violation_raises(self):
        with pytest.raises(PolicyViolationError, match="POL-011"):
            enforce_pol011_ccre_update(kappa=0.5, resonance=0.4, drift=0.9, trace_id="t4")


class TestPOL015TypeSafety:
    """POL-015: Typed Phase Mirror Modes."""

    def test_normal_value_passes(self):
        enforce_pol015_type_safety(42, trace_id="t1")

    def test_json_bytes_raises(self):
        json_bytes = b'{"state": "snapshot"}'
        with pytest.raises(PolicyViolationError, match="POL-015"):
            enforce_pol015_type_safety(json_bytes, trace_id="t2")


class TestPOL017L0Invariants:
    """POL-017: L0 Invariant Enforcement."""

    def test_all_invariants_satisfied(self):
        enforce_pol017_l0_invariants(
            prime_index=7,
            epsilon=0.05,
            sigma=0.8,
            alpha=0.10,
            xi_dim=4,
            gap_lb=0.01,
            slope_ub=100.0,
            trace_id="t1",
        )

    def test_non_prime_index_raises(self):
        with pytest.raises(PolicyViolationError, match="INV-1"):
            enforce_pol017_l0_invariants(
                prime_index=4, epsilon=0.05, sigma=0.8,
                alpha=0.10, xi_dim=4, gap_lb=0.01, slope_ub=100.0,
            )

    def test_sigma_too_high_raises(self):
        with pytest.raises(PolicyViolationError, match="INV-3"):
            enforce_pol017_l0_invariants(
                prime_index=7, epsilon=0.05, sigma=1.0,
                alpha=0.10, xi_dim=4, gap_lb=0.01, slope_ub=100.0,
            )

    def test_alpha_too_low_raises(self):
        with pytest.raises(PolicyViolationError, match="INV-4"):
            enforce_pol017_l0_invariants(
                prime_index=7, epsilon=0.05, sigma=0.8,
                alpha=0.03, xi_dim=4, gap_lb=0.01, slope_ub=100.0,
            )

    def test_infinite_slope_raises(self):
        with pytest.raises(PolicyViolationError, match="INV-7"):
            enforce_pol017_l0_invariants(
                prime_index=7, epsilon=0.05, sigma=0.8,
                alpha=0.10, xi_dim=4, gap_lb=0.01, slope_ub=float("inf"),
            )


class TestPOL020DCGFConstraints:
    """POL-020: DCGF 11-Constraint Taxonomy."""

    @staticmethod
    def _valid_scores():
        return {f"C{i:02d}": {"status": "active", "score": 0.9} for i in range(1, 12)}

    def test_all_constraints_pass(self):
        enforce_pol020_dcgf_constraints(self._valid_scores(), trace_id="t1")

    def test_missing_constraint_raises(self):
        scores = self._valid_scores()
        del scores["C11"]
        with pytest.raises(PolicyViolationError, match="POL-020"):
            enforce_pol020_dcgf_constraints(scores, trace_id="t2")

    def test_invalid_status_raises(self):
        scores = self._valid_scores()
        scores["C05"]["status"] = "unknown"
        with pytest.raises(PolicyViolationError, match="POL-020"):
            enforce_pol020_dcgf_constraints(scores, trace_id="t3")


# ═══════════════════════════════════════════════════════════════════════
#  Section 4: Audit Chain Integrity Tests
# ═══════════════════════════════════════════════════════════════════════

class TestGovernanceAuditChain:
    """Tests for the GovernanceAuditChain."""

    def test_empty_chain_integrity(self):
        chain = GovernanceAuditChain()
        assert chain.verify_chain_integrity()

    def test_single_entry_chain(self):
        chain = GovernanceAuditChain()
        chain.record_boundary_event("pirtm→ace", "pass", "test")
        assert chain.length == 1
        assert chain.verify_chain_integrity()

    def test_multi_entry_chain_integrity(self):
        chain = GovernanceAuditChain()
        for i in range(10):
            chain.record_policy_event(f"POL-{i:03d}", "enforced", f"test {i}")
        assert chain.length == 10
        assert chain.verify_chain_integrity()

    def test_entry_hash_chaining(self):
        chain = GovernanceAuditChain()
        chain.record_boundary_event("a→b", "pass", "first")
        chain.record_boundary_event("b→c", "pass", "second")
        entries = chain.get_entries()
        assert entries[1].previous_hash == entries[0].entry_hash

    def test_filter_by_event_type(self):
        chain = GovernanceAuditChain()
        chain.record_boundary_event("a→b", "pass", "b1")
        chain.record_policy_event("POL-001", "enforced", "p1")
        chain.record_boundary_event("b→c", "pass", "b2")
        assert len(chain.get_entries(event_type="boundary")) == 2
        assert len(chain.get_entries(event_type="policy")) == 1

    def test_filter_by_status(self):
        chain = GovernanceAuditChain()
        chain.record_boundary_event("a→b", "pass", "ok")
        chain.record_boundary_event("a→b", "fail", "bad")
        assert len(chain.get_entries(status="fail")) == 1

    def test_summary_report(self):
        chain = GovernanceAuditChain()
        chain.record_boundary_event("a→b", "pass", "ok")
        chain.record_policy_event("POL-001", "violated", "margin")
        report = chain.summary_report()
        assert report["total_events"] == 2
        assert report["violation_count"] == 1
        assert report["chain_integrity"] is True
        assert report["phase"] == 1

    def test_export_jsonl(self, tmp_path):
        chain = GovernanceAuditChain()
        chain.record_boundary_event("a→b", "pass", "ok")
        chain.record_policy_event("POL-001", "enforced", "ok")
        out = tmp_path / "audit.jsonl"
        chain.export_jsonl(out)
        lines = out.read_text().strip().split("\n")
        assert len(lines) == 2

    def test_export_json(self, tmp_path):
        import json
        chain = GovernanceAuditChain()
        chain.record_gate_event("QG-001", "pass", "gate ok")
        out = tmp_path / "audit.json"
        chain.export_json(out)
        data = json.loads(out.read_text())
        assert len(data) == 1
        assert data[0]["event_type"] == "gate"


# ═══════════════════════════════════════════════════════════════════════
#  Section 5: Wire Type Tests
# ═══════════════════════════════════════════════════════════════════════

class TestRecurrenceTrace:
    """Tests for RecurrenceTrace wire type."""

    def test_valid_construction(self):
        t = RecurrenceTrace(
            state_vectors=((0.1, 0.2),),
            q_t_values=(0.5,),
            margins=(0.45,),
            epsilon=0.05,
            trace_id="test",
        )
        assert t.epsilon == 0.05

    def test_empty_states_raises(self):
        with pytest.raises(ValueError, match="at least one"):
            RecurrenceTrace(
                state_vectors=(),
                q_t_values=(),
                margins=(),
                epsilon=0.05,
                trace_id="test",
            )

    def test_negative_epsilon_raises(self):
        with pytest.raises(ValueError, match="positive"):
            RecurrenceTrace(
                state_vectors=((0.1,),),
                q_t_values=(0.5,),
                margins=(0.45,),
                epsilon=-0.01,
                trace_id="test",
            )


class TestCertificationResult:
    """Tests for CertificationResult wire type."""

    def test_valid_construction(self):
        r = CertificationResult(
            state_id="s1",
            certified=True,
            policy_applied=("POL-001",),
            confidence_score=0.99,
            spectral_radius=0.8,
            contraction_margin=0.15,
        )
        assert r.certified

    def test_confidence_out_of_range(self):
        with pytest.raises(ValueError):
            CertificationResult(
                state_id="s1",
                certified=False,
                policy_applied=(),
                confidence_score=-0.1,
                spectral_radius=0.5,
                contraction_margin=0.1,
            )
