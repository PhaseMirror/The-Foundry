'use client';

import React, { useState } from 'react';
import {
  Binary,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Filter,
  Copy,
  Check,
  Zap,
  Sparkles,
  Layers,
} from 'lucide-react';
import { NonceCandidate } from '@/lib/types';

interface NonceStreamPanelProps {
  candidates: NonceCandidate[];
  onSelectCandidate: (candidate: NonceCandidate) => void;
}

export function NonceStreamPanel({
  candidates,
  onSelectCandidate,
}: NonceStreamPanelProps) {
  const [filter, setFilter] = useState<'ALL' | 'CANDIDATE' | 'BLOCK_SOLVED' | 'PILOT_REJECTED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCandidates = candidates.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-lg bg-[#121212] border border-zinc-800 p-3.5 sm:p-4 flex flex-col gap-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-violet-400">
            <Binary className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-mono font-bold text-xs text-zinc-100 tracking-wide flex items-center gap-1.5 uppercase">
              CANDIDATE NONCE STREAM
            </h2>
            <p className="text-[11px] text-zinc-400">
              SHA-256d affine projection solutions meeting network difficulty target
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 p-0.5 rounded text-xs font-mono">
          {(['ALL', 'CANDIDATE', 'BLOCK_SOLVED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                filter === f
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f === 'ALL' ? 'All (Live)' : f === 'CANDIDATE' ? 'Candidates' : 'Solved Blocks'}
            </button>
          ))}
        </div>
      </div>

      {/* Nonce List */}
      <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredCandidates.length === 0 ? (
          <div className="p-6 text-center text-[11px] font-mono text-zinc-500 border border-dashed border-zinc-800 rounded">
            No candidate nonces found for current filter criteria. Mining loop actively scanning nonce space...
          </div>
        ) : (
          filteredCandidates.map((cand) => {
            const isSolved = cand.status === 'BLOCK_SOLVED';
            const isRejected = cand.status === 'PILOT_REJECTED';

            return (
              <div
                key={cand.id}
                onClick={() => onSelectCandidate(cand)}
                className={`p-2.5 rounded border transition-all cursor-pointer font-mono text-xs ${
                  isSolved
                    ? 'bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400'
                    : isRejected
                    ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-500'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isSolved
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                        : isRejected
                        ? 'bg-rose-900/60 text-rose-300 border border-rose-700/60'
                        : 'bg-zinc-800 text-violet-300 border border-zinc-700'
                    }`}>
                      {isSolved ? 'BLOCK SOLVED' : isRejected ? 'PILOT REJECTED' : 'VALID CANDIDATE'}
                    </span>

                    <span className="text-[10px] text-zinc-400 px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700/50">
                      {cand.substrateSource}
                    </span>

                    <span className="text-[10px] text-cyan-400 font-medium">
                      {cand.leadingZeros} Leading Zeros
                    </span>
                  </div>

                  <div className="text-[10px] text-zinc-500" suppressHydrationWarning>
                    {new Date(cand.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {/* Hash & Nonce Row */}
                <div className="space-y-0.5 bg-[#0A0A0A] p-1.5 rounded border border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-300">
                    <span className="text-zinc-500 text-[10px]">Hash:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-semibold select-all truncate max-w-[260px] sm:max-w-md text-[11px]">
                        {cand.hash}
                      </span>
                      <button
                        onClick={(e) => handleCopy(cand.hash, `h-${cand.id}`, e)}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5"
                        title="Copy SHA-256d Hash"
                      >
                        {copiedId === `h-${cand.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="text-zinc-500 text-[10px]">Nonce:</span>
                    <span className="text-zinc-300 select-all truncate max-w-[260px] sm:max-w-md text-[11px]">
                      {cand.nonceHex}
                    </span>
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-zinc-500">
                  <span>Witness: <span className="text-indigo-400 font-mono">{cand.witnessHash.slice(0, 18)}...</span></span>
                  <span className="text-zinc-400 flex items-center gap-1 hover:text-zinc-200">
                    Inspect Merkle &amp; Proof <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
