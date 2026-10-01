# ADR 0002: Enforce Cryptographic Signatures in Firewall

## Status
Proposed

## Context
The `LegislativeEngine::verify_firewall` function checks for the presence of signature strings and rejects the exact string "MISSING". This is a structural check, not a cryptographic signature verification. It allows arbitrary text to bypass the firewall.

## Decision
We will integrate a standard cryptographic signature scheme (e.g., Ed25519). The `verify_firewall` function will take the public keys of the owner and governor, reconstruct the signed payload, and cryptographically verify both signatures.

## Consequences
- Signatures must be cryptographically valid bytes.
- Governance keys must be provisioned and accessible to the verifier.
- Forged signature strings will be rejected.
