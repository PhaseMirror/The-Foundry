#!/bin/bash
set -e

if [[ "$1" == "--ci-mode" ]]; then
    echo "--- [M] Bootstrap: Initiating CI-Mode Shim ---"
    
    # Ensure genesis env exists before copying
    if [ ! -f "./gov/genesis.env" ]; then
        echo "FAIL: gov/genesis.env missing. Cannot seal CI state."
        exit 1
    fi
    mkdir -p ./artifacts/env
    # Relative path copy for portability
    cp ./gov/genesis.env ./artifacts/env/agi-os.env
    
    echo '{"bootstrap_mode": "ci", "status": "shimmed"}' > ./artifacts/bootstrap_ci_marker.json
    exit 0
fi

echo "--- [M] Bootstrap: Provisioning Local Appliance ---"
# Local provision logic (e.g. creating multiplicity user, etc.)
# For now, just a stub that mimics the shim
mkdir -p ./artifacts/env
cp ./gov/genesis.env ./artifacts/env/agi-os.env
echo '{"bootstrap_mode": "local", "status": "provisioned"}' > ./artifacts/bootstrap_local_marker.json
