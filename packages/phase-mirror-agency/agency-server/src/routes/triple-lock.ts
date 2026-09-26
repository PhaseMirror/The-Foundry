import { Router, Request, Response } from 'express';
import { runBinary } from '../lib/binary-proxy';

export const tripleLockRouter = Router();

tripleLockRouter.post('/v1/agency/coding-commander/completions', async (req: Request, res: Response) => {
  const { mission, partition } = req.body;

  const missionPayload = typeof mission === 'string' ? mission : mission?.payload || 'No payload provided';
  const missionType = typeof mission === 'string'
    ? partition === 'governance' ? 'GovernanceVerification' : 'CodeGeneration'
    : mission?.type || 'CodeGeneration';

  const missionObject = {
    id: `node-pm-${Date.now()}`,
    mission_type: missionType,
    payload: missionPayload,
    created_at: new Date().toISOString(),
  };

  try {
    const result = await runBinary('coding-commander', {
      input: JSON.stringify(missionObject),
      timeoutMs: 60_000,
    });

    if (result.error) {
      return res.status(500).json({ error: 'Dispatch failed', details: result.error });
    }

    let rustResponse: any;
    try {
      rustResponse = JSON.parse(result.stdout);
    } catch {
      return res.status(500).json({ error: 'Invalid response from engine', output: result.stdout });
    }

    res.json({
      id: rustResponse.mission_id,
      witness_hash: rustResponse.witness?.final_witness_hash,
      completion: rustResponse.completion,
      governance_status: rustResponse.status,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Dispatch failed' });
  }
});

tripleLockRouter.post('/v1/agency/the-examiner/audit', async (req: Request, res: Response) => {
  const { observed_l_eff } = req.body;
  const args = observed_l_eff !== undefined ? [`${observed_l_eff}`] : [];

  try {
    const result = await runBinary('the-examiner', {
      args,
      timeoutMs: 30_000,
    });

    if (result.error || result.exitCode !== 0) {
      return res.status(400).json({
        status: 'FAILED',
        error: 'Drift limit violated or verification failed',
        output: (result.stdout + result.stderr).trim(),
        exitCode: result.exitCode,
      });
    }

    res.json({
      status: 'PASSED',
      output: (result.stdout + result.stderr).trim(),
      exitCode: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Audit failed' });
  }
});

tripleLockRouter.post('/v1/agency/the-publisher/publish', async (req: Request, res: Response) => {
  const { file_path } = req.body;
  if (!file_path) {
    return res.status(400).json({ error: 'Missing file_path parameter' });
  }

  try {
    const result = await runBinary('the-publisher', {
      args: [file_path],
      timeoutMs: 60_000,
    });

    if (result.error || result.exitCode !== 0) {
      return res.status(500).json({
        status: 'FAILED',
        error: 'Artifact publication failed',
        details: result.stderr || result.stdout,
      });
    }

    const match = result.stdout.match(/Computed LawfulRecursionHash v1\.0:\s+([a-f0-9]+)/i);
    const recursionHash = match ? match[1] : '';

    res.json({
      status: 'PUBLISHED',
      recursion_hash: recursionHash,
      output: result.stdout.trim(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Publication failed' });
  }
});
