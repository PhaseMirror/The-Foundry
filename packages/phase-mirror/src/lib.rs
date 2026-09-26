pub mod l0_invariants;
pub mod validator;
pub mod legislative;

pub use l0_invariants::*;
pub use validator::*;
pub use legislative::*;

use phase_mirror_surface::{L0Check, TripleLockMachine};

/// `L0Check` is `fn check(state: Self::Input) -> Self::Output`, so the policy
/// cannot be a separate parameter without changing the shared trait. It travels
/// in the input as a `(state, policy)` pair instead.
///
/// This matters because the policy used to be a compile-time constant. With the
/// constant gone, an `L0Check` impl that did not carry a policy would have
/// nothing to bind against and would have to fall back to a default, which
/// `L0Policy::validate` rejects. Carrying it in the input keeps the gate
/// fail-closed through the trait.
///
/// The shape of this constraint, an associated-function trait that cannot
/// express a configured check, is the defect ADR-RML-164 records. Resolving it
/// properly means widening the trait in `phase-mirror-surface`.
impl L0Check for State {
    type Input = (State, L0Policy);
    type Output = InvariantCheckResult;
    fn check(input: Self::Input) -> Self::Output {
        let (state, policy) = input;
        check_l0_invariants(&state, &policy, None)
    }
}

#[derive(Debug, Clone)]
pub struct DesktopTripleLockMachine {
    pub phase: phase_mirror_surface::TripleLockPhase,
    pub engine: LegislativeEngine,
}

impl Default for DesktopTripleLockMachine {
    fn default() -> Self {
        Self {
            phase: phase_mirror_surface::TripleLockPhase::default(),
            engine: LegislativeEngine::new(ConstitutionState {
                epoch: 0,
                last_witness_hash: "GENESIS".to_string(),
                state_root: "0".repeat(64),
                is_lawful: true,
            }),
        }
    }
}

impl TripleLockMachine for DesktopTripleLockMachine {
    type Receipt = UnifiedWitness;
    fn advance(&mut self, witness: &Self::Receipt) -> Result<phase_mirror_surface::TripleLockPhase, phase_mirror_surface::LockError> {
        match self.engine.transition(witness) {
            Ok(_) => {
                self.phase = phase_mirror_surface::TripleLockPhase::Completed;
                Ok(self.phase)
            }
            Err(e) => {
                self.phase = phase_mirror_surface::TripleLockPhase::Failed;
                Err(phase_mirror_surface::LockError::new(e.to_string()))
            }
        }
    }
    fn current_phase(&self) -> phase_mirror_surface::TripleLockPhase {
        self.phase
    }
}

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
            // A genuinely contractive score. This used to be `Some(1.0)`, the
            // single value the Lean invariant `κ < 1` rejects.
            contraction_witness_score: Some(0.95),
        }
    }

    /// This test previously passed `schema_hash: "f7a8b9c0d1e2f3g4"` and
    /// `contraction_witness_score: Some(1.0)`. Both values are now rejected, so
    /// the test was asserting that the gate opens on a placeholder hash and a
    /// non-contractive score. It asserted the defect, not the invariant.
    #[test]
    fn test_l0_invariants_pass() {
        let result = check_l0_invariants(&valid_state(), &test_policy(), None);
        assert!(result.passed, "failed: {:?}", result.violations);
    }

    /// The defect this test used to encode, kept as an explicit regression.
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
    fn test_l0check_trait_impl_carries_policy() {
        let result = <State as L0Check>::check((valid_state(), test_policy()));
        assert!(result.passed, "failed: {:?}", result.violations);
    }

    #[test]
    fn test_l0check_with_default_policy_fails_closed() {
        // No policy digest configured: the trait path must not fail open.
        let result = <State as L0Check>::check((valid_state(), L0Policy::default()));
        assert!(!result.passed);
        assert!(result.failed_checks.contains(&"schema_hash".to_string()));
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

    #[test]
    fn test_legislative_engine_transition() {
        let initial_state = ConstitutionState {
            epoch: 0,
            last_witness_hash: "GENESIS".to_string(),
            state_root: "0".repeat(64),
            is_lawful: true,
        };
        
        let mut engine = LegislativeEngine::new(initial_state);
        
        let witness = UnifiedWitness {
            version: "1.0.0".to_string(),
            envelope_hash: "e".repeat(64),
            proof_artifact: "f".repeat(64),
            frozen_state_hash: Some("d".repeat(64)),
            signatures: Some(DualSignature {
                owner_sig: "a".repeat(64),
                governor_sig: "b".repeat(64),
            }),
        };
        
        let result = engine.transition(&witness);
        assert!(result.is_ok(), "Expected Ok, got: {:?}", result.err());
        let new_state = result.unwrap();
        assert_eq!(new_state.epoch, 1);
        assert_eq!(new_state.last_witness_hash, "e".repeat(64));
        assert!(new_state.is_lawful);
        assert_ne!(new_state.state_root, "0".repeat(64));
    }

    #[test]
    fn test_legislative_engine_compliance_gap_blocked() {
        let initial_state = ConstitutionState {
            epoch: 0,
            last_witness_hash: "GENESIS".to_string(),
            state_root: "0".repeat(64),
            is_lawful: true,
        };
        
        let mut engine = LegislativeEngine::new(initial_state);
        
        // Scenario 1: Missing signatures altogether
        let witness_missing = UnifiedWitness {
            version: "1.0.0".to_string(),
            envelope_hash: "e".repeat(64),
            proof_artifact: "f".repeat(64),
            frozen_state_hash: Some("d".repeat(64)),
            signatures: None,
        };
        
        let result_missing = engine.transition(&witness_missing);
        assert!(result_missing.is_err());
        assert!(result_missing.unwrap_err().to_string().contains("Missing governance signatures"));

        // Scenario 2: Signed as MISSING (compliance gap)
        let witness_marked_missing = UnifiedWitness {
            version: "1.0.0".to_string(),
            envelope_hash: "e".repeat(64),
            proof_artifact: "f".repeat(64),
            frozen_state_hash: Some("d".repeat(64)),
            signatures: Some(DualSignature {
                owner_sig: "MISSING".to_string(),
                governor_sig: "b".repeat(64),
            }),
        };
        
        let result_marked_missing = engine.transition(&witness_marked_missing);
        assert!(result_marked_missing.is_err());
        assert!(result_marked_missing.unwrap_err().to_string().contains("Governance signatures (BAA/DPA) unregistered or marked missing"));
    }
}
