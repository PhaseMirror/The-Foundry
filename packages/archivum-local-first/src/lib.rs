use phase_mirror_surface::{ArchivumEvent, ContractivityReceipt, SurfaceState, SurfaceError};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;

/// Result of merging two divergent Archivum logs.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MergeResult {
    pub accepted: Vec<ArchivumEvent>,
    pub conflicts: Vec<(ArchivumEvent, ArchivumEvent)>,
}

impl MergeResult {
    pub fn is_conflict_free(&self) -> bool {
        self.conflicts.is_empty()
    }

    pub fn total_accepted(&self) -> usize {
        self.accepted.len()
    }
}

/// A conflict between two receipts that could not be auto-resolved.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchivumConflict {
    pub local: ArchivumEvent,
    pub remote: ArchivumEvent,
    pub resolution: ConflictResolution,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ConflictResolution {
    AcceptedLocal,
    AcceptedRemote,
    KeepBoth,
}

/// Local-first Archivum log backed by a file or equivalent partition.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalArchivum {
    pub surface: SurfaceState,
    pub entries: Vec<ArchivumEvent>,
}

impl LocalArchivum {
    pub fn new(surface: SurfaceState) -> Self {
        Self {
            surface,
            entries: Vec::new(),
        }
    }

    pub fn append(&mut self, receipt: &ContractivityReceipt, signature: String) -> ArchivumEvent {
        let event = ArchivumEvent::new(
            self.surface,
            receipt.witness_id.clone(),
            serde_json::to_string(receipt).expect("receipt serialization"),
            signature,
            0,
        );
        self.entries.push(event.clone());
        event
    }

    pub fn append_with_timestamp(
        &mut self,
        receipt: &ContractivityReceipt,
        signature: String,
        timestamp_ms: i64,
    ) -> ArchivumEvent {
        let event = ArchivumEvent::new(
            self.surface,
            receipt.witness_id.clone(),
            serde_json::to_string(receipt).expect("receipt serialization"),
            signature,
            timestamp_ms,
        );
        self.entries.push(event.clone());
        event
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    pub fn all_entries(&self) -> &[ArchivumEvent] {
        &self.entries
    }

    /// Merge a remote log into this log using last-writer-wins with witness-ID tie-breaker.
    pub fn merge(&mut self, remote: &LocalArchivum) -> MergeResult {
        let mut accepted = Vec::new();
        let mut conflicts = Vec::new();
        let mut local_index: HashMap<_, _> = self
            .entries
            .iter()
            .map(|e| (e.witness_id.as_str(), e))
            .collect();

        for remote_entry in &remote.entries {
            match local_index.get(remote_entry.witness_id.as_str()) {
                Some(local_entry) => {
                    if local_entry.timestamp_ms > remote_entry.timestamp_ms {
                        accepted.push((*local_entry).clone());
                    } else if remote_entry.timestamp_ms > local_entry.timestamp_ms {
                        accepted.push(remote_entry.clone());
                    } else {
                        let local_hash = Sha256::digest(local_entry.receipt_json.as_bytes());
                        let remote_hash = Sha256::digest(remote_entry.receipt_json.as_bytes());
                        let local_slice: &[u8] = local_hash.as_ref();
                        let remote_slice: &[u8] = remote_hash.as_ref();
                        if local_slice < remote_slice {
                            accepted.push((*local_entry).clone());
                        } else {
                            accepted.push(remote_entry.clone());
                        }
                        conflicts.push(((*local_entry).clone(), remote_entry.clone()));
                    }
                }
                None => {
                    accepted.push(remote_entry.clone());
                    local_index.insert(remote_entry.witness_id.as_str(), remote_entry);
                }
            }
        }

        // Add local-only entries
        for local_entry in &self.entries {
            if !local_index.contains_key(local_entry.witness_id.as_str()) {
                accepted.push((*local_entry).clone());
            }
        }

        MergeResult { accepted, conflicts }
    }

    /// Serialize the entire log to JSONL.
    pub fn to_jsonl(&self) -> String {
        self.entries
            .iter()
            .map(|e| serde_json::to_string(e).expect("event serialization"))
            .collect::<Vec<_>>()
            .join("\n")
    }

    /// Deserialize a JSONL log.
    pub fn from_jsonl(surface: SurfaceState, jsonl: &str) -> Result<Self, ArchivumError> {
        let mut entries = Vec::new();
        for line in jsonl.lines() {
            if line.trim().is_empty() {
                continue;
            }
            let event: ArchivumEvent =
                serde_json::from_str(line).map_err(|e| ArchivumError::ParseError(e.to_string()))?;
            entries.push(event);
        }
        Ok(Self { surface, entries })
    }
}

/// Errors that can occur in the local-first Archivum.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum ArchivumError {
    #[error("IO error: {0}")]
    IoError(String),
    #[error("Parse error: {0}")]
    ParseError(String),
    #[error("Signature verification failed: {0}")]
    SignatureError(String),
    #[error("Surface error: {0}")]
    SurfaceError(#[from] SurfaceError),
}

impl From<std::io::Error> for ArchivumError {
    fn from(e: std::io::Error) -> Self {
        ArchivumError::IoError(e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn append_and_len() {
        let mut log = LocalArchivum::new(SurfaceState::LocalFirstData);
        let receipt = ContractivityReceipt::ok(
            "w1".into(),
            SurfaceState::LocalFirstData,
            "arch1".into(),
            0.9,
            0.9,
            vec![1, 2],
        );
        log.append(&receipt, "sig1".into());
        assert_eq!(log.len(), 1);
        assert!(!log.is_empty());
    }

    #[test]
    fn merge_prefers_newer_timestamp() {
        let mut local = LocalArchivum::new(SurfaceState::LocalFirstData);
        let mut remote = LocalArchivum::new(SurfaceState::LocalFirstData);
        let receipt = ContractivityReceipt::ok(
            "w1".into(),
            SurfaceState::LocalFirstData,
            "arch1".into(),
            0.9,
            0.9,
            vec![1, 2],
        );
        local.append_with_timestamp(&receipt, "sig-local".into(), 1000);
        remote.append_with_timestamp(&receipt, "sig-remote".into(), 2000);

        let result = local.merge(&remote);
        assert!(result.is_conflict_free());
        assert_eq!(result.total_accepted(), 1);
    }

    #[test]
    fn jsonl_roundtrip() {
        let mut log = LocalArchivum::new(SurfaceState::ESP32Edge);
        let receipt = ContractivityReceipt::ok(
            "w2".into(),
            SurfaceState::ESP32Edge,
            "arch2".into(),
            0.95,
            0.90,
            vec![3, 5, 7],
        );
        log.append(&receipt, "sig2".into());
        let jsonl = log.to_jsonl();
        let parsed = LocalArchivum::from_jsonl(SurfaceState::ESP32Edge, &jsonl).unwrap();
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed.entries[0].witness_id, "w2");
    }
}
