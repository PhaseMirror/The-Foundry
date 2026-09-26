FROM node:20-alpine AS builder
WORKDIR /app

COPY agency-server/package*.json ./agency-server/
COPY ui/package*.json ./ui/

RUN cd agency-server && npm ci --production=false
RUN cd ui && npm ci --production=false

COPY agency-server/src ./agency-server/src
COPY agency-server/config ./agency-server/config
COPY agency-server/tsconfig*.json ./agency-server/
COPY ui/src ./ui/src
COPY ui/public ./ui/public
COPY ui/*.config.* ./ui/
COPY ui/tsconfig*.json ./ui/
COPY ui/index.html ./ui/

RUN cd agency-server && npm run build
RUN cd ui && npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/agency-server/dist ./server-dist
COPY --from=builder /app/agency-server/node_modules ./node_modules
COPY --from=builder /app/agency-server/package.json ./server-package.json
COPY --from=builder /app/ui/dist ./ui-dist
COPY --from=builder /app/ui/package.json ./ui-package.json

RUN mkdir -p /app/var/archivum /app/bin /app/config

COPY agency-server/config/default.yaml ./config/
COPY agency-server/meta-start.sh ./meta-start.sh
RUN chmod +x ./meta-start.sh

EXPOSE 8082 5173

ENV NODE_ENV=production
ENV PORT=8082
ENV ARCHIVUM_WAL=/app/var/archivum/ledger.jsonl

CMD ["node", "server-dist/index.js"]
