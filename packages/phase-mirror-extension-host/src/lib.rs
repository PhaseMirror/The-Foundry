use phase_mirror_surface::{ContractivityReceipt, SurfaceState};
use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Errors that can occur in the extension host.
#[derive(Debug, Clone, PartialEq, Eq, Error)]
#[error("Extension host error: {message}")]
pub struct ExtensionHostError {
    pub message: String,
}

impl ExtensionHostError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

/// Context menu action emitted by the extension.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextMenuAction {
    pub id: String,
    pub title: String,
    pub surface: SurfaceState,
}

impl ContextMenuAction {
    pub fn new(id: impl Into<String>, title: impl Into<String>, surface: SurfaceState) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            surface,
        }
    }
}

/// Sidebar panel state for the Chromium extension.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PanelState {
    pub triple_lock_phase: phase_mirror_surface::TripleLockPhase,
    pub last_receipt: Option<ContractivityReceipt>,
    pub dissonance_feed: Vec<String>,
}

impl PanelState {
    pub fn new() -> Self {
        Self {
            triple_lock_phase: phase_mirror_surface::TripleLockPhase::Genius,
            last_receipt: None,
            dissonance_feed: Vec::new(),
        }
    }

    pub fn update_phase(&mut self, phase: phase_mirror_surface::TripleLockPhase) {
        self.triple_lock_phase = phase;
    }

    pub fn push_dissonance(&mut self, message: impl Into<String>) {
        self.dissonance_feed.push(message.into());
    }
}

/// Problem matcher output for VS Code diagnostics.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Diagnostic {
    pub file: String,
    pub line: u32,
    pub column: u32,
    pub severity: DiagnosticSeverity,
    pub message: String,
    pub receipt_witness_id: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum DiagnosticSeverity {
    Error,
    Warning,
    Info,
}

/// Sync queue entry for deferred offline writes.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncQueueEntry {
    pub id: String,
    pub receipt: ContractivityReceipt,
    pub queued_at_ms: i64,
}

impl SyncQueueEntry {
    pub fn new(receipt: ContractivityReceipt, queued_at_ms: i64) -> Self {
        let id = uuid::Uuid::new_v4().to_string();
        Self {
            id,
            receipt,
            queued_at_ms,
        }
    }
}

/// Trait for extension-host storage backends.
pub trait StorageBackend {
    fn store_receipt(&self, receipt: &ContractivityReceipt) -> Result<(), ExtensionHostError>;
    fn read_receipts(&self, since_ms: i64) -> Result<Vec<ContractivityReceipt>, ExtensionHostError>;
    fn store_sync_queue(&self, entries: &[SyncQueueEntry]) -> Result<(), ExtensionHostError>;
    fn read_sync_queue(&self) -> Result<Vec<SyncQueueEntry>, ExtensionHostError>;
}

#[cfg(target_arch = "wasm32")]
pub mod wasm_storage;

#[cfg(not(target_arch = "wasm32"))]
pub mod native_storage;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn panel_state_defaults() {
        let state = PanelState::new();
        assert_eq!(
            state.triple_lock_phase,
            phase_mirror_surface::TripleLockPhase::Genius
        );
        assert!(state.last_receipt.is_none());
        assert!(state.dissonance_feed.is_empty());
    }

    #[test]
    fn diagnostic_construction() {
        let diag = Diagnostic {
            file: "main.rs".to_string(),
            line: 42,
            column: 10,
            severity: DiagnosticSeverity::Error,
            message: "L0 invariant violated".to_string(),
            receipt_witness_id: Some("w-123".to_string()),
        };
        assert_eq!(diag.line, 42);
    }
}
