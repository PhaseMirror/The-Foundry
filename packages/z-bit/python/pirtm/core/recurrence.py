"""
PIRTM Recurrence Loop - Core Contractive Iteration (Phase 1+)

The fundamental recurrence relation:
  X_{t+1} = P(Ξ_t X_t + Λ_t T(X_t) + G_t)

Where:
  - P: Projection operator (clipping to [-1, 1])
  - Ξ_t: Identity operator (or general linear operator)
  - Λ_t: Aggregation operator (learns how much to weight transformation)
  - G_t: Growth/guidance term (external input)
  - T: Nonlinear transformation (sigmoid)

Refactored for backend abstraction (Phase 1 Liberation).
See ADR-006 for backend protocol, ADR-004 for contractivity semantics.

Reference: docs/PHASE_1_EXPANDED.md (Days 3-4 refactoring)
"""

from typing import Any, Callable, Dict, Optional, Tuple
from ..backend import Array, Scalar, TensorBackend, current_backend
from ..policy import PIRTMPolicy


def step(
    X_t: Array,
    Xi_t: Array,
    Lambda_t: Array,
    G_t: Optional[Array] = None,
    T_func: Optional[Callable[[Array], Array]] = None,
    backend: Optional[TensorBackend] = None,
    *,
    epsilon: float = 0.05,
    lambda_m: float = 1.0,
    L_T: float = 1.0,
    debug: bool = False,
) -> Tuple[Array, Dict[str, Any]]:
    """
    Execute one step of the PIRTM recurrence with frozen semantics.
    
    Computes: X_{t+1} = (1 - λ_m)X_t + λ_m P(Ξ_t X_t + Λ_t T(X_t) + G_t)
    
    Semantics:
        - Projection P: Formally defined as clipping to the interval [-1, 1].
        - Norm: All contractivity checks use the L2 spectral norm (order=2).
        - Lipschitz: Account for the Lipschitz constant L_T of the transformation T.
    
    Args:
        X_t: Current state vector, shape (n,)
        Xi_t: Linear operator (identity or general), shape (n, n)
        Lambda_t: Aggregation operator, shape (n, n)
        G_t: Optional growth term, shape (n,). Defaults to zeros.
        T_func: Nonlinear transformation. Defaults to sigmoid.
        backend: TensorBackend to use. Defaults to current backend.
        epsilon: Contraction margin threshold (default 0.05)
        lambda_m: Multiplicity update parameter (default 1.0)
        L_T: Lipschitz constant of T_func (default 1.0)
        debug: If True, include per-step norm metadata (default False)
    
    Returns:
        Tuple of (X_next, metadata) where:
        - X_next: Next state vector, shape (n,)
        - metadata: Dict with q_t, margin, and optional debug info
    
    Contractivity Guarantee:
        c(λ_m) = (1 - λ_m) + λ_m (||Ξ|| + ||Λ||·L_T)
        If c(λ_m) < 1 - ε, then contraction is certified.
        The margin = (1 - ε) - c(λ_m) is computed and monitored.
    """
    if backend is None:
        backend = current_backend()
    
    if T_func is None:
        T_func = lambda x: backend.sigmoid(x)
    
    if G_t is None:
        G_t = backend.zeros(X_t.shape)
    
    # Compute each term
    term1 = backend.matmul(Xi_t, X_t)
    T_X_t = T_func(X_t)
    term2 = backend.matmul(Lambda_t, T_X_t)
    
    # Sum: Y_t = Ξ X_t + Λ T(X_t) + G_t
    Y_t = backend.add(term1, term2)
    Y_t = backend.add(Y_t, G_t)
    
    # Inner Projection P: clip(Y_t, -1, 1)
    P_Y_t = backend.clip(Y_t, -1.0, 1.0)

    # Convex Update: X_{t+1} = (1 - λ_m)X_t + λ_m P(Y_t)
    if lambda_m == 1.0:
        X_next = P_Y_t
    else:
        # Use scalar multiplication via backend.multiply (supported by NumPy)
        term_stay = backend.multiply(1.0 - lambda_m, X_t)
        term_move = backend.multiply(lambda_m, P_Y_t)
        X_next = backend.add(term_stay, term_move)
    
    # Compute contractivity metric (PIRTM_CORE_SPEC.md: λ_m governed contraction)
    # c_lambda = (1 - λ_m) + λ_m * (||Ξ||_2 + ||Λ||_2 * L_T)
    nXi = float(backend.norm(Xi_t, order=2))
    nLam = float(backend.norm(Lambda_t, order=2))
    c_lambda = (1.0 - lambda_m) + lambda_m * (nXi + nLam * L_T)
    margin = (1.0 - epsilon) - c_lambda
    
    # Warn if margin degraded (below 5% safety threshold)
    if margin < 0.05:
        import warnings
        warnings.warn(
            f"Contractivity margin {margin:.4f} < 0.05 — certificate at risk (lambda_m={lambda_m})",
            stacklevel=2,
        )
    
    # Metadata for debugging and monitoring
    metadata: Dict[str, Any] = {
        "q_t": nXi + nLam * L_T,
        "c_lambda": c_lambda,
        "margin": margin,
        "epsilon": epsilon,
        "lambda_m": lambda_m,
        "L_T": L_T,
        "backend": backend.name(),
    }
    
    # Bridge to formal Lean 4 theorems (SEAL Phase)
    from .certify import FormalStabilityCertificate
    formal_cert = FormalStabilityCertificate(
        lambda_m=lambda_m,
        norm_Xi=nXi,
        norm_Lambda=nLam,
        L_T=L_T,
        epsilon=epsilon
    )
    metadata["formal_bridge"] = formal_cert.to_bridge_dict()
    metadata["is_formally_compliant"] = formal_cert.verify_compliance()
    
    # Gate overhead norm calls behind debug flag (Gate 7 optimization)
    if debug:
        metadata["norm_X_t"] = backend.norm(X_t, order=2)
        metadata["norm_X_next"] = backend.norm(X_next, order=2)
        metadata["norm_Y_t"] = backend.norm(Y_t, order=2)
    
    return X_next, metadata


