use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use anyhow::Result;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub timestamp: DateTime<Utc>,
    pub item_id: String,
    pub action: String,
    pub decision: String,
    pub proof_hash: Option<String>,
}

pub trait AuditLog: Send + Sync {
    fn append(&self, event: &AuditEvent) -> Result<()>;
}

pub struct FileAuditLog {
    path: PathBuf,
}

impl FileAuditLog {
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }
}

impl AuditLog for FileAuditLog {
    fn append(&self, event: &AuditEvent) -> Result<()> {
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)?;
        
        let json = serde_json::to_string(event)? + "\n";
        file.write_all(json.as_bytes())?;
        Ok(())
    }
}
