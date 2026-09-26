#!/usr/bin/env python3
"""ADR: Sorry Check Script (precise, manifest-aware).

Scans the build roots (`ADR/`, `Care/`, `Foundations/`, `WordLove/`) for
`sorry`/`admit` tactic usage in Lean 4 source files. Fails if any are found
outside:

  1. the allowed quarantine file `lean/Core/Axioms.lean`, or
  2. declarations explicitly registered in `state/alp_sorry_manifest.json`
     under `permitted_sorrys`.

Enforces ADR-0010 (Axiom-Clean Kernel Boundary): zero *untracked* proof debt.

The manifest itself is validated:
  - `manifest_drift` must be 0
  - `last_audit` must not be in the future
  - every `permitted_sorrys` name must actually be found in the scanned tree
    (ghost entries are drift) -- reported as a warning
  - every complained name maps to the declaration that hosts the tactic

Usage:  python3 scripts/check_adr_sorry.py
CI:     Add to workflow via `python3 scripts/check_adr_sorry.py`
"""

import datetime
import json
import os
import re
import sys

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Build roots that are part of `lake build` / `lake test` artifacts.
#
# These MUST track the roots enumerated by the lakefile. The previous list
# (`ADR`, `Care`, `PirtmAuthBoundary`) was 2/3 dead -- `Care/` and
# `PirtmAuthBoundary/` do not exist in this tree -- while omitting
# `Foundations/`, which holds all 13 manifest-registered sorries. The result was
# a false green: "PASSED: No sorry/admit tactics found" while untracked debt
# sat in the tree, and the 13 live manifest entries surfaced only as ghost
# warnings behind a zero exit code. D-02.
SCAN_DIRS = ["ADR", "Foundations", "pirtm/lean", "lean"]

# Roots that exist but are excluded from every lakefile. Reported, never
# scanned for pass/fail: archive is not a protected path, but silence about it
# is how D-02 and D-03 survived.
REPORT_ONLY_DIRS = ["attic"]

# Scan roots named in the manifest, lakefile, or AGENTS.md that do not exist.
# A scan root that silently vanishes turns its subtree into an unscanned
# blind spot, which is the D-02 failure mode again.
REQUIRED_ROOTS = ["ADR", "Foundations", "pirtm/lean", "lean"]

MANIFEST_PATH = os.path.join(PROJECT_DIR, "state", "alp_sorry_manifest.json")

# `sorry` token in code (not embedded in identifiers like `zero_sorry`,
# `satisfiesZeroSorry`), and `admit` only as a standalone tactic:
#   - a line that is exactly `admit` (tactic position after `by` on the
#     previous line)
#   - `by admit` / `:= admit` inline
# `admit` as an identifier reference (`def admit`, `unfold admit`,
# `dsimp [admit]`, `.Admit`, strings) must never be flagged.
ADMIT_TACTIC_RE = re.compile(r"^\s*admit\s*$|(\bby\s+admit\s*$)|(:= admit\s*$)")
SORRY_TACTIC_RE = re.compile(r"(?<![\w'])sorry\b")


def strip_strings(code_lines: list[str]) -> list[str]:
    """Remove double-quoted string literal spans so prose is not scanned."""
    out = []
    for line in code_lines:
        res = []
        i, n = 0, len(line)
        while i < n:
            if line[i] == '"':
                j = i + 1
                while j < n:
                    if line[j] == '"':
                        break
                    if line[j] == "\\":
                        j += 1
                    j += 1
                res.append(" ")
                i = j + 1 if j < n else n
            else:
                res.append(line[i])
                i += 1
        out.append("".join(res))
    return out

# Declaration headers that can carry a `sorry` body.
DECL_RE = re.compile(
    r"^\s*(?:@\[[^\]]*\]\s*)*(theorem|lemma|def|example|axiom|opaque)\s+"
    r"([A-Za-z0-9_']+)"
)


def strip_comments(lines: list[str]) -> list[str]:
    """Return code-only text per line, honoring `--` and `/- ... -/` comments.

    Keeps position parity with `lines` (empty string where the whole line is
    comment/docstring prose).
    """
    code_lines = []
    in_block = False
    for line in lines:
        text = line
        if in_block:
            end = text.find("-/")
            if end >= 0:
                in_block = False
                text = text[end + 2 :]
            else:
                code_lines.append("")
                continue
        out = []
        i = 0
        n = len(text)
        while i < n:
            if text.startswith("--", i):
                break
            if text.startswith("/-", i):
                j = text.find("-/", i + 2)
                if j >= 0:
                    i = j + 2
                    continue
                in_block = True
                break
            out.append(text[i])
            i += 1
        code_lines.append("".join(out))
    return code_lines


