from __future__ import annotations

import dataclasses
import pathlib
from typing import Any, Dict, List, Optional

try:
    import tomllib  # type: ignore
except ImportError:  # pragma: no cover - older python
    import tomli as tomllib  # type: ignore

from .prime_utils import is_prime, is_squarefree
from .types import MultiplicityParams


def load_params(path: str | pathlib.Path) -> MultiplicityParams:
    """Load and validate multiplicity parameters from a TOML file."""

    path = pathlib.Path(path)
    with path.open("rb") as f:
        raw = tomllib.load(f)

    return validate_params(raw, path=path)


def validate_params(raw: Dict[str, Any], path: Optional[pathlib.Path] = None) -> MultiplicityParams:
    """Validate a params dict and return a typed `MultiplicityParams`."""

    if not isinstance(raw, dict):
        raise ValueError("Multiplicity params must be a TOML table")

    version = raw.get("version")
    if not isinstance(version, str) or not version:
        raise ValueError("Missing or invalid 'version' in multiplicity params")

    prime_set = raw.get("prime_set")
    if not isinstance(prime_set, list) or not prime_set:
        raise ValueError("'prime_set' must be a non-empty list of primes")

    primes: List[int] = []
    for p in prime_set:
        if not isinstance(p, int):
            raise ValueError(f"prime_set entries must be integers, got {type(p)}")
        if p <= 1:
            raise ValueError(f"prime_set entries must be > 1, got {p}")
        if not is_prime(p):
            raise ValueError(f"prime_set entry is not prime: {p}")
        primes.append(p)

    if len(primes) != len(set(primes)):
        raise ValueError("prime_set contains duplicate entries")

    product = 1
    for p in primes:
        product *= p
    if not is_squarefree(product):
        raise ValueError("prime_set product must be squarefree")


    scales = raw.get("scales")
    scales_version = raw.get("scales_version", "v1")
    if scales_version == "v1":
        if not isinstance(scales, (list, tuple)) or list(scales) != [0, 1, 2, 3]:
            raise ValueError("scales (v1) must be exactly [0, 1, 2, 3]")
    # Future: add more versioned scale checks here

    q = raw.get("q")
    if not isinstance(q, int) or q <= 2 or not is_prime(q):
        raise ValueError("q must be a prime integer > 2")
    if q <= max(primes):
        raise ValueError("q must be larger than all primes in prime_set")

    alpha = raw.get("alpha")
    if not isinstance(alpha, (int, float)) or alpha <= 1:
        raise ValueError("alpha must be a number > 1")

    lambda_m = raw.get("lambda_m")
    if not isinstance(lambda_m, (int, float)) or lambda_m <= 0:
        raise ValueError("lambda_m must be a positive number")

    gamma = raw.get("gamma")
    if not isinstance(gamma, (int, float)) or not (0 < gamma < 1):
        raise ValueError("gamma must be a number in (0, 1)")

    noise = raw.get("noise")
    if not isinstance(noise, dict) or "type" not in noise:
        raise ValueError("noise must be a table with a 'type' field")

    noise_type = noise.get("type")
    if noise_type != "binomial":
        raise ValueError("only 'binomial' noise is supported in this version")

    k = noise.get("k")
    if not isinstance(k, int) or k <= 0:
        raise ValueError("noise.k must be a positive integer")

    return MultiplicityParams(
        version=version,
        prime_set=tuple(primes),
        scales=tuple(scales),
        scales_version=scales_version,
        q=q,
        alpha=float(alpha),
        lambda_m=float(lambda_m),
        gamma=float(gamma),
        noise_type="binomial",
        noise_k=k,
    )
