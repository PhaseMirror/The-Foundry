'use client';

import React from 'react';
import {
  Cpu,
  Layers,
  HardDrive,
  Activity,
  Sliders,
  Sparkles,
  Gauge,
  MemoryStick,
  Zap,
} from 'lucide-react';
import { TelemetrySnapshot, RoutingDecision } from '@/lib/types';

interface DispatcherSubstratePanelProps {
  snapshot: TelemetrySnapshot;
  onUpdateRouting: (partial: Partial<RoutingDecision>) => void;
}

export function DispatcherSubstratePanel({
  snapshot,
  onUpdateRouting,
}: DispatcherSubstratePanelProps) {
  const { routing, hardware } = snapshot;

  const handleGpuChange = (val: number) => {
    const remaining = 100 - val;
    const cpuWeight = Math.round(remaining * 0.65);
    const ramWeight = 100 - val - cpuWeight;
    onUpdateRouting({
      gpuWeight: val,
      cpuWeight,
      ramWeight,
      mode: 'manual_override',
    });
  };

  return (
    <div className="rounded-lg bg-[#121212] border border-zinc-800 p-3.5 sm:p-4 flex flex-col gap-3.5 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-mono font-bold text-xs text-zinc-100 tracking-wide flex items-center gap-1.5 uppercase">
              SUBSTRATE DISPATCHER &amp; ROUTING
            </h2>
            <p className="text-[11px] text-zinc-400">
              Hardware pipeline allocation across GPU CUDA, CPU AVX-512, and Affine RAM substrates
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded text-xs font-mono">
          <button
            onClick={() => onUpdateRouting({ mode: 'autonomous_ccre' })}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
              routing.mode === 'autonomous_ccre'
                ? 'bg-zinc-800 text-cyan-300 border border-zinc-700 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Autonomous CCRE</span>
          </button>
          <button
            onClick={() => onUpdateRouting({ mode: 'manual_override' })}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
              routing.mode === 'manual_override'
                ? 'bg-zinc-800 text-amber-300 border border-zinc-700 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Manual Override</span>
          </button>
        </div>
      </div>

      {/* Substrate Distribution Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono text-zinc-300 mb-1.5">
          <span className="text-[11px] text-zinc-400">Substrate Allocation Ratio</span>
          <div className="flex gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-xs bg-cyan-400" /> GPU: {routing.gpuWeight}%
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="w-2 h-2 rounded-xs bg-indigo-400" /> CPU: {routing.cpuWeight}%
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-xs bg-emerald-400" /> RAM LUT: {routing.ramWeight}%
            </span>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-2.5 w-full bg-zinc-900 rounded overflow-hidden flex border border-zinc-800 p-0.5">
          <div
            style={{ width: `${routing.gpuWeight}%` }}
            className="bg-cyan-500 rounded-l transition-all duration-300"
            title={`GPU CUDA: ${routing.gpuWeight}%`}
          />
          <div
            style={{ width: `${routing.cpuWeight}%` }}
            className="bg-indigo-500 transition-all duration-300"
            title={`CPU AVX-512: ${routing.cpuWeight}%`}
          />
          <div
            style={{ width: `${routing.ramWeight}%` }}
            className="bg-emerald-500 rounded-r transition-all duration-300"
            title={`RAM Affine LUT: ${routing.ramWeight}%`}
          />
        </div>
      </div>

      {/* 3 Substrate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Substrate 1: GPU CUDA */}
        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1 uppercase">
              <Zap className="w-3 h-3 text-cyan-400" /> GPU Acceleration
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-900 text-cyan-400 border border-zinc-800">
              {routing.gpuWeight}%
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-500">Device:</span>
              <span className="text-zinc-200 text-right truncate max-w-[120px]">{hardware.gpuDevice.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Core Clock:</span>
              <span className="text-cyan-300">{hardware.gpuDevice.coreClockMhz} MHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">VRAM:</span>
              <span className="text-zinc-200">
                {(hardware.gpuDevice.vramUsedMb / 1024).toFixed(1)} / {(hardware.gpuDevice.vramTotalMb / 1024).toFixed(1)} GB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Power:</span>
              <span className="text-amber-300">{hardware.gpuDevice.powerDrawWatts} W</span>
            </div>
          </div>

          {routing.mode === 'manual_override' && (
            <div className="pt-1.5 border-t border-zinc-800">
              <label className="text-[10px] font-mono text-zinc-400 flex justify-between mb-1">
                <span>GPU Allocation</span>
                <span className="text-cyan-300">{routing.gpuWeight}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="95"
                value={routing.gpuWeight}
                onChange={(e) => handleGpuChange(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          )}
        </div>

        {/* Substrate 2: CPU AVX-512 */}
        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-indigo-300 flex items-center gap-1 uppercase">
              <Cpu className="w-3 h-3 text-indigo-400" /> CPU Vector
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-900 text-indigo-400 border border-zinc-800">
              {routing.cpuWeight}%
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-500">Vector ISA:</span>
              <span className="text-indigo-300 font-bold">AVX-{routing.vectorWidth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Threads:</span>
              <span className="text-zinc-200">{routing.activeThreads} P-Cores</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Batch Size:</span>
              <span className="text-zinc-200">{routing.batchSize.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Avg Load:</span>
              <span className="text-zinc-200">
                {Math.round(
                  hardware.cpuCores.reduce((acc, c) => acc + c.usagePercent, 0) / hardware.cpuCores.length
                )}%
              </span>
            </div>
          </div>

          {/* Vector Selector */}
          <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500">SIMD:</span>
            <div className="flex gap-1">
              {[128, 256, 512].map((vw) => (
                <button
                  key={vw}
                  onClick={() => onUpdateRouting({ vectorWidth: vw as 128 | 256 | 512 })}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono transition-colors ${
                    routing.vectorWidth === vw
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold'
                      : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {vw}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Substrate 3: RAM Ring Buffer & LUT */}
        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-emerald-300 flex items-center gap-1 uppercase">
              <HardDrive className="w-3 h-3 text-emerald-400" /> Affine RAM
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
              {routing.ramWeight}%
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-500">Ring Buffer:</span>
              <span className="text-zinc-200">
                {(hardware.ramSubstrate.ringBufferUsedMb / 1024).toFixed(1)} / {(hardware.ramSubstrate.ringBufferTotalMb / 1024).toFixed(1)} GB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">LUT Hits:</span>
              <span className="text-emerald-300">
                {(hardware.ramSubstrate.lookupTableHitsPerSec / 1e6).toFixed(1)}M/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Bandwidth:</span>
              <span className="text-zinc-200">{hardware.ramSubstrate.bandwidthGbps.toFixed(1)} GB/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">IPC Occupancy:</span>
              <span className="text-zinc-200">{snapshot.ipcStatus.bufferOccupancyPercent}%</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">PWEH WORM:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Active Lock
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