def has_own_lakefile(dirpath: str) -> bool:
    return (
        os.path.exists(os.path.join(dirpath, "lakefile.lean"))
        or os.path.exists(os.path.join(dirpath, "lakefile.toml"))
    )


def scan_file(filepath: str) -> list[tuple[int, str, str, int]]:
    """Return (sorry_lineno, text, enclosing-decl-name, decl_lineno) per hit.

    `decl_lineno` is the line the manifest anchors on: the manifest records the
    `theorem` header, not the `sorry` token two lines below it. Comparing a
    manifest anchor against the sorry line reports every entry as drifted.
    """
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        raw_lines = f.readlines()
    code_lines = strip_strings(strip_comments(raw_lines))

    hits = []
    current_name: str | None = None
    current_line = 0
    for i, line in enumerate(raw_lines):
        m = DECL_RE.match(code_lines[i])
        if m:
            current_name = m.group(2)
            current_line = i + 1
        if SORRY_TACTIC_RE.search(code_lines[i]) or ADMIT_TACTIC_RE.search(
            code_lines[i]
        ):
            hits.append((i + 1, raw_lines[i].rstrip(), current_name or "?",
                         current_line))
    return hits


def load_manifest() -> dict:
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_manifest(manifest: dict) -> list[str]:
    problems = []
    if manifest.get("manifest_drift", -1) != 0:
        problems.append(
            f"manifest drift: `manifest_drift` = {manifest.get('manifest_drift')}, expected 0"
        )
    try:
        last_audit = datetime.datetime.fromisoformat(
            manifest["last_audit"].replace("Z", "+00:00")
        ).astimezone(datetime.timezone.utc)
        if last_audit > datetime.datetime.now(datetime.timezone.utc):
            problems.append(
                f"manifest `last_audit` is in the future: {manifest['last_audit']}"
            )
    except (KeyError, ValueError):
        problems.append("manifest `last_audit` missing or malformed")
    return problems


