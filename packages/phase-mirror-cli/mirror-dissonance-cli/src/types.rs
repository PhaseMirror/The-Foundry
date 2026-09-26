// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

use serde::{Serialize, Deserialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Outcome {
    PASS,
    WARN,
    BLOCK,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Evidence {
    pub file: PathBuf,
    pub line_range: (usize, usize),
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Violation {
    pub rule_id: String,
    pub severity: Outcome,
    pub evidence: Evidence,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Witness {
    pub id: String,
    pub hash: String,
    pub timestamp: String,
}

use crate::privacy::redact_path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DissonanceReport {
    pub version: String,
    pub event_mode: String,
    pub outcome: Outcome,
    pub l0_status: Outcome,
    pub violations: Vec<Violation>,
    pub witness: Witness,
}

impl DissonanceReport {
    pub fn redact(mut self) -> Self {
        for v in &mut self.violations {
            if let Some(path_str) = v.evidence.file.to_str() {
                v.evidence.file = PathBuf::from(redact_path(path_str));
            }
        }
        self
    }
}

pub trait Scanner {
    fn id(&self) -> &str;
    fn scan(&self, root: &std::path::Path) -> anyhow::Result<Vec<Violation>>;
}
