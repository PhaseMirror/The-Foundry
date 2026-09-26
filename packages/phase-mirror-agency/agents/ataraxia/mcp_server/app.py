"""Python stdio-based MCP server."""

import sys
import json
import importlib
import yaml
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = ROOT / "mcp_server" / "tool_registry.yaml"

# Load server ID from env to prevent token forgery
OWN_SERVER_ID = os.environ.get("MCP_SERVER_ID", "multiplicity-mcp-python")

def main():
    # Import middleware only when needed to allow fail-closed startup check
    try:
        from mcp_server.alp_middleware import verify_sat, AlpRejectionError
    except ImportError:
        # Fallback for direct script execution without proper PYTHONPATH
        if str(ROOT) not in sys.path:
            sys.path.append(str(ROOT))
        from mcp_server.alp_middleware import verify_sat, AlpRejectionError

    with open(REGISTRY_PATH, "r") as f:
        registry = yaml.safe_load(f)
    
    tools = registry.get("tools", [])
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except Exception:
            continue
            
        req_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})
        
        if method == "initialize":
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {}
                    },
                    "serverInfo": {
                        "name": "multiplicity-python-mcp",
                        "version": "0.1.0"
                    }
                }
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()
        elif method == "notifications/initialized":
            pass
        elif method == "tools/list":
            resp_tools = []
            for t in tools:
                resp_tools.append({
                    "name": t["name"],
                    "description": t["description"],
                    "inputSchema": {
                        "type": "object",
                        "properties": {inp: {"type": "string"} for inp in t.get("inputs", [])}
                    }
                })
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "tools": resp_tools
                }
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()
        elif method == "tools/call":
            name = params.get("name")
            arguments = params.get("arguments", {})
            
            # --- SAT Verification (ADR-MCP-003) ---
            # Extract in-band SAT from reserved '_sat' field
            sat_token = arguments.pop("_sat", None)
            
            try:
                if sat_token is None:
                    raise AlpRejectionError("Missing mandatory _sat field in arguments")
                
                verify_sat(sat_token, OWN_SERVER_ID)
                
                tool_entry = next((t for t in tools if t["name"] == name), None)
                if not tool_entry:
                    resp = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "error": {
                            "code": -32601,
                            "message": f"Tool {name} not found"
                        }
                    }
                else:
                    module_path = tool_entry["module"]
                    callable_name = tool_entry["callable"]
                    
                    if str(ROOT) not in sys.path:
                        sys.path.append(str(ROOT))
                    module = importlib.import_module(module_path)
                    handler = getattr(module, callable_name)
                    
                    # Set required environment roots for sub-tools
                    os.environ["PHASE_MIRROR_HQ_ROOT"] = "."
                    os.environ["AGIOS_ROOT"] = "."
                    
                    # Call the tool with parameters
                    result = handler(**arguments)
                    resp = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps(result)
                                }
                            ]
                        }
                    }
            except AlpRejectionError as e:
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32001,  # Custom error code for ALP Rejection
                        "message": f"ALP Rejection: {str(e)}"
                    }
                }
            except Exception as e:
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32603,
                        "message": str(e)
                    }
                }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()
        else:
            if req_id is not None:
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32601,
                        "message": f"Method {method} not found"
                    }
                }
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()

if __name__ == "__main__":
    main()
