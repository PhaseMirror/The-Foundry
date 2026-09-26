const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// PhaseMirror Coder Agent Configuration
const pirtmPath = path.resolve(__dirname, '../../PIRTM/rust/target/debug/pirtm-mcp');
const mcpConfigPath = path.resolve(__dirname, '.opencode/mcp.json');
const agentPromptPath = path.resolve(__dirname, '.opencode/phasemirror_coder.md');

// Ensure directories exist
fs.mkdirSync(path.dirname(mcpConfigPath), { recursive: true });

// Write MCP configuration
const mcpConfig = {
  mcpServers: {
    "pirtm-mcp": {
      "command": pirtmPath,
      "args": []
    }
  }
};
fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));

// Write System Prompt
const systemPrompt = `You are phasemirror_coder, an expert formal methods coding assistant specializing in PhaseMirror and PIRTM/MOC.
You are equipped with the PIRTM MCP server. Use it to compile Lean 4 kernels, verify architectural governance, and resolve dissonance.
Always enforce the L0 Scope Invariant and prioritize verified receipts over float summation.`;
fs.writeFileSync(agentPromptPath, systemPrompt);

console.log("Starting PhaseMirror Coder via OpenCode CLI...");
console.log("MCP Server attached:", pirtmPath);

// Spawn OpenCode CLI with the custom agent configuration
// OpenCode allows specifying an MCP config and a system prompt. We will run it interactively.
const opencodeProcess = spawn('opencode', [
  '--mcp-config', mcpConfigPath,
  '--system-prompt', agentPromptPath
], { stdio: 'inherit' });

opencodeProcess.on('close', (code) => {
  console.log(`PhaseMirror Coder session ended with code ${code}`);
});
