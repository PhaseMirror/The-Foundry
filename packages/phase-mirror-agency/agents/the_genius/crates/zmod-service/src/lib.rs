use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use zmod_guardian::NetworkGovernor;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrajectoryReport {
    pub genius_type: String,
    pub final_loss: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeniusServiceResponse {
    pub status: String,
    pub reason: Option<String>,
    pub trajectory_report: Option<TrajectoryReport>,
}

pub struct ProfileInfo {
    pub adr_bundle: Vec<String>,
    pub defaults: HashMap<String, serde_json::Value>,
}

pub struct GeniusService {
    pub governor: NetworkGovernor,
    pub profiles: HashMap<String, ProfileInfo>,
}

impl Default for GeniusService {
    fn default() -> Self {
        Self::new()
    }
}

impl GeniusService {
    pub fn new() -> Self {
        let governor = NetworkGovernor::new();
        let mut profiles = HashMap::new();
        
        let mut mnist_defaults = HashMap::new();
        mnist_defaults.insert("dataset".to_string(), serde_json::json!("mnist"));
        profiles.insert(
            "MNIST-Fast-Eval".to_string(),
            ProfileInfo {
                adr_bundle: vec!["ADR-000".to_string(), "ADR-009".to_string()],
                defaults: mnist_defaults,
            },
        );

        GeniusService {
            governor,
            profiles,
        }
    }

    pub fn execute_training(&mut self, profile_name: &str) -> Result<GeniusServiceResponse, String> {
        let _profile = self
            .profiles
            .get(profile_name)
            .ok_or_else(|| format!("Unknown profile: {}", profile_name))?;

        let (allowed, reason) = self.governor.is_allowed(profile_name);
        if !allowed {
            return Ok(GeniusServiceResponse {
                status: "REJECTED".to_string(),
                reason,
                trajectory_report: None,
            });
        }

        // Final production integration logic here would call 
        // the zmod-optim and zmod-substrate crates
        
        Ok(GeniusServiceResponse {
            status: "SUCCESS".to_string(),
            reason: None,
            trajectory_report: Some(TrajectoryReport {
                genius_type: "Stochastic / Balanced".to_string(),
                final_loss: 0.001,
            }),
        })
    }
}
