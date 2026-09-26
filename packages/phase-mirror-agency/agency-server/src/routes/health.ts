import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { config } from '../lib/config';

export const healthRouter = Router();

healthRouter.get('/v1/health', (_req: Request, res: Response) => {
  res.send('PHASE MIRROR AGENCY SERVER (NODE.JS): ONLINE');
});

healthRouter.get('/v1/agency/daemon/status', (_req: Request, res: Response) => {
  res.json({
    state: 'running',
    uptime: process.uptime(),
    version: 'v0.2.0',
    pid: process.pid,
    nodeEnv: config.nodeEnv,
  });
});

healthRouter.get('/v1/agency/daemon/metrics', (_req: Request, res: Response) => {
  res.json({
    totalVerifications: 0,
    verifiedCount: 0,
    killCount: 0,
    activeAgents: 0,
    avgResponseTime: 42,
    memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    cpuUsage: 12.5,
  });
});
