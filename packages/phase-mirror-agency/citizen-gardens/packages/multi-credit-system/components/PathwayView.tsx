
import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Award } from 'lucide-react';
import { Member, MembershipLevel } from '../types';

export const PathwayView: React.FC<{ member: Member }> = ({ member }) => {
  const requirements = [
    { label: '40 hrs/week participation', status: true },
    { label: '780/1000 Intrinsic Credits (ELM completion)', status: true },
    { label: '1 year tenure as Associate (8 months remaining)', status: false },
    { label: 'Board qualification', status: false },
    { label: 'Majority vote of department members', status: false },
  ];

  return (
    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-emerald-600/20 rounded-2xl">
          <Award className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">ELM Advancement Pathway</h2>
          <p className="text-slate-400">Track your journey to {MembershipLevel.MANAGER}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="bg-slate-950/50 p-6 rounded-2xl border border-emerald-500/20">
            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Current Status: {member.membershipLevel}</h4>
            <div className="space-y-4">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {req.status ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-700" />
                  )}
                  <span className={req.status ? 'text-slate-200' : 'text-slate-500'}>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-900/20 to-emerald-900/20 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-sm font-bold text-violet-400 uppercase tracking-widest mb-4">Next Stage: {MembershipLevel.MANAGER}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <ArrowRight className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                <span>Unlocks: Branch operations oversight</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <ArrowRight className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                <span>Unlocks: Officer election voting</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <ArrowRight className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                <span>Exchange limit increases to 3,000/month</span>
              </li>
            </ul>
            <button className="mt-8 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-900/40">
              View Detailed Curriculum
            </button>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full" />
        </div>
      </div>
    </div>
  );
};
