use serde::{Deserialize, Serialize};
use multiplicity_common::types::UnifiedWitness;
use multiplicity_alp::admission::AdmissibilityReport;

#[derive(Debug, Clone, Serialize, Deserialize, schemars::JsonSchema)]
#[serde(tag = "type", content = "payload", rename_all = "snake_case")]
pub enum UnifiedEvent {
    /// A new witness has been added to the local or replicated ledger.
    WitnessAdded(UnifiedWitness),
    /// An action has been evaluated by the ALP policy gate.
    PolicyEvaluated {
        action_id: String,
        report: AdmissibilityReport,
    },
    /// A LAN replication event occurred (e.g., successful push or quarantine).
    ReplicationEvent {
        witness_id: String,
        status: String, // "replicated" | "quarantined" | "retrying"
        detail: String,
    },
    /// System-level notification (e.g., key rotation, constitution update).
    SystemStatus {
        level: String, // "info" | "warn" | "error"
        msg: String,
    },
}

pub struct EventBus {
    tx: tokio::sync::broadcast::Sender<UnifiedEvent>,
}

impl EventBus {
    pub fn new() -> Self {
        let (tx, _) = tokio::sync::broadcast::channel(1024);
        Self { tx }
    }

    pub fn sender(&self) -> tokio::sync::broadcast::Sender<UnifiedEvent> {
        self.tx.clone()
    }

    pub fn subscribe(&self) -> tokio::sync::broadcast::Receiver<UnifiedEvent> {
        self.tx.subscribe()
    }

    pub fn publish(&self, event: UnifiedEvent) {
        let _ = self.tx.send(event);
    }
}
