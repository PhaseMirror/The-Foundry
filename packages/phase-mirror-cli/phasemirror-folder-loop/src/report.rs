// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Outcome for a single item processed by the loop.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ItemStatus {
    /// The loop completed successfully for this item.
    Ok,
    /// The loop ran but produced a warning (e.g., partial data).
    Warn,
    /// The loop failed for this item.
    Error,
}

/// A single processed entry produced by one iteration of the loop.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemResult {
    /// Path of the source entry relative to the input folder.
    pub relative_path: PathBuf,
    /// Whether the entry is a file or directory.
    pub kind: String,
    /// Loop outcome for this entry.
    pub status: ItemStatus,
    /// Number of loop iterations applied to this entry.
    pub iterations: u64,
    /// Human-readable message (empty on success).
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub message: String,
    /// Deterministic SHA-256 digest of the entry content (files only).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub content_hash: Option<String>,
}

/// Aggregated report emitted to the output folder.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoopReport {
    /// Report schema version.
    pub version: String,
    /// Identifier of the ADR this report is produced under.
    pub adr: String,
    /// RFC3339 timestamp when the run started.
    pub started_at: DateTime<Utc>,
    /// RFC3339 timestamp when the run finished.
    pub finished_at: DateTime<Utc>,
    /// Resolved input folder.
    pub input_folder: PathBuf,
    /// Resolved output folder.
    pub output_folder: PathBuf,
    /// Total number of entries visited.
    pub entries_scanned: u64,
    /// Counts per outcome category.
    pub counts: Counts,
    /// Deterministic SHA-256 digest over the sorted relative paths of all
    /// visited entries (tamper-evident witness of the input set).
    pub input_manifest_hash: String,
    /// Per-entry loop results.
    pub items: Vec<ItemResult>,
}

/// Outcome tallies for a run.
#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize)]
pub struct Counts {
    pub ok: u64,
    pub warn: u64,
    pub error: u64,
}

impl Counts {
    /// Total number of entries across all outcomes.
    pub fn total(&self) -> u64 {
        self.ok + self.warn + self.error
    }
}

impl LoopReport {
    /// Whether the run is considered successful (no errors).
    pub fn is_success(&self) -> bool {
        self.counts.error == 0
    }
}
