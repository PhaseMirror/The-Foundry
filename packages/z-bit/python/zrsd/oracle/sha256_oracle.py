import hashlib
from typing import Union

class Sha256Oracle:
    """
    Implements the Bitcoin Double-SHA256 oracle.
    Provides scoring based on difficulty targets.
    """
    def __init__(self, block_header_prefix: bytes, target: Union[int, bytes]):
        self.prefix = block_header_prefix
        if isinstance(target, bytes):
            self.target = int.from_bytes(target, 'big')
        else:
            self.target = target

    def score_nonce(self, nonce: Union[int, bytes]) -> float:
        """
        Computes the 'closeness' of a nonce to the target.
        Returns a normalized score where lower is better (closer to 0).
        """
        if isinstance(nonce, int):
            nonce_bytes = nonce.to_bytes(4, 'little')
        else:
            nonce_bytes = nonce

        data = self.prefix + nonce_bytes
        h1 = hashlib.sha256(data).digest()
        h2 = hashlib.sha256(h1).digest()
        
        # Bitcoin hash is little-endian in comparison? 
        # Actually it's usually shown as big-endian hex but compared as a large integer.
        # We'll use big-endian for the integer comparison.
        hash_val = int.from_bytes(h2, 'big')
        
        # Normalized score: hash / target. 
        # If hash < target, score < 1.0 (success).
        return float(hash_val) / float(self.target)

    def count_leading_zeros(self, nonce: Union[int, bytes]) -> int:
        """
        Helper to count leading zero bits in the resulting hash.
        """
        if isinstance(nonce, int):
            nonce_bytes = nonce.to_bytes(4, 'little')
        else:
            nonce_bytes = nonce

        data = self.prefix + nonce_bytes
        h1 = hashlib.sha256(data).digest()
        h2 = hashlib.sha256(h1).digest()
        
        # Convert to bit string
        bits = bin(int.from_bytes(h2, 'big'))[2:].zfill(256)
        return 256 - len(bits.lstrip('0'))
