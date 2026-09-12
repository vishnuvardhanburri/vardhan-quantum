'use client';

import { Bell, Search, Wifi, RefreshCw, User, Server } from 'lucide-react';

export function TopBar({ title, clusterStatus, sseConnected, onRefresh }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-surface-elev border-b border-panel transition-panel sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <div className="flex items-center gap-3 text-xs text-secondary font-mono">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            Backend {sseConnected ? 'Connected' : 'Disconnected'}
          </span>
          {clusterStatus && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3 text-[#00F5D4]" />
                <span>Cluster: {clusterStatus.healthy_count}/{clusterStatus.node_count} Healthy</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                <span>Leader: {clusterStatus.leader || '—'}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-tertiary absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search…"
            className="pl-8 pr-3 py-1.5 text-xs font-mono bg-surface-card border border-panel rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-text-primary placeholder-tertiary transition-all"
          />
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Refresh"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-secondary hover:text-white transition-colors" />
        </button>
        <button
          className="relative p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-secondary" />
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00F5D4] to-[#8A2BE2] flex items-center justify-center font-bold text-xs text-black">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    </header>
  );
}
