use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File, OpenOptions};
use std::io::{self, BufRead, BufReader, Write};
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AGSEvent {
    pub timestamp: String,
    pub profile: String,
    pub task: String,
    pub status: Option<String>,
    pub genius_type: Option<String>,
    pub phoenix_events: usize,
    pub final_loss: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AGSSummary {
    pub total_calls: usize,
    pub profile_distribution: HashMap<String, usize>,
    pub genius_type_distribution: HashMap<String, usize>,
    pub avg_phoenix_rate: f64,
}

#[derive(Debug, Clone)]
pub struct AGSTracker {
    pub log_path: String,
}

impl Default for AGSTracker {
    fn default() -> Self {
        Self::new(None)
    }
}

impl AGSTracker {
    pub fn new(log_path: Option<&str>) -> Self {
        let path = log_path.unwrap_or("models/the_genius/logs/ags_usage.jsonl");
        AGSTracker {
            log_path: path.to_string(),
        }
    }

    pub fn log_event(
        &self,
        profile: &str,
        task_name: &str,
        status: Option<&str>,
        genius_type: Option<&str>,
        phoenix_events: usize,
        final_loss: Option<f64>,
    ) -> Result<(), io::Error> {
        if let Some(parent) = Path::new(&self.log_path).parent() {
            fs::create_dir_all(parent)?;
        }

        // Get simple ISO-like timestamp without external dependencies
        let timestamp = get_simple_timestamp();

        let event = AGSEvent {
            timestamp,
            profile: profile.to_string(),
            task: task_name.to_string(),
            status: status.map(|s| s.to_string()),
            genius_type: genius_type.map(|s| s.to_string()),
            phoenix_events,
            final_loss,
        };

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_path)?;

        let serialized = serde_json::to_string(&event)?;
        writeln!(file, "{}", serialized)?;
        Ok(())
    }

    pub fn get_summary(&self) -> Result<AGSSummary, io::Error> {
        if !Path::new(&self.log_path).exists() {
            return Ok(AGSSummary {
                total_calls: 0,
                profile_distribution: HashMap::new(),
                genius_type_distribution: HashMap::new(),
                avg_phoenix_rate: 0.0,
            });
        }

        let file = File::open(&self.log_path)?;
        let reader = BufReader::new(file);

        let mut total_calls = 0;
        let mut profile_distribution = HashMap::new();
        let mut genius_type_distribution = HashMap::new();
        let mut total_phoenix = 0;

        for line in reader.lines() {
            let line_str = line?;
            if line_str.trim().is_empty() {
                continue;
            }
            if let Ok(event) = serde_json::from_str::<AGSEvent>(&line_str) {
                total_calls += 1;
                *profile_distribution.entry(event.profile.clone()).or_insert(0) += 1;
                if let Some(gt) = event.genius_type {
                    *genius_type_distribution.entry(gt).or_insert(0) += 1;
                }
                total_phoenix += event.phoenix_events;
            }
        }

        let avg_phoenix_rate = if total_calls > 0 {
            total_phoenix as f64 / total_calls as f64
        } else {
            0.0
        };

        Ok(AGSSummary {
            total_calls,
            profile_distribution,
            genius_type_distribution,
            avg_phoenix_rate,
        })
    }
}

// Helper function to get a basic timestamp using only the standard library
fn get_simple_timestamp() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(d) => {
            let secs = d.as_secs();
            // simple division to form YYYY-MM-DD-like epoch timestamp for tracking
            // Since we just need an ISO string:
            format!("{}Z", secs)
        }
        Err(_) => "1970-01-01T00:00:00Z".to_string(),
    }
}
