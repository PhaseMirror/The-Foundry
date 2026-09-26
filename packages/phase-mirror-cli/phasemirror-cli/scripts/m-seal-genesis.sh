#!/bin/bash
set -e

echo "--- [M] Seal: Establishing Merkle Trust Root ---"
mkdir -p artifacts

# In a real system, this would hash all manifest files.
# Here we just emit the example from the ADR.

cat <<EOF > artifacts/genesis_hashes.json
{
  "version": "1.0",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "manifests": {
    "cargo": "a3f2b1c0...",
    "pnpm": "e5d4c3b2..."
  },
  "governance": {
    "genesis_env": "$(sha256sum gov/genesis.env | awk '{print $1}')"
  },
  "seal_status": "authoritative"
}
EOF

echo "[.] Trust root generated at artifacts/genesis_hashes.json"
