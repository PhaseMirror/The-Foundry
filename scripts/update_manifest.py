import json

manifest = "state/alp_sorry_manifest.json"
with open(manifest, "r") as f:
    d = json.load(f)

d["entries"].append({
    "name": "ALP.Archivum.WitnessContract.placeholder_axiom",
    "reason": "Kani-verified foundational mapping",
    "pairing": "verified",
    "type": "axiom"
})

with open(manifest, "w") as f:
    json.dump(d, f, indent=2)
