"""T-02: CognitiveSession — session dataclass with lifecycle and snapshots."""

from __future__ import annotations

import copy
import hashlib
import json
import math
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from .prime_identity import is_prime


# ─── Lifecycle ───────────────────────────────────────────────────────


class SessionStatus(Enum):
    """Session lifecycle state machine."""

    ACTIVE = "active"
    CONVERGED = "converged"
    DIVERGENT = "divergent"
    FROZEN = "frozen"


_VALID_TRANSITIONS = {
    SessionStatus.ACTIVE: {SessionStatus.CONVERGED, SessionStatus.DIVERGENT, SessionStatus.FROZEN},
    SessionStatus.CONVERGED: {SessionStatus.FROZEN},
    SessionStatus.DIVERGENT: {SessionStatus.FROZEN},
    SessionStatus.FROZEN: set(),
}


# ─── ReasonStep ──────────────────────────────────────────────────────


@dataclass(frozen=True)
class ReasonStep:
    """A single reasoning step within a cognitive session."""

    step_id: int
    input_hash: str
    output_hash: str
    spectral_radius: float
    operator_norm: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if self.spectral_radius < 0:
            raise ValueError("Spectral radius must be non-negative")


class ContractionViolation(Exception):
    """Raised when a reasoning step would violate the contraction bound."""


# ─── ContractionBounds ───────────────────────────────────────────────


@dataclass(frozen=True)
class CognitiveContractionBounds:
    """Computed contraction bounds for a cognitive session."""

    session_prime_id: int
    global_bound: float
    per_step_bound: float
    braid_admissibility: bool = True
    rain_index_depth: int = 0

    def is_gate_t_compliant(self) -> bool:
        return (
            self.braid_admissibility
            and self.global_bound < 1.0
            and self.per_step_bound < 1.0
        )


# ─── CognitiveSession ───────────────────────────────────────────────


@dataclass
class CognitiveSession:
    """A reasoning session with prime-indexed identity."""

    prime_id: int
    state_vector: List[float] = field(default_factory=lambda: [1.0])
    contraction_bound: float = 0.99
    status: SessionStatus = SessionStatus.ACTIVE
    steps: List[ReasonStep] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not is_prime(self.prime_id):
            raise ValueError(f"session_id {self.prime_id} fails primality check")
        if self.contraction_bound <= 0 or self.contraction_bound >= 1:
            raise ValueError("contraction_bound must be in (0, 1)")

    # ── lifecycle ────────────────────────────────────────────────────

    def transition(self, target: SessionStatus) -> None:
        """Transition to a new lifecycle state."""
        if target not in _VALID_TRANSITIONS.get(self.status, set()):
            raise ValueError(
                f"Cannot transition from {self.status.value} to {target.value}"
            )
        self.status = target

    # ── reasoning ────────────────────────────────────────────────────

    def admit_step(self, step: ReasonStep) -> None:
        """Admit a reasoning step if it respects contraction bounds."""
        if self.status != SessionStatus.ACTIVE:
            raise ValueError(f"Session is {self.status.value}, cannot admit steps")
        if step.spectral_radius >= self.contraction_bound:
            raise ContractionViolation(
                f"Step ρ={step.spectral_radius} >= bound={self.contraction_bound}"
            )
        self.steps.append(step)

    # ── contraction bounds ───────────────────────────────────────────

    def compute_bounds(self) -> CognitiveContractionBounds:
        """Compute current contraction bounds from admitted steps."""
        if not self.steps:
            return CognitiveContractionBounds(
                session_prime_id=self.prime_id,
                global_bound=0.0,
                per_step_bound=0.0,
                rain_index_depth=0,
            )
        max_rho = max(s.spectral_radius for s in self.steps)
        global_bound = max_rho
        return CognitiveContractionBounds(
            session_prime_id=self.prime_id,
            global_bound=global_bound,
            per_step_bound=max_rho,
            rain_index_depth=len(self.steps),
        )

    # ── snapshot / restore ───────────────────────────────────────────

    def snapshot(self) -> Dict[str, Any]:
        """Serialize session to a dict for persistence."""
        return {
            "prime_id": self.prime_id,
            "state_vector": list(self.state_vector),
            "contraction_bound": self.contraction_bound,
            "status": self.status.value,
            "steps": [
                {
                    "step_id": s.step_id,
                    "input_hash": s.input_hash,
                    "output_hash": s.output_hash,
                    "spectral_radius": s.spectral_radius,
                    "operator_norm": s.operator_norm,
                    "metadata": s.metadata,
                }
                for s in self.steps
            ],
            "metadata": self.metadata,
        }

    @classmethod
    def restore(cls, data: Dict[str, Any]) -> CognitiveSession:
        """Restore session from a snapshot dict."""
        session = cls(
            prime_id=data["prime_id"],
            state_vector=data["state_vector"],
            contraction_bound=data["contraction_bound"],
            metadata=data.get("metadata", {}),
        )
        session.status = SessionStatus(data["status"])
        for s in data["steps"]:
            step = ReasonStep(
                step_id=s["step_id"],
                input_hash=s["input_hash"],
                output_hash=s["output_hash"],
                spectral_radius=s["spectral_radius"],
                operator_norm=s.get("operator_norm", 0.0),
                metadata=s.get("metadata", {}),
            )
            session.steps.append(step)
        return session

    # ── composite identity ───────────────────────────────────────────

    def composite_id(self, other: CognitiveSession) -> int:
        """Compute a composite identity with another session."""
        if self.prime_id == other.prime_id:
            raise ValueError("Sessions must have distinct prime identities")
        return self.prime_id * other.prime_id
