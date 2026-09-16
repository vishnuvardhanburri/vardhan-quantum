'use client';

import React from 'react';
import { Search, User, Settings, Bell, Menu, Radio, Shield } from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';
import { usePersona } from '@/components/PersonaContext';

export function VisionTopBar({ title = 'Default' }) {
  const { setMobileOpen } = useSidebar();
  const { techMode, toggleTechMode } = usePersona();

  return (
    <header className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-[#070C27]/85 backdrop-blur-xl z-30 border-b border-white/5 font-sans">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#718096] font-medium">
            <span className="text-[#00F5D4] font-bold">VARDHAN QUANTUM</span>
            <span>/</span>
            <span>Ingress Defense</span>
            <span>/</span>
            <span className="text-white font-semibold">{title}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-sm font-bold text-white tracking-wide">
              {title}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#01B574]/15 text-[#01B574] border border-[#01B574]/30">
              FIPS 203 / 204
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search audit trail, sessions..."
            className="w-48 lg:w-64 pl-9 pr-4 py-1.5 rounded-xl bg-[#0F1535] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0075FF] transition-all font-mono"
          />
        </div>

        {/* CISO Admin Profile */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <div className="w-7 h-7 rounded-xl bg-[#0075FF]/20 border border-[#0075FF]/40 flex items-center justify-center text-[#0075FF]">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline">CISO Admin</span>
        </div>

        {/* Tech Mode toggle */}
        <button
          onClick={toggleTechMode}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
            techMode
              ? 'bg-[#00F5D4]/15 border-[#00F5D4] text-[#00F5D4]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Diagnostics HUD"
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">TECH</span>
        </button>

        {/* Quick Actions */}
        <button className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Settings">
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-slate-400 hover:text-white transition-colors relative" title="Alerts">
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] absolute top-1 right-1 shadow-[0_0_6px_#00F5D4]" />
        </button>
      </div>
    </header>
  );
}
