use crate::contraction::contraction_holds;
use crate::drift_tracker::drift_holds;
use crate::resonance_guard::resonance_holds;
use crate::witness::emit_witness;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// CCRE update result with formal verification metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CCREUpdateResult {
    pub accepted: bool,
    pub parameters: HashMap<String, f64>,
    pub reason: String,
    pub witness: Option<HashMap<String, String>>,
    pub kappa: f64,
    pub drift: f64,
    pub resonance: f64,
}

/// CCRE state for a single dimension/node.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CCREStep {
    pub parameters: HashMap<String, f64>,
    pub delta: HashMap<String, f64>,
    pub kappa: f64,
    pub drift: f64,
    pub resonance: f64,
    pub alpha: f64,
    pub transform_id: String,
}

impl CCREStep {
    pub fn new(parameters: HashMap<String, f64>, delta: HashMap<String, f64>) -> Self {
        Self {
            parameters: parameters.clone(),
            delta: delta.clone(),
            kappa: 0.0,
            drift: 0.0,
            resonance: 0.0,
            alpha: 0.3,
            transform_id: "default".to_string(),
        }
    }

    pub fn with_kappa(mut self, kappa: f64) -> Self {
        self.kappa = kappa;
        self
    }

    pub fn with_drift(mut self, drift: f64) -> Self {
        self.drift = drift;
        self
    }

    pub fn with_resonance(mut self, resonance: f64) -> Self {
        self.resonance = resonance;
        self
    }

    pub fn with_alpha(mut self, alpha: f64) -> Self {
        self.alpha = alpha;
        self
    }

    pub fn with_transform_id(mut self, transform_id: impl Into<String>) -> Self {
        self.transform_id = transform_id.into();
        self
    }
}

/// Applies a CCRE update step with formal invariant checks.
pub fn apply_ccre_step(step: &CCREStep) -> CCREUpdateResult {
    if step.alpha <= 0.0 {
        return CCREUpdateResult {
            accepted: false,
            parameters: step.parameters.clone(),
            reason: "invalid_alpha".into(),
            witness: None,
            kappa: step.kappa,
            drift: step.drift,
            resonance: step.resonance,
        };
    }
    if !contraction_holds(step.kappa) {
        return CCREUpdateResult {
            accepted: false,
            parameters: step.parameters.clone(),
            reason: "contraction_violation".into(),
            witness: None,
            kappa: step.kappa,
            drift: step.drift,
            resonance: step.resonance,
        };
    }
    if !drift_holds(step.drift, step.alpha) {
        return CCREUpdateResult {
            accepted: false,
            parameters: step.parameters.clone(),
            reason: "drift_violation".into(),
            witness: None,
            kappa: step.kappa,
            drift: step.drift,
            resonance: step.resonance,
        };
    }
    if !resonance_holds(step.resonance, 0.3, 0.7) {
        return CCREUpdateResult {
            accepted: false,
            parameters: step.parameters.clone(),
            reason: "resonance_violation".into(),
            witness: None,
            kappa: step.kappa,
            drift: step.drift,
            resonance: step.resonance,
        };
    }

    let mut next_params = step.parameters.clone();
    for (k, v) in step.delta.iter() {
        let entry = next_params.entry(k.clone()).or_insert(0.0);
        *entry += v;
    }

    let witness = emit_witness(&step.transform_id, &next_params);

    CCREUpdateResult {
        accepted: true,
        parameters: next_params,
        reason: "accepted".into(),
        witness: Some(witness),
        kappa: step.kappa,
        drift: step.drift,
        resonance: step.resonance,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_apply_ccre_step_accepted() {
        let mut params = HashMap::new();
        params.insert("theta".to_string(), 0.5);
        let mut delta = HashMap::new();
        delta.insert("theta".to_string(), 0.1);

        let step = CCREStep::new(params, delta)
            .with_kappa(0.5)
            .with_drift(0.1)
            .with_resonance(0.5)
            .with_alpha(0.3)
            .with_transform_id("test_transform");

        let result = apply_ccre_step(&step);
        assert!(result.accepted);
        assert_eq!(result.parameters.get("theta"), Some(&0.6));
    }

    #[test]
    fn test_apply_ccre_step_rejected_contraction() {
        let mut params = HashMap::new();
        params.insert("theta".to_string(), 0.5);
        let mut delta = HashMap::new();
        delta.insert("theta".to_string(), 0.1);

        let step = CCREStep::new(params, delta)
            .with_kappa(1.5)
            .with_drift(0.1)
            .with_resonance(0.5)
            .with_alpha(0.3)
            .with_transform_id("test_transform");

        let result = apply_ccre_step(&step);
        assert!(!result.accepted);
        assert_eq!(result.reason, "contraction_violation");
    }
}
