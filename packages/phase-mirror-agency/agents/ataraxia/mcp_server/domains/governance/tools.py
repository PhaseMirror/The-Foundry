"""Governance tools for Phase Mirror ADRs and Constitution."""

from __future__ import annotations
import os
from pathlib import Path

def get_governance_adr(adr_id: str) -> dict[str, str]:
    """Fetch a specific ADR by ID."""
    # Assuming ADRs are in PhaseMirror-HQ/docs/adr/
    hq_root = Path(os.getenv("PHASE_MIRROR_HQ_ROOT", "/home/multiplicity/PhaseMirror-HQ"))
    adr_path = hq_root / "docs" / "adr" / f"ADR-{adr_id}.md"
    
    if not adr_path.exists():
        # Check accepted/
        adr_path = hq_root / "docs" / "adr" / "accepted" / f"ADR-{adr_id}.md"
        
    if adr_path.exists():
        return {
            "adr_id": adr_id,
            "content": adr_path.read_text(),
            "status": "found"
        }
    return {"adr_id": adr_id, "status": "not_found"}

def list_governance_adrs() -> list[dict[str, str]]:
    """List all active ADRs with status."""
    hq_root = Path(os.getenv("PHASE_MIRROR_HQ_ROOT", "/home/multiplicity/PhaseMirror-HQ"))
    adr_dir = hq_root / "docs" / "adr"
    
    adrs = []
    if adr_dir.exists():
        for f in adr_dir.glob("*.md"):
            adrs.append({"id": f.stem, "path": str(f)})
        for f in (adr_dir / "accepted").glob("*.md"):
            adrs.append({"id": f.stem, "path": str(f)})
    return adrs

def query_constitution() -> str:
    """Query constitutional provisions."""
    hq_root = Path(os.getenv("PHASE_MIRROR_HQ_ROOT", "/home/multiplicity/PhaseMirror-HQ"))
    const_path = hq_root / "Ξ-Constitution.md"
    if const_path.exists():
        return const_path.read_text()
    return "Constitution not found."
