import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { config } from '../lib/config';

export const wasmRouter = Router();

const wasmDir = config.qcalculator.wasmPath;

wasmRouter.get('/v1/wasm/qcalc/run', (req: Request, res: Response) => {
  res.json({
    status: 'standby',
    message: 'WASM q-calculator execution is available client-side. Use the PIRTM Workspace view in the UI.',
    wasmPath: wasmDir,
  });
});

wasmRouter.get('/v1/wasm/qcalc/list', (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(wasmDir)) {
      return res.json({ files: [], path: wasmDir });
    }
    const files = fs.readdirSync(wasmDir).filter((f) => f.endsWith('.wasm') || f.endsWith('.js'));
    res.json({ files, path: wasmDir });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list WASM files', path: wasmDir });
  }
});

wasmRouter.get('/v1/wasm/uicore/prime-check', (req: Request, res: Response) => {
  const { n } = req.query;
  const num = typeof n === 'string' ? parseInt(n, 10) : 0;
  res.json({
    n: num,
    is_prime: num > 1 && ([...Array(num - 1).keys()].filter(i => i > 1 && num % i === 0).length === 0),
  });
});
