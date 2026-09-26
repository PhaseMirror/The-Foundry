import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TELEMETRY_PATH = process.env.TELEMETRY_PATH || '/tmp/prism-btc-telemetry/latest.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fs.readFile(TELEMETRY_PATH, 'utf-8');
    const snapshot = JSON.parse(data);
    
    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'telemetry_unavailable',
        timestamp: Date.now(),
        message: 'Miner telemetry snapshot not found. Ensure prism-btc-miner is running with --features telemetry.',
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
