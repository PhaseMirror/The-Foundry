"""
PIRTM Projection Operator - State Space Clipping (Phase 1+)

Projection onto the unit ball: P(x) = clip(x, -1, 1)

This ensures all states remain bounded, which is essential for:
1. Contractivity preservation (L0 invariant)
2. Numerical stability (prevents overflow)
3. Physical meaningfulness (PIRTM states are normalized)

Refactored for backend abstraction (Phase 1 Liberation).
See ADR-006 for backend protocol, ADR-004 for contractivity semantics.
See ADR-003 for parameterized projector strategy.

Reference: docs/PHASE_1_EXPANDED.md (Days 3-4 refactoring)
"""

from typing import Literal, Optional
from ..backend import TensorBackend, Array, Scalar, current_backend

# Type alias for projector selection (ADR-003)
ProjectorKind = Literal["clip", "ball", "tanh"]


def project(
    x: Array,
    min_val: Scalar = -1.0,
    max_val: Scalar = 1.0,
    projector: ProjectorKind = "clip",
    backend: Optional[TensorBackend] = None,
) -> Array:
    """
    Project array onto bounded interval [min_val, max_val].
    
    Args:
        x: Input array (any shape)
        min_val: Lower bound (default -1.0)
        max_val: Upper bound (default 1.0)
        projector: Projection method - "clip", "ball", or "tanh" (default "clip")
        backend: TensorBackend to use (defaults to current)
    
    Returns:
        Projected array with values bounded according to projector type
    
    Contractivity: All projectors are nonexpansive:
      ||P(x) - P(y)|| ≤ ||x - y||
    
    This preserves contractivity of the overall recurrence.
    
    Note (ADR-003):
        - "clip": Hard clipping to [min_val, max_val], always at boundary if needed
        - "ball": L2 ball projection, preserves norm bound
        - "tanh": Soft tanh projection, asymptotically approaches ±1 but never reaches
    """
    if backend is None:
        backend = current_backend()
    
    if projector == "clip":
        return backend.clip(x, min_val, max_val)
    elif projector == "ball":
        return project_ball(x, radius=max_val, backend=backend)
    elif projector == "tanh":
        return backend.tanh(x)
    else:
        raise ValueError(f"Unknown projector: {projector}")


def project_ball(
    x: Array,
    radius: Scalar = 1.0,
    backend: Optional[TensorBackend] = None,
) -> Array:
    """
    Project array onto L2 ball of given radius.
    
    Useful for constraining state norm: ||x'|| ≤ radius
    
    Args:
        x: Input array
        radius: Ball radius (default 1.0)
        backend: TensorBackend to use
    
    Returns:
        Projected array with norm ≤ radius
    """
    if backend is None:
        backend = current_backend()
    
    norm_x = backend.norm(x, order=2)
    
    if norm_x <= radius:
        return x
    
    # Scale down to fit in ball
    scale = radius / (norm_x + 1e-10)
    return backend.multiply(x, scale)


def bounded_state_check(
    x: Array,
    min_val: Scalar = -1.0,
    max_val: Scalar = 1.0,
    projector: ProjectorKind = "clip",
    tol: float = 1e-10,
    backend: Optional[TensorBackend] = None,
) -> bool:
    """
    Check if array satisfies boundedness condition for the given projector.
    
    Used in verification and testing to detect L0 invariant violations.
    
    Args:
        x: Input array
        min_val: Lower bound
        max_val: Upper bound
        projector: Projection method - "clip", "ball", or "tanh" (default "clip")
        tol: Tolerance for difference norm check (default 1e-10)
        backend: TensorBackend to use
    
    Returns:
        True if array satisfies boundedness for the given projector
    
    Note (ADR-003):
        The check logic depends on the projector type:
        - "clip": Check if clipping distance is < tol (fully at boundary)
        - "ball": Check if norm is <= radius
        - "tanh": Check if all values in open interval (-1, 1)
        
        Must match the projector used in project() for consistency!
    """
    if backend is None:
        backend = current_backend()
    
    if projector == "tanh":
        # tanh(x) ∈ (-1, 1) strictly—check membership in open interval
        projected = backend.tanh(x)
        import numpy as np
        return bool(
            np.all(projected > min_val) and 
            np.all(projected < max_val)
        )
    elif projector == "ball":
        # Check if norm is within radius
        norm_x = backend.norm(x, order=2)
        return norm_x <= max_val + tol
    else:  # "clip" or default
        # Check distance from clipping (if at boundary, distance is small)
        projected = backend.clip(x, min_val, max_val)
        diff_norm = backend.norm(backend.add(x, backend.multiply(projected, -1.0)))
        return diff_norm < tol


__all__ = ["project", "project_ball", "bounded_state_check"]
