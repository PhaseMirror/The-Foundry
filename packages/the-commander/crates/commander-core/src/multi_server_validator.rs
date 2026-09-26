use crate::hoe_router::{EscalationDecision, HoERouter};
use multiplicity_alp::SpectralMetrics;
use multiplicity_common::types::UnifiedWitness;

/// Multi-server spectral validation result
#[derive(Debug, Clone)]
pub struct MultiServerValidation {
    pub action_id: String,
    pub server_validations: Vec<ServerValidation>,
    pub overall_decision: EscalationDecision,
    pub witness: Option<UnifiedWitness>,
}

/// Validation result for a single MCP server
#[derive(Debug, Clone)]
pub struct ServerValidation {
    pub server_id: String,
    pub spectral_metrics: SpectralMetrics,
    pub escalation_decision: EscalationDecision,
    pub valid: bool,
}

/// Multi-server validator with HoE escalation routing
pub struct MultiServerValidator {
    pub tier: usize,
    pub router: HoERouter,
}

impl MultiServerValidator {
    pub fn new(tier: usize) -> Self {
        Self {
            tier,
            router: HoERouter::new(tier),
        }
    }

    /// Validate spectral metrics from multiple servers
    /// Returns MultiServerValidation with aggregated decision
    pub fn validate_servers(
        &self,
        action_id: &str,
        server_metrics: Vec<(String, SpectralMetrics)>,
    ) -> MultiServerValidation {
        let mut server_validations = Vec::new();
        let mut worst_decision = EscalationDecision::Autonomous;

        for (server_id, metrics) in server_metrics {
            let decision = self.router.route(&metrics);
            let valid = decision.is_autonomous();

            // Track worst decision for escalation
            match &decision {
                EscalationDecision::Escalate(_) => worst_decision = decision.clone(),
                EscalationDecision::Review(_)
                    if matches!(worst_decision, EscalationDecision::Autonomous) =>
                {
                    worst_decision = decision.clone();
                }
                _ => {}
            }

            server_validations.push(ServerValidation {
                server_id,
                spectral_metrics: metrics,
                escalation_decision: decision,
                valid,
            });
        }

        let all_valid = server_validations.iter().all(|v| v.valid);
        let witness = if !all_valid {
            Some(self.build_witness(action_id, &server_validations, &worst_decision))
        } else {
            None
        };

        MultiServerValidation {
            action_id: action_id.to_string(),
            server_validations,
            overall_decision: worst_decision,
            witness,
        }
    }

    fn build_witness(
        &self,
        action_id: &str,
        validations: &[ServerValidation],
        decision: &EscalationDecision,
    ) -> UnifiedWitness {
        let evidence: Vec<String> = validations
            .iter()
            .filter(|v| !v.valid)
            .map(|v| format!("{}: escalating", v.server_id))
            .collect();

        let epsilon = self.router.epsilon();
        let max_rho = validations
            .iter()
            .map(|v| v.spectral_metrics.spectral_radius)
            .fold(0.0f64, f64::max);

        UnifiedWitness {
            witness_id: format!("multisrv-{}", action_id),
            action_id: action_id.to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            compliance_evidence: evidence.join("; "),
            execution_receipt: serde_json::json!({
                "multi_server_validation": {
                    "tier": self.tier,
                    "epsilon": epsilon,
                    "max_spectral_radius": max_rho,
                    "servers_checked": validations.len()
                }
            }),
            contractivity_score: 1.0 - max_rho.max(0.0).min(1.0),
            veto_status: match decision {
                EscalationDecision::Escalate(_) => "escalated",
                EscalationDecision::Review(_) => "review",
                EscalationDecision::Autonomous => "admitted",
            }
            .to_string(),
            consensus_proof: None,
            threshold_met: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_test_metrics(
        spectral_radius: f64,
        gershgorin_radius: f64,
        contraction_margin: f64,
        drift_score: f64,
        iteration_count: usize,
        used_power_iteration: bool,
        convergence_rate: f64,
        effective_iterations: usize,
    ) -> SpectralMetrics {
        SpectralMetrics {
            spectral_radius,
            gershgorin_radius,
            contraction_margin,
            drift_score,
            iteration_count,
            used_power_iteration,
            convergence_rate,
            effective_iterations,
            tier: 2,
        }
    }

    #[test]
    fn test_multi_server_validation_all_autonomous() {
        let validator = MultiServerValidator::new(2);
        let metrics = vec![
            (
                "server-a".to_string(),
                make_test_metrics(0.5, 0.3, 0.5, 0.2, 0, false, 0.0, 0),
            ),
            (
                "server-b".to_string(),
                make_test_metrics(0.4, 0.2, 0.6, 0.2, 0, false, 0.0, 0),
            ),
        ];

        let result = validator.validate_servers("test-action", metrics);
        assert!(matches!(
            result.overall_decision,
            EscalationDecision::Autonomous
        ));
        assert!(result.server_validations.iter().all(|v| v.valid));
    }

    #[test]
    fn test_multi_server_validation_escalation() {
        let validator = MultiServerValidator::new(2);
        let metrics = vec![(
            "server-a".to_string(),
            make_test_metrics(0.96, 0.9, 0.04, 0.06, 50, true, 0.01, 50),
        )];

        let result = validator.validate_servers("test-action", metrics);
        assert!(matches!(
            result.overall_decision,
            EscalationDecision::Escalate(_)
        ));
        assert!(!result.server_validations[0].valid);
        assert!(result.witness.is_some());
    }
}
