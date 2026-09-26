import { Router, Request, Response } from 'express';

export const dissonanceRouter = Router();

dissonanceRouter.get('/v1/agency/dissonance/graph', (_req: Request, res: Response) => {
  const nodes = [
    { id: 'sedona-spine', x: 400, y: 100, label: 'Sedona Spine (Rust)', type: 'primary' },
    { id: 'phase-mirror-engine', x: 400, y: 250, label: 'Phase Mirror Engine', type: 'primary' },
    { id: 'mcp-daemon', x: 200, y: 250, label: 'MCP Daemon', type: 'secondary' },
    { id: 'coding-commander', x: 600, y: 350, label: 'Coding Commander', type: 'agent' },
    { id: 'ataraxia', x: 200, y: 400, label: 'Ataraxia', type: 'agent' },
    { id: 'finton', x: 400, y: 400, label: 'Finton', type: 'agent' },
    { id: 'the-guardian', x: 100, y: 250, label: 'The Guardian', type: 'agent' },
    { id: 'the-examiner', x: 700, y: 250, label: 'The Examiner', type: 'agent' },
    { id: 'the-publisher', x: 500, y: 150, label: 'The Publisher', type: 'agent' },
  ];

  const edges = [
    { from: 'sedona-spine', to: 'phase-mirror-engine' },
    { from: 'phase-mirror-engine', to: 'mcp-daemon' },
    { from: 'phase-mirror-engine', to: 'coding-commander' },
    { from: 'mcp-daemon', to: 'ataraxia', dashed: true },
    { from: 'coding-commander', to: 'finton', dashed: true },
    { from: 'phase-mirror-engine', to: 'the-guardian' },
    { from: 'phase-mirror-engine', to: 'the-examiner', dashed: true },
    { from: 'phase-mirror-engine', to: 'the-publisher', dashed: true },
  ];

  res.json({ nodes, edges, meta: { source: 'phase-mirror-dissonance', version: '0.1.0' } });
});