def main() -> int:
    as_json = "--json" in sys.argv
    if not as_json:
        print("=== ADR Sorry Check (precise, manifest-aware) ===")
        print(f"Scanning: {', '.join(SCAN_DIRS)}")
        print(f"Manifest: {MANIFEST_PATH}")
        print()

    if not os.path.exists(MANIFEST_PATH):
        if as_json:
            print(json.dumps({"ok": False, "error": "manifest missing"}))
        else:
            print(f"FAILED: manifest not found at {MANIFEST_PATH}")
        return 1

    manifest = load_manifest()
    manifest_problems = validate_manifest(manifest)
    for p in manifest_problems:
        print(f"MANIFEST PROBLEM: {p}")

    # A declared scan root that no longer exists is a blind spot, not a
    # pass. Fail rather than shrink coverage silently.
    missing_roots = [
        r for r in REQUIRED_ROOTS if not os.path.isdir(os.path.join(PROJECT_DIR, r))
    ]
    for r in missing_roots:
        manifest_problems.append(
            f"required scan root missing: {r}/ (coverage blind spot)"
        )

    permitted = set(manifest.get("permitted_sorrys", []))

    all_hits = []
    found_in_scope: set[str] = set()
    for root_name in SCAN_DIRS:
        root = os.path.join(PROJECT_DIR, root_name)
        if not os.path.isdir(root):
            continue
        for dirpath, dirnames, files in os.walk(root):
            # Skip vendored dependency trees and nested Lake packages; they
            # are outside this project's build graph (mirror of lakefile.
            # root enumeration, which does not recurse into own-lakefile dirs).
            dirnames[:] = [
                d
                for d in dirnames
                if d != ".lake"
                and not has_own_lakefile(os.path.join(dirpath, d))
            ]
            for fname in sorted(files):
                if not fname.endswith(".lean"):
                    continue
                filepath = os.path.join(dirpath, fname)
                hits = scan_file(filepath)
                for lineno, line, name, decl_line in hits:
                    all_hits.append((filepath, lineno, line, name, decl_line))
                    if name in permitted:
                        found_in_scope.add(name)

    # `attic/` is archive: reported, never fail-scored.
    archived = 0
    for root_name in REPORT_ONLY_DIRS:
        root = os.path.join(PROJECT_DIR, root_name)
        if not os.path.isdir(root):
            continue
        for dirpath, dirnames, files in os.walk(root):
            dirnames[:] = [d for d in dirnames if d != ".lake"]
            for fname in files:
                if not fname.endswith(".lean"):
                    continue
                archived += len(scan_file(os.path.join(dirpath, fname)))

    violations = [h for h in all_hits if h[3] not in permitted]
    registered = [h for h in all_hits if h[3] in permitted]
    ghosts = permitted - found_in_scope

    # A manifest entry is a claim about a specific file+line. Verify the anchor
    # still lands on a real sorry, so the ledger cannot rot in place while its
    # declaration line-number drifts.
    anchored = set()
    for e in manifest.get("entries", []):
        if not e.get("file") or not e.get("line"):
            continue
        anchored.add((e["file"], int(e["line"]), e.get("name")))
    drifted = []
    for filepath, lineno, _line, name, decl_line in registered:
        rel = os.path.relpath(filepath, PROJECT_DIR)
        if (rel, decl_line, name) not in anchored:
            drifted.append(f"{rel}:{decl_line} {name}")

    if as_json:
        print(json.dumps({
            "ok": not (violations or ghosts or manifest_problems or drifted),
            "scanned": SCAN_DIRS,
            "total_hits": len(all_hits),
            "registered": len(registered),
            "violations": [
                {"file": os.path.relpath(f, PROJECT_DIR), "line": n,
                 "declaration": d}
                for f, n, _l, d, _dl in violations
            ],
            "ghosts": sorted(ghosts),
            "anchor_drift": drifted,
            "manifest_problems": manifest_problems,
            "archived_sorry_sites": archived,
        }, indent=2))
        return 0 if not (violations or ghosts or manifest_problems or drifted) else 1

    print()
    if violations:
        for filepath, lineno, line, name, _dl in violations:
            print(
                f"SORRY/ADMIT TACTIC (UNREGISTERED): "
                f"{os.path.relpath(filepath, PROJECT_DIR)}:{lineno}"
            )
            for dl in line.split("\n")[:4]:
                print(f"  | {dl.rstrip()}")
            print(f"  declaration: {name}")

    if registered:
        print(f"REGISTERED (manifest-authorized): {len(registered)}")
        for filepath, lineno, _line, name, _dl in sorted(
            registered, key=lambda h: (h[0], h[1])
        ):
            print(f"  {os.path.relpath(filepath, PROJECT_DIR)}:{lineno} {name}")

    if archived:
        print()
        print(f"REPORT-ONLY: {archived} sorry/admit site(s) in "
              f"{', '.join(REPORT_ONLY_DIRS)}/ (archive, no lakefile). "
              f"Tracked as D-16; not scored as build-path failure.")

    if ghosts:
        print()
        print("FAILED: `permitted_sorrys` entries with no sorry in the scanned "
              "tree (ghost manifest entries):")
        for g in sorted(ghosts):
            print(f"  {g}")
        print("Either the debt was paid off and the entry must be pruned, or the")
        print("scan root that hosted it is not being scanned. Both are drift.")

    if drifted:
        print()
        print("FAILED: registered sorries whose manifest file+line anchor no "
              "longer matches the live site:")
        for d in drifted:
            print(f"  {d}")
        print("Re-anchor the entry in state/alp_sorry_manifest.json.")

    print()
    if manifest_problems:
        return 1
    if ghosts:
        return 1
    if drifted:
        return 1
    if violations:
        print(
            f"FAILED: Found {len(violations)} UNREGISTERED sorry/admit tactic(s) "
            f"across {', '.join(SCAN_DIRS)}"
        )
        print("ADR-0010 violation: zero untracked proof debt required on main branch.")
        return 1
    if not all_hits:
        print("PASSED: No sorry/admit tactics found.")
        return 0
    print(
        f"PASSED: {len(registered)} registered sorry/admit(s) are "
        "manifest-authorized (ADR-0010 compliant)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())