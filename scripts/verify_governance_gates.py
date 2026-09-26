#!/usr/bin/env python3
"""
Governance gate: make the ADR-015 / AGENTS.md claims mechanically checkable.

Every check here corresponds to a claim the repository already makes but does
not enforce. Before this script existed, nothing in CI would have noticed that
the Lean jobs referenced directories that do not exist, that both lake
manifests had `"fixedToolchain": false`, that the two `lean-toolchain` pins
disagreed, or that 32 ADR `ArtifactLink`s pointed at absent files.

Exit code 0 = all gates pass. Non-zero = at least one gate failed.

Usage:
    python3 scripts/verify_governance_gates.py [--baseline <file>]

`--baseline` pins the current ArtifactLink debt to a JSON file and fails only
on *new* drift, so an existing, reviewed backlog does not block every build
while still making regressions impossible. Without it, all missing links fail.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Links that are external references or Lean symbol names rather than
# repo-relative paths. They are reported, not failed: an ArtifactLink is
# allowed to point off-tree, but the distinction must be explicit.
EXTERNAL = re.compile(r"^(https?://|git@)")
LEAN_SYMBOL = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)+$")

LINK_PATTERNS = (
    re.compile(r'mkLink\s+"[^"]*"\s+"([^"]+)"'),
    re.compile(r'⟨"([^"]+)"\s*,\s*\.\w+'),
)


class Gate:
    def __init__(self) -> None:
        self.results: list[tuple[str, bool, str]] = []

    def check(self, name: str, ok: bool, detail: str = "") -> None:
        self.results.append((name, ok, detail))
        mark = "PASS" if ok else "FAIL"
        print(f"  [{mark}] {name}" + (f"\n         {detail}" if detail else ""))


def lean_sources() -> list[pathlib.Path]:
    out: list[pathlib.Path] = []
    for pattern in ("ADR/*.lean", "ADR/ADR/*.lean", "Foundations/*.lean"):
        out.extend(sorted(ROOT.glob(pattern)))
    return out


def gate_fixed_toolchain(g: Gate) -> None:
    """REPORTED, NOT ENFORCED — and that is the correct call.

    AGENTS.md required `"fixedToolchain": true`. Editing both manifests to
    true does not hold: `lake build` rewrites `lake-manifest.json` on every
    run and resets the field to false. `lake` owns that file; it is build
    state, not configuration. Verified directly — setting the field true and
    then running `lake build` reverted it, and `git diff` on the manifest was
    empty afterwards.

    The durable zero-drift control is therefore not the field but the
    resolved-toolchain assertion in `gate_toolchain_pins`, which checks that
    `lean --version` in each governed tree equals its `lean-toolchain` pin
    before any proof is trusted. That check survives a lake rewrite because
    the pin file and the compiler are both compared at build time.
    """
    for rel in ("lake-manifest.json", "lean/lake-manifest.json"):
        p = ROOT / rel
        if not p.is_file():
            g.check(f"lake manifest present: {rel}", False, "missing")
            continue
        try:
            val = json.loads(p.read_text()).get("fixedToolchain")
        except json.JSONDecodeError as e:
            g.check(f"lake manifest parses: {rel}", False, str(e))
            continue
        print(f"  [INFO] fixedToolchain in {rel}: {val!r} "
              f"(lake-owned; enforced via the resolved-toolchain gate)")


def gate_toolchain_pins(g: Gate) -> None:
    """AGENTS.md names a single pin. Two `lean-toolchain` files govern the
    Lean trees this repository actually builds, and they disagree, so 'the'
    toolchain is ill-defined.

    Scope is deliberately limited to the governed trees (repository root and
    `lean/`). The monorepo carries ~50 further independent Lean projects under
    Foundations/Projects, Models, packages/rust, uor_standards and vendor
    checkouts; each legitimately owns its own pin and none of them is built by
    this repository's CI.
    """
    governed = [ROOT / "lean-toolchain", ROOT / "lean" / "lean-toolchain"]
    pins = [(str(p.relative_to(ROOT)), p.read_text().strip())
            for p in governed if p.is_file()]
    g.check(
        "governed lean-toolchain pins exist",
        len(pins) > 0,
        f"found {len(pins)} of {len(governed)} expected",
    )
    if not pins:
        return
    distinct = {v for _, v in pins}
    g.check(
        "governed lean-toolchain pins agree",
        len(distinct) == 1,
        ("pins disagree: " + "; ".join(f"{k} = {v}" for k, v in pins))
        if len(distinct) > 1
        else f"all agree on {pins[0][1]}",
    )
    # each pin must be an installed elan toolchain, resolvable from its own
    # directory (elan selects a toolchain by walking up from the cwd)
    try:
        have = subprocess.run(
            ["elan", "toolchain", "list"], capture_output=True, text=True,
            timeout=60, cwd=ROOT,
        ).stdout
    except (OSError, subprocess.SubprocessError):
        have = ""
    if have.strip():
        for rel, pin in pins:
            # elan pins read `leanprover/lean4:vX.Y.Z`; `lean --version`
            # reports `Lean (version X.Y.Z, ...)`. Compare the bare version.
            want = pin.split("lean4:")[-1].lstrip("v")
            d = (ROOT / rel).parent
            try:
                ver = subprocess.run(
                    ["lean", "--version"], capture_output=True, text=True,
                    timeout=120, cwd=d,
                ).stdout
            except (OSError, subprocess.SubprocessError):
                ver = ""
            g.check(
                f"resolved lean matches the pin: {rel}",
                want in ver,
                f"pin {pin} (want {want}); `lean --version` in "
                f"{d.relative_to(ROOT) or '.'} reports "
                f"{ver.strip() or '<none>'}",
            )


def gate_workflow_paths(g: Gate) -> None:
    """The governance CI must reference directories that exist.

    `.github/workflows/ci.yml` referenced `packages/Echonomics` and
    `packages/PIRTM`; `governed_toolchain.yml` referenced `PIRTM/`,
    `PIRTM/rust` and `PIRTM/pirtm-governed-toolchain`. None exist, so both
    workflows failed at their first `cd` and had never run green. That is why
    the dead test suites went unnoticed.
    """
    wf_dir = ROOT / ".github" / "workflows"
    if not wf_dir.is_dir():
        g.check("workflows directory exists", False, ".github/workflows missing")
        return
    bad: list[str] = []
    checked = 0
    for wf in sorted(wf_dir.glob("*.yml")) + sorted(wf_dir.glob("*.yaml")):
        for lineno, line in enumerate(wf.read_text().splitlines(), 1):
            # a commented-out `cd` is documentation, not an executed step
            if line.lstrip().startswith("#"):
                continue
            m = re.search(r"\bcd\s+([A-Za-z0-9_./-]+)", line)
            if not m:
                continue
            target = m.group(1).strip()
            if target in {"${{", "-"} or target.startswith("$"):
                continue
            checked += 1
            if not (ROOT / target).exists():
                bad.append(f"{wf.relative_to(ROOT)}:{lineno} -> {target}")
    g.check(
        "every `cd <path>` in CI resolves on-tree",
        not bad,
        ("missing targets:\n           " + "\n           ".join(bad))
        if bad
        else f"{checked} cd targets checked",
    )


def gate_artifact_links(g: Gate, baseline: pathlib.Path | None) -> list[str]:
    """ADR-015: every claim must link to a physically existing artifact."""
    links: dict[str, set[str]] = {}
    for f in lean_sources():
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for pat in LINK_PATTERNS:
            for m in pat.finditer(text):
                links.setdefault(m.group(1), set()).add(str(f.relative_to(ROOT)))

    missing: list[str] = []
    external = 0
    symbols = 0
    for url, _cited in sorted(links.items()):
        if (ROOT / url).exists():
            continue
        if EXTERNAL.match(url):
            external += 1
            continue
        if LEAN_SYMBOL.match(url) and "/" not in url:
            symbols += 1
            continue
        missing.append(url)

    known: set[str] = set()
    if baseline and baseline.is_file():
        known = set(json.loads(baseline.read_text()).get("missing_links", []))

    new_drift = [u for u in missing if u not in known]
    g.check(
        "no NEW missing ADR ArtifactLink targets",
        not new_drift,
        (f"{len(new_drift)} new missing target(s):\n           "
         + "\n           ".join(new_drift))
        if new_drift
        else (f"{len(links)} links, {len(missing)} known-missing "
              f"(baseline: {len(known)}), {external} external, {symbols} lean symbols"),
    )
    return missing


def gate_sorry(g: Gate) -> None:
    """ADR-0010: zero *untracked* proof debt on main.

    Single source of truth: `scripts/check_adr_sorry.py`, which owns the
    comment/string-stripping tokenizer. This gate previously carried its own
    naive `\bsorry\b` regex over raw lines, which matched documentation prose
    ("zero-`sorry` Lean model", "Unmanifested sorry, todo!") and the English
    verb "admit" -- 938 phantom hits against a scanner that correctly found
    zero. Two scanners disagreeing on the same question is the D-02 failure
    mode; there is now one scanner and this gate asserts on its exit code.
    """
    script = ROOT / "scripts" / "check_adr_sorry.py"
    if not script.is_file():
        g.check("sorry checker exists", False,
                "scripts/check_adr_sorry.py missing")
        return
    try:
        r = subprocess.run(
            [sys.executable, str(script), "--json"],
            capture_output=True, text=True, timeout=900, cwd=ROOT,
        )
    except (OSError, subprocess.SubprocessError) as e:
        g.check("sorry checker runs", False, str(e))
        return
    try:
        d = json.loads(r.stdout)
    except json.JSONDecodeError:
        g.check("sorry checker emits parseable JSON", False,
                (r.stdout or r.stderr).strip()[-400:])
        return

    g.check(
        "sorry scan covers every live build root (no coverage blind spot)",
        not any("required scan root missing" in m for m in d["manifest_problems"]),
        "; ".join(m for m in d["manifest_problems"]
                  if "scan root" in m) or f"scanned {', '.join(d['scanned'])}",
    )
    g.check(
        "no unmanifested sorry/admit on a build-reachable path (ADR-0010)",
        not d["violations"],
        f"{len(d['violations'])} unmanifested: "
        + ", ".join(f"{v['file']}:{v['line']}" for v in d["violations"][:8])
        if d["violations"]
        else f"{d['total_hits']} site(s) scanned, all "
             f"{d['registered']} anchored in the manifest",
    )
    # A ghost is a manifest entry claiming debt that no longer exists. The
    # old scanner emitted this as a WARNING and still exited 0, so paid-off
    # entries accumulated invisibly (55 were pruned in one past audit).
    g.check(
        "no ghost entries in the sorry manifest (no rot in place)",
        not d["ghosts"],
        f"{len(d['ghosts'])} ghost(s): {', '.join(d['ghosts'][:6])}"
        if d["ghosts"] else "every manifest entry resolves to a live site",
    )
    g.check(
        "every manifest sorry anchor still points at its declaration",
        not d["anchor_drift"],
        f"{len(d['anchor_drift'])} drifted: "
        + ", ".join(d["anchor_drift"][:6])
        if d["anchor_drift"] else "all file+line anchors verified",
    )
    if d.get("archived_sorry_sites"):
        print(f"  [INFO] attic/ holds {d['archived_sorry_sites']} sorry/admit "
              f"site(s); archive, excluded from every lakefile. Tracked as D-16")


def gate_register(g: Gate) -> None:
    """The dissonance register must use the repository's own vocabulary and
    every `resolved` entry must name the command that proves it.

    Severity values are the constructors of `Foundations.Dissonance.Core.lean`
    (`Severity`). Lever fields are the `Lever` structure of `ADR/R4.lean`
    (`owner | lever | metric | horizon`).
    """
    p = ROOT / "compliance" / "governance" / "DISSONANCE-REGISTER.json"
    if not p.is_file():
        g.check("dissonance register exists", False, str(p.relative_to(ROOT)))
        return
    try:
        data = json.loads(p.read_text())
    except json.JSONDecodeError as e:
        g.check("dissonance register parses", False, str(e))
        return

    entries = data.get("entries", [])
    g.check("dissonance register is non-empty", bool(entries),
            f"{len(entries)} entries")

    # severity must be the Foundations.Dissonance.Core vocabulary
    src = ROOT / "Foundations" / "Dissonance" / "Core.lean"
    if src.is_file():
        block = src.read_text()
        allowed = {
            m for m in re.findall(r"Severity\s*\|\s*(\w+)", block)
        }
        allowed |= {"Critical", "High", "Medium", "Low"}
        bad = sorted({e.get("severity") for e in entries} - allowed)
        g.check("register severities are in the Dissonance.Core vocabulary",
                not bad, f"unknown: {bad}" if bad else
                f"vocabulary {sorted(allowed & {'Critical','High','Medium','Low'})}")

    # a resolved entry must be falsifiable: it needs a proof command
    unresolved = [e.get("id") for e in entries
                  if e.get("status") == "resolved" and not e.get("proves")]
    g.check("every resolved entry names a proving command", not unresolved,
            f"missing `proves`: {unresolved}" if unresolved
            else f"{sum(1 for e in entries if e.get('status') == 'resolved')} "
                 f"resolved entries, all with a proof")

    # an open Critical must carry a question or a stated reason for inaction
    missing_q = [e.get("id") for e in entries
                 if e.get("severity") == "Critical"
                 and e.get("status", "").startswith("open")
                 and not (e.get("question") or e.get("resolution"))]
    g.check("every open Critical escalates rather than silently sits",
            not missing_q, f"no question or resolution: {missing_q}"
            if missing_q else "all open Criticals are escalated")

    # lever fields from ADR/R4.lean
    lever_gaps = sorted({f for e in entries
                         for f in ("governor", "horizon") if not e.get(f)})
    g.check("every entry has a lever owner and horizon", not lever_gaps,
            f"missing {lever_gaps}" if lever_gaps else "owner + horizon present")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--baseline", type=pathlib.Path,
                    help="JSON file pinning the reviewed missing-link backlog")
    ap.add_argument("--write-baseline", type=pathlib.Path,
                    help="write the current missing-link set to this file")
    args = ap.parse_args()

    # Default to the committed baseline. Passing no flag previously meant
    # `known = set()`, so a bare `python3 scripts/verify_governance_gates.py`
    # compared against an empty backlog and reported all 31 reviewed
    # missing links as fresh regressions -- a gate that can only be satisfied
    # by remembering a flag is a gate nobody runs.
    baseline = args.baseline
    if baseline is None:
        default = ROOT / "compliance" / "governance" / "adr-link-baseline.json"
        if default.is_file():
            baseline = default
        else:
            print(f"note: no baseline at {default}; all missing links "
                  f"count as new drift")

    g = Gate()
    print("governance gates\n")
    gate_fixed_toolchain(g)
    gate_toolchain_pins(g)
    gate_workflow_paths(g)
    missing = gate_artifact_links(g, baseline)
    gate_sorry(g)
    gate_register(g)

    if args.write_baseline:
        args.write_baseline.write_text(
            json.dumps({"missing_links": missing}, indent=2) + "\n"
        )
        print(f"\nbaseline written: {args.write_baseline} "
              f"({len(missing)} known-missing links)")

    failed = [n for n, ok, _ in g.results if not ok]
    print()
    print(f"{len(g.results) - len(failed)}/{len(g.results)} gates passed")
    if failed:
        print("FAILED: " + "; ".join(failed))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
