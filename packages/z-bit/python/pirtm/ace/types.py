"""
ACE type definitions — frozen dataclasses for certification artifacts.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class CertLevel(str, Enum):
    """TRL mapping: L0=TRL-2, L1=TRL-2, L2=TRL-3, L3=TRL-3, L4=TRL-4."""
    L0_HEURISTIC = "L0-heuristic"
    L1_NORMBOUND = "L1-normbound"
    L2_POWERITER = "L2-poweriter"
    L3_NONEXPANSIVE = "L3-nonexpansive-clamp"
    L4_PERTURBATION = "L4-perturbation-budget"

    @property
    def trl(self) -> int:
        return {
            "L0-heuristic": 2,
            "L1-normbound": 2,
            "L2-poweriter": 3,
            "L3-nonexpansive-clamp": 3,
            "L4-perturbation-budget": 4,
        }[self.value]


@dataclass(frozen=True)
class AceCertificate:
    """
    Machine-checkable contraction certificate.
    Mirrors ContractionCertificate in packages/guardian/src/types/etp-types.ts.
    """
    level: CertLevel
    certified: bool
    lipschitz_upper: float          # ||K|| upper bound
    gap_lb: float                   # 1 - ||K|| (must be > 0 when certified=True)
    contraction_rate: float         # ||K|| (same as lipschitz_upper for this impl)
    budget_used: float              # Sigma b_p |w_p|
    tau: float                      # ACE budget tau
    delta: float                    # safety margin threshold
    margin: float                   # target - max_q (legacy compat with certify.py)
    tail_bound: float               # ISS tail bound
    details: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.certified and self.gap_lb <= 0:
            raise ValueError(
                f"AceCertificate.certified=True requires gap_lb > 0, "
                f"got {self.gap_lb}"
            )
        if self.lipschitz_upper < 0:
            raise ValueError("lipschitz_upper must be >= 0")


@dataclass
class AceBudgetState:
    tau: float = 1.0           # total budget
    consumed: float = 0.0      # Sigma b_p |w_p| so far
    depletion_rate: float = 0.0  # per-cycle consumption rate

    @property
    def remaining(self) -> float:
        return max(0.0, self.tau - self.consumed)

    @property
    def is_depleted(self) -> bool:
        return self.consumed >= self.tau
