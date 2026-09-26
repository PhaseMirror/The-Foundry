import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../lib/config';
import fs from 'fs';

export const governanceRouter = Router();

interface UserRecord {
  id: number;
  username: string;
  password_hash: string;
  role: string;
}

const USERS_DB_PATH = '/tmp/agency-users.json';

function getUsers(): UserRecord[] {
  if (!fs.existsSync(USERS_DB_PATH)) {
    const defaultUser = {
      id: 1,
      username: 'admin',
      password_hash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
    };
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify([defaultUser], null, 2));
    return [defaultUser];
  }
  return JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
}

governanceRouter.post('/v1/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

const MOCK_ADRS = [
  { id: 'ADR-003', title: 'Recursive Feedback Limits', tags: ['autonomy', 'governance', 'attestation'], status: 'PENDING' },
  { id: 'ADR-004', title: 'Rogue Process Spawning', tags: ['autonomy'], status: 'PENDING' },
];

governanceRouter.get('/v1/agency/adrs', (_req: Request, res: Response) => {
  res.json(MOCK_ADRS);
});

governanceRouter.get('/v1/agency/agents', (_req: Request, res: Response) => {
  res.json([
    { id: 'cc-01', name: 'Coding-Commander', status: 'active', metric: 'Triple-Lock: OK', horizon: 'Global', owner: 'Agency' },
    { id: 'at-01', name: 'Ataraxia', status: 'active', metric: 'L0 Invariant: PASS', horizon: 'Local', owner: 'Daemon' },
    { id: 'ft-01', name: 'Finton', status: 'idle', metric: 'Ledger: Clean', horizon: 'Local', owner: 'Finance' },
    { id: 'tg-01', name: 'The Guardian', status: 'active', metric: 'L1 Gate: PASS', horizon: 'Global', owner: 'Governance' },
    { id: 'te-01', name: 'The Examiner', status: 'idle', metric: 'Witness: Clean', horizon: 'Global', owner: 'Governance' },
    { id: 'tp-01', name: 'The Publisher', status: 'idle', metric: 'Recursion: stubbed', horizon: 'Global', owner: 'Governance' },
  ]);
});
