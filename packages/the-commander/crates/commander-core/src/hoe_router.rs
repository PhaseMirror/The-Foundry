use multiplicity_alp::SpectralMetrics;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EscalationDecision {
    Autonomous,
    Escalate(String),
    Review(String),
}

impl EscalationDecision {
    pub fn is_autonomous(&self) -> bool {
        matches!(self, EscalationDecision::Autonomous)
    }
}

#[derive(Debug, Clone)]
pub struct HoERouter {
    pub tier: usize,
}

impl HoERouter {
    pub fn new(tier: usize) -> Self {
        Self { tier }
    }

    pub fn route(&self, metrics: &SpectralMetrics) -> EscalationDecision {
        let epsilon = self.epsilon();

        if metrics.spectral_radius >= 1.0 - epsilon {
            return EscalationDecision::Escalate(format!(
                "SPECTRAL_VIOLATION: ρ={:.4} >= 1-ε={:.2}",
                metrics.spectral_radius, epsilon
            ));
        }

        if metrics.convergence_rate >= 1.0 - epsilon && metrics.used_power_iteration {
            return EscalationDecision::Review(format!(
                "CONVERGENCE_UNCERTAINTY: rate={:.4} >= 1-ε={:.2}",
                metrics.convergence_rate, epsilon
            ));
        }

        if !metrics.used_power_iteration {
            return EscalationDecision::Autonomous;
        }

        EscalationDecision::Autonomous
    }

    pub fn epsilon(&self) -> f64 {
        match self.tier {
            1 => 0.10,
            2 => 0.05,
            3 => 0.02,
            4 => 0.01,
            _ => 0.05,
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
    fn test_hoe_router_autonomous_stable() {
        let metrics = make_test_metrics(0.5, 0.3, 0.5, 0.2, 0, false, 0.0, 0);
        let router = HoERouter::new(2);
        assert!(router.route(&metrics).is_autonomous());
    }

    #[test]
    fn test_hoe_router_escalate_violation() {
        let metrics = make_test_metrics(0.96, 0.9, 0.04, 0.06, 50, true, 0.01, 50);
        let router = HoERouter::new(2);
        match router.route(&metrics) {
            EscalationDecision::Escalate(msg) => assert!(msg.contains("SPECTRAL_VIOLATION")),
            _ => panic!("Expected Escalate"),
        }
    }

    #[test]
    fn test_hoe_router_tier_epsilon() {
        let router1 = HoERouter::new(1);
        assert!((router1.epsilon() - 0.10).abs() < 1e-10);

        let router4 = HoERouter::new(4);
        assert!((router4.epsilon() - 0.01).abs() < 1e-10);
    }
}