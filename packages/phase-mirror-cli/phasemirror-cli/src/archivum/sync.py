import json
import os
import sys
from archivum.ledger import ArchivumLedger

class ArchivumSync:
    """
    Orchestrates WAN replication between independent fleets (ADR-0029).
    """

    def __init__(self, ledger):
        self.ledger = ledger
        self.peers_path = "config/peers/authorized_peers.json"

    def sync_from_peer(self, peer_url):
        """Simulates pulling deltas from a remote peer."""
        print(f"--- [Archivum] Syncing from peer: {peer_url} ---")
        
        # 1. Fetch Tip from Local Ledger
        tip = self.ledger.get_tip()
        last_hash = tip['hash'] if tip else None
        
        # 2. Request Deltas from Peer (Simulated)
        print(f"[.] Requesting deltas after Merkle root: {last_hash[:8] if last_hash else 'GENESIS'}")
        
        # MOCK: In a real system, this would be an HTTP/SSE call
        remote_deltas = self._mock_remote_deltas(last_hash)
        
        if not remote_deltas:
            print("[PASS] Global state synchronized. No deltas found.")
            return True

        # 3. Ingest Deltas
        ingested_count = 0
        for delta in remote_deltas:
            # Verify remote signatures (Simplified)
            if self._verify_signatures(delta):
                self.ledger.append(delta['data'], delta['signatures'])
                ingested_count += 1
            else:
                print(f"[!] DROPPED: Invalid signature on delta {delta['hash'][:8]}")
        
        print(f"[SUCCESS] Ingested {ingested_count} deltas from {peer_url}.")
        return True

    def _mock_remote_deltas(self, last_hash):
        """Generates mock deltas for demonstration."""
        # Only return deltas if we are "behind"
        if last_hash and last_hash.endswith("f"): # Artificial condition for sync demo
            return []
            
        return [
            {
                "data": {"event": "WAN_HEARTBEAT", "origin": "fleet-us-east-1", "lambda_m": 0.99},
                "signatures": ["ed25519:sig1..."],
                "hash": "mock_hash_1"
            },
            {
                "data": {"event": "GLOBAL_STATE_COMMIT", "origin": "fleet-eu-west-1", "lambda_m": 1.0},
                "signatures": ["ed25519:sig2..."],
                "hash": "mock_hash_2"
            }
        ]

    def _verify_signatures(self, delta):
        # Mock Ed25519 2/3 quorum verification
        return len(delta.get('signatures', [])) > 0

if __name__ == "__main__":
    ledger = ArchivumLedger()
    sync = ArchivumSync(ledger)
    
    # Simple CLI wrapper
    if len(sys.argv) > 1:
        peer = sys.argv[1]
        sync.sync_from_peer(peer)
    else:
        # Default to configured peers
        peers_file = "config/peers/authorized_peers.json"
        if os.path.exists(peers_file):
            with open(peers_file, 'r') as f:
                peers = json.load(f)
                for p in peers.get('authorized_peers', []):
                    sync.sync_from_peer(p['url'])
        else:
            print("[!] No authorized peers configured. Defaulting to Mock Relay.")
            sync.sync_from_peer("https://relay.global-archivum.net")
