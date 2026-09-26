'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { MetricCards } from '@/components/MetricCards';
import { DispatcherSubstratePanel } from '@/components/DispatcherSubstratePanel';
import { PilotGateInspector } from '@/components/PilotGateInspector';
import { ThermalGovernorPanel } from '@/components/ThermalGovernorPanel';
import { NonceStreamPanel } from '@/components/NonceStreamPanel';
import { WormAuditLogPanel } from '@/components/WormAuditLogPanel';
import { ProofReplayModal } from '@/components/ProofReplayModal';
import { NonceDetailModal } from '@/components/NonceDetailModal';
import {
  TelemetrySnapshot,
  NonceCandidate,
  WormAuditEntry,
} from '@/lib/types';
import { soundEngine } from '@/lib/sound';
import { Activity } from 'lucide-react';

type ConnectionState = 'connecting' | 'connected' | 'disconnected';

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot | null>(null);
  const [logs, setLogs] = useState<WormAuditEntry[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [pollingRateHz, setPollingRateHz] = useState<number>(2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<NonceCandidate | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: TelemetrySnapshot = await res.json();
      setSnapshot(data);
      if (data.wormLogs && data.wormLogs.length > 0) {
        setLogs(data.wormLogs);
      }
      setConnectionState('connected');
    } catch (err) {
      console.error('Telemetry poll failed:', err);
      setConnectionState('disconnected');
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    intervalRef.current = setInterval(fetchTelemetry, Math.round(1000 / pollingRateHz));
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchTelemetry, pollingRateHz]);

  const handleUpdateRouting = (partial: Partial<TelemetrySnapshot['routing']>) => {
    setSnapshot((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        routing: { ...prev.routing, ...partial },
      };
    });
  };

  const handleUpdateThermal = (partial: Partial<TelemetrySnapshot['thermal']>) => {
    setSnapshot((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        thermal: { ...prev.thermal, ...partial },
      };
    });
  };

  const handleEmergencyCool = () => {
    setSnapshot((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        thermal: {
          ...prev.thermal,
          maxTemp: 64.0,
          throttleFactor: 1.0,
          isThrottled: false,
        },
      };
    });
  };

  const handleExportLogs = () => {
    if (!logs.length) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `prism_btc_worm_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (connectionState === 'disconnected' && !snapshot) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
        <Header
          snapshot={snapshot!}
          onOpenProofModal={() => setIsProofModalOpen(true)}
          onExportAuditLog={handleExportLogs}
          pollingRateHz={pollingRateHz}
          onSetPollingRateHz={setPollingRateHz}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((s) => !s)}
          connectionState={connectionState}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Activity className="w-8 h-8 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-mono font-bold text-zinc-100">MINER OFFLINE</h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-md">
                Telemetry endpoint unavailable. Ensure <code className="text-cyan-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">prism-btc-miner</code> is running with <code className="text-cyan-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">--features telemetry</code>.
              </p>
              <p className="text-xs text-zinc-500 mt-2 font-mono">
                Expected snapshot at: <code className="text-zinc-400">/tmp/prism-btc-telemetry/latest.json</code>
              </p>
            </div>
            <button
              onClick={fetchTelemetry}
              className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-cyan-300 text-xs font-mono transition-colors"
            >
              RETRY CONNECTION
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-400 font-mono">Awaiting telemetry snapshot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Header */}
      <Header
        snapshot={snapshot}
        onOpenProofModal={() => setIsProofModalOpen(true)}
        onExportAuditLog={handleExportLogs}
        pollingRateHz={pollingRateHz}
        onSetPollingRateHz={setPollingRateHz}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        connectionState={connectionState}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-5 space-y-4">
        {/* HUD Top Bento Metrics */}
        <section aria-label="Key Performance Indicators">
          <MetricCards snapshot={snapshot} />
        </section>

        {/* 2-Column Responsive Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Substrate Dispatcher */}
          <DispatcherSubstratePanel
            snapshot={snapshot}
            onUpdateRouting={handleUpdateRouting}
          />

          {/* Lean 4 PilotGate Inspector */}
          <PilotGateInspector
            snapshot={snapshot}
            onOpenProofModal={() => setIsProofModalOpen(true)}
          />
        </div>

        {/* Thermal Monitor & Governor */}
        <section aria-label="Thermal Governor">
          <ThermalGovernorPanel
            snapshot={snapshot}
            onUpdateThermal={handleUpdateThermal}
            onEmergencyCool={handleEmergencyCool}
          />
        </section>

        {/* Live Nonce Stream & WORM Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NonceStreamPanel
            candidates={snapshot.recentCandidates}
            onSelectCandidate={(c) => setSelectedCandidate(c)}
          />

          <WormAuditLogPanel
            logs={logs}
            onExportLogs={handleExportLogs}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#0D0D0D] px-3 sm:px-4 lg:px-6 py-3 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${connectionState === 'connected' ? 'bg-cyan-400' : connectionState === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="text-[11px] tracking-wide text-zinc-400">
              PRISM-BTC TELEMETRY SHIM // {connectionState.toUpperCase()} // POLL {pollingRateHz}Hz
            </span>
          </div>
          <div className="text-[11px] text-zinc-500">
            <span>Lean 4 Proofs: <code className="text-zinc-400">zbit_affine::libaffinecore.so</code> [RTLD_GLOBAL]</span>
          </div>
        </div>
      </footer>

      {/* Proof Replayer Modal */}
      <ProofReplayModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        snapshot={snapshot}
      />

      {/* Nonce Candidate Inspector Modal */}
      <NonceDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}
