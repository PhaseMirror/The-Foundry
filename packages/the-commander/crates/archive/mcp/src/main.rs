pub mod transport;

use axum::{
    Json, extract::{Path, State},
};
use multiplicity_common::types::{ProposalRequest, ToolResponse};
use multiplicity_commander_core::CommanderCore;
use std::sync::Arc;
use crate::transport::{McpTransport, stdio::StdioTransport, http::HttpTransport};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();
    
    let core = Arc::new(CommanderCore::new("."));
    
    let args: Vec<String> = std::env::args().collect();
    
    let transport: Box<dyn McpTransport> = if args.contains(&"--stdio".to_string()) {
        Box::new(StdioTransport)
    } else if let Some(pos) = args.iter().position(|a| a == "--http") {
        let port = args.get(pos + 1)
            .and_then(|p| p.parse().ok())
            .unwrap_or(8000);
        Box::new(HttpTransport { port })
    } else {
        // Default to HTTP loopback if no flag
        Box::new(HttpTransport { port: 8000 })
    };

    transport.run(core).await?;
    
    Ok(())
}

pub async fn list_tools() -> Json<serde_json::Value> {
    let registry_path = std::path::Path::new("mcp_server/tool_registry.yaml");
    if registry_path.exists() {
        if let Ok(content) = std::fs::read_to_string(registry_path) {
            if let Ok(docs) = yaml_rust2::YamlLoader::load_from_str(&content) {
                if let Some(doc) = docs.first() {
                    let mut tools = Vec::new();
                    if let Some(yaml_tools) = doc["tools"].as_vec() {
                        for t in yaml_tools {
                            let name = t["name"].as_str().unwrap_or("").to_string();
                            let description = t["description"].as_str().unwrap_or("").to_string();
                            let mut inputs = Vec::new();
                            if let Some(yaml_inputs) = t["inputs"].as_vec() {
                                for i in yaml_inputs {
                                    if let Some(s) = i.as_str() {
                                        inputs.push(serde_json::json!(s));
                                    }
                                }
                            }
                            tools.push(serde_json::json!({
                                "name": name,
                                "description": description,
                                "inputs": inputs
                            }));
                        }
                        return Json(serde_json::json!({ "tools": tools }));
                    }
                }
            }
        }
    }
    Json(serde_json::json!({
        "tools": []
    }))
}

pub async fn call_tool(
    State(core): State<Arc<CommanderCore>>,
    Path(tool_name): Path<String>,
    Json(req): Json<ProposalRequest>,
) -> Json<ToolResponse> {
    tracing::info!("Calling tool: {}", tool_name);
    
    let payload = &req.payload;
    let command = match tool_name.as_str() {
        "get_governance_adr" => {
            let adr_id = payload["adr_id"].as_str().unwrap_or("").replace("'", "\\'");
            format!("export PHASE_MIRROR_HQ_ROOT=\".\" && python3 -c \"from mcp_server.domains.governance.tools import get_governance_adr; import json; print(json.dumps(get_governance_adr('{}')))\"", adr_id)
        }
        "list_governance_adrs" => {
            format!("export PHASE_MIRROR_HQ_ROOT=\".\" && python3 -c \"from mcp_server.domains.governance.tools import list_governance_adrs; import json; print(json.dumps(list_governance_adrs()))\"")
        }
        "query_constitution" => {
            format!("export PHASE_MIRROR_HQ_ROOT=\".\" && python3 -c \"from mcp_server.domains.governance.tools import query_constitution; import json; print(json.dumps({{'content': query_constitution()}}))\"")
        }
        "run_pirtm_call" => {
            let input_expr = payload["input_expr"].as_str().unwrap_or("").replace("'", "\\'");
            format!("export PHASE_MIRROR_HQ_ROOT=\".\" && python3 -c \"from mcp_server.domains.pirtm.tools import run_pirtm_call; import json; print(json.dumps(run_pirtm_call('{}')))\"", input_expr)
        }
        "agios_get_state" => {
            format!("export AGIOS_ROOT=\".\" && python3 -c \"from mcp_server.domains.agios.tools import agios_get_state; import json; print(json.dumps(agios_get_state()))\"")
        }
        "agios_constitution_check" => {
            let action = payload["action"].as_str().unwrap_or("").replace("'", "\\'");
            format!("export AGIOS_ROOT=\".\" && python3 -c \"from mcp_server.domains.agios.tools import agios_constitution_check; import json; print(json.dumps(agios_constitution_check('{}')))\"", action)
        }
        "execute_lever" => {
            let lever_id = payload["lever_id"].as_str().unwrap_or("").replace("'", "\\'");
            let scope = payload["scope"].as_str().unwrap_or("hq").replace("'", "\\'");
            format!("python3 -c \"from mcp_server.domains.daemon.tools import execute_lever; import json; print(json.dumps(execute_lever('{}', '{}')))\"", lever_id, scope)
        }
        _ => return Json(ToolResponse {
            ok: false,
            tool_name: tool_name.clone(),
            proposal_id: req.proposal_id,
            commit_sha: None,
            result: serde_json::Value::Null,
            violation: Some(format!("Unknown tool: {}", tool_name)),
        }),
    };

    let task = multiplicity_sigma::Task {
        id: format!("mcp-{}", tool_name),
        action: command,
        server_binding: None,
        tool_name: Some(tool_name.clone()),
    };
    let workflow = multiplicity_sigma::Workflow {
        name: format!("mcp-workflow-{}", tool_name),
        tasks: vec![task],
        trust: Some(multiplicity_alp::policy::TrustLevel::Internal),
    };

    match core.run_workflow(workflow).await {
        Ok(witness) => {
            let mut result = serde_json::Value::Null;
            if let Some(tasks) = witness.execution_receipt["tasks"].as_array() {
                if let Some(first_task) = tasks.first() {
                    if let Some(stdout) = first_task["stdout"].as_str() {
                        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(stdout) {
                            result = parsed;
                        } else {
                            result = serde_json::json!({ "output": stdout });
                        }
                    }
                }
            }
            
            Json(ToolResponse {
                ok: true,
                tool_name,
                proposal_id: req.proposal_id,
                commit_sha: Some(core.ledger.head_sha()),
                result,
                violation: None,
            })
        }
        Err(e) => {
            let err_str = e.to_string();
            let violation = if err_str.contains("blocked by policy") {
                Some(err_str)
            } else {
                Some(format!("Execution failed: {}", err_str))
            };
            
            Json(ToolResponse {
                ok: false,
                tool_name,
                proposal_id: req.proposal_id,
                commit_sha: Some(core.ledger.head_sha()),
                result: serde_json::Value::Null,
                violation,
            })
        }
    }
}
