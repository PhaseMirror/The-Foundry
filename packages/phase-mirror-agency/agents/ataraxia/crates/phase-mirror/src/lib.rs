pub mod l0_invariants;
pub mod validator;

pub use l0_invariants::*;
pub use validator::*;

#[cfg(test)]
mod tests {
    use super::*;

    const REAL_DIGEST: &str =
        "c60340700661949c07d26031b73b549682b00b910a86e56b055df3de148c5e7c";

    fn test_policy() -> L0Policy {
        L0Policy {
            expected_schema_hash: REAL_DIGEST.to_string(),
            ..L0Policy::default()
        }
    }

    fn valid_state() -> State {
        State {
            schema_version: "1.0.0".to_string(),
            schema_hash: REAL_DIGEST.to_string(),
            permission_bits: 0,
            drift_magnitude: 0.1,
            nonce: Nonce {
                value: "a".repeat(64),
                issued_at: chrono::Utc::now().timestamp_millis(),
            },
            contraction_witness_score: Some(0.95),
        }
    }

    /// Previously passed the placeholder hash `"f7a8b9c0d1e2f3g4"` and a witness
    /// score of exactly 1.0, the value Lean's `κ < 1` rejects. Both are now
    /// refused. See ADR-RML-159.
    #[test]
    fn test_l0_invariants_pass() {
        let result = check_l0_invariants(&valid_state(), &test_policy(), None);
        assert!(result.passed, "failed: {:?}", result.violations);
    }

    #[test]
    fn test_placeholder_hash_and_unit_score_do_not_pass() {
        let mut state = valid_state();
        state.schema_hash = "f7a8b9c0d1e2f3g4".to_string();
        state.contraction_witness_score = Some(1.0);
        let result = check_l0_invariants(&state, &test_policy(), None);
        assert!(!result.passed);
        assert!(result.failed_checks.contains(&"schema_hash".to_string()));
        assert!(result
            .failed_checks
            .contains(&"contraction_witness".to_string()));
    }

    #[test]
    fn test_validator_drift() {
        let config = L0ValidatorConfig::default();
        let validator = L0Validator::new(config);
        let result = validator.validate_drift_magnitude(10.0, 8.0);
        // (10-8)/8 = 0.25 <= 0.5
        assert!(result.passed);
        assert!(result.message.contains("25.0%"));
    }
}
