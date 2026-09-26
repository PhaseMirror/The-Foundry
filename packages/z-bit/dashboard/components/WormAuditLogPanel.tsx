'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Terminal,
} from 'lucide-react';
import { WormAuditEntry } from '@/lib/types';

interface WormAuditLogPanelProps {
  logs: WormAuditEntry[];
  onExportLogs: () => void;
}

export function WormAuditLogPanel({
  logs,
  onExportLogs,
}: WormAuditLogPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL'>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterSeverity !== 'ALL' && log.severity !== filterSeverity) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.details.toLowerCase().includes(term) ||
        log.eventType.toLowerCase().includes(term) ||
        log.payloadHash.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="rounded-lg bg-[#121212] border border-zinc-800 p-3.5 sm:p-4 flex flex-col gap-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-mono font-bold text-xs text-zinc-100 tracking-wide flex items-center gap-1.5 uppercase">
              PWEH WORM AUDIT TRAIL // IMMUTABLE LEDGER
            </h2>
            <p className="text-[11px] text-zinc-400">
              Cryptographically signed write-once-read-many log verifying Lean 4 formal certificates
            </p>
          </div>
        </div>

        {/* Action: Export & Status */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-emerald-400 font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span>Chain Hash Verified</span>
          </div>

          <button
            onClick={onExportLogs}
            className="px-2.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-mono transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3 text-zinc-400" />
            <span>Export WORM Log</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search audit payload hashes, events, or Lean lemmas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded pl-7 pr-2.5 py-1 text-xs font-mono text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 p-0.5 rounded text-xs font-mono">
          {(['ALL', 'SUCCESS', 'INFO', 'WARN'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                filterSeverity === sev
                  ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded text-[11px]">
            No audit ledger records match the query.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isSuccess = log.severity === 'SUCCESS';
            const isWarn = log.severity === 'WARN';
            const isCritical = log.severity === 'CRITICAL';

            return (
              <div
                key={log.id}
                className={`p-2 rounded border flex flex-col gap-1 ${
                  isSuccess
                    ? 'bg-emerald-950/10 border-emerald-900/40 text-emerald-200'
                    : isWarn
                    ? 'bg-amber-950/20 border-amber-900/50 text-amber-200'
                    : isCritical
                    ? 'bg-rose-950/20 border-rose-900/50 text-rose-200'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-300">Seq #{log.seqId}</span>
                    <span className={`px-1 py-0.2 rounded border uppercase font-bold text-[9px] ${
                      isSuccess
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50'
                        : isWarn
                        ? 'bg-amber-950 text-amber-400 border-amber-800/50'
                        : isCritical
                        ? 'bg-rose-950 text-rose-400 border-rose-800/50'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {log.eventType}
                    </span>
                  </div>
                  <span className="text-zinc-500" suppressHydrationWarning>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-200 font-sans">
                  {log.details}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                  <span className="truncate max-w-[240px]">Payload: {log.payloadHash}</span>
                  <span className="truncate max-w-[180px]">Prev: {log.prevHash.slice(0, 16)}...</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
