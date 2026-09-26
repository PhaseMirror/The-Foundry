'use client';

import React from 'react';
import {
  Flame,
  Fan,
  ShieldAlert,
  Gauge,
  Thermometer,
  Zap,
  Wind,
  CheckCircle,
} from 'lucide-react';
import { TelemetrySnapshot, ThermalMonitor } from '@/lib/types';

interface ThermalGovernorPanelProps {
  snapshot: TelemetrySnapshot;
  onUpdateThermal: (partial: Partial<ThermalMonitor>) => void;
  onEmergencyCool: () => void;
}

export function ThermalGovernorPanel({
  snapshot,
  onUpdateThermal,
  onEmergencyCool,
}: ThermalGovernorPanelProps) {
  const { thermal, hardware } = snapshot;
  const isThrottled = thermal.isThrottled;

  return (
    <div className={`rounded-lg bg-[#121212] border p-3.5 sm:p-4 flex flex-col gap-3 relative overflow-hidden transition-colors ${
      isThrottled ? 'border-rose-600/80' : 'border-zinc-800'
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded border ${
            isThrottled
              ? 'bg-rose-950/70 border-rose-800/50 text-rose-400 animate-pulse'
              : 'bg-zinc-900 border-zinc-800 text-amber-400'
          }`}>
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-mono font-bold text-xs text-zinc-100 tracking-wide flex items-center gap-1.5 uppercase">
              THERMAL MONITOR // DYNAMIC GOVERNOR
            </h2>
            <p className="text-[11px] text-zinc-400">
              Closed-loop PID thermal throttling protecting silicon substrates at T_crit = 85.0°C
            </p>
          </div>
        </div>

        {/* Governor Mode & Emergency Button */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 p-0.5 rounded text-xs font-mono">
            {(['auto_pid', 'performance_curve', 'manual_100'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onUpdateThermal({ fanGovernorMode: mode })}
                className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                  thermal.fanGovernorMode === mode
                    ? 'bg-zinc-800 text-amber-300 border border-zinc-700 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode === 'auto_pid' ? 'Auto PID' : mode === 'performance_curve' ? 'Perf Curve' : 'Max 100%'}
              </button>
            ))}
          </div>

          <button
            onClick={onEmergencyCool}
            className="px-2.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-cyan-200 text-[11px] font-mono transition-all flex items-center gap-1"
          >
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>Emergency Cool</span>
          </button>
        </div>
      </div>

      {/* Primary Thermal Metrics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5">
          <div className="text-[10px] font-mono text-zinc-500 mb-0.5 flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-amber-400" /> Max Hotspot
          </div>
          <div className="text-lg font-mono font-bold text-zinc-100">
            {thermal.maxTemp.toFixed(1)}°C
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            Target: &lt; 78.0°C
          </div>
        </div>

        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5">
          <div className="text-[10px] font-mono text-zinc-500 mb-0.5 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" /> Throttle Factor
          </div>
          <div className={`text-lg font-mono font-bold ${isThrottled ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(thermal.throttleFactor * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            {isThrottled ? 'ACTIVE DAMPING' : 'FULL CLOCK SPEED'}
          </div>
        </div>

        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5">
          <div className="text-[10px] font-mono text-zinc-500 mb-0.5 flex items-center gap-1">
            <Fan className="w-3 h-3 text-indigo-400 animate-spin" /> Fan Speed
          </div>
          <div className="text-lg font-mono font-bold text-zinc-100">
            {hardware.gpuDevice.fanRpm} RPM
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            Duty: {Math.round((hardware.gpuDevice.fanRpm / 4000) * 100)}% PWM
          </div>
        </div>

        <div className="rounded bg-zinc-900/80 border border-zinc-800 p-2.5">
          <div className="text-[10px] font-mono text-zinc-500 mb-0.5 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> GPU VRAM Temp
          </div>
          <div className="text-lg font-mono font-bold text-zinc-100">
            {hardware.gpuDevice.vramTempCelsius}°C
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            Core: {hardware.gpuDevice.coreTempCelsius}°C
          </div>
        </div>
      </div>

      {/* 16-Core CPU Thermal & Load Grid */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-zinc-300 mb-1.5">
          <span className="text-[11px] text-zinc-400">16-Core AVX-512 Substrate Matrix</span>
          <span className="text-[10px] text-zinc-500">P-Core Clock: 4.2 - 4.6 GHz</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {hardware.cpuCores.map((core) => {
            const isHot = core.tempCelsius > 70;
            return (
              <div
                key={core.id}
                className={`rounded border p-1.5 text-center font-mono transition-colors ${
                  isHot
                    ? 'bg-amber-950/30 border-amber-700/60 text-amber-200'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="text-[9px] text-zinc-500 mb-0.2">C#{core.id}</div>
                <div className="text-[11px] font-bold">{core.tempCelsius}°C</div>
                <div className="text-[9px] text-zinc-500">{core.usagePercent}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
