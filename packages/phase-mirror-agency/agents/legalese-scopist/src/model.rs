use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RetentionPolicy {
    pub version: String,
    pub policy_name: String,
    pub sedona_references: Vec<SedonaReference>,
    pub rules: Vec<RetentionRule>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SedonaReference {
    pub principle: String,
    pub note: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RetentionRule {
    pub id: String,
    pub description: Option<String>,
    pub scope: Scope,
    pub when: Conditions,
    pub action: Action,
    pub sedona: SedonaTags,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Scope {
    pub systems: Vec<String>,
    pub esi_types: Vec<String>,
    pub custodians_filter: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conditions {
    pub litigation_hold_active: bool,
    pub relevance_band: Vec<RelevanceBand>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum RelevanceBand {
    Unknown,
    Core,
    Important,
    Marginal,
    Irrelevant,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Action {
    pub retain_for_days: RetentionDuration,
    pub delete_after: bool,
    pub enable_snapshot: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum RetentionDuration {
    Days(u32),
    Infinite(String), // "infinite"
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SedonaTags {
    pub principles: Vec<String>,
    pub rationale: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EsiSource {
    pub id: String,
    pub system: String,
    pub esi_type: String,
    pub custodian: Option<String>,
    pub relevance_band: RelevanceBand,
    pub litigation_hold_active: bool,
    pub created_at: chrono::NaiveDate,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EvaluationResult {
    pub rule_id: String,
    pub action: Action,
    pub sedona_rationale: String,
}
