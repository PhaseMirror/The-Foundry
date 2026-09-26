# Phase Mirror Production Deployment Guide

## Overview

Phase Mirror is a high-integrity governance gateway for agentic AI workflows. This guide covers deploying the production Rust binaries using Docker.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Phase Mirror Stack                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │   Client     │────▶│  phase-mirror│────▶│  Λ-Archivum │ │
│  │ (Claude/GPT) │     │    -gpt      │     │    WAL      │ │
│  └──────────────┘     └──────────────┘     └─────────────┘ │
│         │                    │                              │
│         │                    │                            │
│         ▼                    ▼                            │
│  ┌──────────────┐     ┌──────────────┐                    │
│  │   Web UI     │────▶│  phase-mirror│                    │
│  │ (React/Vite) │     │    -mcp      │                    │
│  └──────────────┘     │ (WebSocket)  │                    │
│                       └──────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Docker Engine 24+
- Docker Compose v2+
- 4GB RAM minimum (8GB recommended)
- 10GB disk space

## Quick Start

### 1. Clone and Build

```bash
git clone https://github.com/Multiplicity-Foundation/phase-mirror.git
cd phase-mirror

# Build all images
docker compose build
```

### 2. Configure

Copy and edit the configuration files:

```bash
# L1 Semantic Policy (forbidden patterns)
cp config/policy.toml.example config/policy.toml

# MCP Contract (per-tool governance policies)
cp config/mcp-contract.json.example config/mcp-contract.json
```

### 3. Start Services

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check health
curl http://localhost:3000/health
```

### 4. Verify Deployment

```bash
# Check governance status via MCP
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_governance_status","arguments":{}}}' | \
  docker exec -i phase-mirror-gpt /app/bin/phase-mirror-gpt

# Verify ledger integrity
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"verify_ledger","arguments":{"ledger":[],"current_state":{"schema_version":"1.0.0","schema_hash":"f7a8b9c0d1e2f3g4","permission_bits":0,"drift_magnitude":0.0,"nonce":{"value":"a".repeat(64),"issued_at":0},"contraction_witness_score":Some(1.0)}}}}' | \
  docker exec -i phase-mirror-mcp /app/bin/phase-mirror-mcp
```

## Services

### phase-mirror-gpt

Primary governance gateway. Runs as a stdio MCP server.

| Environment Variable | Description | Default |
|:---|:---|:---|
| `PHASE_MIRROR_LOG_LEVEL` | Log level (trace, debug, info, warn, error) | `info` |
| `PHASE_MIRROR_ARCHIVUM_PATH` | Path to Λ-Archivum WAL file | `archivum.log` |

### phase-mirror-mcp

Broader MCP server with governed tool suite. Runs as a WebSocket server.

| Environment Variable | Description | Default |
|:---|:---|:---|
| `PHASE_MIRROR_LOG_LEVEL` | Log level | `info` |
| `PHASE_MIRROR_native ACE certificates and triple lock governance_PATH` | Path to native ACE certificates and triple lock governance audit log | `ace_audit.jsonl` |
| `PHASE_MIRROR_CONTRACT_PATH` | Path to MCP contract JSON | `config/mcp-contract.json` |
| `LMSTUDIO_BASE_URL` | LM Studio API URL (feature-gated) | `http://localhost:1234/v1` |

### phase-mirror-automation

Self-governing automation crate for local development.

| Environment Variable | Description | Default |
|:---|:---|:---|
| `PHASE_MIRROR_AUTO_WATCH` | Enable filesystem watcher | `true` |
| `PHASE_MIRROR_AUTO_PACKAGE` | Package to watch | `phase-mirror-gpt` |

## Health Checks

Both services expose health endpoints:

```bash
# phase-mirror-mcp (HTTP)
curl http://localhost:3000/health

# Response:
# {"status":"healthy","service":"phase-mirror-mcp","version":"1.0.0-alpha","timestamp":"..."}
```

## Graceful Shutdown

```bash
# Send SIGTERM to graceful stop
docker compose stop

# Send SIGKILL for immediate stop
docker compose kill
```

## Data Persistence

| Volume | Purpose |
|:---|:---|
| `archivum-data` | Λ-Archivum WAL and native ACE certificates and triple lock governance logs |
| `cargo-cache` | Cargo registry cache for automation |

## Security

- All binaries run as non-root user `nonroot:nonroot`
- Configuration files are mounted read-only
- L0 invariants enforce schema validation and permission bitmasks
- L1 semantic policy scans for forbidden patterns
- Triple-Lock sequence (Genius → Guardian → Examiner) certifies all actions

## Troubleshooting

### Service fails to start

```bash
# Check logs
docker compose logs phase-mirror-gpt
docker compose logs phase-mirror-mcp

# Verify configuration
docker compose exec phase-mirror-gpt cat /app/config/policy.toml
docker compose exec phase-mirror-mcp cat /app/config/mcp-contract.json
```

### Governance blocks legitimate requests

Check L1 policy patterns in `config/policy.toml`. Adjust forbidden patterns if needed and reload:

```bash
# Policy is hot-reloaded - just edit the file
docker compose exec phase-mirror-gpt sh -c "echo '[semantic_policy]' > /app/config/policy.toml"
```

### Container exits immediately

Verify the binary path and entrypoint:

```bash
docker compose exec phase-mirror-gpt ls -la /app/bin/
docker compose exec phase-mirror-mcp ls -la /app/bin/
```
