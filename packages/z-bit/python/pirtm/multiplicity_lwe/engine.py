"""Toy LWE engine for the Multiplicity-LWE primitive.

This is intentionally minimal and deterministic. It provides only public outputs
(sample/digest) and never exposes secret material.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Optional, Tuple

from .types import MultiplicityParams


@dataclass(frozen=True)
class ToyAEngine:
    """Toy A engine implementing the public API.

    The internal state is derived deterministically from `MultiplicityParams`.
    """

    params: MultiplicityParams
    _seed: bytes = b""

    def __post_init__(self) -> None:
        # Derive a stable seed from params; this is internal-only.
        object.__setattr__(self, "_seed", self._derive_seed(self.params))

    @staticmethod
    def _derive_seed(params: MultiplicityParams) -> bytes:
        """Create a deterministic, opaque seed from the stable params."""
        m = hashlib.blake2b(digest_size=32)
        m.update(params.version.encode("utf-8"))
        m.update(b"\n")
        m.update(str(params.prime_set).encode("utf-8"))
        m.update(b"\n")
        m.update(str(params.scales).encode("utf-8"))
        m.update(b"\n")
        m.update(str(params.q).encode("utf-8"))
        m.update(b"\n")
        m.update(str(params.alpha).encode("utf-8"))
        m.update(b"\n")
        m.update(str(params.lambda_m).encode("utf-8"))
        m.update(b"\n")
        m.update(str(params.gamma).encode("utf-8"))
        m.update(b"\n")
        m.update(params.noise_type.encode("utf-8"))
        m.update(b"\n")
        m.update(str(params.noise_k).encode("utf-8"))
        return m.digest()

    def _derive_int(self, context: str, label: str, modulus: Optional[int] = None) -> int:
        """Derive a deterministic integer from the engine seed + context/label."""
        h = hashlib.blake2b(digest_size=32, key=self._seed)
        h.update(label.encode("utf-8"))
        h.update(b"\x00")
        h.update(context.encode("utf-8"))
        raw = int.from_bytes(h.digest(), "big")
        if modulus is None:
            return raw
        return raw % modulus

    def _binomial_noise(self, context: str) -> int:
        """Deterministic centred binomial noise (range depends on params.noise_k)."""
        # Use deterministic bits derived from context.
        bits = self._derive_int(context, label="noise_bits")
        ones = 0
        k = self.params.noise_k
        for i in range(k):
            ones += (bits >> i) & 1
        # centre around zero; for odd k, output is in [-k//2, k - k//2]
        return ones - (k // 2)

    def _secret(self) -> int:
        """Internal secret derived from the stable seed (never exposed)."""
        # Secret is deterministic from params but never returned through the API.
        return self._derive_int("secret", label="s", modulus=self.params.q)

    def public_digest(self) -> str:
        """Return a stable digest identifying this engine configuration."""
        # Return hex string so it can be embedded in logs and comparisons.
        return hashlib.blake2b(self._seed, digest_size=16).hexdigest()

    def public_sample(self, context: str, length: int = 32) -> bytes:
        """Derive a deterministic public sample from a context string.

        The context may include message labels like "gate_input" or "proof".
        """
        h = hashlib.blake2b(digest_size=length, key=self._seed)
        h.update(context.encode("utf-8"))
        h.update(b"\x00")
        h.update(str(self.params.q).encode("utf-8"))
        return h.digest()

    def public_sample_int(self, context: str, modulus: Optional[int] = None) -> int:
        """Return a deterministic integer sample (optionally mod modulus)."""
        raw = int.from_bytes(self.public_sample(context, length=32), "big")
        if modulus is None:
            return raw
        return raw % modulus

    def contractivity_bound(self) -> float:
        """Compute the contractivity bound used in Gate K.

        This corresponds to the quantity `λ_m * max_p p^α` described in the
        Multiplicity‑LWE reference. A contractive configuration should satisfy
        `λ_m * max_p p^α < γ`.
        """
        max_norm = max((p ** self.params.alpha) for p in self.params.prime_set)
        return self.params.lambda_m * max_norm

    def contractivity_margin(self) -> float:
        """Compute remaining margin between the contractivity bound and γ."""
        return self.params.gamma - self.contractivity_bound()

    def validate_contractivity(self) -> None:
        """Validate that the configured params satisfy Gate K contractivity.

        We require the configured multiplicity gain to be contractive relative
        to the target contraction margin `gamma`:

            λ_m * max(p^α) < γ

        This is the formalised gate condition for the Multiplicity‑LWE engine.

        Raises:
            ValueError: If the contractivity bound is violated.
        """
        bound = self.contractivity_bound()
        # Allow a small epsilon to avoid rejecting on floating point rounding.
        if not (bound < self.params.gamma - 1e-12):
            raise ValueError(
                f"Contractivity violation: lambda_m*max(p^alpha)={bound:.6e} "
                f"must be < gamma={self.params.gamma:.6e}"
            )

    class PublicRandom:
        """Deterministic public randomness derived from a ToyAEngine stream."""

        def __init__(self, engine: "ToyAEngine", base_context: str = "public_rng"):
            self._engine = engine
            self._base_context = base_context
            self._counter = 0

        def _next_context(self, label: str) -> str:
            ctx = f"{self._base_context}:{label}:{self._counter}"
            self._counter += 1
            return ctx

        def randint(self, low: int, high: int) -> int:
            """Return a deterministic integer in [low, high)."""
            if low >= high:
                raise ValueError("low must be < high")
            modulus = high - low
            ctx = self._next_context("randint")
            return low + self._engine.public_sample_int(ctx, modulus=modulus)

        def random(self) -> float:
            """Return a deterministic float in [0, 1)."""
            ctx = self._next_context("random")
            # Use 53 bits for float precision
            value = self._engine.public_sample_int(ctx, modulus=2**53)
            return value / float(2**53)

        def lwe_sample(self) -> Tuple[int, int]:
            """Return a deterministic LWE sample (a, b)."""
            ctx = self._next_context("lwe")
            # Note: this uses the same underlying deterministic stream.
            return self._engine.public_lwe_sample(ctx)

        def bytes(self, n: int) -> bytes:
            """Return n deterministic bytes."""
            ctx = self._next_context("bytes")
            # Derive enough bytes by repeating the digest
            out = bytearray()
            i = 0
            while len(out) < n:
                h = hashlib.blake2b(digest_size=32, key=self._engine._seed)
                h.update(ctx.encode("utf-8"))
                h.update(b"\x00")
                h.update(str(i).encode("utf-8"))
                out.extend(h.digest())
                i += 1
            return bytes(out[:n])

    def public_random(self, context: str = "public_rng") -> "ToyAEngine.PublicRandom":
        """Get a deterministic public randomness stream derived from this engine."""
        return ToyAEngine.PublicRandom(self, base_context=context)

    def public_lwe_sample(self, context: str) -> Tuple[int, int]:
        """Return a deterministic LWE sample (a, b) over Z_q.

        - `a` is derived deterministically from the context.
        - `b = a * s + e (mod q)` where s is a hidden internal secret, and
          e is noise derived from the params.

        This exposes only the public sample; the secret `s` is never returned.
        """
        q = self.params.q
        a = self._derive_int(context, label="a", modulus=q)
        s = self._secret()

        # Binomial noise scaled by the gate's gamma parameter.
        raw_noise = self._binomial_noise(context)
        scaled_noise = int(round(raw_noise * self.params.gamma))

        b = (a * s + scaled_noise) % q
        return a, b
