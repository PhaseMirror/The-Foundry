
import React from 'react';
import { CreditType, CreditBalance } from '../types';
import { CREDIT_VISUALS } from '../constants';

interface CreditPodProps {
  balance: CreditBalance;
  onClick: () => void;
}

export const CreditPod: React.FC<CreditPodProps> = ({ balance, onClick }) => {
  const visuals = CREDIT_VISUALS[balance.type];
  const isIntrinsic = balance.type === CreditType.INTRINSIC;

  if (isIntrinsic) {
    const progress = Math.min((balance.balance / 1000) * 100, 100);
    return (
      <div 
        onClick={onClick}
        className="bg-slate-900/50 border border-violet-500/30 rounded-2xl p-6 cursor-pointer hover:border-violet-500/60 transition-all violet-glow group relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-violet-600/20 rounded-xl">
            {visuals.icon}
          </div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-tighter">Intrinsic Reputation</span>
        </div>
        <h3 className="text-3xl font-bold mb-1">{balance.balance} <span className="text-sm font-normal text-slate-400">CP</span></h3>
        <p className="text-xs text-slate-400 mb-4">Reputation progress toward Manager</p>
        
        <div className="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-violet-600 to-emerald-400 h-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>780/1000 FOR ELM</span>
          <span>78%</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900/50 border border-${visuals.color}-500/20 rounded-2xl p-6 cursor-pointer hover:border-${visuals.color}-500/50 transition-all ${visuals.color === 'emerald' ? 'emerald-glow' : 'violet-glow'} group relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 bg-${visuals.color}-600/20 rounded-xl`}>
          {visuals.icon}
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs font-bold text-${visuals.color}-400 uppercase tracking-tighter`}>{balance.type}</span>
          <span className="text-[10px] text-slate-500 italic">{visuals.metaphor}</span>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-3xl font-bold">{balance.balance.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Total Lifetime: {balance.lifetimeEarned.toLocaleString()}</p>
        </div>
        <div className="transform group-hover:scale-110 transition-transform">
          {visuals.growthIcon}
        </div>
      </div>

      {balance.monthlyExchanged > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {balance.monthlyExchanged} used this month
        </div>
      )}
    </div>
  );
};
