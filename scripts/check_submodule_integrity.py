#!/usr/bin/env python3
"""Submodule integrity gate (ADR-0139).

Four checks over the gitlinks recorded in HEAD. The gate fails closed: every
defect is an error unless it carries an explicit, ADR-linked acknowledgement in
the lockstep record, and an acknowledgement that no longer describes reality is
itself an error so a stale excuse cannot outlive the condition it excused.

  1. DECLARATION. Every mode-160000 path in HEAD must have a `.gitmodules`
     entry naming a URL, and every `.gitmodules` path must be a gitlink in
     HEAD. A gitlink with no entry cannot be fetched by anyone: `git clone
     --recursive` leaves an empty directory and `git submodule status` aborts
     with "no submodule mapping found in .gitmodules".

     Gitlinks under a `.lake/packages/` directory are exempt. Lake records its
     vendored dependencies as gitlinks for reproducibility and deliberately
     writes no `.gitmodules` entry for them; a hand-written entry would be
     undone by the next `lake update`. The exemption is scoped to that
     directory, so a genuinely missing declaration elsewhere still fails.

  2. PIN RESOLVABILITY. Each declared submodule's pinned commit must still be
     obtainable from its declared URL. Pins are graded, because the grades carry
     different consequences:

       ADVERTISED  named by a ref the remote publishes. Healthy.
       UNVOUCHED   absent from every advertised ref but the object is still
                   fetchable by SHA. This is the ADR-0139 class: the pin
                   survives on the remote's object-retention schedule rather
                   than on anything a ref vouches for.
       GONE        not fetchable at all ("not our ref"). The object has been
                   garbage-collected upstream; no fresh clone can reproduce the
                   pin and a recursive clone of this repository fails.

     Where the submodule is checked out locally the pin is also verified against
     the local object store, which is all an offline run can honestly assert.

  3. LOCKSTEP. `submodule-lockstep.json` must list exactly the pinned
     submodules and record, for each, the same commit HEAD pins. It also
     carries each dependency's content digest where one is published, because
     SemVer alone does not identify a build: where the binary is on PATH its
     digest is compared and a mismatch is an error.

  4. ACKNOWLEDGEMENT FRESHNESS. Every entry in the lockstep record's
     `acknowledged_unresolved` list must still describe a real, still-broken
     condition and must name the ADR that tracks it. An acknowledgement for a
     pin that has since become healthy, or one naming no ADR, is an error.

Usage:
    python3 scripts/check_submodule_integrity.py [--probe-remote] [--strict]

Exit 0 when clean; 1 otherwise. `--strict` promotes UNVOUCHED pins to errors.
"""
from __future__ import annotations

import argparse
import configparser
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

GITLINK_MODE = "160000"
LAKE_VENDOR_MARKER = ".lake/packages/"
LOCKSTEP_FILE = "submodule-lockstep.json"

ADVERTISED = "ADVERTISED"
UNVOUCHED = "UNVOUCHED"
GONE = "GONE"


def git(*args: str, cwd: Path | None = None) -> tuple[int, str, str]:
    proc = subprocess.run(
        ["git", *args], cwd=str(cwd or ROOT), capture_output=True, text=True
    )
    return proc.returncode, proc.stdout.strip(), proc.stderr.strip()


def read_gitlinks() -> list[tuple[str, str]]:
    """Return (path, pinned_sha) for every mode-160000 entry in HEAD."""
    code, out, _ = git("ls-tree", "-r", "HEAD")
    if code != 0:
        raise SystemExit("fatal: cannot read HEAD; is this a git repository?")
    links: list[tuple[str, str]] = []
    for line in out.splitlines():
        parts = line.split(None, 3)  # <mode> <type> <object> <path>
        if len(parts) == 4 and parts[0] == GITLINK_MODE:
            links.append((parts[3], parts[2]))
    return links


def read_gitmodules() -> dict[str, dict[str, str]]:
    """Parse .gitmodules into {path: {url, branch}}.

    Uses configparser over the raw file: gitmodules subsection names are free
    text and a stricter parser would reject legal ones.
    """
    modules = ROOT / ".gitmodules"
    if not modules.exists():
        return {}
    parser = configparser.ConfigParser()
    parser.read_string(modules.read_text(encoding="utf-8"))
    declared: dict[str, dict[str, str]] = {}
    for section in parser.sections():
        if not section.startswith("submodule "):
            continue
        body = dict(parser.items(section))
        path = body.get("path")
        if path:
            declared[path] = {
                "url": body.get("url", ""),
                "branch": body.get("branch", ""),
            }
    return declared


def read_lockstep() -> dict:
    path = ROOT / LOCKSTEP_FILE
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def exempt(path: str) -> bool:
    return LAKE_VENDOR_MARKER in path


