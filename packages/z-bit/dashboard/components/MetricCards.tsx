'use client';

import React from 'react';
import {
  Zap,
  ShieldCheck,
  Cpu,
  Flame,
  Binary,
  TrendingUp,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { TelemetrySnapshot } from '@/lib/types';

interface MetricCardsProps {
  snapshot: TelemetrySnapshot;
}

export function MetricCards({ snapshot }: MetricCardsProps) {
  const isThrottled = snapshot.thermal.isThrottled;
  const isProofGood = snapshot.pilot.leanProofStatus === 'PROVED_LEAN4';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
      {/* Card 1: Hashrate */}
      <div className="rounded-lg bg-[#121212] border border-zinc-800 p-3 relative overflow-hidden group hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1.5">
          <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-zinc-300">
            <Zap className="w-3 h-3 text-cyan-400" />
            Effective Hashrate
          </span>
          <span className="px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-cyan-400 font-medium">
            +3.4% vs 15m
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-2xl font-mono font-bold tracking-tight text-zinc-100">
            {snapshot.hashrateThs.toFixed(2)}
          </span>
          <span className="text-xs font-mono text-cyan-400 font-semibold">TH/s</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-800/80">
          <span>Instant: <span className="text-zinc-300">{snapshot.instantHashrateThs.toFixed(1)} TH/s</span></span>
          <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
            <TrendingUp className="w-2.5 h-2.5" /> Nominal
          </span>
        </div>
      </div>

      {/* Card 2: PilotGate & Lean 4 Verification */}
      <div className="rounded-lg bg-[#121212] border border-zinc-800 p-3 relative overflow-hidden group hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1.5">
          <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-zinc-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            PilotGate Formal Gate
          </span>
          <span className={`px-1 py-0.2 rounded border text-[10px] font-medium ${
            isProofGood
              ? 'bg-zinc-900 border-zinc-800 text-emerald-400'
              : 'bg-amber-950/60 border-amber-800/40 text-amber-300'
          }`}>
            {snapshot.pilot.proofTimeMs}ms FFI
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-2xl font-mono font-bold tracking-tight text-emerald-400">
            {(snapshot.pilot.resonance * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] font-mono text-zinc-500">Resonance</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-800/80">
          <span>Contraction: <span className="text-zinc-300 font-semibold">{snapshot.pilot.contraction.toFixed(4)}</span></span>
          <span className="text-zinc-400 font-mono">
            &lt; 0.050 max
          </span>
        </div>
      </div>

      {/* Card 3: Power & Energy Efficiency */}
      <div className="rounded-lg bg-[#121212] border border-zinc-800 p-3 relative overflow-hidden group hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1.5">
          <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-zinc-300">
            <Cpu className="w-3 h-3 text-indigo-400" />
            Energy Efficiency
          </span>
          <span className="px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-indigo-300 font-medium">
            {snapshot.powerConsumptionWatts} W
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-2xl font-mono font-bold tracking-tight text-zinc-100">
            {snapshot.energyEfficiencyJTh.toFixed(2)}
          </span>
          <span className="text-xs font-mono text-indigo-400 font-semibold">J/TH</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-800/80">
          <span>Vector: <span className="text-zinc-300">{snapshot.routing.vectorWidth}-bit AVX</span></span>
          <span className="text-zinc-400">128 Threads</span>
        </div>
      </div>

      {/* Card 4: Thermal & Dynamic Throttle */}
      <div className={`rounded-lg bg-[#121212] border p-3 relative overflow-hidden transition-all ${
        isThrottled
          ? 'border-rose-600/80 bg-rose-950/20'
          : 'border-zinc-800 hover:border-zinc-700'
      }`}>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1.5">
          <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-zinc-300">
            <Flame className={`w-3 h-3 ${isThrottled ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            Thermal Governor
          </span>
          <span className={`px-1 py-0.2 rounded border text-[10px] font-medium ${
            isThrottled
              ? 'bg-rose-950/80 border-rose-700 text-rose-300 animate-pulse'
              : 'bg-zinc-900 border-zinc-800 text-amber-300'
          }`}>
            Throttle: {(snapshot.thermal.throttleFactor * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className={`text-2xl font-mono font-bold tracking-tight ${
            snapshot.thermal.maxTemp > 75 ? 'text-amber-400' : 'text-zinc-100'
          }`}>
            {snapshot.thermal.maxTemp.toFixed(1)}°C
          </span>
          <span className="text-[11px] font-mono text-zinc-500">Max Sensor</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-800/80">
          <span>Margin: <span className="text-emerald-400 font-medium">+{(snapshot.thermal.criticalTemp - snapshot.thermal.maxTemp).toFixed(1)}°C</span></span>
          <span className="text-zinc-400">Crit: 85°C</span>
        </div>
      </div>

      {/* Card 5: Nonce Matrix & Block Height */}
      <div className="rounded-lg bg-[#121212] border border-zinc-800 p-3 relative overflow-hidden group hover:border-zinc-700 transition-all sm:col-span-2 lg:col-span-4 xl:col-span-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1.5">
          <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-zinc-300">
            <Binary className="w-3 h-3 text-violet-400" />
            Block #{snapshot.network.blockHeight}
          </span>
          <span className="px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-violet-300 font-medium">
            {snapshot.blocksSolved} Solved
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-2xl font-mono font-bold tracking-tight text-zinc-100">
            {snapshot.candidatesFound}
          </span>
          <span className="text-[11px] font-mono text-violet-400 font-medium">Candidates</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-800/80">
          <span>Nonces: <span className="text-zinc-300">{(snapshot.totalNoncesExamined / 1e6).toFixed(2)}M</span></span>
          <span className="text-zinc-400 font-mono">Diff {snapshot.network.networkDifficultyT.toFixed(1)}T</span>
        </div>
      </div>
    </div>
  );
}
