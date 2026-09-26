import { Router, Request, Response } from 'express';

export const qcalcRouter = Router();

qcalcRouter.get('/v1/qcalc/health', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${process.env.QCALC_REST_URL || 'http://127.0.0.1:7070'}/health`, {
      headers: { Accept: 'application/json' },
    });
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    res.status(503).json({ status: 'unavailable', error: 'Q-Calculator REST service not reachable' });
  }
});

qcalcRouter.post('/v1/qcalc/pirtm/certify_step', async (req: Request, res: Response) => {
  try {
    const upstream = await fetch(`${process.env.QCALC_REST_URL || 'http://127.0.0.1:7070'}/pirtm/certify_step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (error: any) {
    res.status(503).json({ error: error.message || 'Q-Calculator upstream unavailable' });
  }
});

qcalcRouter.post('/v1/qcalc/pirtm/contract', async (req: Request, res: Response) => {
  try {
    const upstream = await fetch(`${process.env.QCALC_REST_URL || 'http://127.0.0.1:7070'}/pirtm/contract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (error: any) {
    res.status(503).json({ error: error.message || 'Q-Calculator upstream unavailable' });
  }
});

qcalcRouter.post('/v1/qcalc/pirtm/multiplicity', async (req: Request, res: Response) => {
  try {
    const upstream = await fetch(`${process.env.QCALC_REST_URL || 'http://127.0.0.1:7070'}/pirtm/multiplicity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (error: any) {
    res.status(503).json({ error: error.message || 'Q-Calculator upstream unavailable' });
  }
});
