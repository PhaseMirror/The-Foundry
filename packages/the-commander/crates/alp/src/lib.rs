use serde::{Deserialize, Serialize};
use multiplicity_common::ConstitutionModel;
use multiplicity_common::types::UnifiedWitness;

pub mod policy {
    pub use multiplicity_common::types::TrustLevel;
}

pub mod admission {
    use serde::{Deserialize, Serialize};
    use schemars::JsonSchema;

    #[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
    pub struct AdmissibilityReport {
        pub allowed: bool,
        pub reason: String,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    pub id: String,
    pub payload: serde_json::Value,
    pub mutating: bool,
    pub server_binding: Option<String>,
}

/// Spectral policy for L0 contractivity validation
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpectralMetrics {
    pub spectral_radius: f64,
    pub gershgorin_radius: f64,
    pub convergence_rate: f64,
    pub effective_iterations: usize,
    pub tier: usize,
    pub contraction_margin: f64,
    pub drift_score: f64,
    pub iteration_count: usize,
    pub used_power_iteration: bool,
}

pub struct PolicyEngine {
    pub constitution: ConstitutionModel,
    pub tier: usize,
}

impl PolicyEngine {
    pub fn new(constitution: ConstitutionModel, _unused: Option<()>, tier: usize) -> Self {
        Self { constitution, tier }
    }

    pub fn validate_action(
        &self,
        action: &Action,
        trust: &policy::TrustLevel,
    ) -> anyhow::Result<admission::AdmissibilityReport> {
        if self.constitution.kill_switch_active {
            return Ok(admission::AdmissibilityReport {
                allowed: false,
                reason: "Kill switch is engaged - all actions blocked".to_string(),
            });
        }

        let governed_servers = ["multiplicity-mcp-rust", "phase-mirror-mcp", "governed-mcp"];
        
        if let Some(ref server) = action.server_binding {
            if trust == &policy::TrustLevel::External && governed_servers.contains(&server.as_str()) {
                return Ok(admission::AdmissibilityReport {
                    allowed: false,
                    reason: format!("Trust Level Violation: External workflow '{}' cannot call governed server '{}'. Use server_binding=sandbox.", action.id, server),
                });
            }
        }

        Ok(admission::AdmissibilityReport {
            allowed: true,
            reason: "Action validated successfully".to_string(),
        })
    }

    /// Validate spectral metrics against L0 invariant for HoE routing
    pub fn validate_spectral(&self, metrics: &SpectralMetrics) -> anyhow::Result<admission::AdmissibilityReport> {
        let epsilon = self.epsilon();
        
        // L0 spectral radius check
        if metrics.spectral_radius >= 1.0 - epsilon {
            return Ok(admission::AdmissibilityReport {
                allowed: false,
                reason: format!(
                    "SPECTRAL_VIOLATION: ρ={:.4} >= 1-ε={:.2} - HoE escalation required",
                    metrics.spectral_radius, epsilon
                ),
            });
        }

        Ok(admission::AdmissibilityReport {
            allowed: true,
            reason: "Spectral L0 preserved".to_string(),
        })
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

/// Build witness from spectral metrics for Archivum anchoring
pub fn build_spectral_witness(
    action_id: &str,
    metrics: &SpectralMetrics,
    veto_status: &str,
) -> UnifiedWitness {
    UnifiedWitness {
        witness_id: format!("spectral-{}", action_id),
        action_id: action_id.to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
        compliance_evidence: format!(
            "spectral_radius={:.4}, convergence_rate={:.4}, tier={}",
            metrics.spectral_radius, metrics.convergence_rate, metrics.tier
        ),
        execution_receipt: serde_json::json!({
            "spectral_metrics": {
                "spectral_radius": metrics.spectral_radius,
                "convergence_rate": metrics.convergence_rate,
                "tier": metrics.tier
            }
        }),
        contractivity_score: 1.0 - metrics.spectral_radius,
        veto_status: veto_status.to_string(),
        consensus_proof: None,
        threshold_met: None,
    }
}

pub mod grapheme {
    use unicode_segmentation::UnicodeSegmentation;
    use std::collections::HashMap;
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
    pub struct UnitIdentity {
        pub grapheme: String,
        pub mod_val: u64,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct PETCVector {
        pub components: HashMap<String, f64>,
    }

    pub struct GraphemeDecomposer {
        grapheme_map: HashMap<String, u64>,
        next_prime_idx: usize,
        primes: Vec<u64>,
    }

    impl GraphemeDecomposer {
        pub fn new() -> Self {
            GraphemeDecomposer {
                grapheme_map: HashMap::new(),
                next_prime_idx: 0,
                primes: generate_primes(10000),
            }
        }
        pub fn decompose(&mut self, text: &str) -> (Vec<UnitIdentity>, PETCVector) {
            let clusters: Vec<&str> = text.graphemes(true).collect();
            let mut all_units = Vec::new();
            let mut total_components = HashMap::new();
            for &g in &clusters {
                let mod_val = self.ensure_grapheme(g);
                all_units.push(UnitIdentity { grapheme: g.to_string(), mod_val });
                let dim = format!("g_{}", mod_val);
                *total_components.entry(dim).or_insert(0.0) += 1.0;
            }
            (all_units, PETCVector { components: total_components })
        }
        pub fn reassemble(&self, units: &[UnitIdentity]) -> String {
            units.iter().map(|u| u.grapheme.as_str()).collect()
        }
        fn ensure_grapheme(&mut self, g: &str) -> u64 {
            if let Some(&m) = self.grapheme_map.get(g) { m } else {
                let m = self.primes[self.next_prime_idx];
                self.next_prime_idx += 1;
                self.grapheme_map.insert(g.to_string(), m);
                m
            }
        }
    }
    fn generate_primes(n: usize) -> Vec<u64> {
        let mut primes = Vec::with_capacity(n);
        let mut candidate = 2;
        while primes.len() < n {
            let mut is_prime = true;
            for &p in &primes {
                if candidate % p == 0 { is_prime = false; break; }
                if p * p > candidate { break; }
            }
            if is_prime { primes.push(candidate); }
            candidate += 1;
        }
        primes
    }
}