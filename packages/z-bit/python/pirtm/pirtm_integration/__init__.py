"""PIRTM Integration Layer for Top-Secret Modules

This module provides a standardized interface between PIRTM (Prime-Indexed 
Recursive Tensor Mathematics) and the existing Top-Secret implementations
(ACFL, CRMF, CCRE, DHT, WKD, etc.).

Key Features:
- Prime decomposition utilities
- Automatic state encoding/decoding
- Spectral radius computation bridges
- Contraction certificate adapters
- Binary to PIRTM translation
- Integration with existing module contracts

Usage:
    from pirtm_integration import PrimeEncoder, ContractionBridge
    
    encoder = PrimeEncoder()
    state_prime = encoder.encode_to_prime(state_vector)
    
    bridge = ContractionBridge()
    cert = bridge.certify_convergence(operator, state)
"""

__version__ = "0.1.0"

from .prime_encoder import PrimeEncoder, BinaryToPrimeTranslator
from .contraction_bridge import ContractionBridge, SpectralBridge
from .state_adapter import StateAdapter, PrimeStateVector
from .module_connectors import ACFLConnector, CRMFConnector, CCREConnector, DHTConnector

__all__ = [
    "PrimeEncoder",
    "BinaryToPrimeTranslator",
    "ContractionBridge",
    "SpectralBridge",
    "StateAdapter",
    "PrimeStateVector",
    "ACFLConnector",
    "CRMFConnector",
    "CCREConnector",
    "DHTConnector",
]
