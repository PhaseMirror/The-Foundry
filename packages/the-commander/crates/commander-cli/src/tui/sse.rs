use std::sync::{Arc, RwLock};
use tokio::time::{sleep, Duration};
use anyhow::Result;
use crate::tui::app::{AppState, LogEntry, SseStatus};
use futures::StreamExt;

pub async fn run_sse_listener(state: Arc<RwLock<AppState>>) {
    // 1. Resolve SSE Endpoint from environment
    let addr = std::env::var("COMMANDER_HTTP_ADDR")
        .unwrap_or_else(|_| "http://127.0.0.1:8000".to_string());
    let endpoint = format!("{}/tools/log", addr);

    let mut attempt: u32 = 0;
    loop {
        {
            let status = if attempt == 0 {
                SseStatus::Connected
            } else {
                SseStatus::Reconnecting { attempt }
            };
            if let Ok(mut s) = state.write() {
                s.sse_status = status;
            }
        }

        match connect_and_stream(&endpoint, Arc::clone(&state)).await {
            Ok(_) => { 
                attempt = 0; 
            }
            Err(e) => {
                tracing::warn!("SSE stream dropped (attempt {}): {}", attempt, e);
                if let Ok(mut s) = state.write() {
                    s.sse_status = SseStatus::Reconnecting { attempt: attempt + 1 };
                    s.push_log(LogEntry {
                        ts: chrono::Utc::now().to_rfc3339(),
                        level: "WARN".into(),
                        msg: format!("SSE disconnected — reconnecting (attempt {})", attempt + 1),
                    });
                }
                attempt += 1;
                let backoff = 30.min(2u64.saturating_pow(attempt));
                sleep(Duration::from_secs(backoff)).await;
            }
        }
    }
}

async fn connect_and_stream(endpoint: &str, state: Arc<RwLock<AppState>>) -> Result<()> {
    let client = reqwest::Client::new();
    let response = client.get(endpoint)
        .header("Authorization", format!("Bearer {}", std::env::var("COMMANDER_SSE_BEARER_TOKEN").unwrap_or_default()))
        .send()
        .await?
        .error_for_status()?;

    let mut stream = response.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item?;
        let text = String::from_utf8_lossy(&chunk);
        
        // Simple SSE parsing
        for line in text.lines() {
            if let Some(data) = line.strip_prefix("data: ") {
                if let Ok(event) = serde_json::from_str::<multiplicity_commander_core::events::UnifiedEvent>(data) {
                    if let Ok(mut s) = state.write() {
                        match event {
                            multiplicity_commander_core::events::UnifiedEvent::WitnessAdded(witness) => {
                                s.push_log(LogEntry {
                                    ts: witness.timestamp,
                                    level: if witness.veto_status == "admitted" { "PASS".to_string() } else { "FAIL".to_string() },
                                    msg: format!("Witness: {} ({})", witness.action_id, witness.witness_id),
                                });
                            }
                            multiplicity_commander_core::events::UnifiedEvent::PolicyEvaluated { action_id, report } => {
                                s.push_log(LogEntry {
                                    ts: "now".to_string(),
                                    level: if report.allowed { "PASS".to_string() } else { "FAIL".to_string() },
                                    msg: format!("Policy: {} -> {}", action_id, report.reason),
                                });
                            }
                            multiplicity_commander_core::events::UnifiedEvent::ReplicationEvent { witness_id, status, detail } => {
                                s.push_log(LogEntry {
                                    ts: "now".to_string(),
                                    level: "INFO".to_string(),
                                    msg: format!("Sync: {} [{}] {}", witness_id, status, detail),
                                });
                            }
                            multiplicity_commander_core::events::UnifiedEvent::SystemStatus { level, msg } => {
                                s.push_log(LogEntry {
                                    ts: "now".to_string(),
                                    level: level.to_uppercase(),
                                    msg: format!("System: {}", msg),
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(())
}
