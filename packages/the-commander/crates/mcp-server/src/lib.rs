use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

/// Spectral context for MCP tool calls
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpectralContext {
    pub tier: usize,
}

impl SpectralContext {
    pub fn epsilon(&self) -> f64 {
        match self.tier {
            1 => 0.10,
            2 => 0.05,
            3 => 0.02,
            4 => 0.01,
            _ => 0.05,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpRequest {
    pub jsonrpc: String,
    pub id: Value,
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpResponse {
    pub jsonrpc: String,
    pub id: Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<McpError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpError {
    pub code: i32,
    pub message: String,
}

/// Governance result for spectral-aware tools
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GovernedToolResult {
    pub ok: bool,
    pub result: Value,
    pub spectral_radius: f64,
    pub escalation_required: bool,
    pub escalation_reason: Option<String>,
    pub witness_hash: Option<String>,
}

pub trait McpTool: Send + Sync {
    fn name(&self) -> String;
    fn description(&self) -> String;
    fn call(&self, params: Value, spectral_context: &SpectralContext) -> Result<Value, String>;
}

pub struct McpServer {
    pub tools: HashMap<String, Box<dyn McpTool>>,
    pub tier: usize,
}

impl McpServer {
    pub fn new(tier: usize) -> Self {
        McpServer { 
            tools: HashMap::new(),
            tier,
        }
    }

    pub fn register_tool(&mut self, tool: Box<dyn McpTool>) {
        self.tools.insert(tool.name(), tool);
    }

    pub fn handle_request(&self, req: McpRequest) -> McpResponse {
        let spectral_context = self.extract_spectral_context(&req);
        
        let result = match req.method.as_str() {
            "initialize" => Ok(serde_json::json!({
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "spectralGovernance": true
                }
            })),
            "tools/list" => Ok(serde_json::json!({
                "tools": self.tools.values().map(|t| serde_json::json!({
                    "name": t.name(),
                    "description": t.description(),
                })).collect::<Vec<_>>()
            })),
            "tools/call" => {
                let params = req.params.unwrap_or(serde_json::json!({}));
                let name = params["name"].as_str().unwrap_or("");
                if let Some(tool) = self.tools.get(name) {
                    tool.call(params["arguments"].clone(), &spectral_context)
                        .map(|v| v)
                } else {
                    Err("Tool not found".to_string())
                }
            }
            _ => Err("Method not found".to_string()),
        };

        match result {
            Ok(res) => McpResponse {
                jsonrpc: "2.0".to_string(),
                id: req.id,
                result: Some(res),
                error: None,
            },
            Err(e) => McpResponse {
                jsonrpc: "2.0".to_string(),
                id: req.id,
                result: None,
                error: Some(McpError { code: -32000, message: e }),
            },
        }
    }
    
    fn extract_spectral_context(&self, req: &McpRequest) -> SpectralContext {
        let mut ctx = SpectralContext::default();
        ctx.tier = self.tier;
        
        if let Some(params) = &req.params {
            if let Some(spectral) = params.get("spectralContext") {
                if let Ok(parsed) = serde_json::from_value::<SpectralContext>(spectral.clone()) {
                    ctx = parsed;
                }
            }
        }
        ctx
    }
}