pub mod server;
pub mod audit;
pub mod policy;
pub mod lean;
pub mod guardian_agent;

use crate::audit::{AuditLog, AuditEvent};
use crate::policy::PolicyEngine;
use crate::lean::LeanVerifier;
use std::sync::Arc;
use chrono::Utc;
use ndarray::Array1;
use zmod_guardian::ACEGuardian;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuardianPolicy {
    pub safety_threshold: f64,
    pub projection_type: String,
}

#[derive(Clone)]
pub struct GuardianService {
    pub guardian: ACEGuardian,
    pub logger: Arc<dyn AuditLog>,
    pub policy_engine: Arc<PolicyEngine>,
    pub verifier: Arc<LeanVerifier>,
}

impl GuardianService {
    pub fn new(guardian: ACEGuardian, logger: Arc<dyn AuditLog>, policy_engine: Arc<PolicyEngine>, verifier: Arc<LeanVerifier>) -> Self {
        Self { guardian, logger, policy_engine, verifier }
    }

    pub fn validate_proposal(&self, item_id: String, proposal: Vec<f64>) -> anyhow::Result<Vec<f64>> {
        let threshold = self.policy_engine.get_rule("safety_threshold").unwrap_or(1.0);
        
        // Formally verify the policy before enforcement
        self.verifier.verify_safety_policy(threshold)?;

        let arr = Array1::from(proposal);
        let projected = self.guardian.project(arr.view());

        let event = AuditEvent {
            timestamp: Utc::now(),
            item_id,
            action: "VALIDATE_FORMAL".to_string(),
            decision: format!("PROJECTED_WITH_VERIFIED_THRESHOLD_{}", threshold),
            proof_hash: None,
        };
        self.logger.append(&event)?;

        Ok(projected.to_vec())
    }
}
