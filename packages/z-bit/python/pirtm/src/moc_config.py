from dataclasses import dataclass, field
from typing import List

@dataclass(frozen=True)
class MOCConfig:
    """
    Formal configuration for MOC resonance evaluation.
    This ensures deterministic results across the Phase Mirror ecosystem.
    """
    lambda_weights: List[float] = field(default_factory=lambda: [0.4, 0.35, 0.25])
    # Default tier weighting η_d (can be updated via registry for specific experiments)
    eta_d_default: float = 1.0 
    
    # Validation constraints for audit trails
    r1_min: float = 0.8
    r2_min: float = 0.7
    r3_min: float = 0.6
