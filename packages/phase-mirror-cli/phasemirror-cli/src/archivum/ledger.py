import json
import hashlib
import os
from datetime import datetime

class ArchivumLedger:
    """
    Append-only time-series ledger for UnifiedWitness events.
    Supports Merkle-delta verification and global sync (ADR-0029).
    """

    def __init__(self, ledger_path="var/archivum/ledger.jsonl"):
        self.ledger_path = ledger_path
        os.makedirs(os.path.dirname(ledger_path), exist_ok=True)
        self.entries = self._load_ledger()

    def _load_ledger(self):
        entries = []
        if os.path.exists(self.ledger_path):
            with open(self.ledger_path, 'r') as f:
                for line in f:
                    if line.strip():
                        entries.append(json.loads(line))
        return entries

    def append(self, witness_shard, signatures=None):
        """Appends a new signed witness event to the ledger."""
        prev_hash = self.entries[-1]['hash'] if self.entries else "0" * 64
        
        event = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "prev_hash": prev_hash,
            "data": witness_shard,
            "signatures": signatures or [] # 2/3 Quorum of Ed25519 signatures
        }
        
        # Calculate Merkle link
        content = json.dumps(event, sort_keys=True)
        event["hash"] = hashlib.sha256(content.encode()).hexdigest()
        
        with open(self.ledger_path, 'a') as f:
            f.write(json.dumps(event) + "\n")
        
        self.entries.append(event)
        return event["hash"]

    def get_tip(self):
        return self.entries[-1] if self.entries else None

    def get_deltas(self, last_known_hash):
        """Returns all entries after the last known hash (Merkle-delta sync)."""
        if not last_known_hash:
            return self.entries
        
        for i, entry in enumerate(self.entries):
            if entry['hash'] == last_known_hash:
                return self.entries[i+1:]
        
        return self.entries # Fallback: sync all if hash not found

    def verify_lineage(self):
        """Verifies the integrity of the entire ledger chain."""
        expected_prev_hash = "0" * 64
        for entry in self.entries:
            if entry['prev_hash'] != expected_prev_hash:
                return False, f"Lineage break at hash {entry['hash'][:8]}"
            
            # Re-verify hash
            temp_event = entry.copy()
            actual_hash = temp_event.pop('hash')
            content = json.dumps(temp_event, sort_keys=True)
            if hashlib.sha256(content.encode()).hexdigest() != actual_hash:
                return False, f"Integrity violation at hash {actual_hash[:8]}"
            
            expected_prev_hash = actual_hash
        return True, "Lineage verified."
