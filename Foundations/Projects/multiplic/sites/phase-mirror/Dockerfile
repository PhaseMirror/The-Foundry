# syntax=docker/dockerfile:1

## ---------- Builder Stage ----------
FROM node:22-slim AS builder
WORKDIR /app

# Install esbuild dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Copy source
COPY server.ts ./
COPY types.ts ./

# Install dependencies (excluding native LLM binaries)
RUN npm ci --omit=optional

# Build server bundle
RUN npm run build

## ---------- Runtime Stage ----------
FROM gcr.io/distroless/nodejs22-debian12 AS runtime

# Copy built artifacts
COPY --from=builder /app/dist/server.cjs /app/server.cjs
COPY --from=builder /app/dist/assets /app/assets
COPY --from=builder /app/dist/index.html /app/index.html

# Copy phase-mirror-gpt binary from sibling Dockerfile
COPY --from=ghcr.io/multiplicity/phase-mirror-gpt:latest /app/bin/phase-mirror-gpt /app/bin/phase-mirror-gpt

WORKDIR /app

# Environment
ENV NODE_ENV=production
ENV PORT=3001
ENV PM_GPT_BINARY=/app/bin/phase-mirror-gpt
ENV GPT_PROJECT_ROOT=/app

EXPOSE 3001

USER 65532:65532
ENTRYPOINT ["node", "/app/server.cjs"]