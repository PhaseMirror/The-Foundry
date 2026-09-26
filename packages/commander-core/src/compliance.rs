use serde::{Deserialize, Serialize};
use anyhow::{Context, Result};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

#[derive(Debug, Deserialize, Serialize)]
pub struct Control {
    pub id: String,
    pub title: String,
    pub description: String,
    pub match_config: MatchConfig,
    pub evidence: EvidenceConfig,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MatchConfig {
    pub event_types: Vec<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct EvidenceConfig {
    pub report: String,
    pub retention: String,
    pub severity_if_missing: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Framework {
    pub id: String,
    pub controls: Vec<Control>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CompliancePolicy {
    pub frameworks: Vec<Framework>,
}

pub struct ComplianceEngine {
    policy: CompliancePolicy,
    report_dir: PathBuf,
}

impl ComplianceEngine {
    pub fn new(repo_path: &Path) -> Result<Self> {
        let policy_path = repo_path.join("policy").join("compliance").join("soc2-hipaa-map.yaml");
        let content = std::fs::read_to_string(&policy_path)
            .context("failed to load compliance policy")?;
        let policy: CompliancePolicy = serde_yaml::from_str(&content)
            .context("failed to parse compliance policy")?;
        
        let report_dir = repo_path.join("state").join("compliance").join("reports");
        
        Ok(Self { policy, report_dir })
    }

    pub fn generate_reports(&self, witnesses: &[serde_json::Value]) -> Result<()> {
        for framework in &self.policy.frameworks {
            for control in &framework.controls {
                let report_path = self.report_dir.join(format!("{}_{}.json", framework.id, control.id));
                let mut evidence = Vec::new();
                
                for witness in witnesses {
                    // Simple matcher logic
                    if self.matches(witness, &control.match_config) {
                        evidence.push(witness.clone());
                    }
                }
                
                let report = serde_json::json!({
                    "control_id": control.id,
                    "generated_at": chrono::Utc::now().to_rfc3339(),
                    "evidence": evidence
                });
                
                std::fs::write(report_path, serde_json::to_string_pretty(&report)?)?;
            }
        }
        Ok(())
    }

    fn matches(&self, witness: &serde_json::Value, config: &MatchConfig) -> bool {
        let event_type = witness["event_type"].as_str().unwrap_or("");
        if !config.event_types.contains(&event_type.to_string()) {
            return false;
        }
        
        let empty = vec![];
        let tags = witness["tags"].as_array().unwrap_or(&empty);
        for tag in tags {
            if config.tags.contains(&tag.as_str().unwrap_or("").to_string()) {
                return true;
            }
        }
        
        false
    }
}
