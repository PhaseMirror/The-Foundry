use crate::zmod::governor::NetworkGovernor;
use crate::zmod::tracker::AGSTracker;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrajectoryReport {
    pub genius_type: String,
    pub phoenix_events: usize,
    pub final_loss: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeniusServiceResponse {
    pub status: String,
    pub reason: Option<String>,
    pub artifact_bundle: Option<HashMap<String, String>>,
    pub trajectory_report: Option<TrajectoryReport>,
    pub evidence_manifest: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ProfileInfo {
    pub adr_bundle: Vec<String>,
    pub defaults: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct GeniusService {
    pub root_dir: String,
    pub tracker: AGSTracker,
    pub governor: NetworkGovernor,
    pub profiles: HashMap<String, ProfileInfo>,
}

impl Default for GeniusService {
    fn default() -> Self {
        Self::new(None)
    }
}

impl GeniusService {
    pub fn new(root_dir: Option<&str>) -> Self {
        let r_dir = root_dir.unwrap_or("models/the_genius");
        let tracker = AGSTracker::new(Some(&format!("{}/logs/ags_usage.jsonl", r_dir)));
        let governor = NetworkGovernor::new();

        let mut profiles = HashMap::new();
        
        // MNIST-Fast-Eval
        let mut mnist_defaults = HashMap::new();
        mnist_defaults.insert("dataset".to_string(), serde_json::json!("mnist"));
        mnist_defaults.insert("max_batches".to_string(), serde_json::json!(10));
        mnist_defaults.insert("safety_threshold".to_string(), serde_json::json!(5.0));
        profiles.insert(
            "MNIST-Fast-Eval".to_string(),
            ProfileInfo {
                adr_bundle: vec!["ADR-000".to_string(), "ADR-001".to_string(), "ADR-009".to_string()],
                defaults: mnist_defaults,
            },
        );

        // CIFAR-Robust-Train
        let mut cifar_defaults = HashMap::new();
        cifar_defaults.insert("dataset".to_string(), serde_json::json!("cifar10"));
        cifar_defaults.insert("max_batches".to_string(), serde_json::json!(100));
        cifar_defaults.insert("safety_threshold".to_string(), serde_json::json!(5.0));
        cifar_defaults.insert("use_lm".to_string(), serde_json::json!(true));
        profiles.insert(
            "CIFAR-Robust-Train".to_string(),
            ProfileInfo {
                adr_bundle: vec![
                    "ADR-000".to_string(),
                    "ADR-001".to_string(),
                    "ADR-005".to_string(),
                    "ADR-006".to_string(),
                    "ADR-007".to_string(),
                    "ADR-008".to_string(),
                    "ADR-009".to_string(),
                ],
                defaults: cifar_defaults,
            },
        );

        // Research-Deep-Sub
        let mut deep_defaults = HashMap::new();
        deep_defaults.insert("dataset".to_string(), serde_json::json!("mnist"));
        deep_defaults.insert("max_batches".to_string(), serde_json::json!(20));
        deep_defaults.insert("safety_threshold".to_string(), serde_json::json!(10.0));
        deep_defaults.insert("primes".to_string(), serde_json::json!(vec![2, 3, 5, 7, 11]));
        profiles.insert(
            "Research-Deep-Sub".to_string(),
            ProfileInfo {
                adr_bundle: vec![
                    "ADR-000".to_string(),
                    "ADR-031".to_string(),
                    "ADR-040".to_string(),
                    "ADR-009".to_string(),
                ],
                defaults: deep_defaults,
            },
        );

        GeniusService {
            root_dir: r_dir.to_string(),
            tracker,
            governor,
            profiles,
        }
    }

    pub fn request_training(
        &mut self,
        profile_name: &str,
        task_name: &str,
        dataset: Option<&str>,
        max_batches: Option<usize>,
        primes: Option<Vec<usize>>,
        hidden_dim: Option<usize>,
        lambda_zeta: Option<f64>,
        a: Option<f64>,
        safety_threshold: Option<f64>,
        use_lm: Option<bool>,
    ) -> Result<GeniusServiceResponse, String> {
        // 1. Resolve Profile
        let profile = self
            .profiles
            .get(profile_name)
            .ok_or_else(|| format!("Unknown profile: {}", profile_name))?;

        // 1.1 Network Governance Check
        if let Ok(summary) = self.tracker.get_summary() {
            self.governor.evaluate_policies(&summary);
        }
        let (allowed, reason) = self.governor.is_allowed(profile_name);
        if !allowed {
            return Ok(GeniusServiceResponse {
                status: "REJECTED".to_string(),
                reason,
                artifact_bundle: None,
                trajectory_report: None,
                evidence_manifest: None,
            });
        }

        // 2. Validation: Refuse requests missing ADR context
        if !profile.adr_bundle.contains(&"ADR-009".to_string()) {
            return Ok(GeniusServiceResponse {
                status: "REJECTED".to_string(),
                reason: Some("Missing mandatory ADR-009 compliance.".to_string()),
                artifact_bundle: None,
                trajectory_report: None,
                evidence_manifest: None,
            });
        }

        // 3. Build scenario config from defaults and parameters
        let def = &profile.defaults;
        let d_dataset = def.get("dataset").and_then(|v| v.as_str()).unwrap_or("mnist");
        let d_max_batches = def.get("max_batches").and_then(|v| v.as_u64()).unwrap_or(10) as usize;
        let d_safety = def.get("safety_threshold").and_then(|v| v.as_f64()).unwrap_or(5.0);
        let d_primes: Vec<usize> = def.get("primes")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().filter_map(|x| x.as_u64().map(|y| y as usize)).collect())
            .unwrap_or_else(|| vec![2, 3, 5]);
        let d_use_lm = def.get("use_lm").and_then(|v| v.as_bool()).unwrap_or(false);

        let scenario_config = serde_json::json!({
            "name": task_name,
            "dataset": dataset.unwrap_or(d_dataset),
            "primes": primes.unwrap_or(d_primes),
            "hidden_dim": hidden_dim.unwrap_or(64),
            "lambda_zeta": lambda_zeta.unwrap_or(0.1),
            "a": a.unwrap_or(2.0),
            "safety_threshold": safety_threshold.unwrap_or(d_safety),
            "use_lm": use_lm.unwrap_or(d_use_lm),
            "max_batches": max_batches.unwrap_or(d_max_batches)
        });

        // 4. Launch Governed Run
        let config_str = serde_json::to_string(&scenario_config).map_err(|e| e.to_string())?;
        
        let mut train_script = PathBuf::from(&self.root_dir);
        train_script.push("scripts");
        train_script.push("train_zmod_genius.py");

        let child = Command::new("/home/multiplicity/models/agios/.venv/bin/python3")
            .arg(train_script)
            .arg(&config_str)
            .env("PYTHONPATH", "/home/multiplicity/models")
            .output()
            .map_err(|e| format!("Failed to run subprocess: {}", e))?;

        if !child.status.success() {
            let stderr_str = String::from_utf8_lossy(&child.stderr).to_string();
            return Ok(GeniusServiceResponse {
                status: "FAILED".to_string(),
                reason: Some(stderr_str),
                artifact_bundle: None,
                trajectory_report: None,
                evidence_manifest: None,
            });
        }

        // 5. Extract Result Artifacts
        let ds = dataset.unwrap_or(d_dataset);
        let result_file = format!("{}_genius_{}.json", ds, task_name);
        let mut result_path = PathBuf::from(&self.root_dir);
        result_path.push("results");
        result_path.push(&result_file);

        if result_path.exists() {
            let run_data_str = fs::read_to_string(&result_path).map_err(|e| e.to_string())?;
            let run_data: serde_json::Value = serde_json::from_str(&run_data_str).map_err(|e| e.to_string())?;

            let telemetry_summary = run_data["telemetry_summary"].as_array();
            let mut phoenix_events = 0;
            let mut last_status = serde_json::Value::Null;

            if let Some(summary_arr) = telemetry_summary {
                phoenix_events = summary_arr
                    .iter()
                    .filter(|s| s["ctrl_status"]["phoenix_triggered"].as_bool().unwrap_or(false))
                    .count();
                if let Some(last) = summary_arr.last() {
                    last_status = last["ctrl_status"].clone();
                }
            }

            let corr = last_status["correlation"].as_f64();
            let g_type = if let Some(c) = corr {
                if c > 0.5 {
                    "Unstable / Chaotic"
                } else {
                    "Stochastic / Balanced"
                }
            } else {
                "Stochastic / Balanced"
            };

            let final_loss = run_data["final_loss"].as_f64().unwrap_or(0.0);

            let mut artifact_bundle = HashMap::new();
            artifact_bundle.insert("weights_path".to_string(), "TBD".to_string());
            artifact_bundle.insert("run_log".to_string(), result_path.to_string_lossy().to_string());

            let response = GeniusServiceResponse {
                status: "SUCCESS".to_string(),
                reason: None,
                artifact_bundle: Some(artifact_bundle),
                trajectory_report: Some(TrajectoryReport {
                    genius_type: g_type.to_string(),
                    phoenix_events,
                    final_loss,
                }),
                evidence_manifest: Some("models/the_genius/module.adr.json".to_string()),
            };

            // 6. Log Global Telemetry
            let _ = self.tracker.log_event(
                profile_name,
                task_name,
                Some("SUCCESS"),
                Some(g_type),
                phoenix_events,
                Some(final_loss),
            );

            return Ok(response);
        }

        Ok(GeniusServiceResponse {
            status: "ERROR".to_string(),
            reason: Some("Run succeeded but result JSON was not produced.".to_string()),
            artifact_bundle: None,
            trajectory_report: None,
            evidence_manifest: None,
        })
    }
}
