import os

base_dir = "/media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/packages/PhaseMirror/"

dirs = [
    "archivum-local-first",
    "commander-core",
    "phase_mirror_adr",
    "phase-mirror-automation",
    "phase-mirror-cli",
    "phase-mirror-client",
    "phase-mirror-echo",
    "phase-mirror-edge",
    "phase-mirror-extension-host",
    "phase-mirror-surface",
    "phase_mirror_wasm",
    "sedona_spine",
    "the-commander"
]

descriptions = {
    "archivum-local-first": "Local-first data management and archival system for the Phase Mirror ecosystem.",
    "commander-core": "Core logic and operations for the Commander governance interface.",
    "phase_mirror_adr": "Architecture Decision Records scaffolding and formalization for Phase Mirror in Lean 4.",
    "phase-mirror-automation": "Automation tools and scripts for the Phase Mirror framework.",
    "phase-mirror-cli": "Command-line interface for interacting with the Phase Mirror ecosystem.",
    "phase-mirror-client": "Client libraries for Phase Mirror services.",
    "phase-mirror-echo": "Echo system components for resolving dissonance across architectural artifacts.",
    "phase-mirror-edge": "Edge deployment capabilities and networking for Phase Mirror.",
    "phase-mirror-extension-host": "Host framework for running Phase Mirror extensions.",
    "phase-mirror-surface": "Surface and API interface definitions for Phase Mirror agents.",
    "phase_mirror_wasm": "WebAssembly bindings and utilities for Phase Mirror logic.",
    "sedona_spine": "The Sedona Spine Engine, serving as the sole mandatory source of truth for retention, litigation holds, and spoliation logic.",
    "the-commander": "Top-level application interface for the Commander dashboard."
}

for d in dirs:
    path = os.path.join(base_dir, d, "README.md")
    name = d.replace("-", " ").replace("_", " ").title()
    content = f"# {name}\n\n{descriptions.get(d, 'Component of the Phase Mirror ecosystem.')}\n"
    
    with open(path, "w") as f:
        f.write(content)

print("Created READMEs successfully.")
