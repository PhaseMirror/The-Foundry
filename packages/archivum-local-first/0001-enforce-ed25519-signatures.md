# ADR 0001: Enforce Ed25519 Cryptographic Signatures

## Status
Proposed

## Context
The package description claims the log is "Ed25519-signed". However, the `append` function accepts a raw `String` parameter for the signature and performs zero verification. This operates on trust, violating the security model.

## Decision
We will remove the `String` signature parameter. We will require an `ed25519_dalek::Signature` and a corresponding public key. The `append` and `merge` functions will mechanically verify the signature against the serialized receipt payload before accepting the event.

## Consequences
- Unverified strings can no longer be appended to the log.
- All events will possess mathematically enforced authenticity.
- The vibe claim is replaced with a strict cryptographic mechanism.
