"""Tests for the public Multiplicity-LWE API surface."""

import pathlib

import pytest

from pirtm.multiplicity_lwe import (
    MultiplicityParams,
    ToyAEngine,
    load_multiplicity_params,
    load_params,
    make_toy_a_engine,
    validate_multiplicity_contractivity,
)


def test_api_imports_and_duck_types():
    """The public API must provide the expected entrypoints."""
    assert MultiplicityParams is not None
    assert ToyAEngine is not None
    assert callable(load_multiplicity_params)
    assert callable(load_params)
    assert callable(make_toy_a_engine)


def test_engine_public_digest_is_deterministic(tmp_path):
    """ToyAEngine should produce deterministic digests and samples."""
    params_path = pathlib.Path(__file__).resolve().parent.parent / "multiplicity_lwe" / "params.example.toml"
    params = load_multiplicity_params(params_path)
    engine = make_toy_a_engine(params)

    digest1 = engine.public_digest()
    digest2 = engine.public_digest()
    assert digest1 == digest2

    sample1 = engine.public_sample("test")
    sample2 = engine.public_sample("test")
    assert sample1 == sample2
    assert isinstance(sample1, bytes)


def test_engine_lwe_sample_consistency(tmp_path):
    """LWE sampling should be deterministic and bounded by q."""
    params_path = pathlib.Path(__file__).resolve().parent.parent / "multiplicity_lwe" / "params.example.toml"
    params = load_multiplicity_params(params_path)
    engine = make_toy_a_engine(params)

    a1, b1 = engine.public_lwe_sample("construct")
    a2, b2 = engine.public_lwe_sample("construct")

    assert a1 == a2
    assert b1 == b2
    assert 0 <= a1 < params.q
    assert 0 <= b1 < params.q

    # Different contexts should provide different samples.
    a3, b3 = engine.public_lwe_sample("construct_v2")
    assert (a3, b3) != (a1, b1)


def test_public_random_stream_is_repeatable(tmp_path):
    """Public randomness stream derived from ToyAEngine must be deterministic."""
    params_path = pathlib.Path(__file__).resolve().parent.parent / "multiplicity_lwe" / "params.example.toml"
    params = load_multiplicity_params(params_path)
    engine = make_toy_a_engine(params)

    r1 = engine.public_random("gate_rng")
    r2 = engine.public_random("gate_rng")

    assert r1.randint(0, 1000) == r2.randint(0, 1000)
    assert r1.random() == r2.random()
    a1, b1 = r1.lwe_sample()
    a2, b2 = r2.lwe_sample()
    assert (a1, b1) == (a2, b2)


def test_contractivity_validation_passes(tmp_path):
    """validate_multiplicity_contractivity must accept the canonical params."""
    params_path = pathlib.Path(__file__).resolve().parent.parent / "multiplicity_lwe" / "params.example.toml"
    params = load_multiplicity_params(params_path)

    # Should not raise
    validate_multiplicity_contractivity(params)


def test_contractivity_validation_fails_on_bad_lambda_m(tmp_path):
    """Contractivity validation should fail when λ_m is too large."""
    params_path = pathlib.Path(__file__).resolve().parent.parent / "multiplicity_lwe" / "params.example.toml"
    params = load_multiplicity_params(params_path)

    bad_params = MultiplicityParams(
        version=params.version,
        prime_set=params.prime_set,
        scales=params.scales,
        q=params.q,
        alpha=params.alpha,
        lambda_m=params.lambda_m * 100.0,
        gamma=params.gamma,
        noise_type=params.noise_type,
        noise_k=params.noise_k,
    )

    with pytest.raises(ValueError, match="Contractivity violation"):
        validate_multiplicity_contractivity(bad_params)
