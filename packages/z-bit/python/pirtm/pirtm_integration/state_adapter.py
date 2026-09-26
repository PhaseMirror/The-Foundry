"""State adaptation layer for PIRTM integration.

Provides utilities to convert between existing state representations
(ACFL, CRMF, DHT) and PIRTM's prime-indexed tensor format.
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
from dataclasses import dataclass

from .prime_encoder import PrimeEncoder


@dataclass
class PrimeStateVector:
    """Vector representation with prime decomposition metadata.
    
    Attributes:
        vector: Numpy array of state values
        prime_decomposition: Dict mapping primes to coefficients
        state_indices: List of state indices corresponding to primes
        metadata: Additional metadata (pathway names, etc.)
    """
    vector: np.ndarray
    prime_decomposition: Dict[int, float]
    state_indices: List[int]
    metadata: Dict
    
    @property
    def dimension(self) -> int:
        """Dimension of the state vector."""
        return len(self.vector)
    
    @property
    def prime_count(self) -> int:
        """Number of prime components."""
        return len(self.prime_decomposition)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary representation."""
        return {
            "vector": self.vector.tolist(),
            "prime_decomposition": self.prime_decomposition,
            "state_indices": self.state_indices,
            "dimension": self.dimension,
            "metadata": self.metadata,
        }


