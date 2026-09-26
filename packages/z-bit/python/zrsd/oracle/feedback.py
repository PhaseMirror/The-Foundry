import numpy as np
from .sha256_oracle import Sha256Oracle
from .nonce_decoder import NonceDecoder

class OracleFeedback:
    """
    Constructs the feedback operator Xi_oracle based on SHA-256 scores.
    """
    def __init__(self, oracle: Sha256Oracle, decoder: NonceDecoder):
        self.oracle = oracle
        self.decoder = decoder

    def get_diagonal_operator(self) -> np.ndarray:
        """
        Returns a diagonal matrix where entries are oracle scores.
        Used as a potential V_oracle in the dynamics.
        """
        scores = []
        for i in range(self.decoder.dimension):
            nonce = self.decoder.decode(i)
            score = self.oracle.score_nonce(nonce)
            scores.append(score)
            
        return np.diag(scores)

    def get_lindblad_ops(self, strength: float = 0.1) -> list:
        """
        Returns a list of Lindblad operators that drive the state 
        toward the minimum oracle score (gradient descent in Fock space).
        """
        scores = np.array([self.oracle.score_nonce(self.decoder.decode(i)) for i in range(self.decoder.dimension)])
        
        # Identify the best (minimum) score state
        target_idx = np.argmin(scores)
        
        L_ops = []
        for i in range(self.decoder.dimension):
            if i != target_idx:
                # The jump rate is proportional to how bad the score is
                # (Assuming scores are normalized < 1.0, though higher is worse).
                # Fallback to just using the score itself as a jump weight towards the target.
                rate = np.sqrt(strength * scores[i])
                L = np.zeros((self.decoder.dimension, self.decoder.dimension), dtype=complex)
                L[target_idx, i] = rate
                L_ops.append(L)
                
        return L_ops
