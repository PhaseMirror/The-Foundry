use std::fs::{OpenOptions, create_dir_all};
use std::io::Write;
use std::collections::{VecDeque, HashMap};
use anyhow::{Result, Context};
use chrono::Utc;
use multiplicity_common::types::UnifiedWitness;
use multiplicity_common::GitLedger;
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;
use crate::events::UnifiedEvent;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MerkleProof {
    pub namespace: String,
    pub prime_index: u64,
    pub record_hash: String,
}

impl MerkleProof {
    pub fn verify(&self) -> bool {
        // Phase 1: Basic validation of non-empty fields
        !self.record_hash.is_empty() && self.prime_index > 0
    }
}

pub struct LocalPrimeRegistry {
    pub namespace: String,
    pub reserved: VecDeque<u64>,
    pub consumed: HashMap<u64, String>,
    pub state: String,
}

impl LocalPrimeRegistry {
    pub fn new(namespace: String, seed_block: Vec<u64>) -> Self {
        Self {
            namespace,
            reserved: VecDeque::from(seed_block),
            consumed: HashMap::new(),
            state: "RESERVED".to_string(),
        }
    }

    pub fn assign(&mut self, record_id: &str) -> Result<u64> {
        if self.reserved.is_empty() {
            anyhow::bail!("Batch reservation depleted in namespace {}", self.namespace);
        }
        let prime = self.reserved.pop_front().unwrap();
        self.consumed.insert(prime, record_id.to_string());
        Ok(prime)
    }

    pub fn void_orphaned(&mut self, prime: u64) {
        self.consumed.insert(prime, "VOID_ORPHANED".to_string());
    }
}

pub struct ArchivumStore {
    ledger: GitLedger,
    event_tx: broadcast::Sender<UnifiedEvent>,
    registries: HashMap<String, LocalPrimeRegistry>,
}

impl ArchivumStore {
    pub fn new(ledger: GitLedger, event_tx: broadcast::Sender<UnifiedEvent>) -> Self {
        Self { 
            ledger, 
            event_tx,
            registries: HashMap::new(),
        }
    }

    pub fn register_namespace(&mut self, namespace: &str, seed_block: Vec<u64>) {
        self.registries.insert(
            namespace.to_string(), 
            LocalPrimeRegistry::new(namespace.to_string(), seed_block)
        );
    }

    pub fn subscribe(&self) -> broadcast::Receiver<UnifiedEvent> {
        self.event_tx.subscribe()
    }

    pub fn anchor(&mut self, record_id: &str, namespace: &str, record_hash: &str) -> Result<MerkleProof> {
        let registry = self.registries.get_mut(namespace)
            .context(format!("Namespace {} not registered", namespace))?;
        
        let prime_index = registry.assign(record_id)?;
        
        Ok(MerkleProof {
            namespace: namespace.to_string(),
            prime_index,
            record_hash: record_hash.to_string(),
        })
    }

    pub fn resolve(&self, prime_index: u64, namespace: &str) -> Result<String> {
        let registry = self.registries.get(namespace)
            .context(format!("Namespace {} not found", namespace))?;
        
        if let Some(record_id) = registry.consumed.get(&prime_index) {
            if record_id == "VOID_ORPHANED" {
                anyhow::bail!("Prime {} in namespace {} is VOID_ORPHANED", prime_index, namespace);
            }
            return Ok(record_id.clone());
        }
        
        anyhow::bail!("Prime {} not found in namespace {}", prime_index, namespace);
    }

    pub fn write_witness(&mut self, witness: &UnifiedWitness) -> Result<()> {
        let mut witness_val = serde_json::to_value(witness)?;
        
        // Phase 1: Auto-anchor AHGI agent actions
        if witness.action_id.starts_with("ahgi.") {
             let namespace = "ahgi.agent_action";
             let record_hash = format!("{:x}", sha2::Sha256::digest(serde_json::to_string(&witness_val)?.as_bytes()));
             let proof = self.anchor(&witness.witness_id, namespace, &record_hash)?;
             witness_val.as_object_mut().unwrap().insert("archivum_proof".to_string(), serde_json::to_value(proof)?);
        }

        let archivum_dir = self.ledger.repo_path.join("state").join("archivum");
        create_dir_all(&archivum_dir).context("failed to create archivum directory")?;
        
        let path = archivum_dir.join("witnesses.jsonl");
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path)
            .context("failed to open witnesses.jsonl file")?;
            
        let json_line = serde_json::to_string(&witness_val).context("failed to serialize witness")?;
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
}
