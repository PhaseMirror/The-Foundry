use std::process::Stdio;
use tokio::process::{Command, Child};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use serde_json::{json, Value};
use anyhow::{Result, anyhow, Context};
use std::sync::atomic::{AtomicU64, Ordering};

pub struct McpClient {
    child: Child,
    next_id: AtomicU64,
}

use std::collections::HashMap;

impl McpClient {
    pub async fn spawn(cmd: &str, args: &[&str], envs: &HashMap<String, String>) -> Result<Self> {
        let mut command = Command::new(cmd);
        command.args(args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .envs(envs)
            .kill_on_drop(true);
            
        let child = command.spawn()
            .context("failed to spawn MCP server")?;
            
        let mut client = Self {
            child,
            next_id: AtomicU64::new(1),
        };
        
        client.initialize().await?;
        Ok(client)
    }
    
    async fn send_request(&mut self, method: &str, params: Value) -> Result<Value> {
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let request = json!({
            "jsonrpc": "2.0",
            "id": id,
            "method": method,
            "params": params
        });
        
        let stdin = self.child.stdin.as_mut().ok_or_else(|| anyhow!("stdin not available"))?;
        let request_str = serde_json::to_string(&request)? + "\n";
        stdin.write_all(request_str.as_bytes()).await?;
        stdin.flush().await?;
        
        let stdout = self.child.stdout.as_mut().ok_or_else(|| anyhow!("stdout not available"))?;
        let mut reader = BufReader::new(stdout);
        let mut response_line = String::new();
        reader.read_line(&mut response_line).await?;
        
        if response_line.trim().is_empty() {
            return Err(anyhow!("MCP Server returned empty response"));
        }
        
        let response: Value = serde_json::from_str(&response_line)
            .with_context(|| format!("Failed to parse response: {}", response_line))?;
            
        if let Some(err) = response.get("error") {
            return Err(anyhow!("MCP Server error: {}", err));
        }
        
        Ok(response.get("result").cloned().unwrap_or(Value::Null))
    }
    
    async fn send_notification(&mut self, method: &str, params: Value) -> Result<()> {
        let request = json!({
            "jsonrpc": "2.0",
            "method": method,
            "params": params
        });
        let stdin = self.child.stdin.as_mut().ok_or_else(|| anyhow!("stdin not available"))?;
        let request_str = serde_json::to_string(&request)? + "\n";
        stdin.write_all(request_str.as_bytes()).await?;
        stdin.flush().await?;
        Ok(())
    }
    
    async fn initialize(&mut self) -> Result<()> {
        let params = json!({
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "pscmd-client",
                "version": "0.1.0"
            }
        });
        self.send_request("initialize", params).await?;
        self.send_notification("notifications/initialized", json!({})).await?;
        Ok(())
    }
    
    pub async fn list_tools(&mut self) -> Result<Value> {
        self.send_request("tools/list", json!({})).await
    }
    
    pub async fn call_tool(&mut self, name: &str, arguments: Value) -> Result<Value> {
        let params = json!({
            "name": name,
            "arguments": arguments
        });
        self.send_request("tools/call", params).await
    }
}
