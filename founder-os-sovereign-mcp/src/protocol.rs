use crate::eventlog::EventLog;
use crate::registry::{mcp_text, ToolRegistry};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::io::{self, BufRead, Write};

/// MCP protocol revision this server implements.
pub const MCP_PROTOCOL_VERSION: &str = "2024-11-05";
pub const MCP_SERVER_NAME: &str = "founder-os-sovereign-mcp";

/// Minimal JSON-RPC 2.0 request as framed by MCP stdio (one message per line).
#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    #[serde(default)]
    pub id: Option<Value>,
    #[serde(default)]
    pub method: String,
    #[serde(default)]
    pub params: Value,
}

#[derive(Debug, Serialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<Value>,
}

/// Stateless-with-persistence MCP server. One instance serves both stdio and
/// HTTP transports; the ledger is shared and serialized externally.
pub struct McpServer {
    registry: ToolRegistry,
    ledger: EventLog,
}

impl McpServer {
    pub fn new(registry: ToolRegistry, ledger: EventLog) -> Self {
        McpServer { registry, ledger }
    }

    pub fn protocol_version(&self) -> &'static str {
        MCP_PROTOCOL_VERSION
    }

    /// Persist a certified envelope to the shared ledger (used by transports
    /// that execute tools outside the JSON-RPC dispatch path).
    pub fn persist(&mut self, seal: &crate::tools::SealedEnvelope) -> Result<u64, String> {
        self.ledger
            .append(&seal.envelope)
            .map_err(|e| e.to_string())
    }

    /// Run tamper-evidence verification over the persisted ledger at startup.
    pub fn startup_chain_check(&self) -> String {
        match self.ledger.verify_chain() {
            Ok(verdict) if verdict.is_clean() => {
                format!("event log: {} entries, chain verified clean", verdict.entries)
            }
            Ok(verdict) => {
                format!(
                    "event log: {} entries, TAMPER EVIDENCE FOUND: {}",
                    verdict.entries,
                    verdict.tamper_evidence.join("; ")
                )
            }
            Err(e) => format!("event log: chain check failed: {e}"),
        }
    }

    /// Handle a single line/body of JSON-RPC. Returns `Some(json)` when a
    /// response must be written back, and `None` for notifications.
    pub fn handle_json(&mut self, body: &str) -> Option<String> {
        let trimmed = body.trim();
        if trimmed.is_empty() {
            return None;
        }
        match serde_json::from_str::<JsonRpcRequest>(trimmed) {
            Ok(req) => self.dispatch(&req).map(|resp| {
                serde_json::to_string(&resp).expect("response serialization cannot fail")
            }),
            Err(e) => {
                let resp = failure(None, -32700, "Parse error", json!({ "detail": e.to_string() }));
                Some(serde_json::to_string(&resp).expect("response serialization cannot fail"))
            }
        }
    }

    fn dispatch(&mut self, req: &JsonRpcRequest) -> Option<JsonRpcResponse> {
        match req.method.as_str() {
            "initialize" => Some(success(
                req.id.clone(),
                json!({
                    "protocolVersion": MCP_PROTOCOL_VERSION,
                    "capabilities": { "tools": {} },
                    "serverInfo": {
                        "name": MCP_SERVER_NAME,
                        "version": env!("CARGO_PKG_VERSION")
                    }
                }),
            )),
            "notifications/initialized" => None,
            "ping" => Some(success(req.id.clone(), json!({}))),
            "tools/list" => {
                if req.id.is_none() {
                    return None;
                }
                Some(success(req.id.clone(), self.registry.list()))
            }
            "tools/call" => {
                if req.id.is_none() {
                    return None;
                }
                let name = req.params.get("name").and_then(Value::as_str);
                let Some(name) = name else {
                    return Some(failure(
                        req.id.clone(),
                        -32602,
                        "Invalid params",
                        json!({ "detail": "missing 'name'" }),
                    ));
                };
                let arguments = req.params.get("arguments").cloned().unwrap_or(json!({}));
                match self.registry.call(name, arguments, &mut self.ledger) {
                    Ok(value) => Some(success(req.id.clone(), mcp_text(&value, false))),
                    Err(value) => Some(success(req.id.clone(), mcp_text(&value, true))),
                }
            }
            other => Some(failure(
                req.id.clone(),
                -32601,
                "Method not found",
                json!({ "detail": format!("unknown method: {other}") }),
            )),
        }
    }
}

fn success(id: Option<Value>, result: Value) -> JsonRpcResponse {
    JsonRpcResponse {
        jsonrpc: "2.0".into(),
        id,
        result: Some(result),
        error: None,
    }
}

fn failure(id: Option<Value>, code: i64, message: &str, data: Value) -> JsonRpcResponse {
    JsonRpcResponse {
        jsonrpc: "2.0".into(),
        id,
        result: None,
        error: Some(json!({ "code": code, "message": message, "data": data })),
    }
}

