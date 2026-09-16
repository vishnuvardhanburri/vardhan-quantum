'use client';

import { Bell, RefreshCw, Wifi, Server, Menu, Terminal } from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';
import { usePersona } from '@/components/PersonaContext';

const personas = [
  { id: 'EXECUTIVE', label: 'Executive', short: 'EXE' },
  { id: 'SECURITY',  label: 'Security',  short: 'SEC' },
  { id: 'SOC',       label: 'SOC',       short: 'SOC' },
  { id: 'AUDITOR',   label: 'Auditor',   short: 'AUD' },
];

export function TopBar({ title, clusterStatus, sseConnected, onRefresh }) {
  const { setMobileOpen } = useSidebar();
  const { persona, setPersona, techMode, toggleTechMode } = usePersona();

  return (
    <header className="topbar-bg border-b border-white/[0.07] sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-white/5 lg:hidden transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[15px] font-bold text-white tracking-wide">{title}</h1>
              <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#0075FF]/15 text-[#60A5FA] border border-[#0075FF]/25 uppercase">
                {persona}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[#A0AEC0] mt-0.5">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-[#01B574]' : 'bg-[#EE5D50]'}`} />
                <span className={sseConnected ? 'text-[#01B574]' : 'text-[#EE5D50]'}>
                  {sseConnected ? 'LIVE' : 'OFFLINE'}
                </span>
              </span>
              {clusterStatus && (
                <>
                  <span className="text-[#5A5F73]">·</span>
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3 text-[#60A5FA]" />
                    <span>{clusterStatus.healthy_count}/{clusterStatus.node_count} nodes</span>
                  </span>
                  <span className="text-[#5A5F73]">·</span>
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-[#A855F7]" />
                    <span>{clusterStatus.leader || '—'}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: persona switcher + tech mode + actions */}
        <div className="flex items-center gap-2.5">
          {/* Persona switcher */}
          <div className="hidden md:flex items-center vui-card p-1 gap-0.5">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all duration-200 ${
                  persona === p.id
                    ? 'bg-gradient-to-r from-[#0075FF] to-[#00F5D4] text-black shadow-[0_0_10px_rgba(0,245,212,0.3)]'
                    : 'text-[#A0AEC0] hover:text-white hover:bg-white/5'
                }`}
              >
                {p.short}
              </button>
            ))}
          </div>

          {/* Tech mode */}
          <button
            onClick={toggleTechMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-all ${
              techMode
                ? 'bg-[#00F5D4]/10 border-[#00F5D4]/40 text-[#00F5D4] shadow-[0_0_12px_rgba(0,245,212,0.2)]'
                : 'bg-white/[0.04] border-white/[0.07] text-[#A0AEC0] hover:text-white'
            }`}
            title="Technical Diagnostics HUD"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">TECH</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[#A0AEC0] hover:text-white hover:bg-white/[0.08] transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[#A0AEC0] hover:text-white hover:bg-white/[0.08] transition-all" title="Notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00F5D4] shadow-[0_0_6px_#00F5D4]" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00F5D4] to-[#8A2BE2] flex items-center justify-center font-black text-black text-xs shadow-[0_0_12px_rgba(0,245,212,0.3)] shrink-0 cursor-pointer">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
