use std::path::{Path, PathBuf};
use anyhow::Result;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use multiplicity_common::replication::ReplicationError;

/// A quarantined witness entry — written to state/sync/quarantine/<id>.json.
/// Never deleted by automated processes. Operator-only via pscmd sync quarantine list.
#[derive(Debug, Serialize, Deserialize)]
pub struct QuarantineEntry {
    pub witness_id: String,
    pub quarantined_at: String,
    pub reason: String,
    pub error_class: String, // "PolicyRejection" | "SchemaError" | "AuthFailure"
    pub raw_witness_json: serde_json::Value,
}

pub struct QuarantineStore {
    dir: PathBuf,
}

impl QuarantineStore {
    pub fn new(state_dir: &Path) -> Self {
        Self { dir: state_dir.join("sync").join("quarantine") }
    }

    pub fn write(&self, witness_id: &str, witness_json: serde_json::Value,
                 err: &ReplicationError) -> Result<()> {
        std::fs::create_dir_all(&self.dir)?;
        let entry = QuarantineEntry {
            witness_id: witness_id.to_string(),
            quarantined_at: Utc::now().to_rfc3339(),
            reason: err.to_string(),
            error_class: match err {
                ReplicationError::PolicyRejection { .. } => "PolicyRejection",
                ReplicationError::SchemaError(_)         => "SchemaError",
                ReplicationError::AuthFailure            => "AuthFailure",
                ReplicationError::Transport(_)           => "Transport",
            }.to_string(),
            raw_witness_json: witness_json,
        };
        let path = self.dir.join(format!("{}.json", witness_id));
        let content = serde_json::to_string_pretty(&entry)?;
        std::fs::write(&path, content)?;
        tracing::warn!(
            witness_id, error_class = entry.error_class,
            "witness quarantined — operator review required"
        );
        Ok(())
    }

    pub fn list(&self) -> Result<Vec<QuarantineEntry>> {
        if !self.dir.exists() { return Ok(vec![]); }
        let mut entries = Vec::new();
        for entry in std::fs::read_dir(&self.dir)? {
            let path = entry?.path();
            if path.extension().and_then(|e| e.to_str()) == Some("json") {
                let raw = std::fs::read_to_string(&path)?;
                entries.push(serde_json::from_str(&raw)?);
            }
        }
        Ok(entries)
    }
}
