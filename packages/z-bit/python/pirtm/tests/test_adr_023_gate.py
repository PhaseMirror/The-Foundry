"""ADR-023 Phase 1: Audit Trail Enforcer Gate Tests

Purpose:
    Validate that the audit trail is recorded for all critical operations and
    is retrievable and deterministic.

Blocking condition:
    If any test fails → ADR-023 incomplete.

Tests:
    1. Audit event recorded for XiExecutor execution
    2. Audit event recorded for session graph verification
    3. Audit log can be exported and read back (JSONL)
    4. Audit trail is deterministic across repeated runs

Provenance: MultiplicityFoundation/Meta-Relativity
Math stack: Deterministic logging, trace reproducibility
"""

import json
import os
import tempfile
from pathlib import Path

import numpy as np

from pirtm.core.xi_executor import XiExecutor
from pirtm.core.session_graph import ModuleNode
from pirtm.transpiler.verify_session_graph import verify_session_graph_pass
from pirtm.governance.audit_trail import AuditTrail, reset_audit_trail


class TestGate1AuditXiExecution:
    """Audit trail records XiExecutor executions."""

    def test_xi_executor_audit_event(self):
        reset_audit_trail()
        audit = AuditTrail.get()

        exec = XiExecutor("direct")
        exec.execute(np.ones(3), p=3, t=0.1)

        events = audit.snapshot()
        assert any(e.component == "xi_executor" and e.event == "xi_execute" for e in events)
        assert any(e.stage == "runtime" for e in events)


class TestGate2AuditSessionVerification:
    """Audit trail records session graph verification."""

    def test_verify_session_graph_records_audit(self):
        reset_audit_trail()
        audit = AuditTrail.get()

        modules = {
            3: ModuleNode(prime_index=3, epsilon=0.01, op_norm_T=1.0),
            5: ModuleNode(prime_index=5, epsilon=0.05, op_norm_T=1.0),
        }
        coupling = np.array([[1.0, 0.3], [0.3, 1.0]])

        passed, _ = verify_session_graph_pass(
            modules=modules,
            coupling_matrix=coupling,
            link_time=0.001,
            session_id="audit-test"
        )

        assert passed

        events = audit.snapshot()
        assert any(e.component == "session_graph_verifier" and e.event == "verification_started" for e in events)
        assert any(e.component == "session_graph_verifier" and e.event == "verification_completed" for e in events)


class TestGate3AuditExport:
    """Audit trail can be exported to JSONL and read back."""

    def test_audit_export_and_readback(self):
        reset_audit_trail()

        exec = XiExecutor("direct")
        exec.execute(np.ones(2), p=2, t=0.2)

        audit = AuditTrail.get()
        assert not audit.is_empty()

        with tempfile.TemporaryDirectory() as tmpdir:
            path = os.path.join(tmpdir, "trace.log")
            audit.write(Path(path))

            # Re-read the file and verify JSON structure
            with open(path, "r", encoding="utf-8") as f:
                lines = [line.strip() for line in f if line.strip()]

            assert len(lines) > 0
            for line in lines:
                obj = json.loads(line)
                assert "timestamp" in obj
                assert "component" in obj
                assert "event" in obj


class TestGate4AuditDeterminism:
    """Audit trail determinism (same inputs => same trail)."""

    def test_audit_is_deterministic(self):
        reset_audit_trail()
        exec1 = XiExecutor("direct")
        exec1.execute(np.ones(3), p=5, t=0.3)
        def normalize(events_json):
            # Remove timestamp for deterministic comparison
            events = [json.loads(line) for line in events_json]
            for e in events:
                e.pop("timestamp", None)
            return events

        audit1 = [e.to_json() for e in AuditTrail.get().snapshot()]

        reset_audit_trail()
        exec2 = XiExecutor("direct")
        exec2.execute(np.ones(3), p=5, t=0.3)
        audit2 = [e.to_json() for e in AuditTrail.get().snapshot()]

        assert normalize(audit1) == normalize(audit2), "Audit trail should be deterministic for same inputs"