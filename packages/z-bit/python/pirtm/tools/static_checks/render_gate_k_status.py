"""Generate a Gate K status artifact from the execution checklist.

The artifact is derived from the current checklist plus the executable evidence
commands already recorded there. Status values are:

- implemented: structural work appears present in-repo
- evidenced: executable evidence for the section/item passes now
- pending: requires manual review, external CI links, or failing evidence
"""

from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
CHECKLIST_PATH = REPO_ROOT / "docs" / "adr" / "gates" / "gate k" / "GATE-K-EXECUTION-CHECKLIST.md"
OUTPUT_PATH = REPO_ROOT / "docs" / "adr" / "gates" / "gate k" / "GATE-K-STATUS.md"


@dataclass
class ChecklistItem:
    section: str
    text: str
    is_evidence: bool
    payloads: list[str]


def _parse_checklist() -> list[ChecklistItem]:
    text = CHECKLIST_PATH.read_text(encoding="utf-8")
    current_section = "Unknown"
    items: list[ChecklistItem] = []

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line.startswith("## "):
            current_section = line[3:].strip()
            continue
        if not line.startswith("- [ ]"):
            continue
        payloads = re.findall(r"`([^`]+)`", line)
        items.append(
            ChecklistItem(
                section=current_section,
                text=line[len("- [ ] ") :].strip(),
                is_evidence="Evidence" in line,
                payloads=payloads,
            )
        )
    return items


def _path_exists(payload: str) -> bool:
    if "*" in payload:
        return any(REPO_ROOT.glob(payload))
    return (REPO_ROOT / payload).exists()


def _run_evidence_command(command: str) -> tuple[bool, str]:
    proc = subprocess.run(
        command,
        cwd=REPO_ROOT,
        shell=True,
        text=True,
        capture_output=True,
        timeout=180,
    )
    output = (proc.stdout + proc.stderr).strip()
    if len(output) > 240:
        output = output[:240] + "..."
    return proc.returncode == 0, output or "ok"


def _evaluate_evidence_item(item: ChecklistItem) -> tuple[str, str]:
    if not item.payloads:
        if "link to CI job" in item.text or "audit log sample" in item.text:
            return "pending", "manual external evidence required"
        return "pending", "no executable evidence payload found"

    payload = item.payloads[0]
    if payload.startswith("docs/"):
        if _path_exists(payload):
            return "evidenced", f"exists: {payload}"
        return "pending", f"missing: {payload}"

    if payload.startswith("pytest ") or payload.startswith("python "):
        ok, detail = _run_evidence_command(payload)
        return ("evidenced" if ok else "pending"), detail

    return "pending", f"unsupported evidence payload: {payload}"


def _evaluate_structural_item(item: ChecklistItem, section_evidenced: bool) -> tuple[str, str]:
    if item.payloads:
        missing = [payload for payload in item.payloads if payload.startswith(("pirtm/", "docs/")) and not _path_exists(payload)]
        if missing:
            return "pending", f"missing path(s): {', '.join(missing)}"
        return "implemented", "referenced path(s) present"

    if item.section == "Cross‑Cutting" and "completion criteria met and approved" in item.text.lower():
        return "pending", "manual reviewer approval required"

    if item.section == "Cross‑Cutting" and "documentation updated" in item.text.lower():
        return "implemented", "Gate K docs present in repository"

    if section_evidenced:
        return "implemented", "section evidence currently passes"

    return "pending", "awaiting passing section evidence"


def render_status() -> str:
    items = _parse_checklist()

    evidence_by_section: dict[str, list[tuple[ChecklistItem, str, str]]] = {}
    evidence_results: dict[tuple[str, str], tuple[str, str]] = {}
    for item in items:
        if item.is_evidence:
            status, detail = _evaluate_evidence_item(item)
            evidence_results[(item.section, item.text)] = (status, detail)
            evidence_by_section.setdefault(item.section, []).append((item, status, detail))

    lines: list[str] = []
    lines.append("# Gate K Status")
    lines.append("")
    lines.append("This artifact is auto-derived from `GATE-K-EXECUTION-CHECKLIST.md` and its current evidence commands.")
    lines.append("")
    lines.append("## Status Legend")
    lines.append("")
    lines.append("- `implemented`: repository structure/code for the item is present")
    lines.append("- `evidenced`: executable evidence for the item currently passes")
    lines.append("- `pending`: missing evidence, external manual review, or unresolved item")
    lines.append("")

    current_section = None
    for idx, item in enumerate(items):
        if item.section != current_section:
            current_section = item.section
            lines.append(f"## {current_section}")
            lines.append("")
            lines.append("| Item | Status | Detail |")
            lines.append("|---|---|---|")

        section_evidence = evidence_by_section.get(item.section, [])
        non_manual_evidence = [
            (e_item, status, detail)
            for e_item, status, detail in section_evidence
            if "manual" not in e_item.text.lower()
        ]
        section_evidenced = any(status == "evidenced" for _, status, _ in non_manual_evidence)

        if item.is_evidence:
            status, detail = evidence_results[(item.section, item.text)]
        else:
            status, detail = _evaluate_structural_item(item, section_evidenced)

        safe_text = item.text.replace("|", "\\|")
        safe_detail = detail.replace("|", "\\|")
        lines.append(f"| {safe_text} | {status} | {safe_detail} |")

        # After the final item in a section, summarize section evidence.
        next_sections = [other.section for other in items[idx + 1 : idx + 2]]
        if not next_sections or next_sections[0] != current_section:
            lines.append("")

    return "\n".join(lines) + "\n"


def main() -> int:
    if not CHECKLIST_PATH.exists():
        print(f"Checklist missing: {CHECKLIST_PATH}")
        return 2
    rendered = render_status()
    OUTPUT_PATH.write_text(rendered, encoding="utf-8")
    print(f"Wrote Gate K status artifact: {OUTPUT_PATH.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())