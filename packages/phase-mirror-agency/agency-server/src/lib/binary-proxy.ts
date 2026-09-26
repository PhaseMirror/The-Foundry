import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { config } from '../lib/config';

export interface BinaryResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  error?: string;
}

export interface BinaryProxyOptions {
  args?: string[];
  cwd?: string;
  env?: Record<string, string | undefined>;
  timeoutMs?: number;
  input?: string;
}

const ALLOWED_BINARIES: Set<string> = new Set(config.binaries.allowed);

export function isBinaryAllowed(binaryName: string): boolean {
  if (ALLOWED_BINARIES.size === 0) {
    return true;
  }
  return ALLOWED_BINARIES.has(binaryName);
}

export function resolveBinaryPath(relativePath: string): string {
  const absolute = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(config.binaries.allowedDir, relativePath);

  if (!fs.existsSync(absolute)) {
    throw new Error(`Binary not found: ${absolute}`);
  }

  if (!fs.statSync(absolute).isFile()) {
    throw new Error(`Binary path is not a file: ${absolute}`);
  }

  return absolute;
}

export async function runBinary(
  binaryName: string,
  options: BinaryProxyOptions = {}
): Promise<BinaryResult> {
  if (!isBinaryAllowed(binaryName)) {
    return {
      stdout: '',
      stderr: '',
      exitCode: null,
      error: `Binary '${binaryName}' is not in the allow-list.`,
    };
  }

  const binaryPath = resolveBinaryPath(binaryName);
  const timeoutMs = options.timeoutMs ?? 30_000;

  return new Promise<BinaryResult>((resolve) => {
    const child = spawn(binaryPath, options.args ?? [], {
      cwd: options.cwd ?? process.cwd(),
      env: {
        ...process.env,
        ...options.env,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill('SIGTERM');
        resolve({
          stdout,
          stderr,
          exitCode: null,
          error: `Binary '${binaryName}' timed out after ${timeoutMs}ms.`,
        });
      }
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    if (options.input) {
      child.stdin.write(options.input);
      child.stdin.end();
    }

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 0,
      });
    });

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: null,
        error: err.message,
      });
    });
  });
}
