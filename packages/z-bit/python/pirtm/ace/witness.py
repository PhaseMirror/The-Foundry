"""
AceWitness: production artifact consumed by ETP's Static Tail.
Every certified ACE call emits exactly one witness, which the ETP Governor
uses as the contractionCertificate field in a PETCTraceAtom.
"""
from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass

from .types import AceCertificate


@dataclass(frozen=True)
class AceWitness:
    witness_id: str          # SHA-256 of canonical JSON
    timestamp_iso: str
    cert: AceCertificate
    prime_index: int         # p in P_N -- filled by caller from PETC context

    @classmethod
    def from_certificate(
        cls,
        cert: AceCertificate,
        prime_index: int,
    ) -> "AceWitness":
        payload = {
            "level": cert.level.value,
            "certified": cert.certified,
            "lipschitz_upper": cert.lipschitz_upper,
            "gap_lb": cert.gap_lb,
            "tau": cert.tau,
            "delta": cert.delta,
            "prime_index": prime_index,
        }
        canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        witness_id = hashlib.sha256(canonical.encode()).hexdigest()
        return cls(
            witness_id=witness_id,
            timestamp_iso=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            cert=cert,
            prime_index=prime_index,
        )

    def is_valid_for_etp(self) -> bool:
        """ETP gate check: cert must be certified AND gap_lb > 0."""
        return self.cert.certified and self.cert.gap_lb > 0
