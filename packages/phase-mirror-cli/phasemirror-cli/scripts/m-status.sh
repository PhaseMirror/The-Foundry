#!/bin/bash
set -e

echo "--- [M] Snapshot: Generating Runtime Telemetry ---"
mkdir -p artifacts

cat <<EOF > artifacts/status_snapshot.json
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "uptime": "$(uptime -p)",
  "load_average": "$(cat /proc/loadavg | awk '{print $1, $2, $3}')",
  "status": "operational"
}
EOF

# Final Merge into unified_witness_final.json
if command -v jq >/dev/null 2>&1; then
    # Merge all shards if they exist
    FILES="artifacts/genesis_hashes.json artifacts/validation_witness_final.json artifacts/drift_report.json artifacts/status_snapshot.json artifacts/spectral_witness.json artifacts/cell_orchestration.json"
    VALID_FILES=""
    for f in $FILES; do
        if [ -f "$f" ]; then
            VALID_FILES="$VALID_FILES $f"
        fi
    done
    
    jq -s 'add' $VALID_FILES > artifacts/unified_witness_final.json
    echo "[.] Final witness merged at artifacts/unified_witness_final.json"
    
    # Phase 5: Log to Archivum Ledger
    python3 -c "
import json
from archivum.ledger import ArchivumLedger
with open('artifacts/unified_witness_final.json', 'r') as f:
    witness = json.load(f)
ledger = ArchivumLedger()
ledger.append(witness, signatures=['ed25519:local_node_sig'])
print('[.] Logged local witness to Archivum Ledger.')
"
else
    echo "[!] jq not found. Manual witness merge stub."
    cat artifacts/genesis_hashes.json artifacts/validation_witness_final.json artifacts/drift_report.json artifacts/status_snapshot.json artifacts/spectral_witness.json artifacts/cell_orchestration.json > artifacts/unified_witness_final.json
fi