/// Blocking MCP stdio transport: newline-delimited JSON-RPC on stdin/stdout.
///
/// This is the transport Claude Desktop and other MCP clients use when they
/// spawn the server via the `command` key of `mcpServers`.
pub fn serve_stdio(server: &mut McpServer, reader: impl BufRead, writer: impl Write) -> io::Result<()> {
    let mut writer = writer;
    for line in reader.lines() {
        let line = line?;
        if let Some(resp) = server.handle_json(&line) {
            writer.write_all(resp.as_bytes())?;
            writer.write_all(b"\n")?;
            writer.flush()?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::registry::builtin_registry;
    use crate::envelope::GENESIS_STATE_HASH;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn server() -> McpServer {
        let dir = std::env::temp_dir().join(format!("foe_proto_{}", now()));
        McpServer::new(builtin_registry(), EventLog::open(dir).unwrap())
    }

    fn call(server: &mut McpServer, msg: &str) -> Option<String> {
        server.handle_json(msg)
    }

    #[test]
    fn initialize_returns_protocol() {
        let mut s = server();
        let resp = call(
            &mut s,
            r#"{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}"#,
        )
        .unwrap();
        let v: Value = serde_json::from_str(&resp).unwrap();
        assert_eq!(v["id"], 1);
        assert_eq!(v["result"]["protocolVersion"], "2024-11-05");
        assert!(v["result"]["capabilities"]["tools"].is_object());
    }

    #[test]
    fn tools_list_contains_six_tools() {
        let mut s = server();
        let resp = call(&mut s, r#"{"jsonrpc":"2.0","id":2,"method":"tools/list"}"#).unwrap();
        let v: Value = serde_json::from_str(&resp).unwrap();
        assert_eq!(v["result"]["tools"].as_array().unwrap().len(), 6);
        assert!(v["result"]["tools"].as_array().unwrap().iter().any(|t| t["name"] == "workflow.run"));
        assert!(v["result"]["tools"].as_array().unwrap().iter().any(|t| t["name"] == "client.receipt.export"));
    }

    #[test]
    fn notification_gets_no_response() {
        let mut s = server();
        let resp = call(&mut s, r#"{"jsonrpc":"2.0","method":"notifications/initialized"}"#);
        assert!(resp.is_none());
    }

    #[test]
    fn ping_roundtrip() {
        let mut s = server();
        let resp = call(&mut s, r#"{"jsonrpc":"2.0","id":3,"method":"ping"}"#).unwrap();
        let v: Value = serde_json::from_str(&resp).unwrap();
        assert_eq!(v["result"], json!({}));
    }

    #[test]
    fn workflow_call_accepts_and_persists() {
        let mut s = server();
        let msg = format!(
            r#"{{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{{"name":"workflow.run","arguments":{{"workflow_id":"founder-os/email-sequence/lead-nurture","context_hash":"{GENESIS_STATE_HASH}","proposed_ops":[{{"op_type":"crm.update","target":"field:last_touch"}},{{"op_type":"email.send","target":"segment:active-trial"}}]}}}}}}"#
        );
        let resp = call(&mut s, &msg).unwrap();
        let v: Value = serde_json::from_str(&resp).unwrap();
        assert_eq!(v["error"], Value::Null);
        assert_eq!(v["result"]["isError"], false);
        let text: Value = serde_json::from_str(v["result"]["content"][0]["text"].as_str().unwrap()).unwrap();
        assert_eq!(text["status"], "accepted");
        assert_eq!(text["ledger_sequence"], 1);
        assert_eq!(text["side_effect_permissions"][0], "crm.update:allowed");
    }

    #[test]
    fn workflow_call_rejects_bad_funnel() {
        let mut s = server();
        let msg = format!(
            r#"{{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{{"name":"workflow.run","arguments":{{"workflow_id":"f","context_hash":"{GENESIS_STATE_HASH}","proposed_ops":[{{"op_type":"email.send","target":"segment:active-trial"}}]}}}}}}"#
        );
        let resp = call(&mut s, &msg).unwrap();
        let v: Value = serde_json::from_str(&resp).unwrap();
        assert_eq!(v["result"]["isError"], true);
        let text: Value = serde_json::from_str(v["result"]["content"][0]["text"].as_str().unwrap()).unwrap();
        assert_eq!(text["status"], "rejected");
        assert!(text["violation_vector"]
            .as_array()
            .unwrap()
            .iter()
            .any(|x| x["field"] == "funnel_reachability"));
    }

    #[test]
    fn unknown_method_is_error() {
        let mut s = server();
        let resp = call(&mut s, r#"{"jsonrpc":"2.0","id":6,"method":"bogus"}"#).unwrap();
        let v: Value = serde_json::from_str(&resp).unwrap();
        assert_eq!(v["error"]["code"], -32601);
    }

    #[test]
    fn stdio_terminal_roundtrip() {
        let mut s = server();
        let input = format!(
            "{}\n{}\n",
            r#"{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}"#,
            r#"{"jsonrpc":"2.0","id":2,"method":"tools/list"}"#
        );
        let mut out = Vec::new();
        serve_stdio(&mut s, input.as_bytes(), &mut out).unwrap();
        let text = String::from_utf8(out).unwrap();
        assert_eq!(text.lines().count(), 2);
        assert!(text.contains(r#""protocolVersion":"2024-11-05""#));
        assert!(text.contains(r#""name":"workflow.run""#));
    }

    fn now() -> u64 {
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos() as u64
    }
}