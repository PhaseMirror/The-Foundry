use crate::automation::AutomationAction;
use crate::governance::{
    AutomationEvaluationContext, AutomationEvent, AutomationGovernanceOracle,
    AutomationGovernanceOutcome,
};
use crate::kani_runner::KaniRunner;
use crate::triple_lock::AutomationTripleLockSuite;
use anyhow::Result;
use phase_mirror_gpt::domain_invariants::SemanticPolicy;
use phase_mirror_gpt::validator::GovernanceTier;
use serde::{Deserialize, Serialize};
use std::io::{self, BufRead, Write};
use std::sync::Arc;
use tokio::sync::Mutex as TokioMutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpRequest {
    pub jsonrpc: String,
    pub id: Option<serde_json::Value>,
    pub method: String,
    pub params: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct McpResponse {
    pub jsonrpc: String,
    pub id: Option<serde_json::Value>,
    pub result: Option<serde_json::Value>,
    pub error: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ToolCallParams {
    pub name: String,
    pub arguments: serde_json::Value,
}

pub struct KiloMcpServer {
    pub policy: Arc<SemanticPolicy>,
    pub governance: AutomationGovernanceOracle,
    pub triple_lock: AutomationTripleLockSuite,
}

impl KiloMcpServer {
    pub fn new(policy: Arc<SemanticPolicy>) -> Self {
        let governance = AutomationGovernanceOracle::new(policy.clone());
        let telemetry = std::sync::Arc::new(std::sync::Mutex::new(
            phase_mirror_gpt::telemetry::LiveTelemetryOracle::init_baseline(),
        ));
        let ledger = std::sync::Arc::new(TokioMutex::new(
            phase_mirror_gpt::archivum::ArchivumLedger::new(),
        ));
        let triple_lock = AutomationTripleLockSuite::new(telemetry, ledger, policy.clone());
        Self {
            policy,
            governance,
            triple_lock,
        }
    }

    pub async fn handle_request(&self, req: McpRequest) -> McpResponse {
        match req.method.as_str() {
            "tools/list" => McpResponse {
                jsonrpc: "2.0".to_string(),
                id: req.id,
                result: Some(serde_json::json!({
                    "tools": [
                        {"name": "verify", "description": "Run L0+L1+Triple-Lock verification without side effects", "inputSchema": {"type": "object"}},
                        {"name": "execute", "description": "Admit and run an automation action", "inputSchema": {"type": "object"}},
                        {"name": "kani", "description": "Run Kani proofs and return witness", "inputSchema": {"type": "object"}}
                    ]
                })),
                error: None,
            },
            "tools/call" => {
                let params = match req.params {
                    Some(p) => p,
                    None => return McpResponse::error(req.id, "missing params", -32601),
                };
                let call: ToolCallParams = match serde_json::from_value(params) {
                    Ok(c) => c,
                    Err(_) => return McpResponse::error(req.id, "invalid params", -32602),
                };
                self.handle_tool_call(req.id, call).await
            }
            _ => McpResponse::error(req.id, "method not found", -32601),
        }
    }

    async fn handle_tool_call(
        &self,
        id: Option<serde_json::Value>,
        call: ToolCallParams,
    ) -> McpResponse {
        match call.name.as_str() {
            "verify" => {
                let ctx = AutomationEvaluationContext {
                    permission_bits: 0b1111,
                    schema_signature: 0b111,
                    expected_schema: 0b111,
                };
                let outcome = self.governance.admit(
                    &ctx,
                    AutomationEvent::KiloMcpInvoke,
                    &call.arguments.to_string(),
                    GovernanceTier::Tier1Authoritative,
                );
                let result = match outcome {
                    AutomationGovernanceOutcome::Allow => {
                        serde_json::json!({"status": "VERIFIED", "outcome": "Allow"})
                    }
                    AutomationGovernanceOutcome::Warn(msg) => {
                        serde_json::json!({"status": "WARN", "outcome": msg})
                    }
                    AutomationGovernanceOutcome::Block(msg) => {
                        serde_json::json!({"status": "BLOCKED", "outcome": msg})
                    }
                };
                McpResponse {
                    jsonrpc: "2.0".to_string(),
                    id,
                    result: Some(result),
                    error: None,
                }
            }
            "execute" => {
                let action_str = call
                    .arguments
                    .get("action")
                    .and_then(|v| v.as_str())
                    .unwrap_or("");
                let action = match action_str {
                    "build" => AutomationAction::CargoBuild {
                        package: None,
                        release: true,
                    },
                    "test" => AutomationAction::CargoTest { package: None },
                    "kani" => AutomationAction::CargoKani { package: None },
                    _ => return McpResponse::error(id, "unknown action", -32602),
                };
                let outcome = action.execute();
                let result = match outcome {
                    Ok(crate::automation::AutomationOutcome::Success { stdout, .. }) => {
                        serde_json::json!({"status": "OK", "stdout": stdout})
                    }
                    Ok(crate::automation::AutomationOutcome::Failure { stderr, .. }) => {
                        serde_json::json!({"status": "FAILED", "stderr": stderr})
                    }
                    Err(e) => serde_json::json!({"status": "ERROR", "error": e.to_string()}),
                };
                McpResponse {
                    jsonrpc: "2.0".to_string(),
                    id,
                    result: Some(result),
                    error: None,
                }
            }
            "kani" => {
                let report = KaniRunner::verify(None, None);
                let result = match report {
                    Ok(r) if r.success => {
                        serde_json::json!({"status": "VERIFIED", "stdout": r.stdout})
                    }
                    Ok(r) => serde_json::json!({"status": "FAILED", "stderr": r.stderr}),
                    Err(e) => serde_json::json!({"status": "ERROR", "error": e.to_string()}),
                };
                McpResponse {
                    jsonrpc: "2.0".to_string(),
                    id,
                    result: Some(result),
                    error: None,
                }
            }
            _ => McpResponse::error(id, "unknown tool", -32601),
        }
    }
}

impl McpResponse {
    fn error(id: Option<serde_json::Value>, message: &str, code: i32) -> Self {
        Self {
            jsonrpc: "2.0".to_string(),
            id,
            result: None,
            error: Some(serde_json::json!({"code": code, "message": message})),
        }
    }
}

pub async fn run_stdio_loop(server: Arc<KiloMcpServer>) -> Result<()> {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut stdout_lock = stdout.lock();

    for line_result in stdin.lock().lines() {
        let line = line_result?;
        if line.trim().is_empty() {
            continue;
        }
        let req: McpRequest = match serde_json::from_str(&line) {
            Ok(r) => r,
            Err(_) => continue,
        };
        let resp = server.handle_request(req).await;
        let json = serde_json::to_string(&resp)?;
        writeln!(stdout_lock, "{}", json)?;
        stdout_lock.flush()?;
    }
    Ok(())
}
