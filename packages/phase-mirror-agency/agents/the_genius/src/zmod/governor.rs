use crate::zmod::tracker::AGSSummary;
use std::collections::HashSet;

#[derive(Debug, Clone)]
pub struct NetworkGovernor {
    pub throttled_profiles: HashSet<String>,
}

impl Default for NetworkGovernor {
    fn default() -> Self {
        Self::new()
    }
}

impl NetworkGovernor {
    pub fn new() -> Self {
        NetworkGovernor {
            throttled_profiles: HashSet::new(),
        }
    }

    pub fn evaluate_policies(&mut self, summary: &AGSSummary) -> Vec<String> {
        let mut interventions = Vec::new();

        // 1. Profile Throttling (Threshold: 2.0 Phoenix/call)
        if summary.avg_phoenix_rate > 2.0 {
            self.throttled_profiles.insert("Research-Deep-Sub".to_string());
            interventions.push(
                "THROTTLE: Research-Deep-Sub due to high network Phoenix rate.".to_string(),
            );
        } else {
            self.throttled_profiles.remove("Research-Deep-Sub");
        }

        // 2. Network Cool-down (Threshold: 5.0 Phoenix/call)
        if summary.avg_phoenix_rate > 5.0 {
            interventions.push(
                "COOL-DOWN: Global network reset triggered. All non-critical jobs paused."
                    .to_string(),
            );
        }

        interventions
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
}
