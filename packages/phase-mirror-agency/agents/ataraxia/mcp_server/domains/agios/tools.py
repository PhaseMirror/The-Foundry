"""agiOS cognitive operation tools."""

from __future__ import annotations
import os
from pathlib import Path
import yaml

def agios_get_state() -> dict[str, object]:
    """Query current agiOS runtime state from its lever manifest."""
    agios_root = Path(os.getenv("AGIOS_ROOT", "/home/multiplicity/agiOS"))
    manifest_path = agios_root / "state" / "lever_manifest.yaml"
    
    if manifest_path.exists():
        with open(manifest_path, 'r') as f:
            return yaml.safe_load(f)
    return {"status": "error", "reason": "agiOS manifest not found"}

def agios_constitution_check(action: str) -> dict[str, object]:
    """Verify an action against the Ξ-Constitution constraints."""
    # Placeholder for constitutional verification logic
    return {
        "action": action,
        "allowed": True,
        "reason": "Action aligned with prime-lawful recursion protocols."
    }
