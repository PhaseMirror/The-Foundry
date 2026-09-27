#!/usr/bin/env python3
"""Kubernetes deployment status updater for the compliance manifest.

This script queries the Kubernetes cluster for the status of a Helm release
(and its associated pods) and writes the results into the
`compliance/manifest.json` file under the `deployment_status` key.

Usage:
  python k8s_status_updater.py --release <release-name>

It expects `kubectl` to be available in the PATH and configured with the
appropriate context.
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

MANIFEST_PATH = Path(__file__).parent / "manifest.json"

def run_kubectl(args: list[str]) -> str:
    """Run a kubectl command and return its stdout.
    Raises RuntimeError on failure.
    """
    result = subprocess.run(["kubectl"] + args, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"kubectl {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout.strip()

def get_revision(release: str) -> str:
    # Deployment revision annotation is stored on the Deployment resource.
    # Helm creates a deployment named <release>-controller or similar; we ask
    # for the release's primary deployment using a label selector.
    try:
        out = run_kubectl([
            "get", "deployment",
            "-l", f"app.kubernetes.io/instance={release}",
            "-o", "jsonpath={.items[0].metadata.annotations.deployment\.kubernetes\.io/revision}"])
        return out or ""
    except Exception:
        return ""

def get_phase(release: str) -> str:
    # Determine overall phase by inspecting pod readiness.
    try:
        pods_json = run_kubectl([
            "get", "pods",
            "-l", f"app.kubernetes.io/instance={release}",
            "-o", "json"])
        pods = json.loads(pods_json)
        if not pods.get("items"):
            return "NoPods"
        not_ready = [p for p in pods["items"] if any(
            c.get("type") == "Ready" and c.get("status") != "True"
            for c in p.get("status", {}).get("conditions", []))]
        return "Degraded" if not_ready else "Healthy"
    except Exception:
        return "Unknown"

def update_manifest(phase: str, revision: str) -> None:
    if not MANIFEST_PATH.is_file():
        raise FileNotFoundError(f"Manifest not found at {MANIFEST_PATH}")
    data = json.loads(MANIFEST_PATH.read_text())
    data.setdefault("deployment_status", {})
    data["deployment_status"]["phase"] = phase
    data["deployment_status"]["revision"] = revision
    data["deployment_status"]["last_updated"] = ""  # will be filled by CI timestamp if needed
    MANIFEST_PATH.write_text(json.dumps(data, indent=2))

def main() -> None:
    parser = argparse.ArgumentParser(description="Update compliance manifest with K8s status")
    parser.add_argument("--release", required=True, help="Helm release name to query")
    args = parser.parse_args()
    try:
        phase = get_phase(args.release)
        revision = get_revision(args.release)
        update_manifest(phase, revision)
        print(f"Updated manifest: phase={phase}, revision={revision}")
    except Exception as e:
        print(f"Error updating status: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
