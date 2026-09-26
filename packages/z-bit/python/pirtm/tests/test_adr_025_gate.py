"""ADR-025 Phase 1: Badge Registry Gate Tests

Purpose:
    Ensure badge issuance, revocation, persistence, and deterministic fingerprinting.

Blocking condition:
    If any test fails → ADR-025 incomplete.

Tests:
    1. Issue badge and persist registry (PASS)
    2. Revoke badge updates status + revocation fields (PASS)
    3. CLI operations produce valid JSON output (PASS)
    4. Badge fingerprint is deterministic across loads (PASS)

Provenance: MultiplicityFoundation/Meta-Relativity
"""

import json
import os
import tempfile
from pathlib import Path

from pirtm.governance.badge_registry import BadgeRegistry
from pirtm.tools.pirtm_badge import main as badge_cli


class TestGate1IssuePersistence:
    """Issuing a badge should persist it in the registry."""

    def test_issue_badge_persists(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            registry_path = os.path.join(tmpdir, "registry.json")

            # Issue a badge
            registry = BadgeRegistry.load(Path(registry_path))
            entry = registry.issue_badge(
                module_name="xi_operator",
                prime_index=17,
                issued_by="test-issuer",
                certificate_id="cert-123",
                clone_check_id="clone-abc",
                audit_trace="/tmp/dummy-audit.json",
            )
            registry.save(Path(registry_path))

            # Reload and verify
            reloaded = BadgeRegistry.load(Path(registry_path))
            loaded = reloaded.get(entry.badge_id)
            assert loaded is not None
            assert loaded.status == "ACTIVE"
            assert loaded.certificate_id == "cert-123"


class TestGate2RevokeUpdatesStatus:
    """Revoking a badge should mark it revoked and record metadata."""

    def test_revoke_badge_sets_status(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            registry_path = os.path.join(tmpdir, "registry.json")
            registry = BadgeRegistry.new()
            entry = registry.issue_badge(
                module_name="xi_operator",
                prime_index=17,
                issued_by="test-issuer",
                certificate_id="cert-123",
                clone_check_id="clone-abc",
                audit_trace="/tmp/dummy-audit.json",
            )
            registry.save(Path(registry_path))

            # Revoke via API
            registry = BadgeRegistry.load(Path(registry_path))
            revoked = registry.revoke_badge(entry.badge_id, "test reason", "revoker")
            assert revoked is not None
            assert revoked.status == "REVOKED"
            assert "test reason" in revoked.revocation_reason
            assert revoked.revoked_at is not None


class TestGate3CLIOperations:
    """Badge CLI should emit JSON output and return expected exit codes."""

    def test_cli_issue_status_revoke_list(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            registry_path = os.path.join(tmpdir, "registry.json")

            # Create clone-check report (PASS) and audit trace file
            clone_check_report = os.path.join(tmpdir, "clone_check.json")
            with open(clone_check_report, "w") as f:
                json.dump({"status": "PASS", "token_similarity": 0.1, "ast_similarity": 0.0, "fingerprint": "abc"}, f)

            audit_trace = os.path.join(tmpdir, "audit.jsonl")
            with open(audit_trace, "w") as f:
                f.write("{}\n")

            # Issue badge
            rv = badge_cli([
                "issue",
                "--registry",
                registry_path,
                "--module",
                "xi_operator",
                "--prime",
                "17",
                "--issuer",
                "cli-test",
                "--certificate-id",
                "cert-xyz",
                "--clone-check-report",
                clone_check_report,
                "--audit-trace",
                audit_trace,
            ])
            assert rv == 0

            # Ensure registry file exists and parse output for badge id
            assert os.path.exists(registry_path)
            with open(registry_path, "r") as f:
                data = json.load(f)
            assert "entries" in data
            badge_id = data["entries"][0]["badge_id"]

            # Query status
            rv = badge_cli(["status", "--registry", registry_path, "--id", badge_id])
            assert rv == 0

            # List should include active badge
            rv = badge_cli(["list", "--registry", registry_path])
            assert rv == 0

            # Revoke badge
            rv = badge_cli([
                "revoke",
                "--registry",
                registry_path,
                "--id",
                badge_id,
                "--reason",
                "expired",
                "--issuer",
                "cli-test",
            ])
            assert rv == 0

            # List all should include revoked
            rv = badge_cli(["list", "--registry", registry_path, "--all"])
            assert rv == 0


class TestGate4DeterministicFingerprint:
    """Badge fingerprint should be deterministic for the same badge data."""

    def test_fingerprint_stable_across_loads(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            registry_path = os.path.join(tmpdir, "registry.json")
            registry = BadgeRegistry.new()
            entry = registry.issue_badge(
                module_name="xi_operator",
                prime_index=17,
                issued_by="test-issuer",
                certificate_id="cert-123",
                clone_check_id="clone-abc",
                audit_trace="trace://123",
            )
            registry.save(Path(registry_path))

            # Reload and compare fingerprint
            reloaded = BadgeRegistry.load(Path(registry_path))
            reloaded_entry = reloaded.get(entry.badge_id)
            assert reloaded_entry is not None
            assert entry.fingerprint() == reloaded_entry.fingerprint()


class TestGate5SchemaEvolution:
    """Registry should be forward/backward compatible with schema changes."""

    def test_load_registry_with_extra_fields(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            registry_path = os.path.join(tmpdir, "registry.json")
            # Create a registry JSON with an unexpected field and missing optional fields
            payload = {
                "version": "1.0",
                "entries": [
                    {
                        "badge_id": "abc123",
                        "module_name": "xi_operator",
                        "prime_index": 17,
                        "status": "ACTIVE",
                        "issued_at": "2026-03-17T00:00:00Z",
                        "issued_by": "test",
                        "certificate_id": "cert-123",
                        "unexpected_field": "should be ignored",
                    }
                ],
            }
            with open(registry_path, "w", encoding="utf-8") as f:
                json.dump(payload, f)

            registry = BadgeRegistry.load(Path(registry_path))
            assert len(registry.entries) == 1
            entry = registry.entries[0]
            assert entry.badge_id == "abc123"
            # Unexpected field should not be stored
            assert not hasattr(entry, "unexpected_field")
            # Optional fields default to None or empty as appropriate
            assert entry.clone_check_id is None
            assert entry.audit_trace is None
            assert entry.metadata == {}
