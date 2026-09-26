use std::sync::Arc;
use multiplicity_commander_core::CommanderCore;
use axum::{
    routing::{get, post},
    Router, extract::State,
    response::sse::{Event, Sse},
    http::{StatusCode, HeaderMap},
};
use async_trait::async_trait;
use futures::stream::{self, Stream};
use super::McpTransport;

pub struct HttpTransport {
    pub port: u16,
}

#[async_trait]
impl McpTransport for HttpTransport {
    async fn run(&self, core: Arc<CommanderCore>) -> anyhow::Result<()> {
        let app = Router::new()
            .route("/tools", get(crate::list_tools))
            .route("/call/:tool_name", post(crate::call_tool))
            .route("/tools/log", get(sse_handler))
            .with_state(core);

        let addr = format!("127.0.0.1:{}", self.port);
        let listener = tokio::net::TcpListener::bind(&addr).await?;
        tracing::info!("Multiplicity HTTP MCP Server listening on {}", listener.local_addr()?);
        
        axum::serve(listener, app).await?;
        Ok(())
    }
}

async fn sse_handler(
    State(core): State<Arc<CommanderCore>>,
    headers: HeaderMap,
) -> Result<Sse<impl Stream<Item = Result<Event, Infallible>>>, StatusCode> {
    // 1. Bearer Token Auth (ADR-MCP-004)
    let expected_token = std::env::var("COMMANDER_SSE_BEARER_TOKEN").map_err(|_| {
        tracing::error!("COMMANDER_SSE_BEARER_TOKEN not set. Rejecting SSE connection.");
        StatusCode::UNAUTHORIZED
    })?;

    let auth_header = headers.get("Authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if auth_header != expected_token {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // 2. Subscribe to witnesses
    let receiver = core.archivum.subscribe();

    let stream = stream::unfold(receiver, |mut rx| async move {
        match rx.recv().await {
            Ok(event) => {
                let event_type = match event {
                    multiplicity_commander_core::events::UnifiedEvent::WitnessAdded(_) => "witness",
                    multiplicity_commander_core::events::UnifiedEvent::PolicyEvaluated { .. } => "policy",
                    multiplicity_commander_core::events::UnifiedEvent::ReplicationEvent { .. } => "replication",
                    multiplicity_commander_core::events::UnifiedEvent::SystemStatus { .. } => "system",
                };
                let event = Event::default()
                    .event(event_type)
                    .data(serde_json::to_string(&event).unwrap_or_default());
                Some((Ok(event), rx))
            }
            Err(_) => None,
        }
    });

    Ok(Sse::new(stream).keep_alive(axum::response::sse::KeepAlive::default()))
}

use std::convert::Infallible;
