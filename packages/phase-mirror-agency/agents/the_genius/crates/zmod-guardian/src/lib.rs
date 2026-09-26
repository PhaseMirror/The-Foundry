use ndarray::{Array1, Array2, ArrayView1};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ACEGuardian {
    pub safety_threshold: f64,
    pub projection_type: String,
}

impl ACEGuardian {
    pub fn new(safety_threshold: Option<f64>, projection_type: Option<String>) -> Self {
        ACEGuardian {
            safety_threshold: safety_threshold.unwrap_or(1.0),
            projection_type: projection_type.unwrap_or_else(|| "norm".to_string()),
        }
    }

    pub fn project(&self, weights: ArrayView1<f64>) -> Array1<f64> {
        if weights.is_empty() {
            return Array1::zeros(0);
        }

        if self.projection_type == "norm" {
            let norm = self.compute_norm(weights);
            if norm > self.safety_threshold {
                return weights.mapv(|w| w * (self.safety_threshold / norm));
            }
        }

        weights.to_owned()
    }

    pub fn compute_norm(&self, x: ArrayView1<f64>) -> f64 {
        x.mapv(|val| val * val).sum().sqrt()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkGovernor {
    pub throttled_profiles: HashSet<String>,
}

impl NetworkGovernor {
    pub fn new() -> Self {
        NetworkGovernor {
            throttled_profiles: HashSet::new(),
        }
    }

    pub fn is_allowed(&self, profile_name: &str) -> (bool, Option<String>) {
        if self.throttled_profiles.contains(profile_name) {
            (
                false,
                Some(format!(
                    "Profile '{}' is currently throttled due to network instability.",
                    profile_name
                )),
            )
        } else {
            (true, None)
        }
    }
    
    pub fn throttle(&mut self, profile_name: &str) {
        self.throttled_profiles.insert(profile_name.to_string());
    }

    pub fn unthrottle(&mut self, profile_name: &str) {
        self.throttled_profiles.remove(profile_name);
    }
}
