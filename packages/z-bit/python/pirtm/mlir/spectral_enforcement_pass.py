"""
C-04: Spectral Enforcement Pass

Python implementation of the MLIR spectral enforcement pass that mirrors the
planned C++ PassWrapper<> implementation in spectral_enforcement_pass.cpp.

Mathematical contract (Spectral Small-Gain Theorem):
  A PIRTM module is safe iff r(Λ) < 1 − ε where r(Λ) is the spectral
  radius of the gain matrix Λ. This must be enforced at link time — not
  just at transpile time — to prevent gain-matrix substitution attacks.

Pass interface:
  pass = SpectralEnforcementPass(epsilon, spectral_radius)
  result = pass.run()
  if not result.passed:
      raise SpectralEnforcementError(result.diagnostic)

Link-time enforcement order (C-05):
  Pass 1 (Name Resolution) → Pass 2 (Commitment Crosscheck)
  → Pass 3 (Matrix Construction) → [SpectralEnforcementPass] → LLVM lowering

Reference: ADR-008, Gate C C-04
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class PassResult:
    """Result of a SpectralEnforcementPass.run() invocation."""
    passed: bool
    diagnostic: str
    spectral_radius: float
    epsilon: float
    threshold: float        # 1 - epsilon


class SpectralEnforcementError(RuntimeError):
    """
    Raised when a module fails the spectral small-gain enforcement.

    Analogous to a non-zero mlir-opt exit code with a diagnostic error.
    """


class SpectralEnforcementPass:
    """
    Link-time spectral radius enforcement pass.

    Enforces: r(Λ) < 1 − ε (strict inequality).

    If the condition is violated, run() returns a PassResult with
    passed=False and a diagnostic string that includes both r(Λ) and
    the threshold 1 − ε for easy debugging.

    Usage:
        enforcer = SpectralEnforcementPass(epsilon=0.05, spectral_radius=0.7)
        result = enforcer.run()
        if not result.passed:
            raise SpectralEnforcementError(result.diagnostic)
    """

    # Spec-stable diagnostic prefix (must not change without ADR amendment)
    DIAG_PREFIX = "spectral-small-gain: enforcement FAILED"

    def __init__(self, epsilon: float, spectral_radius: float,
                 module_name: str = "<unnamed>"):
        """
        Initialise the pass with module-level spectral metadata.

        Args:
            epsilon: Contractivity margin ε (from @epsilon in pirtm.module).
            spectral_radius: Spectral radius r(Λ) (from matrix construction).
            module_name: Human-readable module identifier for diagnostics.
        """
        if not (0.0 < epsilon < 1.0):
            raise ValueError(f"epsilon must be in (0, 1); got {epsilon}")
        if spectral_radius < 0.0:
            raise ValueError(f"spectral_radius must be ≥ 0; got {spectral_radius}")

        self.epsilon = epsilon
        self.spectral_radius = spectral_radius
        self.module_name = module_name

    def run(self) -> PassResult:
        """
        Execute the enforcement pass.

        Returns:
            PassResult with passed=True when r(Λ) < 1 − ε,
            or passed=False with a diagnostic message when violated.
        """
        threshold = 1.0 - self.epsilon

        if self.spectral_radius < threshold:
            return PassResult(
                passed=True,
                diagnostic=(
                    f"spectral-small-gain: PASS  "
                    f"r(Λ)={self.spectral_radius:.6f} < 1−ε={threshold:.6f}  "
                    f"module={self.module_name}"
                ),
                spectral_radius=self.spectral_radius,
                epsilon=self.epsilon,
                threshold=threshold,
            )
        else:
            return PassResult(
                passed=False,
                diagnostic=(
                    f"{self.DIAG_PREFIX}  "
                    f"r(Λ)={self.spectral_radius:.6f} ≥ 1−ε={threshold:.6f}  "
                    f"module={self.module_name}  "
                    f"(spectral radius violates r(Λ) < 1−ε invariant)"
                ),
                spectral_radius=self.spectral_radius,
                epsilon=self.epsilon,
                threshold=threshold,
            )

    @classmethod
    def from_module_metadata(
        cls,
        metadata: dict,
        spectral_radius: float,
        module_name: str = "<unnamed>",
    ) -> "SpectralEnforcementPass":
        """
        Construct a pass from pirtm.module @symbol metadata dict.

        Args:
            metadata: Dict containing at least 'epsilon'.
            spectral_radius: Spectral radius from matrix construction (Pass 3).
            module_name: Module identifier for diagnostics.
        """
        epsilon = float(metadata.get("epsilon", 0.05))
        return cls(
            epsilon=epsilon,
            spectral_radius=spectral_radius,
            module_name=module_name,
        )


def run_spectral_enforcement(
    epsilon: float,
    spectral_radius: float,
    module_name: str = "<unnamed>",
    raise_on_failure: bool = True,
) -> PassResult:
    """
    Convenience function: create and run the enforcement pass in one call.

    Args:
        epsilon: Contractivity margin ε.
        spectral_radius: Spectral radius r(Λ).
        module_name: Module name for diagnostics.
        raise_on_failure: If True (default), raises SpectralEnforcementError
                          on failure (mimics mlir-opt non-zero exit code).

    Returns:
        PassResult (only returned directly when raise_on_failure=False).

    Raises:
        SpectralEnforcementError: When r(Λ) ≥ 1 − ε and raise_on_failure=True.
    """
    pass_ = SpectralEnforcementPass(
        epsilon=epsilon,
        spectral_radius=spectral_radius,
        module_name=module_name,
    )
    result = pass_.run()
    if not result.passed and raise_on_failure:
        raise SpectralEnforcementError(result.diagnostic)
    return result


def enforce_network_spectral_condition(
    coupling_matrix: List[List[float]],
    epsilon: float,
    module_name: str = "<unnamed>",
    raise_on_failure: bool = True,
) -> PassResult:
    """
    Compute spectral radius from coupling matrix, then enforce condition.

    Args:
        coupling_matrix: N×N coupling gain matrix.
        epsilon: Contractivity margin ε.
        module_name: Module name for diagnostics.
        raise_on_failure: If True, raises on violation.

    Returns:
        PassResult with spectral_radius populated from the computed eigenvalue.
    """
    try:
        import numpy as np
        matrix = np.array(coupling_matrix, dtype=float)
        eigenvalues = np.linalg.eigvals(matrix)
        spectral_radius = float(np.max(np.abs(eigenvalues)))
    except ImportError:
        # Power-iteration fallback when NumPy is unavailable
        spectral_radius = _power_iteration(coupling_matrix)
    except Exception as exc:
        raise RuntimeError(
            f"spectral radius computation failed: {exc}"
        ) from exc

    return run_spectral_enforcement(
        epsilon=epsilon,
        spectral_radius=spectral_radius,
        module_name=module_name,
        raise_on_failure=raise_on_failure,
    )


def _power_iteration(matrix: List[List[float]], max_iter: int = 500) -> float:
    """
    Approximate spectral radius via power iteration.
    Used as NumPy fallback only.
    """
    n = len(matrix)
    if n == 0:
        return 0.0

    import math
    # Start with ones vector
    v = [1.0 / math.sqrt(n)] * n

    for _ in range(max_iter):
        # w = M @ v
        w = [sum(matrix[i][j] * v[j] for j in range(n)) for i in range(n)]
        norm = math.sqrt(sum(x * x for x in w))
        if norm < 1e-15:
            return 0.0
        v = [x / norm for x in w]

    # Final Rayleigh quotient
    w = [sum(matrix[i][j] * v[j] for j in range(n)) for i in range(n)]
    return abs(sum(v[i] * w[i] for i in range(n)))
