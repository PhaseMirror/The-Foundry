# ADR-0029: Global Archivum Sync & WAN Replication

> **Status**: Proposed  
> **Date**: 2026-06-09  
> **Authors**: Gemini CLI  
> **Spec Reference**: Phase 5: Global Archivum Sync

---

## Problem Statement

Phases 1-4 established a "Certified Production Fleet" where multi-node orchestration and consensus ensure local cluster integrity. However, to achieve "Global Archivum" status, the ledger (`UnifiedWitness`) must be replicated across Wide Area Networks (WAN) between independent fleets. This requires handling high latency, intermittent connectivity, and ensuring that the "Lineage" remains verifiable across global boundaries.

---

## Solution

Implement the **Global Archivum Sync** protocol:

1.  **Archivum Ledger**: Transition from a single `unified_witness_final.json` to a time-series ledger stored in `var/archivum/ledger.jsonl`.
2.  **WAN Replication Protocol**:
    *   **Pull-based Sync**: Nodes periodically poll authorized peers for new ledger entries.
    *   **Merkle-Delta Exchange**: Only sync the diffs between the last known common Merkle root and the current tip.
    *   **Signature Verification**: Every synced entry MUST carry a 2/3 quorum of signatures from the originating fleet.
3.  **Archivum Ingress**: A dedicated endpoint for local and remote events to enter the ledger.
4.  **CLI command `m sync`**: Orchestrates the peer discovery and delta replication.

---

## Consequences

### Positive

- **Global Resilience**: The ledger survives the total loss of a regional fleet.
- **Auditability**: Global auditors can verify the entire lineage from any node.
- **WAN Optimization**: Merkle-delta sync minimizes bandwidth usage.

### Negative

- **Eventual Consistency**: Global state may lag local state during network partitions.
- **Security Complexity**: Requires management of cross-fleet trust roots (Ed25519 keys).

---

## Rationale

By extending the `UnifiedWitness` into a persistent, signed ledger and implementing delta-sync, we maintain the "Path of Integrity" across global networks. This aligns with the "Global Archivum" vision of a trustless, mathematically bounded record of fleet lawfulness.

---

## Acceptance Criteria

- [ ] `var/archivum/ledger.jsonl` stores signed witness events.
- [ ] `m sync` successfully pulls missing entries from a peer node.
- [ ] Cross-fleet signatures are verified before ingestion.
- [ ] `m status` reports global sync latency and peer status.

---

## References

- [ADR-0028: Pro-Tier Spectral Certification](./ADR-0028-pro-tier-spectral-certification.md)
- [ADR-0002: Constitutional Runbook Verification](./ADR-0002-constitutional-runbook-verification.md)
