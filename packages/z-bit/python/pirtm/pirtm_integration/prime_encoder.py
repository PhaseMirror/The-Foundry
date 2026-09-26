"""Prime encoding utilities for PIRTM integration.

Provides mechanisms to encode computational states as prime numbers and
translate between binary representations and PIRTM's prime-indexed space.
"""

from typing import Dict, List, Optional, Tuple
import numpy as np


class PrimeEncoder:
    """Encodes state vectors and operators using prime number indexing.
    
    This follows the philosophy from A-MACHINELEARN.json where each state
    is mapped to a unique prime number for efficient quantum-like processing
    on classical hardware.
    """
    
    def __init__(self, max_prime: int = 10000):
        """Initialize encoder with pre-computed prime table.
        
        Args:
            max_prime: Maximum prime number to pre-compute (default 10000)
        """
        self.primes = self._sieve_of_eratosthenes(max_prime)
        self.prime_to_idx = {p: i for i, p in enumerate(self.primes)}
        
    def _sieve_of_eratosthenes(self, limit: int) -> List[int]:
        """Generate all primes up to limit using Sieve of Eratosthenes."""
        if limit < 2:
            return []
        
        sieve = [True] * (limit + 1)
        sieve[0] = sieve[1] = False
        
        for i in range(2, int(limit**0.5) + 1):
            if sieve[i]:
                for j in range(i*i, limit + 1, i):
                    sieve[j] = False
                    
        return [i for i in range(limit + 1) if sieve[i]]
    
    def encode_state_index(self, state_idx: int) -> int:
        """Map state index to its corresponding prime number.
        
        Args:
            state_idx: Integer state index (0, 1, 2, ...)
            
        Returns:
            Prime number p_i corresponding to state q_i
            
        Example:
            >>> encoder = PrimeEncoder()
            >>> encoder.encode_state_index(0)  # q_0 -> p_0
            2
            >>> encoder.encode_state_index(1)  # q_1 -> p_1
            3
            >>> encoder.encode_state_index(2)  # q_2 -> p_2
            5
        """
        if state_idx >= len(self.primes):
            raise ValueError(f"State index {state_idx} exceeds prime table size")
        return self.primes[state_idx]
    
    def decompose_to_primes(self, value: float, num_components: int = 5) -> Dict[int, float]:
        """Decompose a value into prime-indexed components.
        
        This creates a prime decomposition similar to what's used in
        ACFL, DHT, and other modules for their operator fields.
        
        Args:
            value: Floating point value to decompose
            num_components: Number of prime components to use
            
        Returns:
            Dictionary mapping prime numbers to coefficients
            
        Example:
            >>> encoder = PrimeEncoder()
            >>> decomp = encoder.decompose_to_primes(0.75, num_components=3)
            >>> # Returns {2: 0.25, 3: 0.25, 5: 0.25} (uniform distribution)
        """
        components = self.primes[:num_components]
        
        # Simple uniform distribution (can be enhanced with spectral methods)
        coefficient = value / num_components
        
        return {p: coefficient for p in components}
    
    def prime_superposition(self, prime_decomposition: Dict[int, float]) -> np.ndarray:
        """Create quantum-like superposition state from prime decomposition.
        
        This aligns with the A-MACHINELEARN.json concept where quantum
        superposition is achieved through prime encoding on classical hardware.
        
        Args:
            prime_decomposition: Dict mapping primes to amplitudes
            
        Returns:
            Numpy array representing the superposition state
        """
        max_prime = max(prime_decomposition.keys())
        state_dim = self.prime_to_idx.get(max_prime, len(self.primes)) + 1
        
        state = np.zeros(state_dim)
        for prime, amplitude in prime_decomposition.items():
            if prime in self.prime_to_idx:
                state[self.prime_to_idx[prime]] = amplitude
                
        # Normalize to unit vector for quantum-like properties
        norm = np.linalg.norm(state)
        if norm > 0:
            state = state / norm
            
        return state


class BinaryToPrimeTranslator:
    """Translates binary representations to PIRTM prime-indexed form.
    
    Implements the universal translation mechanism where even binary
    can be expressed in PIRTM's prime mathematics substrate.
    """
    
    def __init__(self):
        """Initialize translator with prime encoder."""
        self.encoder = PrimeEncoder()
        
    def binary_to_prime_sequence(self, binary_string: str) -> List[int]:
        """Convert binary string to sequence of prime numbers.
        
        Each bit position is mapped to a prime number. Set bits (1s)
        are included in the sequence.
        
        Args:
            binary_string: String of '0' and '1' characters
            
        Returns:
            List of prime numbers corresponding to set bit positions
            
        Example:
            >>> translator = BinaryToPrimeTranslator()
            >>> translator.binary_to_prime_sequence("101")
            [2, 5]  # Bits at positions 0 and 2 are set
        """
        primes = []
        for i, bit in enumerate(reversed(binary_string)):
            if bit == '1':
                primes.append(self.encoder.encode_state_index(i))
        return primes
    
    def integer_to_prime_factorization(self, n: int) -> Dict[int, int]:
        """Factor integer into prime powers.
        
        This natural factorization embeds integers directly into
        PIRTM's prime mathematics.
        
        Args:
            n: Integer to factor
            
        Returns:
            Dictionary mapping primes to their powers
            
        Example:
            >>> translator = BinaryToPrimeTranslator()
            >>> translator.integer_to_prime_factorization(12)
            {2: 2, 3: 1}  # 12 = 2^2 * 3^1
        """
        if n <= 1:
            return {}
            
        factors = {}
        d = 2
        while d * d <= n:
            while n % d == 0:
                factors[d] = factors.get(d, 0) + 1
                n //= d
            d += 1
            
        if n > 1:
            factors[n] = factors.get(n, 0) + 1
            
        return factors
    
    def bytes_to_prime_encoding(self, data: bytes) -> Dict[int, List[int]]:
        """Encode arbitrary bytes to prime representation.
        
        Each byte is mapped to a sequence of primes based on its
        bit pattern, creating a PIRTM-compatible representation
        of any binary data.
        
        Args:
            data: Bytes to encode
            
        Returns:
            Dictionary mapping byte positions to prime sequences
            
        Example:
            >>> translator = BinaryToPrimeTranslator()
            >>> translator.bytes_to_prime_encoding(b"\\x0F")
            {0: [2, 3, 5, 7]}  # 0x0F = 0b00001111
        """
        encoding = {}
        for i, byte in enumerate(data):
            binary = format(byte, '08b')
            encoding[i] = self.binary_to_prime_sequence(binary)
        return encoding
    
    def prime_encoding_to_pirtm(self, prime_encoding: Dict[int, List[int]]) -> Dict[int, float]:
        """Convert prime encoding to PIRTM-compatible decomposition.
        
        Transforms the discrete prime sequences into continuous
        coefficients suitable for PIRTM's tensor operations.
        
        Args:
            prime_encoding: Dict mapping positions to prime sequences
            
        Returns:
            Prime decomposition with normalized coefficients
        """
        decomposition = {}
        total_primes = sum(len(primes) for primes in prime_encoding.values())
        
        if total_primes == 0:
            return {}
        
        # Uniform weighting per prime occurrence
        weight = 1.0 / total_primes
        
        for primes in prime_encoding.values():
            for prime in primes:
                decomposition[prime] = decomposition.get(prime, 0.0) + weight
                
        return decomposition
