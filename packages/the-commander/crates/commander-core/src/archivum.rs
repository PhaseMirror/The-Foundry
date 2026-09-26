use std::fs::{OpenOptions, create_dir_all};
use std::io::Write;
use anyhow::{Result, Context};
use chrono::Utc;
use multiplicity_common::types::UnifiedWitness;
use multiplicity_common::GitLedger;
use tokio::sync::broadcast;
use crate::events::UnifiedEvent;

pub struct ArchivumStore {
    ledger: GitLedger,
    event_tx: broadcast::Sender<UnifiedEvent>,
}

impl ArchivumStore {
    pub fn new(ledger: GitLedger, event_tx: broadcast::Sender<UnifiedEvent>) -> Self {
        Self { ledger, event_tx }
    }

    pub fn subscribe(&self) -> broadcast::Receiver<UnifiedEvent> {
        self.event_tx.subscribe()
    }

    pub fn write_witness(&self, witness: &UnifiedWitness) -> Result<()> {
        let archivum_dir = self.ledger.repo_path.join("state").join("archivum");
        create_dir_all(&archivum_dir).context("failed to create archivum directory")?;
        
        let path = archivum_dir.join("witnesses.jsonl");
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path)
            .context("failed to open witnesses.jsonl file")?;
            
        let json_line = serde_json::to_string(witness).context("failed to serialize witness")?;
        writeln!(file, "{}", json_line).context("failed to write witness to file")?;
        
        // Notify the unified event bus
        let _ = self.event_tx.send(UnifiedEvent::WitnessAdded(witness.clone()));

        // Also commit the new witness to Git to satisfy immutable log requirements
        let output = std::process::Command::new("git")
            .arg("-C")
            .arg(&self.ledger.repo_path)
            .args(&["add", "state/archivum/witnesses.jsonl"])
            .output()?;
            
        if output.status.success() {
            let message = format!("archivum: log witness {}", witness.witness_id);
            let _ = std::process::Command::new("git")
                .arg("-C")
                .arg(&self.ledger.repo_path)
                .args(&["commit", "--no-verify", "-m", &message])
                .output();
        }
        
        Ok(())
    }

    pub fn read_witnesses(&self) -> Result<Vec<UnifiedWitness>> {
        let path = self.ledger.repo_path.join("state").join("archivum").join("witnesses.jsonl");
        if !path.exists() {
            return Ok(Vec::new());
        }
        let content = std::fs::read_to_string(&path)?;
        let mut witnesses = Vec::new();
        for line in content.lines() {
            if line.trim().is_empty() {
                continue;
            }
            let w: UnifiedWitness = serde_json::from_str(line)?;
            witnesses.push(w);
        }
        Ok(witnesses)
    }

    pub fn get_last_witness_for_workflow(&self, workflow_id: &str) -> Result<Option<UnifiedWitness>> {
        let witnesses = self.read_witnesses()?;
        Ok(witnesses.into_iter()
            .filter(|w| w.action_id == workflow_id)
            .last())
    }

    pub async fn append_replicated(&self, mut witness: serde_json::Value) -> Result<()> {
        // 1. Stamp with replication metadata if not present
        if let Some(obj) = witness.as_object_mut() {
            if !obj.contains_key("replicated_at") {
                obj.insert("replicated_at".to_string(), serde_json::json!(Utc::now().to_rfc3339()));
            }
        }

        // 2. Write to local ledger
        let archivum_dir = self.ledger.repo_path.join("state").join("archivum");
        let path = archivum_dir.join("witnesses.jsonl");
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path)?;
            
        let json_line = serde_json::to_string(&witness)?;
        writeln!(file, "{}", json_line)?;
        
        // 3. Notify the unified event bus
        if let Ok(w) = serde_json::from_value::<UnifiedWitness>(witness.clone()) {
            let _ = self.event_tx.send(UnifiedEvent::WitnessAdded(w));
        }

        // 4. Commit to git
        let output = std::process::Command::new("git")
            .arg("-C")
            .arg(&self.ledger.repo_path)
            .args(&["add", "state/archivum/witnesses.jsonl"])
            .output()?;
            
        if output.status.success() {
            let witness_id = witness.get("witness_id").and_then(|v| v.as_str()).unwrap_or("unknown");
            let message = format!("archivum: replicated witness {}", witness_id);
            let _ = std::process::Command::new("git")
                .arg("-C")
                .arg(&self.ledger.repo_path)
                .args(&["commit", "--no-verify", "-m", &message])
                .output();
        }

        Ok(())
    }

    /// Write spectral witness from SpectralMetrics for HoE escalation tracking
    pub fn write_spectral_witness(
        &self,
        action_id: &str,
        metrics: &multiplicity_alp::SpectralMetrics,
        veto_status: &str,
    ) -> Result<UnifiedWitness> {
        let witness = multiplicity_alp::build_spectral_witness(action_id, metrics, veto_status);
        self.write_witness(&witness)?;
        Ok(witness)
    }
}
