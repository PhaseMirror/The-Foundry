"""
L2-poweriter: TRL-3. Power iteration for tighter spectral radius rho(K).
Resolves ADR-001 open precision question: this measures SPECTRAL_ONLY,
not FULL_PIPELINE. Measurement domain = SPECTRAL_ONLY.
"""
from __future__ import annotations

import numpy as np

from ..types import AceCertificate, CertLevel

MEASUREMENT_DOMAIN = "SPECTRAL_ONLY"
MAX_ITER = 1000
TOL = 1e-8


def certify_l2(
    K: np.ndarray,
    *,
    tau: float = 1.0,
    delta: float = 0.05,
    max_iter: int = MAX_ITER,
    tol: float = TOL,
) -> AceCertificate:
    """
    K: the contraction operator matrix (n x n, real or complex).
    Uses power iteration to estimate rho(K) = spectral radius.
    """
    if K.ndim != 2 or K.shape[0] != K.shape[1]:
        raise ValueError("K must be a square matrix")

    n = K.shape[0]
    rng = np.random.default_rng(seed=42)
    v = rng.standard_normal(n)
    v = v / (np.linalg.norm(v) + 1e-12)

    rho_prev = 0.0
    iterations_used = 0
    for i in range(max_iter):
        Kv = K @ v
        rho = float(np.linalg.norm(Kv))
        v = Kv / (rho + 1e-12)
        iterations_used = i + 1
        if abs(rho - rho_prev) < tol:
            break
        rho_prev = rho

    lipschitz_upper = rho
    gap_lb = 1.0 - lipschitz_upper
    certified = lipschitz_upper < (1.0 - delta)

    return AceCertificate(
        level=CertLevel.L2_POWERITER,
        certified=certified,
        lipschitz_upper=lipschitz_upper,
        gap_lb=max(0.0, gap_lb),
        contraction_rate=lipschitz_upper,
        budget_used=lipschitz_upper,
        tau=tau,
        delta=delta,
        margin=gap_lb - delta,
        tail_bound=float("inf") if lipschitz_upper >= 1.0
                   else tau / max(1e-12, gap_lb),
        details={
            "measurement_domain": MEASUREMENT_DOMAIN,
            "matrix_shape": list(K.shape),
            "iterations_used": iterations_used,
            "tol": tol,
        },
    )
