import React from 'react';
import { Shield, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const instructions = [
  { id: 'AI-01', text: 'No fake reports: 100% verified facts with source citations; hallucinations discarded.', status: 'Locked' },
  { id: 'AI-02', text: 'Ownership mindset: Sam acts as the owner; optimizes long-term revenue & reputation.', status: 'Locked' },
  { id: 'AI-03', text: 'Remember main goal: Goal restated at every task start.', status: 'Locked' },
  { id: 'AI-04', text: 'Lock correct processes: After 3 successful test runs -> frozen.', status: 'Locked' },
  { id: 'AI-05', text: 'Three-Try Rule: Max 3 attempts -> stop, analyze root cause, propose better alternative.', status: 'Locked' },
  { id: 'AI-06', text: 'Approval gates: Spending, first-time publishing, legal actions, withdrawals.', status: 'Locked' },
  { id: 'AI-07', text: 'Source citation: Every fact must include a source URL or internal reference.', status: 'Locked' },
  { id: 'AI-08', text: 'Fail-safe defaults: On uncertainty -> pause + escalate to owner.', status: 'Locked' },
  { id: 'AI-09', text: 'Audit log: Every action timestamped + saved to Drive.', status: 'Locked' },
  { id: 'AI-10', text: 'Prefer Google ecosystem: Use Google Apps first.', status: 'Locked' },
  { id: 'AI-11', text: 'Multilingual CEO: Sam communicates in Kannada, English, Hindi, Telugu, Tamil, etc.', status: 'Locked' },
  { id: 'AI-12', text: 'Non-disruptive upgrades: New processes run in parallel; old removed after approval.', status: 'Locked' },
];

export const AIInstructions = () => {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-cyan-400 w-6 h-6" />
        <h2 className="text-xl font-bold tracking-tight text-white uppercase">AI Instructions (Active Rules)</h2>
      </div>
      <div className="space-y-4">
        {instructions.map((item) => (
          <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-white/20 transition-all">
            <div className="flex-shrink-0 mt-1">
              {item.status === 'Locked' ? (
                <Lock className="w-4 h-4 text-cyan-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">{item.id}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.status}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{item.text}</p>
            </div>
            <div className="text-[10px] text-gray-600 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              v2.0_VERIFIED
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
