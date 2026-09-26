import { Router, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { healthRouter } from './routes/health';
import { archivumRouter } from './routes/archivum';
import { tripleLockRouter } from './routes/triple-lock';
import { dissonanceRouter } from './routes/dissonance';
import { governanceRouter } from './routes/governance';
import { wasmRouter } from './routes/wasm';
import { qcalcRouter } from './routes/qcalc';
import { alpRouter } from './routes/alp';
import { config } from '../lib/config';

export const cliRouter = Router();

const ALLOWED_COMMANDS = new Set([
  'phase-mirror',
  'ls',
  'pwd',
  'date',
  'whoami',
  'cargo',
  'npm',
  'cat',
]);

cliRouter.post('/v1/agency/cli/execute', (req: Request, res: Response) => {
  const { command } = req.body;
  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'command is required' });
  }

  const cmdBase = command.trim().split(/\s+/)[0];
  if (!ALLOWED_COMMANDS.has(cmdBase)) {
    return res.status(403).json({ error: `Command '${cmdBase}' not allowed.` });
  }

  const { exec } = require('child_process');
  exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
    res.json({ output: stdout || stderr, exitCode: error ? error.code : 0 });
  });
});

export function createApp() {
  const app = require('express')();

  app.use(cors({ origin: config.cors.origins }));
  app.use(morgan('dev'));
  app.use(bodyParser.json());

  app.use(healthRouter);
  app.use(archivumRouter);
  app.use(cliRouter);
  app.use(tripleLockRouter);
  app.use(dissonanceRouter);
  app.use(governanceRouter);
  app.use(wasmRouter);
  app.use(qcalcRouter);
  app.use(alpRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}
