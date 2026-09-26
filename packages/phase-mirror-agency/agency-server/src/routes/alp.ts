import { Router, Request, Response } from 'express';
import { runBinary } from '../lib/binary-proxy';

export const alpRouter = Router();

alpRouter.post('/v1/alp/evaluate', async (req: Request, res: Response) => {
  const { id, payload, mutating, server_binding, trust_level } = req.body;

  const input = {
    id: id || 'agency-action',
    payload: payload ?? {},
    mutating: mutating ?? true,
    server_binding: server_binding || null,
  };

  try {
    const result = await runBinary('alp-cli', {
      input: JSON.stringify(input),
      timeoutMs: 5_000,
    });

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(result.stdout.trim());
    } catch {
      parsed = { risk: 'unknown', raw: result.stdout.trim() };
    }

    res.json({
      ...parsed,
      action_id: id,
      evaluated_by: 'alp-rs',
      tier: 'L0',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'ALP evaluation failed' });
  }
});
