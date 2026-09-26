"""
L1-normbound: TRL-2. ||K|| <= Sigma b_p |w_p| -- weighted-l1 norm bound.
This is the bound that ETP's l_safe derivation depends on (ADR-001).
"""
from __future__ import annotations

from typing import Sequence

from ..types import AceCertificate, CertLevel


def certify_l1(
    weights: Sequence[float],
    basis_norms: Sequence[float],
    *,
    tau: float = 1.0,
    delta: float = 0.05,
) -> AceCertificate:
    """
    weights:     w_p coefficients in K = Sigma_p w_p B_p
    basis_norms: ||B_p|| for each prime-indexed basis operator
    """
    if len(weights) != len(basis_norms):
        raise ValueError("weights and basis_norms must have equal length")
    if not weights:
        raise ValueError("L1: empty weight/norm vectors")

    lipschitz_upper = float(sum(abs(w) * b for w, b in zip(weights, basis_norms)))
    budget_used = lipschitz_upper
    gap_lb = 1.0 - lipschitz_upper
    certified = lipschitz_upper < (1.0 - delta)

    return AceCertificate(
        level=CertLevel.L1_NORMBOUND,
        certified=certified,
        lipschitz_upper=lipschitz_upper,
        gap_lb=max(0.0, gap_lb),
        contraction_rate=lipschitz_upper,
        budget_used=budget_used,
        tau=tau,
        delta=delta,
        margin=gap_lb - delta,
        tail_bound=float("inf") if lipschitz_upper >= 1.0 else tau / max(1e-12, gap_lb),
        details={
            "weights": list(weights),
            "basis_norms": list(basis_norms),
            "n_operators": len(weights),
        },
    )
