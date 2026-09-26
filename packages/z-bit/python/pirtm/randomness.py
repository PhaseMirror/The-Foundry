"""Deterministic randomness interfaces for Gate K and PIRTM.

The goal is to make any component that consumes randomness (policy, kernel,
other gate logic) explicitly declare that dependency so that randomness can be
sourced from an auditable, deterministic stream (e.g., `MultiplicityCoreEngine.PublicRandom`).

This allows gate evaluation to be fully traceable and reproducible.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from pirtm.core.multiplicity_core import MultiplicityCoreEngine


@runtime_checkable
class RandomnessConsumer(Protocol):
    """Protocol for components that consume deterministic randomness."""

    def set_random_stream(self, rng: MultiplicityCoreEngine.PublicRandom) -> None:
        """Configure the consumer with a deterministic randomness stream."""
        ...


__all__ = ["RandomnessConsumer"]
