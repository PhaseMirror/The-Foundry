# syntax=docker/dockerfile:1

# ---- Builder stage ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
# Build the TypeScript sources (assumes a "build" script that outputs to /app/dist)
RUN npm run build

# ---- Runtime stage ----
FROM gcr.io/distroless/static AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
# Entrypoint – the compiled server entry point (adjust if different)
CMD ["./dist/server.js"]
