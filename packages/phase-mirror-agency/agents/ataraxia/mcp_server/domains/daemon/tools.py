"""Unified lever execution tools."""

from __future__ import annotations
import subprocess
import os
from pathlib import Path

def execute_lever(lever_id: str, scope: str = "hq") -> dict[str, object]:
    """Execute a task-based lever across the ecosystem."""
    
    # Determine working directory and script path based on scope
    roots = {
        "hq": "/home/multiplicity/PhaseMirror-HQ",
        "agios": "/home/multiplicity/agiOS",
        "multiplic": "/home/multiplicity/github-Multiplicity/.github-Multiplicity"
    }
    
    work_dir = roots.get(scope, roots["hq"])
    script_path = Path(work_dir) / "scripts" / "lever_manager.py"
    
    if not script_path.exists():
        return {
            "status": "error",
            "reason": f"Lever manager not found at {script_path}",
            "scope": scope
        }
        
    try:
        # Format: python3 lever_manager.py exec <id>
        result = subprocess.run(
            ["python3", str(script_path), "exec", lever_id],
            cwd=work_dir,
            capture_output=True,
            text=True
        )
        
        return {
            "status": "success" if result.returncode == 0 else "failure",
            "lever_id": lever_id,
            "scope": scope,
            "output": result.stdout,
            "stderr": result.stderr
        }
    except Exception as e:
        return {
            "status": "error",
            "reason": str(e),
            "lever_id": lever_id,
            "scope": scope
        }