class StateAdapter:
    """Adapts various state representations to PIRTM format.
    
    Handles conversions between:
    - ACFL operator results
    - CRMF certificates
    - CCRE resonance states
    - DHT state engines
    - WKD witness data
    """
    
    def __init__(self):
        """Initialize state adapter with prime encoder."""
        self.encoder = PrimeEncoder()
        
    def acfl_to_prime_state(
        self,
        acfl_result: Dict,
        pathway_names: Optional[List[str]] = None
    ) -> PrimeStateVector:
        """Convert ACFL operator result to prime state vector.
        
        Args:
            acfl_result: ACFL operator result dictionary
            pathway_names: Optional list of pathway names for metadata
            
        Returns:
            PrimeStateVector with prime decomposition
        """
        # Extract prime decomposition from ACFL result
        prime_decomp = acfl_result.get("prime_decomposition", {})
        
        # Convert to sorted list for consistent vector representation
        sorted_primes = sorted(prime_decomp.keys())
        
        # Create state vector from coefficients
        vector = np.array([prime_decomp[p] for p in sorted_primes])
        
        # Map primes to state indices
        state_indices = [self.encoder.prime_to_idx.get(p, -1) for p in sorted_primes]
        
        metadata = {
            "source": "acfl",
            "arity": acfl_result.get("arity", len(vector)),
        }
        
        if pathway_names:
            metadata["pathway_names"] = pathway_names
            
        return PrimeStateVector(
            vector=vector,
            prime_decomposition=prime_decomp,
            state_indices=state_indices,
            metadata=metadata,
        )
    
    def crmf_to_prime_state(
        self,
        certificate: Dict,
        operator_field: Optional[np.ndarray] = None
    ) -> PrimeStateVector:
        """Convert CRMF certificate to prime state vector.
        
        Args:
            certificate: CRMF ContractionCertificate dictionary
            operator_field: Optional operator field array
            
        Returns:
            PrimeStateVector encoding the certificate state
        """
        spectral_radius = certificate["spectral_radius"]
        is_stable = certificate["is_stable"]
        metadata_dict = certificate.get("metadata", {})
        
        # Encode stability state using prime decomposition
        # Use small primes for basic state encoding
        prime_decomp = {
            2: 1.0 if is_stable else 0.0,  # p=2: stability flag
            3: spectral_radius,              # p=3: spectral radius
            5: metadata_dict.get("epsilon", 0.05),  # p=5: epsilon
        }
        
        # If operator field provided, incorporate it
        if operator_field is not None:
            # Use next primes for operator components
            for i, value in enumerate(operator_field.flatten()[:5]):
                prime_decomp[self.encoder.primes[3 + i]] = float(value)
        
        vector = np.array(list(prime_decomp.values()))
        state_indices = [self.encoder.prime_to_idx[p] for p in prime_decomp.keys()]
        
        metadata = {
            "source": "crmf",
            "trace_id": certificate.get("trace_id", "unknown"),
            "is_stable": is_stable,
        }
        
        return PrimeStateVector(
            vector=vector,
            prime_decomposition=prime_decomp,
            state_indices=state_indices,
            metadata=metadata,
        )
    
    def dht_to_prime_state(
        self,
        dht_state: Dict,
    ) -> PrimeStateVector:
        """Convert DHT (Digital Health Tracker) state to prime state vector.
        
        Args:
            dht_state: DHT state dictionary
            
        Returns:
            PrimeStateVector encoding the DHT state
        """
        # Extract DHT components
        crmf_decomp = dht_state.get("crmf_decomposition", {})
        drift_level = dht_state.get("drift_level", 0.0)
        witness_count = dht_state.get("witness_count", 0)
        
        # Use existing prime decomposition or create new
        if crmf_decomp:
            prime_decomp = dict(crmf_decomp)
        else:
            # Create default decomposition
            prime_decomp = {
                2: drift_level,
                3: float(witness_count) / 100.0,  # Normalized witness count
            }
        
        vector = np.array(list(prime_decomp.values()))
        state_indices = [self.encoder.prime_to_idx.get(p, -1) for p in prime_decomp.keys()]
        
        metadata = {
            "source": "dht",
            "drift_level": drift_level,
            "witness_count": witness_count,
        }
        
        return PrimeStateVector(
            vector=vector,
            prime_decomposition=prime_decomp,
            state_indices=state_indices,
            metadata=metadata,
        )
    
    def prime_state_to_pirtm(
        self,
        prime_state: PrimeStateVector,
        target_dim: Optional[int] = None
    ) -> np.ndarray:
        """Convert prime state vector to PIRTM-compatible tensor.
        
        Args:
            prime_state: PrimeStateVector to convert
            target_dim: Optional target dimension (pads or truncates)
            
        Returns:
            Numpy array suitable for PIRTM operations
        """
        vector = prime_state.vector
        
        if target_dim is not None:
            if len(vector) < target_dim:
                # Pad with zeros
                vector = np.pad(vector, (0, target_dim - len(vector)))
            elif len(vector) > target_dim:
                # Truncate
                vector = vector[:target_dim]
        
        # Normalize to unit vector for stability
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
            
        return vector
    
    def create_operator_from_primes(
        self,
        prime_decomposition: Dict[int, float],
        dim: int = 10
    ) -> np.ndarray:
        """Create operator matrix from prime decomposition.
        
        Uses prime coefficients to construct a structured operator
        suitable for PIRTM dynamics.
        
        Args:
            prime_decomposition: Dict mapping primes to coefficients
            dim: Dimension of output operator matrix
            
        Returns:
            Operator matrix with prime-structured spectrum
        """
        # Create diagonal operator weighted by prime coefficients
        diag = np.zeros(dim)
        
        sorted_primes = sorted(prime_decomposition.keys())
        for i, prime in enumerate(sorted_primes[:dim]):
            coeff = prime_decomposition[prime]
            # Scale coefficient to ensure stability
            diag[i] = coeff * 0.9  # Keep spectral radius < 1
        
        # Add small off-diagonal structure for interesting dynamics
        operator = np.diag(diag)
        for i in range(dim - 1):
            operator[i, i+1] = 0.05
            operator[i+1, i] = 0.05
            
        return operator
    
    def batch_convert_states(
        self,
        states: List[Dict],
        source_type: str
    ) -> List[PrimeStateVector]:
        """Batch convert multiple states to prime state vectors.
        
        Args:
            states: List of state dictionaries
            source_type: Type of source ("acfl", "crmf", "dht")
            
        Returns:
            List of PrimeStateVector objects
        """
        converter_map = {
            "acfl": self.acfl_to_prime_state,
            "crmf": self.crmf_to_prime_state,
            "dht": self.dht_to_prime_state,
        }
        
        converter = converter_map.get(source_type)
        if not converter:
            raise ValueError(f"Unknown source type: {source_type}")
        
        return [converter(state) for state in states]
