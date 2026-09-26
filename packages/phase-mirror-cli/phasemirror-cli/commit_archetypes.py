import json
import os
import sys

# Ensure src directory is in path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))
from archivum.ledger import ArchivumLedger

def commit():
    # Initialize authoritative python ledger
    ledger = ArchivumLedger()
    
    baa_path = "../../baa_signed.json"
    dpa_path = "../../dpa_signed.json"
    
    if os.path.exists(baa_path):
        with open(baa_path, 'r') as f:
            baa_data = json.load(f)
        sigs = [sig['signature'] for sig in baa_data.get('signatories', [])]
        hash_val = ledger.append(baa_data, sigs)
        print(f"[SUCCESS] Committed BAA archetype. Merkle Hash: {hash_val}")
    else:
        print(f"[ERROR] Signed BAA not found at: {baa_path}")
        
    if os.path.exists(dpa_path):
        with open(dpa_path, 'r') as f:
            dpa_data = json.load(f)
        sigs = [sig['signature'] for sig in dpa_data.get('signatories', [])]
        hash_val = ledger.append(dpa_data, sigs)
        print(f"[SUCCESS] Committed DPA archetype. Merkle Hash: {hash_val}")
    else:
        print(f"[ERROR] Signed DPA not found at: {dpa_path}")

if __name__ == "__main__":
    commit()
