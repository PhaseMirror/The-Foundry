import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { config } from '../lib/config';

export const archivumRouter = Router();

const LEDGER_PATH = config.archivum.walPath;

archivumRouter.get('/v1/agency/archivum/ledger', (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(LEDGER_PATH)) {
      return res.json([]);
    }
    const data = fs.readFileSync(LEDGER_PATH, 'utf8');
    const entries = data
      .trim()
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read Archivum ledger' });
  }
});

archivumRouter.post('/v1/agency/archivum/register', (req: Request, res: Response) => {
  const newEntry = {
    id: `Qm${Math.random().toString(36).substring(2, 15)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    type: 'Site.Registration',
    metadata: req.body,
    drift: Math.random() * 0.2,
    status: 'Archived',
  };

  try {
    fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true });
    fs.appendFileSync(LEDGER_PATH, JSON.stringify(newEntry) + '\n');
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});
