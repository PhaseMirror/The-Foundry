use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum TwinBindingError {
    #[error("Inadmissible Contraction: q {q} exceeds maximum threshold {max_threshold}")]
    InadmissibleContraction { q: f64, max_threshold: f64 },

    #[error("Trajectory Dissonance: Educational trajectory {edu_trajectory} does not match Health trajectory {health_trajectory}")]
    TrajectoryDissonance { edu_trajectory: String, health_trajectory: String },

    #[error("Provenance Gap: TEE quote is missing or invalid for twin binding")]
    ProvenanceGap,

    #[error("Cross-Domain Misalignment: Educational state and Health state diverge beyond acceptable ACE bounds")]
    CrossDomainMisalignment,
}

/// Represents the atomized deep provenance payload originating from the agiOS ingress spine / EchoMirror.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LambdaTraceAtom {
    pub proof_digest: String,
    pub state_root_hash: String,
    pub timestamp: u64,
    pub q: f64,
    pub tee_quote: Option<String>,
    pub trajectory_id: String,
    pub protocol_v: u32,
    pub signer_id: Option<String>,
}

/// Health Twin State within Ataraxia
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthTwinState {
    pub twin_id: String,
    pub active_trajectory: String,
    pub biometrics_hash: String,
    pub eeg_coherence_score: f64, // Simulated coherence from neuro-feedback
    pub last_updated: u64,
}

/// The Cross-Domain Contractivity Bridge enforcing resonance between EchoMirror (Educational) and Ataraxia (Health)
pub struct TwinBindingContract {
    pub max_q_threshold: f64,
    pub min_eeg_coherence: f64,
}

impl TwinBindingContract {
    pub fn new(max_q_threshold: f64, min_eeg_coherence: f64) -> Self {
        Self {
            max_q_threshold,
            min_eeg_coherence,
        }
    }

    /// Evaluates cross-domain resonance between the incoming educational state (atom) and the current health twin state.
    pub fn evaluate_resonance(
        &self,
        educational_atom: &LambdaTraceAtom,
        health_twin: &HealthTwinState,
    ) -> Result<(), TwinBindingError> {
        // 1. Trajectory Resonance
        if educational_atom.trajectory_id != health_twin.active_trajectory {
            return Err(TwinBindingError::TrajectoryDissonance {
                edu_trajectory: educational_atom.trajectory_id.clone(),
                health_trajectory: health_twin.active_trajectory.clone(),
            });
        }

        // 2. TEE Provenance Validation
        if educational_atom.tee_quote.is_none() {
            return Err(TwinBindingError::ProvenanceGap);
        }

        // 3. Contractivity Margin (Educational stability)
        if educational_atom.q >= self.max_q_threshold {
            return Err(TwinBindingError::InadmissibleContraction {
                q: educational_atom.q,
                max_threshold: self.max_q_threshold,
            });
        }

        // 4. Cross-Domain Misalignment (Health/EEG stability)
        // If the health twin indicates distress (low coherence), we cannot accept high-q (stressful) educational moves.
        if health_twin.eeg_coherence_score < self.min_eeg_coherence {
            return Err(TwinBindingError::CrossDomainMisalignment);
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_successful_twin_binding() {
        let contract = TwinBindingContract::new(0.995, 0.70);
        let atom = LambdaTraceAtom {
            proof_digest: "digest".to_string(),
            state_root_hash: "state_hash".to_string(),
            timestamp: 123456789,
            q: 0.95,
            tee_quote: Some("TEE_HARDWARE_QUOTE".to_string()),
            trajectory_id: "Ataraxia-EchoMirror-Twin-Binding".to_string(),
            protocol_v: 1,
            signer_id: Some("signer".to_string()),
        };
        let health_twin = HealthTwinState {
            twin_id: "twin-001".to_string(),
            active_trajectory: "Ataraxia-EchoMirror-Twin-Binding".to_string(),
            biometrics_hash: "bio_hash".to_string(),
            eeg_coherence_score: 0.85,
            last_updated: 123456780,
        };

        assert!(contract.evaluate_resonance(&atom, &health_twin).is_ok());
    }

    #[test]
    fn test_dissonance_trajectory_mismatch() {
        let contract = TwinBindingContract::new(0.995, 0.70);
        let atom = LambdaTraceAtom {
            proof_digest: "digest".to_string(),
            state_root_hash: "state_hash".to_string(),
            timestamp: 123456789,
            q: 0.95,
            tee_quote: Some("TEE_HARDWARE_QUOTE".to_string()),
            trajectory_id: "EchoMirror-Only".to_string(),
            protocol_v: 1,
            signer_id: Some("signer".to_string()),
        };
        let health_twin = HealthTwinState {
            twin_id: "twin-001".to_string(),
            active_trajectory: "Ataraxia-Only".to_string(),
            biometrics_hash: "bio_hash".to_string(),
            eeg_coherence_score: 0.85,
            last_updated: 123456780,
        };

        assert!(matches!(
            contract.evaluate_resonance(&atom, &health_twin),
            Err(TwinBindingError::TrajectoryDissonance { .. })
        ));
    }

    #[test]
    fn test_cross_domain_misalignment() {
        let contract = TwinBindingContract::new(0.995, 0.70);
        let atom = LambdaTraceAtom {
            proof_digest: "digest".to_string(),
            state_root_hash: "state_hash".to_string(),
            timestamp: 123456789,
            q: 0.95,
            tee_quote: Some("TEE_HARDWARE_QUOTE".to_string()),
            trajectory_id: "Ataraxia-EchoMirror-Twin-Binding".to_string(),
            protocol_v: 1,
            signer_id: Some("signer".to_string()),
        };
        let health_twin = HealthTwinState {
            twin_id: "twin-001".to_string(),
            active_trajectory: "Ataraxia-EchoMirror-Twin-Binding".to_string(),
            biometrics_hash: "bio_hash".to_string(),
            eeg_coherence_score: 0.50, // Low coherence indicates distress
            last_updated: 123456780,
        };

        assert!(matches!(
            contract.evaluate_resonance(&atom, &health_twin),
            Err(TwinBindingError::CrossDomainMisalignment)
        ));
    }
}
