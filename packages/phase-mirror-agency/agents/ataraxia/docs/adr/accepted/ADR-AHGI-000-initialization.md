# ADR-AHGI-000: Ξ-Constitutional Authority and Amendment Protocol

- Status: accepted
- Date: 2026-05-25
- Owners: Multiplicity Foundation
- Tags: [architecture]

---

## Constitutional Authority
Single-author authority is held by the Multiplicity Foundation. All amendments are signed by this DID and anchored in Archivum under namespace `ahgi.governance`.

*   **DID:** `did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuias8251kGqyx` (Multiplicity Foundation Sovereign Key)
*   **Name:** Multiplicity Foundation
*   **Scope:** Full amendment authority over all Ξ-Constitution artifacts.
*   **Bound:** All amendments must be signed by this DID and Archivum-anchored.
*   **Effective:** 2026-05-25

## Amendment Protocol
1. Author proposes amendment as a draft ADR or schema change.
2. Minimum 48-hour review period before ratification.
3. Amendment is signed, Archivum-anchored, and assigned a prime index.
4. Dependent schemas are flagged for re-validation if constitutional parameters change.
5. No amendment may violate the six L1-HC invariants.

## Escalation to Multi-Custodian Authority
Triggered by: first external institutional partner, clinical pilot initiation, or explicit author decision.

Upon trigger: M-of-N multisig protocol replaces single-author authority. M and N are specified at trigger time based on partner count.

## Succession
**Sealed succession document:** `arch-sealed-succ-00000001` (Archivum record ID)

This document specifies the conditions under which succession triggers, the successor identity/role, and whether the transfer is automatic. It remains sealed in Archivum and is never opened unless succession triggers.

## What Cannot Be Amended
The six L1-HC constitutional invariants (established in ADR-AHGI-001) are non-amendable by any authority. They can only be superseded by a full constitutional replacement, which itself requires a new ADR-AHGI-000.