def check_declaration(gitlinks, declared) -> list[str]:
    errors: list[str] = []
    for path, sha in gitlinks:
        if exempt(path):
            continue
        entry = declared.get(path)
        if entry is None:
            errors.append(
                f"{path}: gitlink pinned at {sha[:12]} has no .gitmodules entry; "
                f"a fresh clone leaves an empty directory here"
            )
        elif not entry["url"]:
            errors.append(f"{path}: .gitmodules entry declares no url")
    for path in declared:
        if not any(p == path for p, _ in gitlinks):
            errors.append(
                f"{path}: .gitmodules declares a submodule that is not a gitlink in HEAD"
            )
    return errors


def probe_remote(url: str, pin: str) -> tuple[str, str]:
    """Grade one pin against a remote. Returns (grade, detail)."""
    code, out, err = git("ls-remote", url)
    if code != 0:
        return GONE, f"cannot reach remote: {err or 'unknown error'}"
    advertised = {line.split()[0] for line in out.splitlines() if line.strip()}
    if pin in advertised:
        return ADVERTISED, "named by an advertised ref"
    # Not advertised. Fetch the object itself: this is the only way to tell an
    # unvouched-but-present pin from one that has been collected.
    tmp = Path(tempfile.mkdtemp(prefix="submodule-pin-probe-"))
    try:
        code, _, _ = git("init", "--quiet", "--bare", str(tmp))
        if code != 0:
            return UNVOUCHED, "not advertised by any ref; probe inconclusive"
        code, _, err = git("fetch", "--quiet", url, pin, cwd=tmp)
        if code != 0:
            return GONE, f"not advertised by any ref and not fetchable: {err}"
        return UNVOUCHED, "not advertised by any ref; still fetchable by SHA"
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def acknowledgement_for(lockstep: dict, path: str, pin: str) -> dict | None:
    for entry in lockstep.get("acknowledged_unresolved", []):
        if entry.get("path") == path and entry.get("commit") == pin:
            return entry
    return None


def check_pins(gitlinks, declared, lockstep, probe: bool, strict: bool):
    """Returns (errors, warnings, grades).

    `grades` records every pin the gate actually measured, in the order measured, so
    the run's verdict is auditable from its own output rather than inferred from which
    lines are absent. A gate that prints only its failures cannot be cited as evidence
    that a pin was checked and passed.
    """
    errors: list[str] = []
    warnings: list[str] = []
    grades: list[tuple[str, str, str]] = []
    for path, pin in gitlinks:
        if exempt(path) or path not in declared:
            continue
        url = declared[path]["url"]
        worktree = ROOT / path
        checked_out = (worktree / ".git").exists()
        if checked_out:
            code, _, _ = git("cat-file", "-e", f"{pin}^{{commit}}", cwd=worktree)
            if code != 0:
                errors.append(
                    f"{path}: pinned commit {pin[:12]} is absent from the local object "
                    f"store; the checkout does not match HEAD"
                )
                continue
        elif not probe:
            # An offline run cannot assert anything about a tree it did not
            # fetch, so this is a note, not a verdict.
            warnings.append(
                f"{path}: not checked out and remote probing is off; pin unverified"
            )
            grades.append((path, pin, "UNGRADED (submodule not checked out)"))
            continue
        if not probe:
            grades.append((path, pin, "UNGRADED (offline run did not contact the remote)"))
            continue

        grade, detail = probe_remote(url, pin)
        grades.append((path, pin, f"{grade} ({detail})"))
        line = f"{path}: pin {pin[:12]} is {grade} ({detail})"
        ack = acknowledgement_for(lockstep, path, pin)
        if grade == GONE:
            if ack and ack.get("tracked_by"):
                warnings.append(
                    f"{line}; acknowledged as unresolved by {ack['tracked_by']} "
                    f"({ack.get('reason', 'no reason recorded')})"
                )
            else:
                errors.append(
                    f"{line}; no fresh clone can reproduce this pin and no "
                    f"acknowledged_unresolved entry in {LOCKSTEP_FILE} tracks it"
                )
        elif grade == UNVOUCHED:
            if ack and ack.get("tracked_by"):
                warnings.append(f"{line}; tracked by {ack['tracked_by']}")
            elif strict:
                errors.append(line + "; strict mode treats an unvouched pin as fatal")
            else:
                warnings.append(line)
    return errors, warnings, grades


