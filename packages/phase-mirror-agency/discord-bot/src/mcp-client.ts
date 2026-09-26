// Thin HTTP wrapper over mcp_server/http_transport.py
// ADR: docs/adrs/ADR-discord-bot-surface.md — bot is read-only HTTP client only.
// CI gate: this file must never import from governance/, kernel/, or daemon/.

const MCP_BASE_URL = process.env.MCP_BASE_URL ?? 'http://localhost:8000';
const MCP_BOT_TOKEN = process.env.MCP_BOT_TOKEN ?? '';

export async function callTool(
  toolName: string,
  args: Record<string, unknown> = {},
): Promise<unknown> {
  const res = await fetch(`${MCP_BASE_URL}/tools/${toolName}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MCP_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    throw new Error(`MCP error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// LawfulRecursionVersion:1.0
