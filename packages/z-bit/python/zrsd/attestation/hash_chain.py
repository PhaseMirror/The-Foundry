import hashlib
from typing import Optional

class HashChain:
    """
    Implements a recursive SHA-256 hash chain for PWEH.
    """
    def __init__(self, genesis_hash: Optional[bytes] = None):
        # If no genesis hash, use 32 zero bytes
        self.current_hash = genesis_hash or b'\x00' * 32

    def update(self, step_bytes: bytes) -> bytes:
        """
        Updates the chain head: S_t = Hash(S_{t-1} || Step_t)
        """
        hasher = hashlib.sha256()
        hasher.update(self.current_hash)
        hasher.update(step_bytes)
        self.current_hash = hasher.digest()
        return self.current_hash

    def get_head(self) -> str:
        """
        Returns the hex representation of the current chain head.
        """
        return self.current_hash.hex()
