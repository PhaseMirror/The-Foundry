use reqwest::{Client, header};
use serde_json::json;
use std::time::Duration;
use std::env;

#[tokio::test]
async fn test_mtpi_certified_admission() {
    // 1. Configure the TLS client to accept the local/self-signed cert
    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .timeout(Duration::from_secs(5))
        .build()
        .expect("Failed to build secure HTTP client");

    // 2. Retrieve the admission token (simulating the mtpi‑certifier injection)
    //    Fallback provided for local test execution if the env var isn't sourced
    let admission_token = env::var("MCP_ADMISSION_TOKEN")
        .unwrap_or_else(|_| "test-admission-token-override".to_string());

    // 3. Construct a canonical MTPI payload
    let payload = json!({
        "jsonrpc": "2.0",
        "method": "verify_tool_integrity",
        "params": {
            "tool": "apply_drmm",
            "witness_hash": "8f2a1..." // Simulated BLAKE3 witness
        },
        "id": 1
    });

    // 4. Execute the secure POST request against the local daemon
    let response = client
        .post("https://127.0.0.1:8080/mcp") // Adjust to your specific bound port
        .header("Authorization", format!("Bearer {}", admission_token))
        .json(&payload)
        .send()
        .await
        .expect("Failed to connect to MCP server. Is mcp.service running?");

    // 5. Assertions: Fail‑Closed Protection & Tool Shadowing Prevention
    assert!(
        response.status().is_success(),
        "MCP server rejected the certified payload. Status: {}",
        response.status()
    );

    let response_data: serde_json::Value = response.json().await.unwrap();
    assert_eq!(response_data["jsonrpc"], "2.0");
    assert!(
        response_data.get("error").is_none(),
        "MTPI Gatekeeper triggered a terminal error: {:?}",
        response_data["error"]
    );
}
