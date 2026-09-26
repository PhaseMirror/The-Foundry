"""
Q-02: Gershgorin Guard (Tier 1).

Fast row-sum bound for contractivity check:

    r(Λ) ≤ max_i ( |a_ii| + Σ_{j≠i} |a_ij| )

If this bound < 1 − ε, contractivity is guaranteed in O(Kn) time
without eigenvalue computation.
"""
from __future__ import annotations

import enum
from dataclasses import dataclass
from typing import Union

import numpy as np
from scipy import sparse

from .network_gain import NetworkGainMatrix


class GuardVerdict(enum.Enum):
    """Result of Gershgorin Guard check."""
    PASS = "pass"            # contractivity confirmed
    INCONCLUSIVE = "inconclusive"  # bound too loose, escalate


@dataclass(frozen=True)
class GuardResult:
    """Full result of a Gershgorin Guard check."""
    verdict: GuardVerdict
    gershgorin_bound: float   # upper bound on spectral radius
    worst_row: int            # row with largest Gershgorin radius
    margin: float             # (1 - epsilon) - bound  (positive ⟹ PASS)
    is_diag_dominant: bool    # strict diagonal dominance


class GershgorinGuard:
    """Tier 1: fast row-sum contractivity check."""

    def check(
        self,
        matrix: Union[NetworkGainMatrix, np.ndarray, sparse.spmatrix],
        epsilon: float = 0.05,
    ) -> GuardResult:
        """Check contractivity via Gershgorin circle theorem.

        Returns PASS if bound < 1 - epsilon, INCONCLUSIVE otherwise.
        """
        radii = self._row_radii(matrix)
        bound = float(np.max(radii))
        worst = int(np.argmax(radii))
        margin = (1.0 - epsilon) - bound
        diag_dom = self._check_diagonal_dominance(matrix)

        verdict = GuardVerdict.PASS if margin > 0 else GuardVerdict.INCONCLUSIVE
        return GuardResult(
            verdict=verdict,
            gershgorin_bound=bound,
            worst_row=worst,
            margin=margin,
            is_diag_dominant=diag_dom,
        )

    def bound(
        self, matrix: Union[NetworkGainMatrix, np.ndarray, sparse.spmatrix]
    ) -> float:
        """Return the Gershgorin upper bound on spectral radius."""
        return float(np.max(self._row_radii(matrix)))

    # -- internals ---------------------------------------------------------

    def _row_radii(
        self, matrix: Union[NetworkGainMatrix, np.ndarray, sparse.spmatrix]
    ) -> np.ndarray:
        """Compute per-row Gershgorin radii: |a_ii| + Σ_{j≠i}|a_ij|."""
        if isinstance(matrix, NetworkGainMatrix):
            M = matrix.to_sparse()
        elif isinstance(matrix, np.ndarray):
            M = sparse.csr_matrix(matrix)
        else:
            M = sparse.csr_matrix(matrix)

        n = M.shape[0]
        abs_M = abs(M)
        row_sums = np.asarray(abs_M.sum(axis=1)).ravel()  # total absolute row sum
        diag = np.abs(np.asarray(M.diagonal()))
        # Gershgorin radius = |a_ii| + Σ_{j≠i}|a_ij| = row_sum (includes diag)
        # But actually the Gershgorin radius centered at a_ii has radius
        # R_i = Σ_{j≠i}|a_ij|, and the disc captures eigenvalues in
        # [a_ii - R_i, a_ii + R_i]. For spectral radius bound:
        # |λ| ≤ max_i (|a_ii| + R_i) = max_i Σ_j |a_ij| = ‖A‖_∞
        # This is equivalent to the infinity norm row bound.
        return row_sums

    def _check_diagonal_dominance(
        self, matrix: Union[NetworkGainMatrix, np.ndarray, sparse.spmatrix]
    ) -> bool:
        """Check strict diagonal dominance: |a_ii| > Σ_{j≠i}|a_ij| for all i."""
        if isinstance(matrix, NetworkGainMatrix):
            M = matrix.to_sparse()
        elif isinstance(matrix, np.ndarray):
            M = sparse.csr_matrix(matrix)
        else:
            M = sparse.csr_matrix(matrix)

        abs_M = abs(M)
        row_sums = np.asarray(abs_M.sum(axis=1)).ravel()
        diag = np.abs(np.asarray(M.diagonal()))
        off_diag = row_sums - diag
        return bool(np.all(diag > off_diag))
