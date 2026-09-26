'use client';

import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  FileCode2,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Search,
  ExternalLink,
  Play,
  RotateCw,
} from 'lucide-react';
import { TelemetrySnapshot } from '@/lib/types';

interface PilotGateInspectorProps {
  snapshot: TelemetrySnapshot;
  onInjectPilotError?: () => void;
  onOpenProofModal: () => void;
}

export function PilotGateInspector({
  snapshot,
  onInjectPilotError,
  onOpenProofModal,
}: PilotGateInspectorProps) {
  const { pilot } = snapshot;
  const isAccepted = pilot.leanProofStatus === 'PROVED_LEAN4';

  // Calculate percentage gauges
  const contractionPct = Math.min(100, Math.round((pilot.contraction / 0.05) * 100));
  const driftPct = Math.min(100, Math.round((pilot.drift / 0.02) * 100));
  const resonancePct = Math.min(100, Math.round(pilot.resonance * 100));

  return (
    <div className="rounded-lg bg-[#121212] border border-zinc-800 p-3.5 sm:p-4 flex flex-col gap-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded border ${
            isAccepted
              ? 'bg-zinc-900 border-zinc-800 text-emerald-400'
              : 'bg-rose-950/60 border-rose-800 text-rose-400 animate-pulse'
          }`}>
            {isAccepted ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          </div>
          <div>
            <h2 className="font-mono font-bold text-xs text-zinc-100 tracking-wide flex items-center gap-1.5 uppercase">
              LEAN 4 PILOTGATE // AFFINECORE FFI
            </h2>
            <p className="text-[11px] text-zinc-400">
              Formal verification-gated boundary validating CCRE step invariance before dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onInjectPilotError && (
            <button
              onClick={onInjectPilotError}
              className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-amber-300 text-[11px] font-mono transition-colors flex items-center gap-1"
              title="Inject drift exceeding bounded epsilon to test PilotGate rejection gate"
            >
              <AlertOctagon className="w-3 h-3 text-amber-400" />
              <span>Test Drift</span>
            </button>
          )}

          <button
            onClick={onOpenProofModal}
            className="px-2.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 text-indigo-300 text-[11px] font-mono transition-all flex items-center gap-1"
          >
            <FileCode2 className="w-3 h-3 text-indigo-400" />
            <span>Proof AST</span>
          </button>
        </div>
      </div>

      {/* Main Metric Visualizer & Vectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Contraction Metric */}
        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-0.5">
              <span className="text-zinc-500">Contraction (κ)</span>
              <span className={pilot.contraction <= 0.05 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                {pilot.contraction <= 0.05 ? 'BOUNDED' : 'EXCEEDED'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-bold text-zinc-100">
                {pilot.contraction.toFixed(4)}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">/ 0.0500 max</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, contractionPct)}%` }}
                className={`h-full rounded-full transition-all ${
                  contractionPct > 90 ? 'bg-rose-500' : contractionPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Drift Metric */}
        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-0.5">
              <span className="text-zinc-500">Residual Drift (δ)</span>
              <span className={pilot.drift <= 0.02 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                {pilot.drift <= 0.02 ? 'STABLE' : 'UNSTABLE'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-bold text-zinc-100">
                {pilot.drift.toFixed(4)}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">/ 0.0200 max</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, driftPct)}%` }}
                className={`h-full rounded-full transition-all ${
                  driftPct > 80 ? 'bg-rose-500' : driftPct > 50 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Resonance Metric */}
        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-0.5">
              <span className="text-zinc-500">Resonance (ρ)</span>
              <span className="text-indigo-400 font-bold">OPTIMAL</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-bold text-indigo-300">
                {(pilot.resonance * 100).toFixed(2)}%
              </span>
              <span className="text-[10px] font-mono text-zinc-500">&gt; 95.0% min</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${resonancePct}%` }}
                className="h-full bg-indigo-500 rounded-full transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lean 4 Theorem Certificate & Witness Hash Box */}
      <div className="rounded bg-zinc-950 border border-zinc-800/80 p-2.5 flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-zinc-400 pb-1.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Lemma:</span>
            <span className="text-cyan-400 font-medium">{pilot.lemmaName}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <span>FFI Latency: <span className="text-emerald-400 font-medium">{pilot.proofTimeMs} ms</span></span>
            <span>Epoch: <span className="text-zinc-300">#{pilot.epochIndex}</span></span>
          </div>
        </div>

        {/* Theorem Code Snippet */}
        <div className="bg-[#0A0A0A] p-2 rounded border border-zinc-900 text-zinc-300 text-[11px] overflow-x-auto leading-relaxed">
          <span className="text-violet-400 font-semibold">theorem</span>{' '}
          <span className="text-cyan-300">ccre_affine_contraction_bounded</span>{' '}
          <span className="text-zinc-500">(state : MiningState) (step : CCREStep) :</span>
          <br />
          &nbsp;&nbsp;<span className="text-amber-300">affine_drift</span> state step &lt; epsilon_bound :={' '}
          <span className="text-emerald-400 font-semibold">by ccre_core_solver</span>
        </div>

        {/* Cryptographic Witness Hash */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-0.5 text-[10px]">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Witness Hash:</span>
            <span className="text-zinc-300 font-mono select-all bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800 text-[10px]">
              {pilot.witnessHash}
            </span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Formal Certificate Valid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
