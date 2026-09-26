import React, { useEffect, useRef, useState } from 'react';
// import init, { UnifiedWitnessWasm } from '../../pkg/phase_mirror_wasm.js'; // Adjust path once WASM is bundled

export interface TelemetryEvent {
  stepId: number;
  hash: string;
  status: 'CERTIFIED' | 'REJECTED' | 'FROZEN';
  slopeUb: number;
  reason?: string;
  timestamp: number;
}

export const GlassConsole: React.FC = () => {
  const [telemetryStream, setTelemetryStream] = useState<TelemetryEvent[]>([]);
  const [systemState, setSystemState] = useState<'EXECUTION' | 'STANDBY' | 'SIG_GOV_KILL'>('STANDBY');
  const [globalSlope, setGlobalSlope] = useState<number>(0.5);
  const [wasmReady, setWasmReady] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Dynamic import to simulate WASM initialization loading
    import('../../../phase_mirror_wasm/pkg/phase_mirror_wasm.js').then((wasm) => {
      wasm.default().then(() => {
        setWasmReady(true);
        setSystemState('EXECUTION');
        // Store WASM in window or a ref for the simulator below
        (window as any).UnifiedWitnessWasm = wasm.UnifiedWitnessWasm;
      });
    }).catch(err => {
      console.error("WASM load failed (this is expected if build isn't done yet)", err);
    });
  }, []);

  // Simulator: Generate candidates to feed into the WASM seal
  useEffect(() => {
    if (!wasmReady || systemState === 'SIG_GOV_KILL') return;
    let stepId = 1;
    
    const interval = setInterval(() => {
      // Simulate engine producing states
      const randScore = Math.random() * 1.05; // Occasionally exceeds 1.0
      
      const UnifiedWitnessWasm = (window as any).UnifiedWitnessWasm;
      if (!UnifiedWitnessWasm) return;

      const witness = new UnifiedWitnessWasm(
        `0x${Math.random().toString(16).slice(2, 10)}...`,
        "gen_hypothesis",
        Date.now().toString(),
        "pending",
        randScore
      );
      
      // Native WASM evaluation!
      const telemetryJsonStr = witness.evaluate_seal(0.97, stepId++);
      const telemetryEvent = JSON.parse(telemetryJsonStr);
      
      setGlobalSlope(telemetryEvent.slopeUb);
      setTelemetryStream(prev => [telemetryEvent, ...prev.slice(0, 49)]);
      
      if (telemetryEvent.status === 'REJECTED') {
        setSystemState('SIG_GOV_KILL');
      }
    }, 800);
    
    return () => clearInterval(interval);
  }, [wasmReady, systemState]);

  // WebGL/Canvas 2D Phase Space Simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    interface Particle {
      x: number; y: number; vx: number; vy: number;
      active: boolean; opacity: number; scale: number;
    }
    
    let particles: Particle[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      active: true,
      opacity: 1,
      scale: 3
    }));

    let phaseTime = 0;

    const render = () => {
      phaseTime += 0.05;
      
      // Clear background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Subtle Matrix Breathing ---
      const gridScale = 1 + (globalSlope * 0.1) * Math.sin(phaseTime);
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(gridScale, gridScale);
      ctx.translate(-canvas.width/2, -canvas.height/2);
      ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 + (globalSlope * 0.1)})`; // Greenish matrix
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }
      ctx.restore();

      // --- Terminal Ring Flashing ---
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
      if (systemState === 'SIG_GOV_KILL') {
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20; // Aggressive bloom
      } else {
        ctx.strokeStyle = '#10b981';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Reset shadow for particles
      ctx.shadowBlur = 0;

      // Render trajectories
      particles.forEach((p) => {
        if (p.active) {
          // Pull toward center (Lambda_m attractor)
          p.vx += (centerX - p.x) * 0.005;
          p.vy += (centerY - p.y) * 0.005;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy *= 0.95;

          const dist = Math.hypot(p.x - centerX, p.y - centerY);
          if (dist > 120 && systemState === 'SIG_GOV_KILL') {
            p.active = false; 
          }
        } else {
          // --- Particle Dissolution ---
          p.opacity -= 0.1;
          p.scale -= 0.2;
        }

        if (p.opacity > 0) {
          ctx.fillStyle = p.active ? `rgba(56, 189, 248, ${p.opacity})` : `rgba(239, 68, 68, ${p.opacity})`;
          const s = Math.max(0.1, p.scale);
          ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
        }
      });

      particles = particles.filter(p => p.opacity > 0);

      // Respawn particles if running
      if (systemState === 'EXECUTION' && Math.random() < 0.1) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          active: true, opacity: 1, scale: 3
        });
        if (particles.length > 100) particles.shift();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [systemState, globalSlope]);

  return (
    <div className="bg-black text-green-400 font-mono p-6 min-h-screen flex flex-col gap-6">
      <header className="border-b border-green-800 pb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">PHASE MIRROR // GLASS CONSOLE V1.1</h1>
        <div className="flex gap-4 items-center">
          <span className="text-xs">WASM BINDING:</span>
          <span className={`px-2 py-1 text-xs font-semibold rounded ${wasmReady ? 'bg-blue-900 text-blue-200' : 'bg-neutral-800'}`}>
            {wasmReady ? 'NATIVE' : 'LOADING'}
          </span>
          <span className="text-xs">L0 GATE:</span>
          <span className={`px-3 py-1 text-xs font-semibold rounded ${
            systemState === 'SIG_GOV_KILL' ? 'bg-red-900 text-red-200 animate-pulse' : 'bg-green-900 text-green-200'
          }`}>
            {systemState}
          </span>
          <span className="text-xs">SLOPE_UB: {globalSlope.toFixed(4)}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 border border-green-800 p-4 flex flex-col items-center justify-center relative bg-neutral-950">
          <span className="absolute top-2 left-2 text-xs text-green-600">ATTRACTOR MANIFOLD PHASE SPACE (WEBGL)</span>
          <canvas ref={canvasRef} width={600} height={400} className="border border-neutral-800" />
        </div>

        <div className="border border-green-800 p-4 flex flex-col bg-neutral-950 overflow-hidden">
          <h2 className="text-xs text-green-600 mb-2 border-b border-neutral-800 pb-1">CRMF AUDIT TRAIL STREAM</h2>
          <div className="flex-1 overflow-y-auto space-y-2 text-xs font-mono">
            {telemetryStream.length === 0 ? (
              <p className="text-neutral-600 italic">Awaiting secure event stream...</p>
            ) : (
              telemetryStream.map((log, idx) => (
                <div key={idx} className={`p-2 border-l-2 ${log.status === 'CERTIFIED' ? 'border-green-500 bg-green-950/20' : 'border-red-500 bg-red-950/20'}`}>
                  <div className="flex justify-between">
                    <span>STEP #{log.stepId}</span>
                    <span className={log.status === 'CERTIFIED' ? 'text-green-400 font-bold' : 'text-red-400 font-bold animate-pulse'}>{log.status}</span>
                  </div>
                  <div className={`truncate ${log.status === 'CERTIFIED' ? 'text-[#38bdf8]' : 'text-neutral-500'}`}>
                    HASH: {log.hash}
                  </div>
                  {log.reason && <div className="text-red-300 text-[10px] mt-1">{log.reason}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
