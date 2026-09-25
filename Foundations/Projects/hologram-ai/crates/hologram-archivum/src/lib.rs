use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use std::fs::OpenOptions;
use std::io::Write;
use chrono::Utc;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AiEvent {
    pub timestamp: String,
    pub event_type: String,
    pub domain: String,
    pub payload: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UnifiedWitness {
    pub hash: String,
    pub event: AiEvent,
}

pub struct ArchivumLogger {
    pub log_path: String,
}

impl ArchivumLogger {
    pub fn new(path: &str) -> Self {
        Self {
            log_path: path.to_string(),
        }
    }

    pub fn log_event(&self, event_type: &str, domain: &str, payload: &str) -> Result<UnifiedWitness, String> {
        let event = AiEvent {
            timestamp: Utc::now().to_rfc3339(),
            event_type: event_type.to_string(),
            domain: domain.to_string(),
            payload: payload.to_string(),
        };

        let event_json = serde_json::to_string(&event).map_err(|e| e.to_string())?;

        let mut hasher = Sha256::new();
        hasher.update(event_json.as_bytes());
        let hash = format!("{:x}", hasher.finalize());

        let witness = UnifiedWitness {
            hash: hash.clone(),
            event,
        };

        let witness_json = serde_json::to_string(&witness).map_err(|e| e.to_string())?;

        if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(&self.log_path) {
            let _ = writeln!(file, "{}", witness_json);
        }

        Ok(witness)
    }
}
