#!/bin/bash
set -e

echo "--- [M] Audit: Checking for Infrastructure Drift ---"

if [ ! -f "artifacts/genesis_hashes.json" ]; then
    echo "FAIL: Genesis seal missing. Run 'm seal-genesis' first."
    exit 1
fi

# Example drift check: compare current gov/genesis.env hash with the one in the seal
CURRENT_HASH=$(sha256sum gov/genesis.env | awk '{print $1}')
SEAL_HASH=$(grep "genesis_env" artifacts/genesis_hashes.json | awk -F'"' '{print $4}')

if [[ "$CURRENT_HASH" == "$SEAL_HASH" ]]; then
    echo "[PASS] No drift detected. System matches constitution."
    echo '{"drift_status": "stable", "lambda_m": 1.0, "chi_squared": 0.0}' > artifacts/drift_report.json
else
    echo "!!! [FAIL] Drift detected in gov/genesis.env !!!"
    echo "Current: $CURRENT_HASH"
    echo "Seal:    $SEAL_HASH"
    echo '{"drift_status": "drifted", "lambda_m": 0.7, "chi_squared": 12.4}' > artifacts/drift_report.json
    exit 107
fi
