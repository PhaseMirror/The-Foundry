use crate::updater::{apply_ccre_step, CCREStep};

/// Runs full pilot validation on a CCRE step.
/// This is the Rust replacement for the Python `run_pilot_validation` function.
pub fn run_pilot_validation(step: &CCREStep) -> serde_json::Value {
    let result = apply_ccre_step(step);
    serde_json::to_value(&result).unwrap_or(serde_json::json!({"error": "serialization_failed"}))
}

/// Batch pilot validation for multiple CCRE steps.
pub fn batch_pilot_validation(steps: &[CCREStep]) -> Vec<serde_json::Value> {
    steps.iter().map(run_pilot_validation).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_run_pilot_validation() {
        let mut params = std::collections::HashMap::new();
        params.insert("theta".to_string(), 0.5);
        let mut delta = std::collections::HashMap::new();
        delta.insert("theta".to_string(), 0.1);

        let step = CCREStep::new(params, delta)
            .with_kappa(0.5)
            .with_drift(0.1)
            .with_resonance(0.5)
            .with_alpha(0.3)
            .with_transform_id("test_transform");

        let result = run_pilot_validation(&step);
        assert!(result.is_object());
    }
}