def check_lockstep(gitlinks) -> list[str]:
    """Cross-check the lockstep record against the pins HEAD actually records."""
    errors: list[str] = []
    path = ROOT / LOCKSTEP_FILE
    if not path.exists():
        return [f"{LOCKSTEP_FILE} is missing; ADR-0139 requires a lockstep record"]
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"{LOCKSTEP_FILE} is not valid JSON: {exc}"]
    recorded = {entry.get("path"): entry for entry in data.get("submodules", [])}
    pinned = {p: sha for p, sha in gitlinks if not exempt(p)}
    for submodule, sha in sorted(pinned.items()):
        entry = recorded.get(submodule)
        if entry is None:
            errors.append(f"{LOCKSTEP_FILE}: no entry for pinned submodule {submodule}")
        elif entry.get("commit") != sha:
            errors.append(
                f"{LOCKSTEP_FILE}: {submodule} records commit "
                f"{str(entry.get('commit'))[:12]} but HEAD pins {sha[:12]}"
            )
    for submodule in sorted(recorded):
        if submodule not in pinned:
            errors.append(f"{LOCKSTEP_FILE}: entry {submodule} is not pinned in HEAD")
    for submodule, entry in sorted(recorded.items()):
        digest = entry.get("compiler_semantics")
        if not digest:
            continue
        binary = entry.get("digest_binary", "lexlean")
        if shutil.which(binary) is None:
            continue  # nothing to compare against; not an error
        proc = subprocess.run([binary, "--version"], capture_output=True, text=True)
        for line in proc.stdout.splitlines():
            if line.startswith("compiler-semantics "):
                observed = line.split(None, 1)[1].strip()
                if observed != digest:
                    errors.append(
                        f"{LOCKSTEP_FILE}: {submodule} records compiler-semantics "
                        f"{digest[:12]} but `{binary} --version` reports {observed[:12]}"
                    )
                break
    return errors


def check_acknowledgements(gitlinks, lockstep, probe: bool) -> list[str]:
    """An acknowledgement must still describe a real, still-broken condition."""
    errors: list[str] = []
    declared = read_gitmodules()
    for ack in lockstep.get("acknowledged_unresolved", []):
        path, pin = ack.get("path"), ack.get("commit")
        label = f"{LOCKSTEP_FILE}: acknowledged_unresolved entry for {path}"
        if not ack.get("tracked_by"):
            errors.append(f"{label} names no tracking ADR; fail-closed")
        if not ack.get("reason"):
            errors.append(f"{label} records no reason")
        matched = [(p, sha) for p, sha in gitlinks if p == path and sha == pin]
        if not matched:
            errors.append(
                f"{label} at {str(pin)[:12]} is stale: HEAD no longer pins that commit"
            )
            continue
        if path in declared and declared[path]["url"] and probe:
            grade, _ = probe_remote(declared[path]["url"], pin)
            if grade == ADVERTISED:
                errors.append(
                    f"{label} is stale: the pin now grades ADVERTISED, so the "
                    f"acknowledgement should be removed"
                )
    return errors


def main() -> int:
    ap = argparse.ArgumentParser(description="ADR-0139 submodule integrity gate")
    ap.add_argument(
        "--probe-remote",
        action="store_true",
        help="contact each remote to grade its pin (requires network)",
    )
    ap.add_argument(
        "--root",
        type=Path,
        default=None,
        help="repository to check; defaults to this script's repository. One copy of "
             "this gate serves both The-Foundry and the nested Packages repository, "
             "so the two cannot drift apart.",
    )
    ap.add_argument(
        "--strict",
        action="store_true",
        help="treat UNVOUCHED pins as errors rather than warnings",
    )
    args = ap.parse_args()

    if args.root is not None:
        global ROOT
        ROOT = args.root.resolve()

    gitlinks = read_gitlinks()
    declared = read_gitmodules()
    lockstep = read_lockstep()

    errors = check_declaration(gitlinks, declared)
    pin_errors, pin_warnings, grades = check_pins(
        gitlinks, declared, lockstep, args.probe_remote, args.strict
    )
    lockstep_errors = check_lockstep(gitlinks)
    ack_errors = check_acknowledgements(gitlinks, lockstep, args.probe_remote)

    lake = sum(1 for p, _ in gitlinks if exempt(p))
    print(f"repository: {ROOT}")
    print(f"gitlinks in HEAD: {len(gitlinks)} ({lake} Lake-exempt)")
    print(f".gitmodules entries: {len(declared)}")
    print(f"lockstep record: {LOCKSTEP_FILE} ({'found' if lockstep else 'MISSING'})")
    print(f"remote probing: {'on' if args.probe_remote else 'off'}")
    if grades:
        print("pin grades:")
        for path, pin, grade in grades:
            print(f"  {path} {pin[:12]} {grade}")

    for warning in pin_warnings:
        print(f"WARNING: {warning}")
    for error in errors + pin_errors + lockstep_errors + ack_errors:
        print(f"ERROR: {error}")

    total = len(errors) + len(pin_errors) + len(lockstep_errors) + len(ack_errors)
    if total:
        print(f"FAIL: {total} error(s)")
        return 1
    print("PASS: submodule declarations, pins and lockstep record verified")
    return 0


if __name__ == "__main__":
    sys.exit(main())