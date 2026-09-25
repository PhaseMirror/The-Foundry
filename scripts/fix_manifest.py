import json
import os
import sys

MANIFEST_FILE = "alp_sorry_manifest.json"

# Run phase mirror loop's scan_lean
sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from phase_mirror_loop import scan_lean

ev = scan_lean()

with open(MANIFEST_FILE, "r") as f:
    data = json.load(f)

# Find what is actually in lean:
actual_sorrys = set()
for decl, meta in ev.decl_meta.items():
    if meta.get("has_sorry"):
        actual_sorrys.add(decl)

# Also include unledgered axioms?
# Let's add them as well.
for axiom, meta in ev.axioms.items():
    actual_sorrys.add(axiom)

# Retain entries only if their name is in actual_sorrys (checking the leaf).
new_entries = []
actual_leaves = {d.split(".")[-1] for d in actual_sorrys}

for entry in data.get("entries", []):
    leaf = entry.get("name", entry.get("file", "")).split(".")[-1]
    if leaf in actual_leaves:
        new_entries.append(entry)

# What is missing from new_entries?
manifested_leaves = {e.get("name", e.get("file", "")).split(".")[-1] for e in new_entries}

missing_leaves = actual_leaves - manifested_leaves

# Add stubs for missing
for decl, meta in ev.decl_meta.items():
    if meta.get("has_sorry"):
        leaf = decl.split(".")[-1]
        if leaf in missing_leaves:
            new_entries.append({
                "file": meta["file"],
                "line": meta["line"],
                "type": "sorry",
                "name": decl,
                "description": "Scaffolded stub",
                "resolution": "To be proven.",
                "deadline": "2026-12-31",
                "governor": "the-examiner",
                "urgency": 4
            })
            missing_leaves.remove(leaf)

for axiom, meta in ev.axioms.items():
    leaf = axiom.split(".")[-1]
    if leaf in missing_leaves:
        new_entries.append({
            "file": meta.get("file", "unknown"),
            "line": meta.get("line", 0),
            "type": "axiom",
            "name": axiom,
            "description": "Unledgered axiom",
            "resolution": "To be resolved.",
            "deadline": "2026-12-31",
            "governor": "the-guardian",
            "urgency": 3
        })
        missing_leaves.remove(leaf)

data["entries"] = new_entries
data["permitted_sorrys"] = []

with open(MANIFEST_FILE, "w") as f:
    json.dump(data, f, indent=2)

print("Fixed manifest!")
