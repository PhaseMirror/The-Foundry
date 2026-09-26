"""
L0-heuristic: TRL-2. Wraps existing certify.py telemetry-based logic.
Use for development scaffolding only -- not for patent claim bodies.
"""
from __future__ import annotations

from typing import Sequence

from pirtm.step_types import StepInfo
from ..types import AceCertificate, CertLevel


def certify_l0(
    records: Sequence[StepInfo],
    *,
    tau: float = 1.0,
    tail_norm: float = 0.0,
    delta: float = 0.05,
) -> AceCertificate:
    if not records:
        raise ValueError("L0: no telemetry provided")

    target = 1.0 - min(r.epsilon for r in records)
    max_q = max(r.q for r in records)
    margin = target - max_q
    certified = margin >= delta
    lipschitz_upper = max_q
    gap_lb = 1.0 - lipschitz_upper

    tail_bound = (
        float("inf") if max_q >= 1.0
        else tail_norm / max(1e-12, 1.0 - max_q)
    )
    budget_used = sum(abs(getattr(r, "w", 0.0)) for r in records)

    return AceCertificate(
        level=CertLevel.L0_HEURISTIC,
        certified=certified,
        lipschitz_upper=lipschitz_upper,
        gap_lb=max(0.0, gap_lb),
        contraction_rate=max_q,
        budget_used=budget_used,
        tau=tau,
        delta=delta,
        margin=margin,
        tail_bound=tail_bound,
        details={"max_q": max_q, "target": target, "steps": len(records)},
    )
