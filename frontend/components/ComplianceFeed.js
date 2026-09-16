'use client';

import React from 'react';

export const ComplianceFeed = ({ events = [] }) => {
  return (
    <div className="vui-card p-6 font-mono text-xs overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-10 opacity-30"></div>
      
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-slate-400 text-xs relative z-20">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0075FF] shadow-[0_0_10px_#0075FF]"></div>
          <span className="text-white font-bold uppercase tracking-wider">Continuous DORA / NIS2 Compliance Feed</span>
        </div>
        <span className="text-[#00F5D4] animate-pulse font-bold text-[11px]">● LIVE AUDIT LOG</span>
      </div>

      <div className="space-y-2 text-slate-300 relative z-20 max-h-72 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            Connecting to live compliance stream…
          </div>
        ) : (
          events.map((ev, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00F5D4]/30 hover:bg-white/[0.04] transition-all"
            >
              <span className="text-slate-500 w-28 text-[11px]">[{ev.timestamp}]</span>
              <span className="text-[#00F5D4] font-semibold w-64 truncate">{ev.mandate}</span>
              <span className="text-slate-300 w-44 truncate">{ev.primitive}</span>
              <span className="text-[#8A2BE2] w-28">{ev.entropy}</span>
              <span className={`font-bold w-12 text-right ${ev.status === 'OK' ? 'text-emerald-400' : 'text-red-400'}`}>
                {ev.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
