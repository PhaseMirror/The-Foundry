"""PIRTM-native attestation schema and serializer.

This module defines the canonical migration target for repo-wide lawfulness
attestations. It intentionally models PIRTM evidence directly instead of
wrapping a third-party proof backend.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping, TYPE_CHECKING

try:  # Optional but preferred for real signature verification.
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric.ed25519 import (
        Ed25519PrivateKey,
        Ed25519PublicKey,
    )
    _ED25519_AVAILABLE = True
except ImportError:  # pragma: no cover - fallback only
    serialization = None
    Ed25519PrivateKey = None
    Ed25519PublicKey = None
    _ED25519_AVAILABLE = False

_REPO_ROOT = Path(__file__).resolve().parents[2]
_MULTIPLICITY_CRYPTO_PY_DIR = _REPO_ROOT / "multiplicity" / "crypto" / "python"
if _MULTIPLICITY_CRYPTO_PY_DIR.exists():
    bridge_path = str(_MULTIPLICITY_CRYPTO_PY_DIR)
    if bridge_path not in sys.path:
        sys.path.insert(0, bridge_path)

try:  # Prefer the canonical multiplicity BLS provider for release provenance.
    from multiplicity_crypto import MultiplicityCrypto
    _MULTIPLICITY_CRYPTO_AVAILABLE = True
except ImportError:  # pragma: no cover - optional bridge fallback
    MultiplicityCrypto = None
    _MULTIPLICITY_CRYPTO_AVAILABLE = False

if TYPE_CHECKING:
    from .certify import ContractivityCertificate


_HEX_64_RE = re.compile(r"^[0-9a-f]{64}$")
_VALID_CERTIFICATE_KINDS = {"module", "session"}


def _require_hex_64(name: str, value: str) -> str:
    if not _HEX_64_RE.fullmatch(value):
        raise ValueError(f"{name} must be a 64-char lowercase hex digest")
    return value


def _normalize_metadata(metadata: Mapping[str, Any] | None) -> dict[str, Any]:
    if metadata is None:
        return {}
    return dict(metadata)


def _canonical_json_bytes(payload: Mapping[str, Any]) -> bytes:
    return json.dumps(dict(payload), sort_keys=True, separators=(",", ":")).encode("utf-8")


def _normalize_signing_seed(seed: bytes | str | None, payload: bytes) -> bytes:
    if seed is None:
        env_seed = os.environ.get("PIRTM_ATTESTATION_SIGNING_SEED")
        seed_bytes = env_seed.encode("utf-8") if env_seed is not None else payload
    elif isinstance(seed, str):
        seed_bytes = seed.encode("utf-8")
    else:
        seed_bytes = bytes(seed)
    return hashlib.sha256(seed_bytes).digest()


def _fallback_signature(public_key: str, payload: bytes) -> str:
    return hashlib.sha256(bytes.fromhex(public_key) + payload).hexdigest()


def _get_multiplicity_crypto() -> Any | None:
    if not _MULTIPLICITY_CRYPTO_AVAILABLE or MultiplicityCrypto is None:
        return None
    try:
        return MultiplicityCrypto()
    except Exception:
        return None


def _sign_with_bls12_381(
    payload: bytes,
    signing_seed: bytes,
    *,
    key_id: str | None = None,
) -> tuple[str, str, str] | None:
    bridge = _get_multiplicity_crypto()
    if bridge is None:
        return None

    try:
        result = bridge._call("blsSign", signing_seed.hex(), payload.decode("utf-8"))
        public_key = str(result["publicKey"])
        signature = str(result["signature"])
        public_key_bytes = bytes.fromhex(public_key[2:] if public_key.startswith("0x") else public_key)
        resolved_key_id = key_id or hashlib.sha256(public_key_bytes).hexdigest()[:16]
        return public_key, signature, resolved_key_id
    except Exception:
        return None


def _verify_with_bls12_381(public_key: str, signature: str, payload: bytes) -> bool:
    bridge = _get_multiplicity_crypto()
    if bridge is None:
        return False

    try:
        return bool(
            bridge._call(
                "blsVerify",
                {
                    "publicKey": public_key,
                    "signature": signature,
                    "message": payload.decode("utf-8"),
                },
            )
        )
    except Exception:
        return False


@dataclass(frozen=True)
class PIRTMAttestation:
    """Canonical PIRTM-native attestation payload.

    This is the repo-wide replacement surface for legacy third-party proof and
    certificate wrappers. It binds PIRTM's mathematical certification outputs to
    deterministic artifact hashes and audit-chain references.
    """

    proof_hash: str
    witness_commitment: str
    trace_hash: str
    certificate_kind: str
    issued_at_epoch: int
    verification_result: bool
    prime_index: int | None = None
    session_prime_vector: tuple[int, ...] = ()
    epsilon: float | None = None
    op_norm_T: float | None = None
    spectral_radius: float | None = None
    identity_binding: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    attestation_type: str = "pirtm-native"

    def __post_init__(self) -> None:
        if self.attestation_type != "pirtm-native":
            raise ValueError("attestation_type must be 'pirtm-native'")
        if self.certificate_kind not in _VALID_CERTIFICATE_KINDS:
            raise ValueError("certificate_kind must be 'module' or 'session'")
        if self.issued_at_epoch < 0:
            raise ValueError("issued_at_epoch must be non-negative")
        if self.prime_index is not None and self.prime_index <= 1:
            raise ValueError("prime_index must be > 1 when provided")
        if any(prime <= 1 for prime in self.session_prime_vector):
            raise ValueError("session_prime_vector values must be > 1")

        _require_hex_64("proof_hash", self.proof_hash)
        _require_hex_64("witness_commitment", self.witness_commitment)
        _require_hex_64("trace_hash", self.trace_hash)
        if self.identity_binding is not None:
            _require_hex_64("identity_binding", self.identity_binding)

        object.__setattr__(self, "session_prime_vector", tuple(self.session_prime_vector))
        object.__setattr__(self, "metadata", _normalize_metadata(self.metadata))

    @classmethod
    def from_contractivity_certificate(
        cls,
        cert: ContractivityCertificate,
        *,
        proof_hash: str,
        witness_commitment: str,
        trace_hash: str,
        certificate_kind: str,
        issued_at_epoch: int,
        verification_result: bool,
        prime_index: int | None = None,
        session_prime_vector: tuple[int, ...] = (),
        op_norm_T: float | None = None,
        identity_binding: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> "PIRTMAttestation":
        return cls(
            proof_hash=proof_hash,
            witness_commitment=witness_commitment,
            trace_hash=trace_hash,
            certificate_kind=certificate_kind,
            issued_at_epoch=issued_at_epoch,
            verification_result=verification_result,
            prime_index=prime_index,
            session_prime_vector=session_prime_vector,
            epsilon=cert.epsilon,
            op_norm_T=op_norm_T,
            spectral_radius=cert.spectral_radius,
            identity_binding=identity_binding,
            metadata=_normalize_metadata(metadata),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "attestation_type": self.attestation_type,
            "proof_hash": self.proof_hash,
            "witness_commitment": self.witness_commitment,
            "trace_hash": self.trace_hash,
            "certificate_kind": self.certificate_kind,
            "issued_at_epoch": self.issued_at_epoch,
            "verification_result": self.verification_result,
            "prime_index": self.prime_index,
            "session_prime_vector": list(self.session_prime_vector),
            "epsilon": self.epsilon,
            "op_norm_T": self.op_norm_T,
            "spectral_radius": self.spectral_radius,
            "identity_binding": self.identity_binding,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, payload: Mapping[str, Any]) -> "PIRTMAttestation":
        return cls(
            attestation_type=str(payload.get("attestation_type", "pirtm-native")),
            proof_hash=str(payload["proof_hash"]),
            witness_commitment=str(payload["witness_commitment"]),
            trace_hash=str(payload["trace_hash"]),
            certificate_kind=str(payload["certificate_kind"]),
            issued_at_epoch=int(payload["issued_at_epoch"]),
            verification_result=bool(payload["verification_result"]),
            prime_index=int(payload["prime_index"]) if payload.get("prime_index") is not None else None,
            session_prime_vector=tuple(int(prime) for prime in payload.get("session_prime_vector", [])),
            epsilon=float(payload["epsilon"]) if payload.get("epsilon") is not None else None,
            op_norm_T=float(payload["op_norm_T"]) if payload.get("op_norm_T") is not None else None,
            spectral_radius=float(payload["spectral_radius"]) if payload.get("spectral_radius") is not None else None,
            identity_binding=str(payload["identity_binding"]) if payload.get("identity_binding") is not None else None,
            metadata=_normalize_metadata(payload.get("metadata")),
        )

    def to_json(self, *, indent: int | None = None) -> str:
        if indent is None:
            return json.dumps(self.to_dict(), sort_keys=True, separators=(",", ":"))
        return json.dumps(self.to_dict(), sort_keys=True, indent=indent)

    @classmethod
    def from_json(cls, payload: str) -> "PIRTMAttestation":
        return cls.from_dict(json.loads(payload))

    def canonical_bytes(self) -> bytes:
        return _canonical_json_bytes(self.to_dict())

    def sign(
        self,
        *,
        seed: bytes | str | None = None,
        key_id: str | None = None,
    ) -> "SignedPIRTMAttestation":
        payload = self.canonical_bytes()
        signing_seed = _normalize_signing_seed(seed, payload)
        preferred_algorithm = os.environ.get("PIRTM_ATTESTATION_ALGORITHM", "bls12-381").lower()

        if preferred_algorithm in {"bls", "bls12-381", "bls12_381"}:
            bls_material = _sign_with_bls12_381(payload, signing_seed, key_id=key_id)
            if bls_material is not None:
                public_key, signature, resolved_key_id = bls_material
                return SignedPIRTMAttestation(
                    attestation=self,
                    public_key=public_key,
                    signature=signature,
                    key_id=resolved_key_id,
                    algorithm="bls12-381",
                )

        if _ED25519_AVAILABLE:
            private_key = Ed25519PrivateKey.from_private_bytes(signing_seed)
            public_key = private_key.public_key().public_bytes(
                encoding=serialization.Encoding.Raw,
                format=serialization.PublicFormat.Raw,
            ).hex()
            signature = private_key.sign(payload).hex()
            algorithm = "ed25519"
        else:  # pragma: no cover - exercised only when cryptography is unavailable
            public_key = hashlib.sha256(b"pirtm:public:" + signing_seed).hexdigest()
            signature = _fallback_signature(public_key, payload)
            algorithm = "sha256-compat"

        resolved_key_id = key_id or hashlib.sha256(bytes.fromhex(public_key)).hexdigest()[:16]
        return SignedPIRTMAttestation(
            attestation=self,
            public_key=public_key,
            signature=signature,
            key_id=resolved_key_id,
            algorithm=algorithm,
        )


@dataclass(frozen=True)
class SignedPIRTMAttestation:
    """Signed provenance envelope for a canonical PIRTM attestation."""

    attestation: PIRTMAttestation
    public_key: str
    signature: str
    key_id: str = ""
    algorithm: str = "bls12-381"

    def verify(self) -> bool:
        payload = self.attestation.canonical_bytes()
        try:
            if self.algorithm in {"bls", "bls12-381", "bls12_381"}:
                return _verify_with_bls12_381(self.public_key, self.signature, payload)
            if self.algorithm == "ed25519" and _ED25519_AVAILABLE:
                Ed25519PublicKey.from_public_bytes(bytes.fromhex(self.public_key)).verify(
                    bytes.fromhex(self.signature),
                    payload,
                )
                return True
            if self.algorithm == "sha256-compat":
                return self.signature == _fallback_signature(self.public_key, payload)
        except Exception:
            return False
        return False

    def to_dict(self) -> dict[str, Any]:
        return {
            "algorithm": self.algorithm,
            "key_id": self.key_id,
            "public_key": self.public_key,
            "signature": self.signature,
            "attestation": self.attestation.to_dict(),
        }

    @classmethod
    def from_dict(cls, payload: Mapping[str, Any]) -> "SignedPIRTMAttestation":
        return cls(
            algorithm=str(payload.get("algorithm", "ed25519")),
            key_id=str(payload.get("key_id", "")),
            public_key=str(payload["public_key"]),
            signature=str(payload["signature"]),
            attestation=PIRTMAttestation.from_dict(payload["attestation"]),
        )


__all__ = ["PIRTMAttestation", "SignedPIRTMAttestation"]