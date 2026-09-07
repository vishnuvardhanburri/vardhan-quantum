'use client';

import React from 'react';

export interface AuditEvent {
  timestamp: number;
  mandate: string;
  primitive: string;
  entropy: string;
  status: string;
}

interface ComplianceFeedProps {
  events: AuditEvent[];
}

export const ComplianceFeed: React.FC<ComplianceFeedProps> = ({ events }) => {
  return (
    <div className="relative rounded-xl bg-[#0D0F17]/80 backdrop-blur-xl border border-white/10 p-6 font-mono text-xs overflow-hidden shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-10 opacity-40"></div>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5 text-slate-500 text-[11px]">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500/80"></div>
          <span className="text-slate-400 uppercase tracking-widest">Continuous DORA / NIS2 Json Compliance Feed</span>
        </div>
        <span className="text-[#00F5D4]/80 animate-pulse font-bold">● LIVE LOGGING</span>
      </div>

      <div className="space-y-2 text-slate-300 relative z-20">
        {events.map((ev, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <span className="text-slate-500 w-28">[{ev.timestamp}]</span>
            <span className="text-[#00F5D4] font-semibold w-64">{ev.mandate}</span>
            <span className="text-slate-400 w-44">{ev.primitive}</span>
            <span className="text-[#8A2BE2] w-28">{ev.entropy}</span>
            <span className="text-emerald-400 font-bold w-12 text-right">{ev.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