def iterate(
    X_0: Array,
    policy: PIRTMPolicy,
    kernel: Any,  # FullAsymmetricAttributionKernel
    steps: int,
    backend: Optional[TensorBackend] = None,
    lambda_m: float = 1.0,
    L_T: float = 1.0,
) -> Dict[str, Any]:
    """
    Execute multiple recurrence steps with policy-driven operators.
    
    Args:
        X_0: Initial state vector
        policy: Must implement PIRTMPolicy protocol
        kernel: FullAsymmetricAttributionKernel instance
        steps: Number of iterations
        backend: TensorBackend to use
        lambda_m: Multiplicity update parameter (default 1.0)
        L_T: Lipschitz constant of T transformation (default 1.0)
    
    Returns:
        Dict with trajectory and metadata:
        - trajectory: List of state vectors over time
        - final_state: Final state after all steps
        - steps: Number of iterations completed
        - backend: Backend name used
    
    Raises:
        TypeError: If policy does not implement PIRTMPolicy protocol
    
    Note (ADR-004):
        The policy must provide goal_budget attribute and methods Xi_t, Lambda_t, G_t.
        This function enforces the protocol at entry to catch missing attributes early.
        Integration with Multiplicity ledger system (Phase 2+) is pending.
    """
    # Enforce PIRTMPolicy protocol at entry (ADR-004)
    if not isinstance(policy, PIRTMPolicy):
        raise TypeError(
            f"policy must implement PIRTMPolicy protocol "
            f"(required: Xi_t, Lambda_t, G_t, goal_budget). "
            f"Got: {type(policy).__name__}"
        )
    
    if backend is None:
        backend = current_backend()
    
    trajectory = [X_0]
    X_t = X_0
    
    for t in range(steps):
        # Get operators from policy (now guaranteed to have these methods)
        Xi_t = policy.Xi_t(t)
        Lambda_t = policy.Lambda_t(t)
        G_t = policy.G_t(t)
        
        X_t, _ = step(X_t, Xi_t, Lambda_t, G_t, backend=backend, lambda_m=lambda_m, L_T=L_T)
        trajectory.append(X_t)
    
    return {
        "trajectory": trajectory,
        "final_state": X_t,
        "steps": steps,
        "backend": backend.name(),
    }


__all__ = ["step", "iterate"]
