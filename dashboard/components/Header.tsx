'use client';

import React from 'react';
import { ShieldCheck, Cpu, Download, Activity } from 'lucide-react';

interface HeaderProps {
  nodeId: string;
  quorumStatus: string;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ nodeId, quorumStatus, onExport }) => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#0D0F17]/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F5D4] to-[#8A2BE2] flex items-center justify-center font-extrabold text-black shadow-[0_0_20px_rgba(0,245,212,0.5)]">
          V
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-widest uppercase flex items-center gap-2">
            Vardhan <span className="text-[#00F5D4]">Quantum</span> Proxy
          </h1>
          <p className="text-[10px] text-slate-400 font-mono">FIPS 203 / 204 ENVELOPED EDGE</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col items-start md:items-end">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Node Identity</span>
          <span className="text-xs text-[#00F5D4] font-mono flex items-center gap-1">
            <Cpu className="w-3 h-3" /> {nodeId}
          </span>
        </div>

        <div className="flex flex-col items-start md:items-end">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Consensus State</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5D4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F5D4]"></span>
            </span>
            <span className="text-xs text-white font-mono uppercase">{quorumStatus}</span>
          </div>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-lg bg-white/5 border border-white/10 hover:border-[#00F5D4]/50 hover:bg-[#00F5D4]/10 hover:text-[#00F5D4] transition-all duration-300"
        >
          <Download className="w-3.5 h-3.5 text-[#00F5D4]" />
          EXPORT DORA PDF
        </button>
      </div>
    </header>
  );
};
