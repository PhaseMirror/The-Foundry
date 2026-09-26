# ADR 012: Phase Mirror Audit, Gap Analysis, & Dissonance Resolution

## Status
Proposed

## Context
A comprehensive "phase mirror audit" of the `phase-mirror-gpt` production implementation was conducted to identify gaps, surface productive contradictions, and name hidden assumptions. Several critical dissonances were found between the theoretical architecture (as defined in ADR-001 through ADR-011) and the actual code execution paths. 

### 1. The "Trusting the Caller" Contradiction (Triple-Lock L0 Validation)
**Dissonance**: In `transport.rs`, the MCP tool payload for `triple_lock_verify` allows the caller to provide its own `permission_bits`, `schema_signature`, and `expected_schema`. 
**Productive Contradiction**: The Invariant Consistency Oracle (ADR-002) is designed to mathematically enforce structural integrity, yet the transport layer inherently trusts the untrusted caller to self-certify its L0 context.
**Resolution**: The `EvaluationContext` must be cryptographically derived from the caller's identity (e.g., via MTLS or signed JWT tokens) or pre-configured in the operator, not read directly from the JSON RPC payload.

### 2. The Fail-Open Ledger Contradiction
**Dissonance**: In `transport.rs` (`handle_mcp_call`), the system logs tool invocations to the Λ-Archivum by calling `ledger.commit_event()`. However, the `Result` is ignored (`let _ = l.commit_event(...)`).
**Productive Contradiction**: ADR-005 explicitly mandates "Fail-Closed Governance" prioritized over availability. By ignoring the ledger write failure, the system falls back to "Fail-Open", allowing potentially malicious tool calls to execute without a durable audit trail.
**Resolution**: We must handle the `Result` of `commit_event`. If the ledger cannot commit the event (e.g., due to a broken chain continuity), the MCP tool invocation must immediately short-circuit and return a `FAIL-CLOSED BLOCK`.

### 3. The Asynchronous WAL Durability Gap
**Dissonance**: `archivum.rs` implements persistence by sending entries over an unbounded `mpsc` channel to a background task that flushes every 10ms or 64 entries. `commit_event` returns `Ok(())` synchronously as soon as the message is queued.
**Hidden Assumption**: The system assumes that it will not crash in the milliseconds between queuing the event and fsyncing it to disk. 
**Resolution**: To uphold the "p=7 Data Lineage", the WAL must support synchronous fsync guarantees for Tier 1 Authoritative operations. `commit_event` must await acknowledgment from the WAL writer task before returning success to the execution path.

### 4. The Hardcoded MASTER_REGISTRY Assumption
**Dissonance**: The Triple-Lock Examiner phase (`triple_lock.rs`) hardcodes the path `MASTER_REGISTRY.md` and assumes a specific line-by-line format (`**Chain**: `).
**Hidden Assumption**: Assumes the binary is executed from a working directory where this file exists and is strictly formatted. It also assumes `tokio::fs::rename` is sufficient for cross-platform atomicity, which may fail on some filesystems if the temp file and target are on different partitions.
**Resolution**: Make the registry path configurable via environment variables or `policy.toml`. Abstract the registry parsing into a formal state machine rather than relying on string-matching from the end of a markdown file.

### 5. Redaction Implementation Gap
**Dissonance**: `signature: "REDACTED_HMAC".to_string()` is hardcoded in `archivum.rs`.
**Gap**: Zero-surveillance redaction is not yet integrated with an actual KMS or HMAC provider.
**Resolution**: Implement a local HMAC provider (using a secret injected via environment variable) to sign entries until the AWS SSM/KMS integration is available.

## Decisions
1. **Enforce Caller Authentication**: Remove `permission_bits` from the JSON-RPC payload of `triple_lock_verify`. Infer permissions from the transport session context (to be implemented via JWT or TLS context).
2. **Strict Ledger Acknowledgment**: Modify `handle_mcp_call` to propagate `commit_event` errors and return JSON-RPC errors instantly, enforcing ADR-005.
3. **Synchronous WAL Flushes**: Refactor `ArchivumLedger` to use a one-shot return channel for each commit, ensuring `commit_event` awaits the `sync_data()` completion for high-tier actions.
4. **Registry Configuration**: Expose `MASTER_REGISTRY.md` path in `policy.toml` and implement a structured parser.

## Consequences
- These changes will introduce slight latency penalties (specifically for synchronous WAL flushes), potentially putting the "sub-100ns" L0 goal at risk if IO bound. We must accept this to prioritize integrity (Fail-Closed) over raw throughput.
