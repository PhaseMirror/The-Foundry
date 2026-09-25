# Deployment Configuration

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | Set to `production` for prod |
| `PORT` | No | 3001 | HTTP server port |
| `PM_GPT_BINARY` | Yes (prod) | `/home/multiplicity/Multiplicity/Phase Mirror/target/release/phase-mirror-gpt` | Path to Rust governance binary |
| `GPT_PROJECT_ROOT` | No | Package dir | Working directory for archivum |
| `LLM_MOCK` | No | false | Use mock LLM for testing |
| `LLM_HOST` | No | - | Ollama HTTP endpoint |
| `LLM_MODEL` | No | qwen2.5:1.5b | Model for Ollama |

## Production Setup

1. Build the Rust kernel:
```bash
cd packages/phase-mirror-gpt
cargo build --release
```

2. Build the website:
```bash
cd packages/phase-mirror-website
npm ci
npm run build
```

3. Set production environment:
```bash
export NODE_ENV=production
export PM_GPT_BINARY=/path/to/phase-mirror-gpt
npm start
```

## Docker Compose

```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    volumes: ["./ollama:/root/.ollama"]
    command: serve

  phase-mirror-gpt:
    build:
      context: ..
      dockerfile: Dockerfile
    volumes: ["./archivum:/app/archivum"]
    environment:
      - RUST_LOG=info

  phase-mirror-website:
    build:
      context: .
      dockerfile: Dockerfile
    ports: ["3001:3001"]
    depends_on: [phase-mirror-gpt, ollama]
    environment:
      - NODE_ENV=production
      - PM_GPT_BINARY=/app/bin/phase-mirror-gpt
      - LLM_HOST=http://ollama:11434
      - LLM_MODEL=qwen2.5:1.5b
```

## Health Checks

- `/api/health` - Basic liveness probe
- `/api/ready` - Readiness with compliance check
- `/api/metrics` - Prometheus metrics endpoint

## Rate Limiting (Recommended)

Configure at ingress:
- 100 requests/minute per IP
- 1000 requests/minute globally

## TLS/Ingress

Terminate TLS at reverse proxy (nginx/Caddy):
```nginx
server {
  listen 443 ssl;
  ssl_certificate /etc/ssl/certs/fullchain.pem;
  ssl_certificate_key /etc/ssl/private/key.pem;

  location / {
    proxy_pass http://phase-mirror-website:3001;
    proxy_set_header Host $host;
  }
}
```

## Monitoring

Required alerts:
- Compliance rate < 1.0 triggers pager
- Witness hash chain breaks trigger critical alert
- Error rate > 5% triggers warning