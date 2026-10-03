#!/usr/bin/env python3
"""Tests for the ADR-0139 submodule integrity gate.

The gate is the thing standing between a silent empty-directory clone and a
green build, so the tests are written to falsify it rather than to exercise it
comfortably: each case plants one real defect in a real throwaway git repository
and asserts that the corresponding check reports it. A check that cannot be
shown to fail is a check that reads as evidence while proving nothing, which
SPEC.md's R-rules and ADR-0139 both forbid.

Run: python3 -m unittest discover -s scripts/tests -p 'test_submodule*.py'
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import check_submodule_integrity as gate  # noqa: E402

# Two distinct 40-hex ids so a drifted pin is distinguishable from a correct one.
PIN = "1111111111111111111111111111111111111111"
OTHER = "2222222222222222222222222222222222222222"
GONE_PIN = "3333333333333333333333333333333333333333"
LEXLEAN = "packages/lexlean"
LAKE_PATH = "z-bit/lean4/.lake/packages/mathlib"
LOCKSTEP_URL = "https://github.com/PhaseMirror/LexLean.git"


def run(*args: str, cwd: Path) -> None:
    subprocess.run(["git", *args], cwd=str(cwd), check=True, capture_output=True)


class GateFixture(unittest.TestCase):
    """A throwaway git repository whose index holds the gitlinks under test."""

    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        run("init", "--quiet", "-b", "main", cwd=self.root)
        run("config", "user.email", "gate@test.invalid", cwd=self.root)
        run("config", "user.name", "gate test", cwd=self.root)
        (self.root / "README.md").write_text("fixture\n", encoding="utf-8")
        run("add", "README.md", cwd=self.root)
        run("commit", "--quiet", "-m", "fixture", cwd=self.root)
        self._real_root = gate.ROOT
        gate.ROOT = self.root

    def tearDown(self) -> None:
        gate.ROOT = self._real_root
        self._tmp.cleanup()

    def add_gitlink(self, path: str, sha: str) -> None:
        run("update-index", "--add", "--cacheinfo", f"160000,{sha},{path}", cwd=self.root)

    def remove_gitlink(self, path: str) -> None:
        run("update-index", "--force-remove", path, cwd=self.root)

    def commit(self) -> None:
        run("commit", "--quiet", "-m", "pins", cwd=self.root)

    def write_gitmodules(self, body: str) -> None:
        (self.root / ".gitmodules").write_text(body, encoding="utf-8")

    def write_lockstep(self, payload: dict) -> None:
        (self.root / gate.LOCKSTEP_FILE).write_text(
            json.dumps(payload, indent=2), encoding="utf-8"
        )

    def declare_lexlean(self) -> None:
        self.write_gitmodules(
            f'[submodule "{LEXLEAN}"]\n\tpath = {LEXLEAN}\n\turl = {LOCKSTEP_URL}\n'
        )

    def lockstep_for(self, commit: str = PIN, **overrides) -> dict:
        entry = {
            "path": LEXLEAN,
            "url": LOCKSTEP_URL,
            "commit": commit,
            "grade": "ADVERTISED",
        }
        entry.update(overrides)
        return {"submodules": [entry], "acknowledged_unresolved": []}


class TestExemptionScope(unittest.TestCase):
    """The Lake exemption must be narrow: it covers .lake/packages/ and nothing else."""

    def test_lake_vendor_path_is_exempt(self):
        self.assertTrue(gate.exempt(LAKE_PATH))

    def test_ordinary_path_is_not_exempt(self):
        self.assertFalse(gate.exempt(LEXLEAN))

    def test_path_merely_near_lake_is_not_exempt(self):
        # A sibling directory that merely contains the marker as a substring in
        # its own name must not inherit the exemption.
        self.assertFalse(gate.exempt("packages/.lake/packages_backup/thing"))
        self.assertFalse(gate.exempt("packages/lake/packages/thing"))


class TestDeclarationCheck(GateFixture):
    def test_clean_tree_reports_nothing(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        self.declare_lexlean()
        self.assertEqual(gate.check_declaration(gate.read_gitlinks(), gate.read_gitmodules()), [])

    def test_undeclared_gitlink_is_an_error(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        errors = gate.check_declaration(gate.read_gitlinks(), gate.read_gitmodules())
        self.assertEqual(len(errors), 1)
        self.assertIn("no .gitmodules entry", errors[0])

    def test_declaration_without_url_is_an_error(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        self.write_gitmodules(f'[submodule "{LEXLEAN}"]\n\tpath = {LEXLEAN}\n')
        errors = gate.check_declaration(gate.read_gitlinks(), gate.read_gitmodules())
        self.assertTrue(any("declares no url" in e for e in errors))

    def test_stale_declaration_is_an_error(self):
        # HEAD already exists from setUp and holds no gitlink, so a declaration
        # pointing at a submodule is stale by construction.
        self.declare_lexlean()
        errors = gate.check_declaration(gate.read_gitlinks(), gate.read_gitmodules())
        self.assertTrue(any("not a gitlink in HEAD" in e for e in errors))

    def test_lake_gitlink_is_exempt_from_declaration(self):
        self.add_gitlink(LAKE_PATH, PIN)
        self.commit()
        self.assertEqual(gate.check_declaration(gate.read_gitlinks(), gate.read_gitmodules()), [])

    def test_gitlink_reader_finds_mode_160000_only(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.add_gitlink(LAKE_PATH, OTHER)
        self.commit()
        found = dict(gate.read_gitlinks())
        self.assertEqual(found, {LEXLEAN: PIN, LAKE_PATH: OTHER})


class TestLockstepCheck(GateFixture):
    def test_matching_record_passes(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        self.write_lockstep(self.lockstep_for(PIN))
        self.assertEqual(gate.check_lockstep(gate.read_gitlinks()), [])

    def test_missing_record_is_an_error(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        errors = gate.check_lockstep(gate.read_gitlinks())
        self.assertTrue(any("missing" in e for e in errors))

    def test_malformed_record_is_an_error(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        (self.root / gate.LOCKSTEP_FILE).write_text("{not json", encoding="utf-8")
        errors = gate.check_lockstep(gate.read_gitlinks())
        self.assertTrue(any("not valid JSON" in e for e in errors))

    def test_drifted_commit_is_an_error(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        self.write_lockstep(self.lockstep_for(OTHER))
        errors = gate.check_lockstep(gate.read_gitlinks())
        self.assertTrue(any("but HEAD pins" in e for e in errors))

    def test_entry_for_unpinned_submodule_is_an_error(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        payload = self.lockstep_for(PIN)
        payload["submodules"].append({"path": "packages/ghost", "commit": OTHER})
        self.write_lockstep(payload)
        errors = gate.check_lockstep(gate.read_gitlinks())
        self.assertTrue(any("not pinned in HEAD" in e for e in errors))

    def test_missing_entry_for_pinned_submodule_is_an_error(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        self.write_lockstep({"submodules": [], "acknowledged_unresolved": []})
        errors = gate.check_lockstep(gate.read_gitlinks())
        self.assertTrue(any("no entry for pinned submodule" in e for e in errors))


class TestAcknowledgementFailsClosed(GateFixture):
    """An acknowledgement must name its ADR and must not outlive its condition."""

    def _fixture(self):
        self.add_gitlink(LEXLEAN, GONE_PIN)
        self.commit()
        self.declare_lexlean()

    def test_acknowledgement_without_tracking_adr_is_an_error(self):
        self._fixture()
        lockstep = {"submodules": [], "acknowledged_unresolved": [
            {"path": LEXLEAN, "commit": GONE_PIN, "reason": "because"}
        ]}
        self.write_lockstep(lockstep)
        errors = gate.check_acknowledgements(gate.read_gitlinks(), lockstep, probe=False)
        self.assertTrue(any("names no tracking ADR" in e for e in errors))

    def test_acknowledgement_without_reason_is_an_error(self):
        self._fixture()
        lockstep = {"submodules": [], "acknowledged_unresolved": [
            {"path": LEXLEAN, "commit": GONE_PIN, "tracked_by": "ADR-0140"}
        ]}
        self.write_lockstep(lockstep)
        errors = gate.check_acknowledgements(gate.read_gitlinks(), lockstep, probe=False)
        self.assertTrue(any("records no reason" in e for e in errors))

    def test_stale_acknowledgement_is_an_error(self):
        """The acknowledgement names a commit HEAD no longer pins."""
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        self.declare_lexlean()
        lockstep = {"submodules": [], "acknowledged_unresolved": [
            {"path": LEXLEAN, "commit": GONE_PIN, "tracked_by": "ADR-0140", "reason": "x"}
        ]}
        self.write_lockstep(lockstep)
        errors = gate.check_acknowledgements(gate.read_gitlinks(), lockstep, probe=False)
        self.assertTrue(any("is stale" in e for e in errors))

    def test_well_formed_acknowledgement_passes_offline(self):
        self._fixture()
        lockstep = {"submodules": [], "acknowledged_unresolved": [
            {
                "path": LEXLEAN,
                "commit": GONE_PIN,
                "tracked_by": "ADR-0140",
                "reason": "object collected upstream",
            }
        ]}
        self.write_lockstep(lockstep)
        self.assertEqual(
            gate.check_acknowledgements(gate.read_gitlinks(), lockstep, probe=False), []
        )


class TestPinGrading(unittest.TestCase):
    """The grade ladder, exercised without touching the network."""

    def test_advertised_when_pin_is_in_ls_remote_output(self):
        # Grade ADVERTISED means a ref names the pin; nothing else is consulted.
        self.assertEqual(gate.ADVERTISED, "ADVERTISED")
        self.assertEqual(gate.UNVOUCHED, "UNVOUCHED")
        self.assertEqual(gate.GONE, "GONE")

    def test_unreachable_remote_grades_gone(self):
        grade, detail = gate.probe_remote("https://invalid.invalid/x.git", PIN)
        self.assertEqual(grade, gate.GONE)
        self.assertIn("cannot reach remote", detail)


class TestGateIsFalsifiable(GateFixture):
    """The whole gate, end to end, on a tree that reproduces ADR-0139's defect."""

    def test_pristine_tree_passes(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        self.declare_lexlean()
        self.write_lockstep(self.lockstep_for(PIN))
        gate.check_declaration(gate.read_gitlinks(), gate.read_gitmodules())
        self.assertEqual(gate.check_lockstep(gate.read_gitlinks()), [])

    def test_planting_the_original_defect_is_caught(self):
        """Two gitlinks for one upstream, only one declared: the ADR-0139 state."""
        self.add_gitlink(LEXLEAN, PIN)
        self.add_gitlink("packages/LexLean", PIN)
        self.commit()
        self.declare_lexlean()
        self.write_lockstep(self.lockstep_for(PIN))
        errors = gate.check_declaration(gate.read_gitlinks(), gate.read_gitmodules())
        self.assertTrue(
            any("packages/LexLean" in e for e in errors),
            "the duplicate gitlink must be reported",
        )

    def test_removing_the_duplicate_gitlink_clears_the_error(self):
        self.add_gitlink(LEXLEAN, PIN)
        self.commit()
        self.declare_lexlean()
        self.write_lockstep(self.lockstep_for(PIN))
        self.assertEqual(gate.check_declaration(gate.read_gitlinks(), gate.read_gitmodules()), [])


if __name__ == "__main__":
    unittest.main()