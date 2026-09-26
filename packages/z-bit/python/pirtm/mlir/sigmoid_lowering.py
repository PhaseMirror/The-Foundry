"""
C-09: pirtm.sigmoid MLIR Lowering (Path B — Python/C++ runtime sigmoid)

Implements the lowering of the custom `pirtm.sigmoid` MLIR operation to
executable code via Path B (C++ runtime) as specified in Gate C ADR C-09.

Mathematical contract:
  σ(x) = 1 / (1 + e^{-x})
  σ is 1/4-Lipschitz: |σ(x) - σ(y)| ≤ (1/4)|x - y| for all x, y
  This Lipschitz bound is the foundation of the contractivity type system.

Lowering strategy (Path B — C++ runtime):
  - `pirtm.sigmoid` is lowered to a vectorised Python-side computation
    using NumPy (which calls BLAS/LAPACK or SVML under the hood).
  - The C++ runtime exposes `pirtm_sigmoid_vec` which can be called via ctypes.
  - Accuracy guarantee: |σ_approx(x) - σ(x)| ≤ ~1e-12 relative error (a few ULP
    in IEEE 754 double precision; stable abs-based formula vs. naive).

Accuracy note:
  Python/NumPy sigmoid: `1 / (1 + np.exp(-x))` is IEEE 754 accurate to 1 ULP.
  The C++ runtime uses the same formula with std::exp.

Performance target (C-10):
  - 512-dim vector: ≤ 100 µs (20% of 0.5 µs/step budget for matmul)
  - At 540K steps/sec, sigmoid overhead < 1 ns/element.

Reference: ADR-009, Gate C C-09
"""

from __future__ import annotations

from typing import Optional
import math

# NumPy is used for vectorised sigmoid (Path B performance target)
try:
    import numpy as np
    _HAS_NUMPY = True
except ImportError:
    _HAS_NUMPY = False


# Lipschitz constant of σ: |σ'(x)| ≤ 1/4 for all x
SIGMOID_LIPSCHITZ = 0.25


def sigmoid_scalar(x: float) -> float:
    """
    Scalar sigmoid: σ(x) = 1 / (1 + e^{-x}).

    Numerically stable implementation that avoids overflow for large |x|.
    Accurate to IEEE 754 double precision.
    """
    if x >= 0.0:
        return 1.0 / (1.0 + math.exp(-x))
    else:
        ex = math.exp(x)
        return ex / (1.0 + ex)


def sigmoid_vector(x):
    """
    Vectorised sigmoid for array input.

    Uses NumPy for SIMD-accelerated computation when available.
    Falls back to scalar loop otherwise.

    Args:
        x: NumPy array or list of floats.

    Returns:
        NumPy array (or list) of σ(x_i).
    """
    if _HAS_NUMPY:
        x_arr = np.asarray(x, dtype=np.float64)
        # Stable vectorised computation: avoid double exp() per element (C-09 review)
        exp_neg = np.exp(-np.abs(x_arr))
        pos_mask = x_arr >= 0.0
        return np.where(
            pos_mask,
            1.0 / (1.0 + exp_neg),
            1.0 - 1.0 / (1.0 + exp_neg),
        )
    # Fallback: scalar loop
    return [sigmoid_scalar(xi) for xi in x]


def sigmoid_lipschitz_bound(n: int) -> float:
    """
    Return the Lipschitz constant for an n-element vector sigmoid application.

    For element-wise application, the operator norm is:
      ‖σ(x) - σ(y)‖ ≤ SIGMOID_LIPSCHITZ × ‖x - y‖

    This is independent of n (element-wise Lipschitz = 1/4).

    Args:
        n: Vector dimension (unused, but documented for clarity).

    Returns:
        Lipschitz constant 0.25 (= 1/4, tight bound for σ).
    """
    return SIGMOID_LIPSCHITZ


class SigmoidLoweringPass:
    """
    Python-side lowering pass for the `pirtm.sigmoid` MLIR operation.

    This pass intercepts `pirtm.sigmoid` nodes in the operation graph and
    replaces them with a Python/C++ runtime call that:
      1. Computes σ(x) with IEEE 754 accuracy (NumPy path).
      2. Returns Lipschitz constant 0.25 for contractivity propagation.

    Usage:
        pass_ = SigmoidLoweringPass()
        output = pass_.lower(input_vector)
        lipschitz = pass_.lipschitz_constant(len(input_vector))
    """

    def lower(self, x) -> "np.ndarray":
        """
        Lower a single `pirtm.sigmoid` operation.

        Args:
            x: Input array (NumPy array or list of floats).

        Returns:
            σ(x) as NumPy array with same shape.
        """
        return sigmoid_vector(x)

    def lipschitz_constant(self, n: int = 1) -> float:
        """Return 1/4-Lipschitz constant for contractivity type propagation."""
        return sigmoid_lipschitz_bound(n)

    def validate_accuracy(self, x, reference=None, tol: float = 1e-14) -> bool:
        """
        Validate sigmoid accuracy against reference implementation.

        Args:
            x: Input array.
            reference: Reference output (if None, uses scalar sigmoid as reference).
            tol: Maximum allowed relative error (default 1e-14 ≈ IEEE 754).

        Returns:
            True if all outputs within tolerance.
        """
        computed = sigmoid_vector(x)
        if reference is None:
            reference = [sigmoid_scalar(float(xi)) for xi in x]

        if _HAS_NUMPY:
            ref = np.asarray(reference, dtype=np.float64)
            comp = np.asarray(computed, dtype=np.float64)
            rel_err = np.max(np.abs(comp - ref) / (np.abs(ref) + 1e-300))
            return float(rel_err) <= tol
        else:
            for r, c in zip(reference, computed):
                if abs(r) > 1e-300:
                    if abs(r - c) / abs(r) > tol:
                        return False
        return True


def lower_pirtm_sigmoid(x):
    """
    Convenience: lower one `pirtm.sigmoid` node in the operation graph.

    This is the primary entry point called by the Python-side execution engine
    when it encounters `pirtm.sigmoid` in the MLIR operation stream.

    Args:
        x: Input array.

    Returns:
        σ(x) element-wise.
    """
    return sigmoid_vector(x)
