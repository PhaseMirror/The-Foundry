use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuleViolation {
    pub rule_id: String,
    pub severity: Severity,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleInput {
    pub mode: String,
    #[serde(default)]
    pub strict: bool,
    #[serde(default)]
    pub dry_run: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Outcome {
    Allow,
    Block,
    Warn,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineDecision {
    pub outcome: Outcome,
    pub reasons: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}
