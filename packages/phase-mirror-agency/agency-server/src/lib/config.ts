import * as yaml from 'yaml';

export interface ServerConfig {
  port: number;
  jwtSecret: string;
  nodeEnv: 'development' | 'production' | 'test';
  archivum: {
    walPath: string;
  };
  binaries: {
    allowedDir: string;
    allowed: string[];
  };
  mcp: {
    pmBinaryPath: string;
    wsPort: number;
  };
  qcalculator: {
    wasmPath: string;
    restUrl: string;
  };
  cors: {
    origins: string[];
  };
}

export function loadConfig(): ServerConfig {
  const nodeEnv = (process.env.NODE_ENV as ServerConfig['nodeEnv']) || 'development';
  const configPath = process.env.AGENCY_CONFIG || resolveConfigPath(nodeEnv);

  let fileConfig: Partial<ServerConfig> = {};
  if (configPath && require('fs').existsSync(configPath)) {
    const fileContent = require('fs').readFileSync(configPath, 'utf8');
    fileConfig = yaml.parse(fileContent) as Partial<ServerConfig>;
  }

  return {
    port: normalizeNumber(process.env.PORT, fileConfig.port, 8082),
    jwtSecret: process.env.JWT_SECRET || fileConfig.jwtSecret || 'change-me-in-production',
    nodeEnv,
    archivum: {
      walPath: process.env.ARCHIVUM_WAL || fileConfig.archivum?.walPath || resolveLedgerPath(),
    },
    binaries: {
      allowedDir: process.env.BINARIES_DIR || fileConfig.binaries?.allowedDir || resolveBinDir(),
      allowed: fileConfig.binaries?.allowed || [],
    },
    mcp: {
      pmBinaryPath: process.env.PM_BINARY_PATH || fileConfig.mcp?.pmBinaryPath || resolvePmBinary(),
      wsPort: normalizeNumber(process.env.MCP_WS_PORT, fileConfig.mcp?.wsPort, 3002),
    },
    qcalculator: {
      wasmPath: process.env.QCALC_WASM_PATH || fileConfig.qcalculator?.wasmPath || resolveWasmPath(),
      restUrl: process.env.QCALC_REST_URL || fileConfig.qcalculator?.restUrl || 'http://127.0.0.1:7070',
    },
    cors: {
      origins: parseOrigins(process.env.CORS_ORIGINS, fileConfig.cors?.origins),
    },
  };
}

function normalizeNumber(envVal: string | undefined, fileVal: number | undefined, fallback: number): number {
  if (envVal) {
    const parsed = Number(envVal);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (typeof fileVal === 'number') return fileVal;
  return fallback;
}

function parseOrigins(envVal: string | undefined, fileVal: string[] | undefined): string[] {
  if (envVal) return envVal.split(',').map(s => s.trim()).filter(Boolean);
  if (fileVal && Array.isArray(fileVal)) return fileVal;
  return ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];
}

function resolveConfigPath(env: ServerConfig['nodeEnv']): string {
  const root = require('path').join(__dirname, '../../config');
  if (env === 'production') return require('path').join(root, 'default.yaml');
  return require('path').join(root, 'default.yaml');
}

function resolveLedgerPath(): string {
  return require('path').join(__dirname, '../var/archivum/ledger.jsonl');
}

function resolveBinDir(): string {
  return require('path').join(__dirname, '../bin');
}

function resolvePmBinary(): string {
  const fs = require('fs');
  const path = require('path');
  const candidates = [
    process.env.PM_BINARY_PATH,
    '/app/bin/pm',
    path.join(__dirname, '../../../phase-mirror-gpt/bin/phase-mirror-gpt'),
    path.join(__dirname, '../../../Phase Mirror/phase-mirror-gpt/bin/phase-mirror-gpt'),
  ];
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return path.join(__dirname, '../bin/phase-mirror-gpt');
}

function resolveWasmPath(): string {
  return require('path').join(__dirname, '../wasm-pkg');
}

export const config = loadConfig();
