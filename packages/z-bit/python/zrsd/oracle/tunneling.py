import numpy as np

class TunnelingDriver:
    """
    Implements off-diagonal tunneling drivers for Fock space exploration.
    Used to accelerate transitions between search states using true prime-factor topology.
    """
    def __init__(self, dimension: int):
        self.dimension = dimension

    def get_prime_coupled_tunneling(self, bridge, strength: float = 0.05) -> np.ndarray:
        """
        Couples states that differ by a single prime occupation (Hamming distance 1).
        This replaces the deprecated 1D get_nearest_neighbor_tunneling.
        """
        a_dag, a = bridge.get_creation_annihilation()
        
        H = np.zeros((self.dimension, self.dimension), dtype=complex)
        for ad, an in zip(a_dag, a):
            H += strength * (ad + an)
            
        return H

