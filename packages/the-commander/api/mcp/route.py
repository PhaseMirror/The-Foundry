"""Vercel-compatible MCP route."""

from __future__ import annotations
import importlib
import logging
import os
import yaml
from pathlib import Path
from typing import Any
from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel

# Initialize logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
ROOT = Path(__file__).resolve().parents[2]
REGISTRY_PATH = ROOT / "mcp_server" / "tool_registry.yaml"

# Load Registry
with open(REGISTRY_PATH, "r") as f:
    REGISTRY = yaml.safe_load(f)

# Models
class ToolInvocation(BaseModel):
    tool_name: str
    arguments: dict[str, Any]

app = FastAPI()

@app.get("/tools")
async def list_tools():
    """List available tools."""
    return {"tools": REGISTRY.get("tools", [])}

@app.post("/call/{tool_name}")
async def call_tool(tool_name: str, req: dict[str, Any]):
    """Execute a tool call."""
    tools = REGISTRY.get("tools", [])
    tool_entry = next((t for t in tools if t["name"] == tool_name), None)
    
    if not tool_entry:
        raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found.")
        
    module_path = tool_entry["module"]
    callable_name = tool_entry["callable"]
    
    try:
        module = importlib.import_module(module_path)
        handler = getattr(module, callable_name)
        
        # Execute tool
        args = req.get("args", {})
        result = handler(**args)
        
        return {"result": result}
    except Exception as e:
        logger.exception(f"Error executing tool {tool_name}")
        raise HTTPException(status_code=500, detail=str(e))
