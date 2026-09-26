'use client';

import React from 'react';
import {
  Volume2,
  VolumeX,
  FileCode2,
  FileSpreadsheet,
  Activity,
  Cpu,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
} from 'lucide-react';
import { TelemetrySnapshot } from '@/lib/types';
import { soundEngine } from '@/lib/sound';

interface HeaderProps {
  snapshot: TelemetrySnapshot | null;
  onOpenProofModal: () => void;
  onExportAuditLog: () => void;
  pollingRateHz: number;
  onSetPollingRateHz: (hz: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  connectionState: 'connecting' | 'connected' | 'disconnected';
}

export function Header({
  snapshot,
  onOpenProofModal,
  onExportAuditLog,
  pollingRateHz,
  onSetPollingRateHz,
  soundEnabled,
  onToggleSound,
  connectionState,
}: HeaderProps) {
  const isThrottled = snapshot?.thermal.isThrottled ?? false;
  const isProofGood = snapshot?.pilot.leanProofStatus === 'PROVED_LEAN4';

  return (
    <header className="border-b border-zinc-800/90 bg-[#0D0D0D]/95 backdrop-blur sticky top-0 z-40 px-3 sm:px-4 lg:px-6 py-2.5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
        {/* Left: Branding & Core Runtime Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-cyan-400 font-mono font-black text-base shadow-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs tracking-wider text-zinc-100 uppercase">
                  PRISM-BTC
                </span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  v0.4.2-wasm
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                  Lean 4 Gated
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-tight">
                AffineCore CCRE Step Dispatcher &amp; Formal Verification Observability
              </p>
            </div>
          </div>

          {/* Runtime Badges */}
          <div className="hidden md:flex items-center gap-1.5 pl-2.5 border-l border-zinc-800">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono">
              <Radio className={`w-3 h-3 ${connectionState === 'connected' ? 'text-emerald-400' : connectionState === 'connecting' ? 'text-amber-400 animate-pulse' : 'text-rose-400'}`} />
              <span className="text-zinc-500">IPC:</span>
              <span className={`font-semibold ${connectionState === 'connected' ? 'text-zinc-200' : connectionState === 'connecting' ? 'text-amber-400' : 'text-rose-400'}`}>
                {connectionState.toUpperCase()}
              </span>
            </div>

            {snapshot && (
              <>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono">
                  <ShieldCheck className={`w-3 h-3 ${isProofGood ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span className="text-zinc-500">PilotGate:</span>
                  <span className={isProofGood ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {snapshot.pilot.leanProofStatus}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span className="text-zinc-500">Substrates:</span>
                  <span className="text-cyan-300 font-medium">GPU {snapshot.routing.gpuWeight}% / CPU {snapshot.routing.cpuWeight}%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Polling Frequency */}
          <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs font-mono">
            <span className="text-zinc-500 px-1 text-[10px] flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 text-zinc-500" /> Poll:
            </span>
            {[1, 2, 5, 10].map((hz) => (
              <button
                key={hz}
                onClick={() => onSetPollingRateHz(hz)}
                className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                  pollingRateHz === hz
                    ? 'bg-zinc-800 text-cyan-300 border border-zinc-700 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {hz}Hz
              </button>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundEngine.setEnabled(!soundEnabled);
            }}
            title={soundEnabled ? 'Mute Audio Cues' : 'Enable Audio Feedback'}
            className={`p-1.5 rounded border text-xs font-mono transition-all ${
              soundEnabled
                ? 'bg-zinc-800 text-cyan-400 border-zinc-700 hover:bg-zinc-750'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Action: Formal Proof Replayer */}
          <button
            onClick={onOpenProofModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 text-indigo-300 text-[11px] font-mono font-medium transition-colors"
          >
            <FileCode2 className="w-3 h-3 text-indigo-400" />
            <span>Proof Replayer</span>
          </button>

          {/* Action: Export Audit Log */}
          <button
            onClick={onExportAuditLog}
            title="Export WORM audit trail as JSON"
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-emerald-300 text-[11px] font-mono transition-colors"
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Export Logs</span>
          </button>
        </div>
      </div>
    </header>
  );
}
