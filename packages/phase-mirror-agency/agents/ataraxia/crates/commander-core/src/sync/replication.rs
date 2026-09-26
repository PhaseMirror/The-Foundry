use std::path::Path;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio::time::{sleep, Duration};
use anyhow::Result;
use tracing::{info, warn, error};
use multiplicity_common::replication::{ReplicationConfig, ReplicationError, ReplicationRole};
use crate::sat::SatIssuer;
use crate::events::UnifiedEvent;
use super::quarantine::QuarantineStore;

const REPLICATION_ENDPOINT: &str = "/archivum/replicate";

pub struct ReplicaPushLoop {
    config: ReplicationConfig,
    sat_issuer: Arc<SatIssuer>,
    quarantine: QuarantineStore,
    http: reqwest::Client,
    event_tx: broadcast::Sender<UnifiedEvent>,
}

impl ReplicaPushLoop {
    pub fn new(config: ReplicationConfig, sat_issuer: Arc<SatIssuer>,
               state_dir: &Path, event_tx: broadcast::Sender<UnifiedEvent>) -> Self {
        Self {
            config,
            sat_issuer,
            quarantine: QuarantineStore::new(state_dir),
            http: reqwest::Client::new(),
            event_tx,
        }
    }

    /// Push a single witness to the Primary. Called by the replication task
    /// after every Internal-trust UnifiedWitness commit on a Replica node.
    pub async fn push(&self, witness_id: &str,
                      witness_json: serde_json::Value) -> Result<()> {
        let ReplicationRole::Replica { ref primary_addr } = self.config.role else {
            // Primary nodes do not push — they receive.
            return Ok(());
        };

        let endpoint = format!("{}{}", primary_addr, REPLICATION_ENDPOINT);
        let mut retries = 0u32;
        let mut auth_retried = false;

        loop {
            // Issue SAT for replication
            let sat = self.sat_issuer.issue_token(
                self.config.node_id.clone(),
                "primary-archivum".to_string(),
                "archivum.replicate".to_string(),
                vec!["replicate".to_string()],
                "1.0.0".to_string(),
                5,
                None,
            )?;

            let result = self.http
                .post(&endpoint)
                .bearer_auth(&sat.signature) // signature is used as the token
                .json(&witness_json)
                .send()
                .await;

            match self.classify(result).await {
                Ok(()) => {
                    info!(witness_id, "witness replicated to primary");
                    let _ = self.event_tx.send(UnifiedEvent::ReplicationEvent {
                        witness_id: witness_id.to_string(),
                        status: "replicated".to_string(),
                        detail: "Success".to_string(),
                    });
                    return Ok(());
                }

                Err(e @ ReplicationError::Transport(_)) => {
                    retries += 1;
                    if retries > self.config.max_transport_retries {
                        warn!(witness_id, retries, "transport retries exhausted — quarantining");
                        self.quarantine.write(witness_id, witness_json.clone(), &e)?;
                        let _ = self.event_tx.send(UnifiedEvent::ReplicationEvent {
                            witness_id: witness_id.to_string(),
                            status: "quarantined".to_string(),
                            detail: format!("Retries exhausted: {}", e),
                        });
                        return Ok(());
                    }
                    let backoff = 2u64.saturating_pow(retries);
                    warn!(witness_id, retries, backoff_secs = backoff, "transport failure — retrying");
                    let _ = self.event_tx.send(UnifiedEvent::ReplicationEvent {
                        witness_id: witness_id.to_string(),
                        status: "retrying".to_string(),
                        detail: format!("Transport error (retry {}): {}", retries, e),
                    });
                    sleep(Duration::from_secs(backoff)).await;
                }

                Err(ReplicationError::AuthFailure) if !auth_retried => {
                    auth_retried = true;
                    warn!(witness_id, "SAT auth failure — rotating and retrying once");
                    continue;
                }

                Err(e) => {
                    error!(witness_id, error = %e, "witness rejected by primary — quarantining");
                    self.quarantine.write(witness_id, witness_json.clone(), &e)?;
                    let _ = self.event_tx.send(UnifiedEvent::ReplicationEvent {
                        witness_id: witness_id.to_string(),
                        status: "quarantined".to_string(),
                        detail: format!("Policy/Schema rejection: {}", e),
                    });
                    return Ok(());
                }
            }
        }
    }

    async fn classify(&self, result: reqwest::Result<reqwest::Response>)
        -> std::result::Result<(), ReplicationError>
    {
        match result {
            Err(e) => Err(ReplicationError::Transport(e.to_string())),
            Ok(resp) => match resp.status().as_u16() {
                200..=299 => Ok(()),
                401 | 403  => Err(ReplicationError::AuthFailure),
                409        => {
                    let body = resp.text().await.unwrap_or_default();
                    Err(ReplicationError::PolicyRejection {
                        witness_id: String::new(),
                        reason: body,
                    })
                }
                422        => {
                    let body = resp.text().await.unwrap_or_default();
                    Err(ReplicationError::SchemaError(body))
                }
                other      => Err(ReplicationError::Transport(
                    format!("unexpected HTTP {}", other)
                )),
            }
        }
    }
}
