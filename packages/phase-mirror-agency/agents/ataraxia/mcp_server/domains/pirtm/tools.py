"""PIRTM computation tools."""

from __future__ import annotations
import subprocess
import os
from pathlib import Path

def run_pirtm_call(input_expr: str) -> dict[str, str]:
    """Execute a PIRTM computation (Prime-Indexed Recurrence Tensor Machine)."""
    hq_root = Path(os.getenv("PHASE_MIRROR_HQ_ROOT", "/home/multiplicity/PhaseMirror-HQ"))
    harness = hq_root / "test_pirtm_call.py"
    
    if not harness.exists():
        return {"status": "error", "reason": "PIRTM harness not found"}
        
    try:
        # Example call pattern using the existing python harness
        result = subprocess.run(
            ["python3", str(harness), "--expr", input_expr],
            cwd=hq_root,
            capture_output=True,
            text=True
        )
        return {
            "status": "success" if result.returncode == 0 else "failure",
            "output": result.stdout,
            "stderr": result.stderr
        }
    except Exception as e:
        return {"status": "error", "reason": str(e)}
