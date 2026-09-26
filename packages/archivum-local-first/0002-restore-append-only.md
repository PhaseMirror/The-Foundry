# ADR 0002: Restore Strict Append-Only Semantics

## Status
Proposed

## Context
The log is described as "append-only". However, the `merge` function treats `witness_id` as a primary key and overwrites local entries using a "last-writer-wins" (LWW) strategy based on an untrusted `timestamp_ms`. This allows any remote actor to retroactively erase or mutate log entries by supplying a future timestamp.

## Decision
We will eliminate the LWW register mutation logic. The log will function as an actual append-only set. `merge` will compute the cryptographic hash of each event and append all unique, valid events. `witness_id` will no longer grant overwrite privileges.

## Consequences
- The log becomes strictly monotonic.
- Data deletion or mutation via timestamp manipulation is eliminated.
- The `MergeResult` conflict mechanism will be replaced by deterministic deduplication.
