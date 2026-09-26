"""T-05: RAIN — Recursive Audit Index Network.

Every reasoning step produces an auditable entry with spectral radius
and a proof stub.  Supports linear chains, tree structures for
interactions, recursive proof aggregation, and tamper detection.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


# ─── RAIN step ───────────────────────────────────────────────────────


@dataclass(frozen=True)
class RAINStep:
    """A single audit entry in the RAIN index."""

    prime_id: int
    step_index: int
    spectral_radius: float
    zk_proof_hash: str
    state_hash: str
    parent_step: Optional[int] = None
    crossing_ref: Optional[int] = None  # braid crossing index

    def to_dict(self) -> Dict[str, Any]:
        return {
            "prime_id": self.prime_id,
            "step_index": self.step_index,
            "spectral_radius": self.spectral_radius,
            "zk_proof_hash": self.zk_proof_hash,
            "state_hash": self.state_hash,
            "parent_step": self.parent_step,
            "crossing_ref": self.crossing_ref,
        }


# ─── Proof stub ──────────────────────────────────────────────────────


def generate_proof_hash(prime_id: int, step_index: int, spectral_radius: float) -> str:
    """Generate a deterministic proof stub hash for a step.

    In production this would invoke a ZK-SNARK prover.
    For Gate T we use a SHA-256 placeholder.
    """
    payload = f"{prime_id}:{step_index}:{spectral_radius:.15f}".encode()
    return hashlib.sha256(payload).hexdigest()


def generate_state_hash(prime_id: int, step_index: int, data: str = "") -> str:
    """Hash the session state at a given step."""
    payload = f"state:{prime_id}:{step_index}:{data}".encode()
    return hashlib.sha256(payload).hexdigest()


# ─── RAIN Index ──────────────────────────────────────────────────────


class RAINIndex:
    """Recursive Audit Index for a single cognitive session.

    Maintains an append-only chain of RAINStep entries with optional
    tree branching for interaction-induced forks.
    """

    def __init__(self, prime_id: int) -> None:
        self._prime_id = prime_id
        self._steps: List[RAINStep] = []
        self._step_map: Dict[int, RAINStep] = {}

    @property
    def prime_id(self) -> int:
        return self._prime_id

    @property
    def depth(self) -> int:
        return len(self._steps)

    # ── recording ────────────────────────────────────────────────────

    def record_step(
        self,
        step_index: int,
        spectral_radius: float,
        state_data: str = "",
        crossing_ref: Optional[int] = None,
    ) -> RAINStep:
        """Record a reasoning step into the RAIN index."""
        parent = self._steps[-1].step_index if self._steps else None
        proof_hash = generate_proof_hash(self._prime_id, step_index, spectral_radius)
        state_hash = generate_state_hash(self._prime_id, step_index, state_data)

        entry = RAINStep(
            prime_id=self._prime_id,
            step_index=step_index,
            spectral_radius=spectral_radius,
            zk_proof_hash=proof_hash,
            state_hash=state_hash,
            parent_step=parent,
            crossing_ref=crossing_ref,
        )
        self._steps.append(entry)
        self._step_map[step_index] = entry
        return entry

    # ── queries ──────────────────────────────────────────────────────

    def get_step(self, step_index: int) -> Optional[RAINStep]:
        return self._step_map.get(step_index)

    def all_steps(self) -> List[RAINStep]:
        return list(self._steps)

    def max_spectral_radius(self) -> float:
        if not self._steps:
            return 0.0
        return max(s.spectral_radius for s in self._steps)

    def is_gate_t_compliant(self) -> bool:
        return self.coverage() == 1.0 and self.max_spectral_radius() < 1.0

    # ── coverage ─────────────────────────────────────────────────────

    def coverage(self) -> float:
        """Fraction of steps with proof entries.  1.0 = no gaps."""
        if not self._steps:
            return 1.0
        total = max(s.step_index for s in self._steps) + 1
        covered = len(self._step_map)
        return covered / total

    def find_gaps(self) -> List[int]:
        """Return step indices that are missing from the index."""
        if not self._steps:
            return []
        max_idx = max(s.step_index for s in self._steps)
        return [i for i in range(max_idx + 1) if i not in self._step_map]

    # ── proof aggregation ────────────────────────────────────────────

    def aggregate_proof(self) -> str:
        """Compute an aggregate proof hash (Π = π₁ ∘ π₂ ∘ … ∘ π_n)."""
        if not self._steps:
            return hashlib.sha256(b"empty").hexdigest()
        combined = ":".join(s.zk_proof_hash for s in self._steps)
        return hashlib.sha256(combined.encode()).hexdigest()

    # ── tamper detection ─────────────────────────────────────────────

    def verify_chain(self) -> Tuple[bool, List[str]]:
        """Verify the RAIN chain has no tampered or missing entries."""
        errors: List[str] = []
        for i, step in enumerate(self._steps):
            expected_proof = generate_proof_hash(
                step.prime_id, step.step_index, step.spectral_radius,
            )
            if step.zk_proof_hash != expected_proof:
                errors.append(f"Step {step.step_index}: proof hash mismatch")
            if i > 0 and step.parent_step != self._steps[i - 1].step_index:
                errors.append(f"Step {step.step_index}: parent chain broken")
        gaps = self.find_gaps()
        if gaps:
            errors.append(f"Missing steps: {gaps}")
        return (len(errors) == 0, errors)

    # ── export ───────────────────────────────────────────────────────

    def export(self) -> Dict[str, Any]:
        return {
            "prime_id": self._prime_id,
            "depth": self.depth,
            "max_spectral_radius": self.max_spectral_radius(),
            "aggregate_proof": self.aggregate_proof(),
            "gate_t_compliant": self.is_gate_t_compliant(),
            "steps": [s.to_dict() for s in self._steps],
        }
