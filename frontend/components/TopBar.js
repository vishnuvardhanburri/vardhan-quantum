'use client';

import { Bell, Search, Wifi, RefreshCw, User, Server, Menu, Terminal } from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';
import { usePersona } from '@/components/PersonaContext';

const personas = [
  { id: 'EXECUTIVE', label: 'Executive' },
  { id: 'SECURITY', label: 'Security & IT' },
  { id: 'SOC', label: 'SOC Operator' },
  { id: 'AUDITOR', label: 'Auditor' },
];

export function TopBar({ title, clusterStatus, sseConnected, onRefresh }) {
  const { setMobileOpen } = useSidebar();
  const { persona, setPersona, techMode, toggleTechMode } = usePersona();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-[#060B28]/90 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30 gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-base lg:text-lg font-black text-white font-mono uppercase tracking-wider">{title}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0075FF]/20 text-[#0075FF] border border-[#0075FF]/40 uppercase">
              {persona} VIEW
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]' : 'bg-red-500'}`}></span>
              <span>Telemetry: <strong className={sseConnected ? 'text-[#00F5D4]' : 'text-red-400'}>{sseConnected ? 'LIVE' : 'DISCONNECTED'}</strong></span>
            </span>
            {clusterStatus && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#0075FF]" />
                  <span>Cluster: <strong className="text-white">{clusterStatus.healthy_count}/{clusterStatus.node_count}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-[#8A2BE2]" />
                  <span>Leader: <strong className="text-white">{clusterStatus.leader || '—'}</strong></span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-3">
        {/* Persona Switcher */}
        <div className="flex items-center bg-[#05060A]/80 border border-white/10 rounded-xl p-1 gap-1">
          {personas.map((p) => {
            const active = persona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#0075FF] to-[#00F5D4] text-black shadow-[0_0_12px_rgba(0,245,212,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Technical Mode Toggle */}
        <button
          onClick={toggleTechMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-all ${
            techMode
              ? 'bg-[#00F5D4]/15 border-[#00F5D4] text-[#00F5D4] shadow-[0_0_15px_rgba(0,245,212,0.2)]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Technical Engine Diagnostics HUD"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>TECH MODE: {techMode ? 'ON' : 'OFF'}</span>
        </button>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          title="Refresh cluster metrics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00F5D4] to-[#8A2BE2] flex items-center justify-center font-bold text-xs text-black shadow-[0_0_15px_rgba(0,245,212,0.3)] shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
