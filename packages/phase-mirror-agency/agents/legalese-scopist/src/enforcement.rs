use crate::model::{RetentionPolicy, EsiSource, EvaluationResult, RetentionRule};
use thiserror::Error;
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Error, Debug)]
pub enum RetentionError {
    #[error("No matching rule found for ESI source: {0}")]
    NoMatchingRule(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RetentionViolation {
    pub esi_source_id: String,
    pub system_id: String,
    pub issue_type: String,
    pub description: String,
    pub sedona_principles: Vec<String>,
}

#[wasm_bindgen]
pub struct RetentionEngine;

impl RetentionEngine {
    pub fn evaluate(
        policy: &RetentionPolicy,
        source: &EsiSource,
    ) -> Result<EvaluationResult, RetentionError> {
        for rule in &policy.rules {
            if Self::matches_rule(rule, source) {
                return Ok(EvaluationResult {
                    rule_id: rule.id.clone(),
                    action: rule.action.clone(),
                    sedona_rationale: rule.sedona.rationale.clone(),
                });
            }
        }

        Err(RetentionError::NoMatchingRule(source.id.clone()))
    }

    fn matches_rule(rule: &RetentionRule, source: &EsiSource) -> bool {
        if !rule.scope.systems.contains(&source.system) {
            return false;
        }
        if !rule.scope.esi_types.contains(&source.esi_type) {
            return false;
        }
        if rule.when.litigation_hold_active != source.litigation_hold_active {
            return false;
        }
        if !rule.when.relevance_band.contains(&source.relevance_band) {
            return false;
        }

        true
    }
}

#[wasm_bindgen]
impl RetentionEngine {
    pub fn audit_retention(
        policy_json: &str,
        sources_json: &str,
    ) -> Result<JsValue, JsValue> {
        let policy: RetentionPolicy = serde_json::from_str(policy_json)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        let sources: Vec<EsiSource> = serde_json::from_str(sources_json)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        let mut violations = Vec::new();

        for source in sources {
            match Self::evaluate(&policy, &source) {
                Ok(res) => {
                    if source.litigation_hold_active && !matches!(res.action.retain_for_days, crate::model::RetentionDuration::Infinite(_)) {
                        violations.push(RetentionViolation {
                            esi_source_id: source.id.clone(),
                            system_id: source.system.clone(),
                            issue_type: "HoldNotImplemented".into(),
                            description: format!("Active hold on {} requires infinite retention, but rule '{}' specified limited duration.", source.id, res.rule_id),
                            sedona_principles: vec!["Principle 5".into()],
                        });
                    }
                }
                Err(_) => {
                    violations.push(RetentionViolation {
                        esi_source_id: source.id.clone(),
                        system_id: source.system.clone(),
                        issue_type: "NoMatchingPolicy".into(),
                        description: format!("No retention rule found for ESI source {}.", source.id),
                        sedona_principles: vec!["Principle 1".into()],
                    });
                }
            }
        }

        Ok(serde_wasm_bindgen::to_value(&violations)?)
    }
}
