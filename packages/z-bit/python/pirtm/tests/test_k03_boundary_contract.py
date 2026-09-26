"""K-03 boundary contract tests for Multiplicity Core integration."""

from __future__ import annotations

import pathlib
import subprocess
import sys

import pytest

from pirtm.core.multiplicity_core import (
    MultiplicityCoreEngine,
    ProtectedEngine,
    load_multiplicity_params,
    make_multiplicity_engine,
)
from pirtm.randomness import RandomnessConsumer
from pirtm.sigma.adapters.pirtm_carry_forward_adapter import PIRTMCarryForwardAdapter


class _MockCarryForwardPolicy:
    def __init__(self, beta: float = 1.0, lambda_decay: float = 0.9, convergence_mode: str = "steady_state"):
        self.beta = beta
        self.lambda_decay = lambda_decay
        self.convergence_mode = convergence_mode


def _engine() -> MultiplicityCoreEngine:
    repo_root = pathlib.Path(__file__).resolve().parents[2]
    params_path = repo_root / "pirtm" / "multiplicity_lwe" / "params.example.toml"
    params = load_multiplicity_params(params_path)
    return make_multiplicity_engine(params)


def test_boundary_methods_return_expected_shapes_and_types() -> None:
    engine = _engine()

    a, b = engine.get_public_sample("k03:test_sample")
    digest = engine.get_state_digest()
    params = engine.inspect_params()

    assert isinstance(a, int)
    assert isinstance(b, int)
    assert 0 <= a < params.q
    assert 0 <= b < params.q
    assert isinstance(digest, str)
    assert len(digest) > 0
    assert params.q == 257


def test_boundary_sample_and_digest_are_deterministic() -> None:
    engine = _engine()

    sample_1 = engine.get_public_sample("k03:determinism")
    sample_2 = engine.get_public_sample("k03:determinism")
    digest_1 = engine.get_state_digest()
    digest_2 = engine.get_state_digest()

    assert sample_1 == sample_2
    assert digest_1 == digest_2


def test_protected_engine_rejects_internal_access() -> None:
    wrapped = ProtectedEngine(_engine())

    with pytest.raises(AttributeError, match="boundary API"):
        _ = wrapped._secret

    with pytest.raises(AttributeError, match="boundary API"):
        _ = wrapped.state_vector


def test_protected_engine_allows_boundary_calls() -> None:
    wrapped = ProtectedEngine(_engine())

    a, b = wrapped.get_public_sample("k03:allowed")
    digest = wrapped.get_state_digest()
    params = wrapped.inspect_params()

    assert isinstance(a, int)
    assert isinstance(b, int)
    assert isinstance(digest, str)
    assert params.q == 257


def test_randomness_consumer_protocol_on_adapter() -> None:
    adapter = PIRTMCarryForwardAdapter(_MockCarryForwardPolicy(), dim=5)
    assert isinstance(adapter, RandomnessConsumer)


def test_static_checker_passes_for_current_workspace() -> None:
    repo_root = pathlib.Path(__file__).resolve().parents[2]
    checker = repo_root / "pirtm" / "tools" / "static_checks" / "forbidden_imports.py"

    proc = subprocess.run(
        [sys.executable, str(checker)],
        cwd=repo_root,
        capture_output=True,
        text=True,
        check=False,
    )

    assert proc.returncode == 0, proc.stdout + "\n" + proc.stderr
    assert "boundary static check passed" in proc.stdout.lower()
