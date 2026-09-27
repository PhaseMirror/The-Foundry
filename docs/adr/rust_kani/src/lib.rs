//! Core ADR definitions and API.
//! No external math libraries – pure Rust.

use serde::{Deserialize, Serialize};

/// Unique identifier for an ADR.
pub type ADRId = u32;

/// Enumeration of ADR lifecycle states.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ADRStatus {
    Proposed,
    Accepted,
    Deprecated,
    Superseded,
}

/// Links to external artifacts (e.g., Git commit, PDF).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactLink {
    pub description: String,
    pub url: String,
}

/// Core ADR data structure.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ADR {
    pub id: ADRId,
    pub title: String,
    pub status: ADRStatus,
    pub context: String,
    pub decision: String,
    pub consequences: Vec<String>,
    pub supersedes: Option<ADRId>,
    pub links: Vec<ArtifactLink>,
}

impl ADR {
    /// Create a new proposed ADR.
    pub fn new(id: ADRId, title: impl Into<String>, context: impl Into<String>, decision: impl Into<String>, consequences: Vec<String>) -> Self {
        ADR {
            id,
            title: title.into(),
            status: ADRStatus::Proposed,
            context: context.into(),
            decision: decision.into(),
            consequences,
            supersedes: None,
            links: Vec::new(),
        }
    }

    /// Transition to Accepted – only allowed if not already superseded.
    pub fn accept(&mut self) {
        assert!(self.status == ADRStatus::Proposed, "Only Proposed ADRs can be accepted");
        self.status = ADRStatus::Accepted;
    }

    /// Mark as Deprecated.
    pub fn deprecate(&mut self) {
        self.status = ADRStatus::Deprecated;
    }

    /// Supersede this ADR with a new one.
    pub fn supersede(&mut self, new_id: ADRId) {
        self.supersedes = Some(new_id);
        self.status = ADRStatus::Superseded;
    }
}
