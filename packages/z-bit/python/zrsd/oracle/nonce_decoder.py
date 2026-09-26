import numpy as np

class NonceDecoder:
    """
    Maps Hilbert space states (Fock indices) to candidate Bitcoin nonces.
    """
    def __init__(self, dimension: int, nonce_offset: int = 0):
        self.dimension = dimension
        self.offset = nonce_offset

    def decode(self, state_index: int) -> int:
        """
        Maps a state index i to a 4-byte nonce.
        Simple linear mapping for the prototype.
        """
        if state_index >= self.dimension:
            raise ValueError(f"State index {state_index} exceeds dimension {self.dimension}")
            
        # For prototype, we just use the index plus offset
        return (self.offset + state_index) & 0xFFFFFFFF

    def decode_expectation(self, rho: np.ndarray) -> int:
        """
        Decodes the most likely nonce from a density matrix (mode).
        """
        diag = np.real(np.diag(rho))
        most_likely_index = np.argmax(diag)
        return self.decode(int(most_likely_index))
