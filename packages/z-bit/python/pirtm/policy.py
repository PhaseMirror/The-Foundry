"""
PIRTM Policy Protocol — Type-Safe Policy Interface

Defines PIRTMPolicy as a structural protocol for AGI-layer policy objects
that drive the recurrence loop. Replaces duck-typed getattr fallbacks with
explicit protocol enforcement.

See ADR-004 for design rationale and implementation details.
"""
from __future__ import annotations
from typing import Protocol, runtime_checkable
from .backend import Array


@runtime_checkable
class PIRTMPolicy(Protocol):
    """
    Structural protocol for PIRTM-compatible policy objects.
    
    Any policy used in iterate() must implement this interface.
    The goal_budget attribute is the enforcement surface for the
    contractivity-preserving G_t injection bound:
    
        ∑_k ε_k < (1 - γ_i) · ||P_i||⁻¹
    
    Where:
        - ε_k: epsilon values (contraction margins per module)
        - γ_i: per-module contraction rate
        - P_i: module projection operator norm
    
    Attributes:
        goal_budget: float
            Upper bound on aggregated G-channel epsilon contributions.
            Used to enforce contractivity-preserving bounds in iterate().
    
    Methods:
        Xi_t(t: int) -> Array
            Return coefficient operator matrix at time step t.
            Shape: (n, n)
        
        Lambda_t(t: int) -> Array
            Return aggregation/recurrence weight at time step t.
            Shape: (n, n)
        
        G_t(t: int) -> Array
            Return control/injection channel at time step t.
            Shape: (n,) or (n, n)
    """
    goal_budget: float

    def Xi_t(self, t: int) -> Array:
        """Coefficient matrix at time step t."""
        ...

    def Lambda_t(self, t: int) -> Array:
        """Recurrence weight at time step t."""
        ...

    def G_t(self, t: int) -> Array:
        """Control/injection channel at time step t."""
        ...


__all__ = ["PIRTMPolicy"]
