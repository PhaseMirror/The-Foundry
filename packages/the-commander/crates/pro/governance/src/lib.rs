use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostInterrogateMetrics {
    pub p50_ms: f64,
    pub p95_ms: f64,
    pub p99_ms: f64,
    pub sample_count: usize,
    pub window_start_iso: String,
    pub window_end_iso: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElasticVelocityResult {
    pub max_velocity: f64,
    pub ell_safe: f64,
    pub data_debt: f64,
    pub region: String,
    pub braking_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractionCertificate {
    pub trace_id: String,
    pub spectral_radius: f64,
    pub is_stable: bool,
    pub metadata: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProposalCheckResult {
    pub authorized: bool,
    pub data_debt: f64,
    pub braking_triggered: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JubileeCheckResult {
    pub jubilee_triggered: bool,
}

pub trait EtpGovernor: Send + Sync {
    fn calculate_elastic_velocity(
        &self,
        head_position: f64,
        tail_position: f64,
        cost_interrogate: &CostInterrogateMetrics,
        v_max: f64,
        verified_multiplicity: Option<f64>,
    ) -> ElasticVelocityResult;

    fn check_proposal(
        &self,
        proposal_hash: &str,
        head_position: f64,
        tail_position: f64,
        cost_interrogate: &CostInterrogateMetrics,
        certificate: &ContractionCertificate,
        depends_only_on_verified: bool,
        current_velocity: f64,
    ) -> ProposalCheckResult;
}

pub mod governor_impl;
pub use governor_impl::*;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::governor_impl::ProductionEtpGovernor;

    #[test]
    fn test_etp_governor_logic() {
        let governor = ProductionEtpGovernor { base_v_max: 10.0 };
        let metrics = CostInterrogateMetrics {
            p50_ms: 10.0,
            p95_ms: 20.0,
            p99_ms: 50.0,
            sample_count: 100,
            window_start_iso: "2026-05-23T00:00:00Z".to_string(),
            window_end_iso: "2026-05-23T01:00:00Z".to_string(),
        };

        let velocity = governor.calculate_elastic_velocity(1.0, 0.0, &metrics, 10.0, None);
        assert!(!velocity.braking_active);
    }
}
