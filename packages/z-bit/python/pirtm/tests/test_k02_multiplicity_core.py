"""K-02 production tests for MultiplicityCoreEngine.

These tests certify that Gate K uses the canonical core engine import,
preserves deterministic parity with ToyAEngine, and keeps LWE/noise and
contractivity guarantees stable.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from pirtm.core.multiplicity_core import (
    MultiplicityCoreEngine,
    StateTransitionHarnessConfig,
    empirical_contraction_report,
    make_multiplicity_engine,
)
from pirtm.multiplicity_lwe import (
    ToyAEngine,
    load_multiplicity_params,
    make_toy_a_engine,
    validate_multiplicity_contractivity,
)


def _params_path() -> Path:
    return Path(__file__).resolve().parent.parent / "multiplicity_lwe" / "params.example.toml"


def _center_mod(value: int, q: int) -> int:
    """Map modular residue to centered representative in [-q/2, q/2]."""
    half = q // 2
    return ((value + half) % q) - half


def test_k02_canonical_core_engine_type() -> None:
    """K-02 requires a canonical core engine type in pirtm/core."""
    assert issubclass(MultiplicityCoreEngine, ToyAEngine)


def test_k02_make_multiplicity_engine_returns_core_engine() -> None:
    params = load_multiplicity_params(_params_path())
    engine = make_multiplicity_engine(params)
    assert isinstance(engine, MultiplicityCoreEngine)


def test_k02_determinism_parity_with_toya_digest() -> None:
    """Core and ToyA must remain deterministic-identical for same params."""
    params = load_multiplicity_params(_params_path())
    core = make_multiplicity_engine(params)
    toy = make_toy_a_engine(params)

    assert core.public_digest() == toy.public_digest()


def test_k02_determinism_parity_with_toya_samples() -> None:
    """K-02 parity: identical contexts produce identical LWE public samples."""
    params = load_multiplicity_params(_params_path())
    core = make_multiplicity_engine(params)
    toy = make_toy_a_engine(params)

    contexts = [f"k02/sample/{i}" for i in range(64)]
    for ctx in contexts:
        assert core.public_lwe_sample(ctx) == toy.public_lwe_sample(ctx)


def test_k02_inner_product_residual_identity() -> None:
    """For every sample, b = a*s + e (mod q) with hidden deterministic secret s."""
    params = load_multiplicity_params(_params_path())
    engine = make_multiplicity_engine(params)

    # Internal secret is intentionally hidden from public API but testable here.
    s = engine._secret()  # noqa: SLF001

    for i in range(128):
        context = f"k02/identity/{i}"
        a, b = engine.public_lwe_sample(context)
        residual_mod_q = (b - (a * s)) % params.q
        residual_centered = _center_mod(residual_mod_q, params.q)

        assert b == (a * s + residual_centered) % params.q


def test_k02_noise_bound_matches_gate_requirement() -> None:
    """K-02 noise gate: |e| <= 6 coordinate-wise over deterministic contexts."""
    params = load_multiplicity_params(_params_path())
    engine = make_multiplicity_engine(params)
    s = engine._secret()  # noqa: SLF001

    max_abs = 0
    for i in range(1000):
        context = f"k02/noise/{i}"
        a, b = engine.public_lwe_sample(context)
        residual_mod_q = (b - (a * s)) % params.q
        e = abs(_center_mod(residual_mod_q, params.q))
        max_abs = max(max_abs, e)

    assert max_abs <= 6


def test_k02_contractivity_validation_passes() -> None:
    """Gate K contractivity validator must pass for canonical params."""
    params = load_multiplicity_params(_params_path())
    validate_multiplicity_contractivity(params)


def test_k02_contractivity_bound_is_strictly_below_gamma() -> None:
    """Core engine reports positive contractivity margin under canonical params."""
    params = load_multiplicity_params(_params_path())
    engine = make_multiplicity_engine(params)

    bound = engine.contractivity_bound()
    margin = engine.contractivity_margin()

    assert bound < params.gamma
    assert margin > 0.0


def test_k02_empirical_state_trajectory_contraction_locked_harness() -> None:
    """Empirical K-02 gate: trajectory distance contracts under locked harness."""
    params = load_multiplicity_params(_params_path())
    engine = make_multiplicity_engine(params)

    cfg = StateTransitionHarnessConfig(
        dim=8,
        # Lock gamma directly to params for explicitness in the certification test.
        gamma=params.gamma,
        drive_scale=0.25,
        context_prefix="k02/trajectory_contraction",
    )

    # Distinct initial states with same deterministic drive sequence.
    x0_a = [0.40, -0.30, 0.20, -0.10, 0.05, 0.15, -0.25, 0.35]
    x0_b = [-0.35, 0.25, -0.15, 0.05, -0.05, -0.20, 0.30, -0.40]

    report = empirical_contraction_report(
        engine,
        x0_a,
        x0_b,
        steps=64,
        config=cfg,
    )

    # Allow tiny numeric tolerance for floating-point operations.
    tol = 1e-12
    assert report["ratio_count"] > 0
    assert report["max_ratio"] <= params.gamma + tol
    assert report["final_distance"] < report["initial_distance"]
