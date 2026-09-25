mod routing;
use std::env;
use std::fs;
use std::io::{self, BufRead};
use tokio::io::{AsyncBufReadExt, BufReader, AsyncWriteExt};
use tokio::net::TcpListener;
use serde::{Deserialize, Serialize};

use hologram_cnl::{compile_command, VerifiedAction};
use hologram_archivum::ArchivumLogger;
use routing::{RoutingTable, ModelRoute};

#[derive(Serialize, Deserialize, Debug)]
struct McpRequest {
    pub method: String,
    pub params: serde_json::Value,
    pub id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct McpResponse {
    pub jsonrpc: String,
    pub id: Option<String>,
    pub result: Option<serde_json::Value>,
    pub error: Option<serde_json::Value>,
}

#[tokio::main]
async fn main() {
    let ledger_path = env::var("HOLOGRAM_LEDGER_PATH").unwrap_or_else(|_| "hologram_archivum_ledger.jsonl".to_string());
    let logger = ArchivumLogger::new(&ledger_path);

    // Load Routing Table
    let routing_path = env::var("HOLOGRAM_ROUTING_PATH").unwrap_or_else(|_| "routing.yaml".to_string());
    let routing_yaml = fs::read_to_string(&routing_path).unwrap_or_else(|_| "default_model: unknown\nroutes: []".to_string());
    let routing_table = RoutingTable::load_from_yaml(&routing_yaml).unwrap_or_else(|_| {
        eprintln!("Failed to parse {}. Falling back to empty routing table.", routing_path);
        RoutingTable { default_model: "unknown".to_string(), routes: vec![] }
    });

    // Send a boot event to Archivum
    let _ = logger.log_event("BOOT", "system", &format!("Hologram-API MCP Server started. Default Model: {}", routing_table.default_model));

    // Spawn a lightweight HTTP server for liveness probes
    tokio::spawn(async move {
        let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
        loop {
            if let Ok((mut socket, _)) = listener.accept().await {
                tokio::spawn(async move {
                    let mut buf = [0; 1024];
                    if let Ok(n) = socket.try_read(&mut buf) {
                        let request = String::from_utf8_lossy(&buf[..n]);
                        if request.starts_with("GET /health ") {
                            let response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"status\":\"healthy\",\"engine\":\"hologram-api\"}";
                            let _ = socket.write_all(response.as_bytes()).await;
                        } else if request.starts_with("GET /ready ") {
                            let response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"status\":\"ready\",\"saturated\":true}";
                            let _ = socket.write_all(response.as_bytes()).await;
                        } else if request.starts_with("GET /telemetry ") {
                            // Mocking residency and telemetry feedback for horizontal scaling orchestrators
                            let telemetry_payload = serde_json::json!({
                                "metrics": {
                                    "tensor_residency_bytes": 1024 * 1024 * 256, // 256 MB pinned
                                    "context_pinning_ratio": 0.85,
                                    "saturation_index": 0.92,
                                    "inference_latency_margin_ms": 14.5
                                },
                                "status": "nominal"
                            });
                            let response = format!("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{}", telemetry_payload.to_string());
                            let _ = socket.write_all(response.as_bytes()).await;
                        } else {
                            let response = "HTTP/1.1 404 NOT FOUND\r\n\r\n";
                            let _ = socket.write_all(response.as_bytes()).await;
                        }
                    }
                });
            }
        }
    });

    // Simple stdin-based JSON-RPC (MCP standard)
    let stdin = io::stdin();
    let mut handle = stdin.lock();
    let mut buffer = String::new();

    while let Ok(bytes_read) = handle.read_line(&mut buffer) {
        if bytes_read == 0 {
            break; // EOF
        }

        let input = buffer.trim();
        if input.is_empty() {
            buffer.clear();
            continue;
        }

        match serde_json::from_str::<McpRequest>(input) {
            Ok(request) => {
                let response = handle_request(&request, &logger, &routing_table).await;
                println!("{}", serde_json::to_string(&response).unwrap());
            }
            Err(_) => {
                let error_resp = serde_json::json!({
                    "jsonrpc": "2.0",
                    "error": { "code": -32700, "message": "Parse error" }
                });
                println!("{}", error_resp.to_string());
            }
        }
        buffer.clear();
    }
}

async fn handle_request(req: &McpRequest, logger: &ArchivumLogger, routing_table: &RoutingTable) -> McpResponse {
    let mut result = None;
    let mut error = None;

    match req.method.as_str() {
        "hologram_compile" => {
            // Log compile request
            let _ = logger.log_event("MCP_TOOL_CALL", "system", &format!("hologram_compile: {:?}", req.params));
            result = Some(serde_json::json!({ "status": "compiled", "model": "safetensors_graph" }));
        }
        "hologram_generate" => {
            let domain = req.params.get("domain").and_then(|v| v.as_str()).unwrap_or("general_orchestrator");
            let target_model = if let Some(route) = routing_table.resolve_model(domain) {
                route.model_id.clone()
            } else {
                routing_table.default_model.clone()
            };

            // Extract generation parameters and enforce CNL
            if let Some(prompt) = req.params.get("prompt").and_then(|v| v.as_str()) {
                // Let's pretend the prompt contains CNL constraints as a test
                match compile_command(prompt) {
                    Ok(compilation) => {
                        if compilation.invariants_passed() {
                            let _ = logger.log_event("MCP_TOOL_CALL", domain, &format!("hologram_generate allowed on model {}: {:?}", target_model, compilation.verified_action));
                            
                            // Mocking the generation logic
                            result = Some(serde_json::json!({ 
                                "status": "generated", 
                                "model_used": target_model,
                                "text": format!("This is a governed generation output from {}", target_model) 
                            }));
                            
                            let _ = logger.log_event("MCP_TOOL_RESULT", domain, &format!("Generation complete using {}", target_model));
                        } else {
                            error = Some(serde_json::json!({ "code": -32001, "message": "CNL Invariants failed: Generation Blocked." }));
                            let _ = logger.log_event("MCP_TOOL_BLOCKED", domain, "Generation Blocked by ALP-CNL.");
                        }
                    }
                    Err(e) => {
                        error = Some(serde_json::json!({ "code": -32002, "message": format!("CNL Parse Error: {}", e) }));
                        let _ = logger.log_event("MCP_TOOL_ERROR", domain, &format!("CNL Parse Error: {}", e));
                    }
                }
            } else {
                error = Some(serde_json::json!({ "code": -32602, "message": "Missing 'prompt' parameter" }));
            }
        }
        _ => {
            error = Some(serde_json::json!({ "code": -32601, "message": "Method not found" }));
        }
    }

    McpResponse {
        jsonrpc: "2.0".to_string(),
        id: req.id.clone(),
        result,
        error,
    }
}
