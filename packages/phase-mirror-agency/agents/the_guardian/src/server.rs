use serde::{Deserialize, Serialize};
use tokio::net::{UnixListener, UnixStream};
use tokio_util::codec::{Framed, LengthDelimitedCodec};
use futures::{StreamExt, SinkExt};
use anyhow::Result;
use std::path::Path;
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GuardianRequest {
    Validate { proposal: Vec<f64> },
    Ping,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GuardianResponse {
    Validated { proposal: Vec<f64> },
    Pong,
    Error { message: String },
}

pub struct GuardianServer {
    socket_path: String,
    service: crate::GuardianService,
}

impl GuardianServer {
    pub fn new(socket_path: String, service: crate::GuardianService) -> Self {
        Self { socket_path, service }
    }

    pub async fn run(&self) -> Result<()> {
        if Path::new(&self.socket_path).exists() {
            fs::remove_file(&self.socket_path)?;
        }

        let listener = UnixListener::bind(&self.socket_path)?;
        println!("Guardian IPC listening on {}", self.socket_path);

        loop {
            let (stream, _) = listener.accept().await?;
            let service = crate::GuardianService {
                guardian: self.service.guardian.clone(),
                logger: self.service.logger.clone(),
                policy_engine: self.service.policy_engine.clone(),
                verifier: self.service.verifier.clone(),
            };
            
            tokio::spawn(async move {
                if let Err(e) = Self::handle_stream(stream, service).await {
                    eprintln!("Error handling IPC stream: {}", e);
                }
            });
        }
    }

    async fn handle_stream(stream: UnixStream, service: crate::GuardianService) -> Result<()> {
        let mut framed = Framed::new(stream, LengthDelimitedCodec::new());

        while let Some(result) = framed.next().await {
            let bytes = result?;
            let request: GuardianRequest = serde_json::from_slice(&bytes)?;
            
            let response = match request {
                GuardianRequest::Ping => GuardianResponse::Pong,
                GuardianRequest::Validate { proposal } => {
                    // Placeholder item_id for now
                    match service.validate_proposal("stream-id".to_string(), proposal) {
                        Ok(validated) => GuardianResponse::Validated { proposal: validated },
                        Err(e) => GuardianResponse::Error { message: e.to_string() },
                    }
                }
            };
            
            let response_bytes = serde_json::to_vec(&response)?;
            framed.send(response_bytes.into()).await?;
        }
        Ok(())
    }
}
