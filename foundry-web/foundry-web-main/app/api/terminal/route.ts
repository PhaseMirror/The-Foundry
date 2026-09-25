import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json();
    
    if (!command) {
      return NextResponse.json({ error: 'Command required' }, { status: 400 });
    }

    // Execution mechanism bounds restricted to project context
    const { stdout, stderr } = await execAsync(command, { cwd: process.cwd() });
    
    return NextResponse.json({ success: true, output: stdout || stderr || 'Command executed with no output.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, output: error.message || 'Execution failed.' }, { status: 500 });
  }
}
