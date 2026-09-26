"""Tests for the Multiplicity-LWE parameter loader and validator."""

import pathlib

import pytest

from pirtm.multiplicity_lwe import load_multiplicity_params, MultiplicityParams


TEST_DATA_DIR = pathlib.Path(__file__).resolve().parent.parent / "multiplicity_lwe"


def test_load_example_params_file(tmp_path):
    """The reference params.example.toml should load without errors."""
    params_path = TEST_DATA_DIR / "params.example.toml"
    params = load_multiplicity_params(params_path)

    assert isinstance(params, MultiplicityParams)
    assert params.version == "1.0"
    assert params.scales == (0, 1, 2, 3)
    assert params.q > max(params.prime_set)


def _write_toml(path: pathlib.Path, contents: str) -> None:
    path.write_text(contents, encoding="utf-8")


def test_invalid_prime_set_raises(tmp_path):
    """A prime_set containing a composite number should be rejected."""
    bad = tmp_path / "bad_params.toml"
    _write_toml(
        bad,
        """version = \"1.0\"
prime_set = [2, 3, 4]
scales = [0, 1, 2, 3]
q = 257
alpha = 2
lambda_m = 0.1
gamma = 0.5

[noise]
type = \"binomial\"
k = 3
""",
    )

    with pytest.raises(ValueError, match="prime_set entry is not prime"):
        load_multiplicity_params(bad)


def test_invalid_gamma_range_raises(tmp_path):
    """Gamma outside (0, 1) should be rejected."""
    bad = tmp_path / "bad_params.toml"
    _write_toml(
        bad,
        """version = \"1.0\"
prime_set = [2, 3, 5]
scales = [0, 1, 2, 3]
q = 257
alpha = 2
lambda_m = 0.1
gamma = 1.0

[noise]
type = \"binomial\"
k = 3
""",
    )

    with pytest.raises(ValueError, match="gamma must be a number in \(0, 1\)"):
        load_multiplicity_params(bad)
