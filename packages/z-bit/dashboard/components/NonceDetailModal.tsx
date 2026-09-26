'use client';

import React, { useState } from 'react';
import {
  X,
  Binary,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { NonceCandidate } from '@/lib/types';

interface NonceDetailModalProps {
  candidate: NonceCandidate | null;
  onClose: () => void;
}

export function NonceDetailModal({
  candidate,
  onClose,
}: NonceDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!candidate) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isSolved = candidate.status === 'BLOCK_SOLVED';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-zinc-800 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded border ${
              isSolved
                ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                : 'bg-zinc-800 border-zinc-700 text-violet-400'
            }`}>
              <Binary className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-xs text-zinc-100 flex items-center gap-1.5 uppercase">
                <span>NONCE CANDIDATE INSPECTION</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isSolved
                    ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                    : 'bg-zinc-800 text-violet-300 border border-zinc-700'
                }`}>
                  {candidate.status}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Block Height #{candidate.blockHeight} &bull; Substrate: {candidate.substrateSource}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs">
          {/* Leading Zeros & Difficulty Banner */}
          <div className="p-2.5 bg-zinc-900/80 rounded border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Solution Quality:</span>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {candidate.leadingZeros} Consecutive Leading Zero Bits
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Discovered At:</span>
              <div className="text-[11px] text-zinc-300" suppressHydrationWarning>
                {new Date(candidate.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* SHA-256d Hash Field */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-400 text-[10px]">
              <span className="text-zinc-400">SHA-256d Affine Projected Hash:</span>
              <button
                onClick={() => handleCopy(candidate.hash, 'hash')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
              >
                {copiedField === 'hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'hash' ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
            <div className="bg-[#0A0A0A] p-2 rounded border border-zinc-800 text-emerald-300 select-all break-all leading-relaxed text-[11px]">
              {candidate.hash}
            </div>
          </div>

          {/* Nonce Hex Field */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-400 text-[10px]">
              <span className="text-zinc-400">Calculated Nonce Hex:</span>
              <button
                onClick={() => handleCopy(candidate.nonceHex, 'nonce')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
              >
                {copiedField === 'nonce' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'nonce' ? 'Copied' : 'Copy Nonce'}</span>
              </button>
            </div>
            <div className="bg-[#0A0A0A] p-2 rounded border border-zinc-800 text-zinc-200 select-all break-all leading-relaxed text-[11px]">
              {candidate.nonceHex}
            </div>
          </div>

          {/* Merkle Root Field */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-400 text-[10px]">
              <span className="text-zinc-400">Block Merkle Root:</span>
              <button
                onClick={() => handleCopy(candidate.merkleRoot, 'merkle')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
              >
                {copiedField === 'merkle' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'merkle' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-[#0A0A0A] p-2 rounded border border-zinc-800 text-zinc-300 select-all break-all text-[11px]">
              {candidate.merkleRoot}
            </div>
          </div>

          {/* Lean Witness & Formal Security Seal */}
          <div className="p-2.5 bg-zinc-900/80 rounded border border-zinc-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <div>
                <div className="text-zinc-200 font-bold text-[11px]">Lean 4 AffineCore Witness Validated</div>
                <div className="text-[10px] text-zinc-400 font-mono truncate max-w-sm">
                  {candidate.witnessHash}
                </div>
              </div>
            </div>
            <div className="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 font-bold border border-zinc-700 text-[9px]">
              CCRE CERTIFIED
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-zinc-900 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors border border-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
