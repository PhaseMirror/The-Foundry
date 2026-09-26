import os
import time
import json
import threading
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError

# --- Initialization & Fail-Closed Guard ---
_PUBLIC_KEY_HEX = os.environ.get("COMMANDER_SAT_PUBLIC_KEY")
if not _PUBLIC_KEY_HEX:
    # Fail-closed per ADR-MCP-003: process MUST exit if key is missing.
    import sys
    print("FATAL: COMMANDER_SAT_PUBLIC_KEY not set. Fail-closed per ADR-MCP-003.", file=sys.stderr)
    sys.exit(1)

_VERIFY_KEY = VerifyKey(bytes.fromhex(_PUBLIC_KEY_HEX))
_REPLAY_CACHE: set[str] = set()
_REPLAY_LOCK = threading.Lock()

class AlpRejectionError(Exception):
    """Raised when ALP admission fails."""
    pass

def verify_sat(token: dict, own_server_id: str) -> None:
    """
    Verifies a Signed Admission Token (SAT) against the current policy and key.
    Raises AlpRejectionError on any violation.
    
    Order of operations is load-bearing:
    1. Check Expiry/Clock Skew (Fast)
    2. Check Server Binding (Fast)
    3. Check Replay Cache (Fast)
    4. Check Cryptographic Signature (Expensive)
    5. Commit to Replay Cache (State Mutation)
    """
    now = int(time.time())

    # 1. Expiry + clock skew (±2s)
    if now > token["expires_at"] + 2:
        raise AlpRejectionError("SAT expired")
    if token["issued_at"] > now + 2:
        raise AlpRejectionError("SAT issued in future — clock skew exceeded")

    # 2. Server binding — non-transferable
    if token["server_binding"] != own_server_id:
        raise AlpRejectionError(f"SAT server_binding mismatch: expected {own_server_id}, got {token['server_binding']}")

    # 3. Replay protection (Thread-safe)
    with _REPLAY_LOCK:
        if token["token_id"] in _REPLAY_CACHE:
            raise AlpRejectionError(f"SAT replay detected: token_id {token['token_id']} already used")

    # 4. Signature over canonical payload (sig excluded)
    payload = {k: v for k, v in token.items() if k != "signature"}
    # json.dumps with sort_keys=True matches Rust's BTreeMap-backed serialization
    # ADR-MCP-003 constraint: all field names must be ASCII.
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    
    try:
        # Ed25519 verification
        _VERIFY_KEY.verify(canonical.encode("utf-8"), bytes.fromhex(token["signature"]))
    except BadSignatureError:
        raise AlpRejectionError("SAT signature invalid")
    except Exception as e:
        raise AlpRejectionError(f"SAT verification error: {str(e)}")

    # 5. Admit — invalidate token_id for future use (Thread-safe)
    with _REPLAY_LOCK:
        _REPLAY_CACHE.add(token["token_id"])
    
    # Optional: Periodically prune replay cache of expired tokens
    # (Deferred to middleware implementation for cleaner logic)
