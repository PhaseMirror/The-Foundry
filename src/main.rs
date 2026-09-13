use axum::{routing::post, Json, Router};
use std::net::SocketAddr;

use founder_os_sovereign_mcp::tools::{self, ContentRequest, CrmfResponse, WorkflowRequest};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/mcp/v1/workflow", post(handle_workflow_run))
        .route("/mcp/v1/content", post(handle_content_certify));

    let addr = SocketAddr::from(([127, 0, 0, 1], 8090));
    println!("founder-os-sovereign-mcp listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handle_workflow_run(Json(payload): Json<WorkflowRequest>) -> Json<CrmfResponse> {
    match tools::execute_certified_workflow(payload) {
        Ok(seal) => Json(CrmfResponse {
            status: "accepted".into(),
            receipt_id: Some(seal.receipt_id),
            envelope_hash: Some(seal.envelope_hash),
            violation_vector: None,
        }),
        Err(violations) => Json(CrmfResponse {
            status: "rejected".into(),
            receipt_id: None,
            envelope_hash: None,
            violation_vector: Some(violations),
        }),
    }
}

async fn handle_content_certify(Json(payload): Json<ContentRequest>) -> Json<CrmfResponse> {
    match tools::execute_content_certify(payload) {
        Ok(seal) => Json(CrmfResponse {
            status: "accepted".into(),
            receipt_id: Some(seal.receipt_id),
            envelope_hash: Some(seal.envelope_hash),
            violation_vector: None,
        }),
        Err(violations) => Json(CrmfResponse {
            status: "rejected".into(),
            receipt_id: None,
            envelope_hash: None,
            violation_vector: Some(violations),
        }),
    }
}