from __future__ import annotations

import json

import pytest

from pirtm.core.attestation import PIRTMAttestation, SignedPIRTMAttestation
from pirtm.core.certify import ContractivityCertificate


HEX_A = "a" * 64
HEX_B = "b" * 64
HEX_C = "c" * 64
HEX_D = "d" * 64


def test_attestation_round_trip_dict_and_json():
    attestation = PIRTMAttestation(
        proof_hash=HEX_A,
        witness_commitment=HEX_B,
        trace_hash=HEX_C,
        certificate_kind="module",
        issued_at_epoch=7,
        verification_result=True,
        prime_index=11,
        epsilon=0.05,
        op_norm_T=0.25,
        spectral_radius=0.7,
        identity_binding=HEX_D,
        metadata={"source": "unit-test"},
    )

    restored = PIRTMAttestation.from_dict(attestation.to_dict())
    json_restored = PIRTMAttestation.from_json(attestation.to_json())

    assert restored == attestation
    assert json_restored == attestation
    assert json.loads(attestation.to_json())["attestation_type"] == "pirtm-native"


def test_attestation_from_contractivity_certificate():
    cert = ContractivityCertificate(
        epsilon=0.05,
        confidence=0.9999,
        spectral_radius=0.62,
        state_norm=0.4,
        trace_id="demo",
    )

    attestation = PIRTMAttestation.from_contractivity_certificate(
        cert,
        proof_hash=HEX_A,
        witness_commitment=HEX_B,
        trace_hash=HEX_C,
        certificate_kind="session",
        issued_at_epoch=13,
        verification_result=True,
        session_prime_vector=(2, 3, 5),
        op_norm_T=0.25,
        metadata={"origin": "cert"},
    )

    assert attestation.certificate_kind == "session"
    assert attestation.epsilon == 0.05
    assert attestation.spectral_radius == 0.62
    assert attestation.session_prime_vector == (2, 3, 5)


def test_contractivity_certificate_projects_to_attestation():
    cert = ContractivityCertificate(
        epsilon=0.05,
        confidence=0.9999,
        spectral_radius=0.41,
        state_norm=0.2,
        trace_id="projection-demo",
    )

    attestation = cert.to_attestation(
        proof_hash=HEX_A,
        witness_commitment=HEX_B,
        trace_hash=HEX_C,
        certificate_kind="module",
        issued_at_epoch=21,
        verification_result=True,
        prime_index=17,
        op_norm_T=0.25,
        identity_binding=HEX_D,
        metadata={"origin": "projection"},
    )

    assert attestation.certificate_kind == "module"
    assert attestation.prime_index == 17
    assert attestation.epsilon == cert.epsilon
    assert attestation.metadata["origin"] == "projection"


def test_attestation_rejects_non_hex_hashes():
    with pytest.raises(ValueError, match="proof_hash"):
        PIRTMAttestation(
            proof_hash="not-a-digest",
            witness_commitment=HEX_B,
            trace_hash=HEX_C,
            certificate_kind="module",
            issued_at_epoch=0,
            verification_result=True,
        )


def test_attestation_rejects_unknown_certificate_kind():
    with pytest.raises(ValueError, match="certificate_kind"):
        PIRTMAttestation(
            proof_hash=HEX_A,
            witness_commitment=HEX_B,
            trace_hash=HEX_C,
            certificate_kind="proof-backend",
            issued_at_epoch=0,
            verification_result=True,
        )


def test_attestation_can_be_signed_and_verified():
    attestation = PIRTMAttestation(
        proof_hash=HEX_A,
        witness_commitment=HEX_B,
        trace_hash=HEX_C,
        certificate_kind="module",
        issued_at_epoch=9,
        verification_result=True,
        prime_index=19,
        identity_binding=HEX_D,
        metadata={"source": "sign-test"},
    )

    signed = attestation.sign(seed=b"unit-test-signer", key_id="unit-test")

    assert isinstance(signed, SignedPIRTMAttestation)
    assert signed.key_id == "unit-test"
    assert signed.algorithm == "bls12-381"
    assert signed.verify() is True

    restored = SignedPIRTMAttestation.from_dict(signed.to_dict())
    assert restored.verify() is True
    assert restored.attestation == attestation


def test_signed_attestation_detects_tampering():
    attestation = PIRTMAttestation(
        proof_hash=HEX_A,
        witness_commitment=HEX_B,
        trace_hash=HEX_C,
        certificate_kind="session",
        issued_at_epoch=5,
        verification_result=True,
        session_prime_vector=(2, 3, 5),
        identity_binding=HEX_D,
    )

    signed = attestation.sign(seed=b"unit-test-signer", key_id="tamper-test")
    tampered_payload = signed.to_dict()
    tampered_payload["attestation"]["proof_hash"] = HEX_B

    tampered = SignedPIRTMAttestation.from_dict(tampered_payload)
    assert tampered.verify() is False