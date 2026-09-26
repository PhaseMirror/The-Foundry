"""Type definitions for the Multiplicity-LWE primitive.

This module is intentionally small and dependency-free.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final, Tuple


ScaleSet = Tuple[int, int, int, int]
PrimeSet = Tuple[int, ...]

#: Fixed scale set constant used throughout Gate K.
SCALES: Final[ScaleSet] = (0, 1, 2, 3)


@dataclass(frozen=True)
class MultiplicityParams:
    """Typed parameter record for the Multiplicity-LWE primitive.

    This is a light-weight container; invariants are enforced by the
    loader/validator (`load_params`).
    Now supports versioned scale sets.
    """

    version: str
    prime_set: PrimeSet
    scales: ScaleSet
    q: int
    alpha: float
    lambda_m: float
    gamma: float
    noise_type: str
    noise_k: int
    scales_version: str = "v1"  # New field for schema versioning (moved to end)

    def __post_init__(self) -> None:
        # Invariants are checked by load_params; this guard is a sanity check
        # to prevent accidental misuse of the dataclass in tests or intermediate
        # code.
        if self.scales_version == "v1":
            if self.scales != SCALES:
                raise ValueError(f"scales (v1) must be exactly {SCALES}")
        # Future: add more versioned scale checks here

        if self.noise_type != "binomial":
            raise ValueError("only 'binomial' noise type is supported")
