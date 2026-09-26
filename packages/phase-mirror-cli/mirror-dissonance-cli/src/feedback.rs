// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct RuleStats {
    pub total_violations: u64,
    pub user_overrides: u64,
}

impl RuleStats {
    pub fn fpr(&self) -> f64 {
        if self.total_violations == 0 {
            0.0
        } else {
            self.user_overrides as f64 / self.total_violations as f64
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct FpStore {
    pub rules: HashMap<String, RuleStats>,
}

impl FpStore {
    pub fn load(path: &Path) -> anyhow::Result<Self> {
        if !path.exists() {
            return Ok(Self::default());
        }
        let content = std::fs::read_to_string(path)?;
        let store = serde_json::from_str(&content)?;
        Ok(store)
    }

    pub fn should_downgrade(&self, rule_id: &str, threshold: f64) -> bool {
        self.rules.get(rule_id)
            .map(|stats| stats.fpr() > threshold)
            .unwrap_or(false)
    }
}
