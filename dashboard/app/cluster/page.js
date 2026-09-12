'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { withAuth } from '@/components/withAuth';
import { useClusterStatus, useClusterPeers } from '@/lib/useApi';
import { useSSE } from '@/lib/useSSE';
import { useState, useCallback } from 'react';
import { Cpu, Shield, Cloud, Wifi, WifiOff, LogOut, ArrowLeft, RefreshCw } from 'lucide-react';

function statusColor(state) {
  switch (state) {
    case 'healthy': return 'text-emerald-400';
    case 'degraded': return 'text-amber-400';
    case 'draining': return 'text-orange-400';
    case 'dead': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

function StatusIcon({ state }) {
  if (state === 'healthy') return <Wifi className="w-4 h-4 text-emerald-400" />;
  if (state === 'dead') return <WifiOff className="w-4 h-4 text-red-400" />;
  return <Shield className="w-4 h-4 text-amber-400" />;
}

function ClusterPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { data: status, loading: statusLoading, error: statusError, refetch: refetchStatus } = useClusterStatus();
  const { data: peers, loading: peersLoading, error: peersError } = useClusterPeers();

  const [sseLive, setSseLive] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseLive((prev) => {
      const next = [event, ...prev];
      return next.slice(0, 100);
    });
  }, []);
  const { connected: sseConnected } = useSSE(true, handleSSE);

  const nodes = status?.healthy_nodes || [];
  const leader = status?.leader || '—';
  const nodeCount = status?.node_count || 0;
  const healthyCount = status?.healthy_count || 0;
  const drainingCount = status?.draining_count || 0;
  const deadCount = status?.dead_count || 0;

  return (
    <main className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#0D0F17]/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F5D4] to-[#8A2BE2] flex items-center justify-center font-extrabold text-black shadow-[0_0_20px_rgba(0,245,212,0.5)]">
            V
          </div>
          <h1 className="text-xl font-extrabold tracking-widest uppercase">
            Vardhan <span className="text-[#00F5D4]">Quantum</span> Proxy
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-[10px] ${sseConnected ? 'text-emerald-400' : 'text-red-400'} font-mono`}>
            SSE: {sseConnected ? 'LIVE' : 'DISCONNECTED'}
          </span>
          <button
            onClick={refetchStatus}
            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-3 h-3" /> LOGOUT
          </button>
        </div>
      </header>

      {/* Cluster Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Nodes" value={nodeCount} icon={<Cpu className="w-5 h-5" />} />
        <StatCard title="Healthy" value={healthyCount} icon={<Shield className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Draining" value={drainingCount} icon={<Shield className="w-5 h-5 text-orange-400" />} />
        <StatCard title="Dead" value={deadCount} icon={<WifiOff className="w-5 h-5 text-red-400" />} />
      </div>

      {/* Leader Info */}
      <div className="bg-[#0D0F17]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">Cluster Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Current Leader</span>
            <span className="text-xl font-bold text-[#00F5D4] font-mono block mt-1">{leader}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Quorum Requirement</span>
            <span className="text-xl font-bold text-white font-mono block mt-1">{(nodeCount / 2 + 1).toFixed(0)} of {nodeCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Cluster Status</span>
            <span className="text-xl font-bold text-white font-mono block mt-1">
              {healthyCount >= (nodeCount / 2 + 1) ? 'OPERATIONAL' : 'DEGRADED'}
            </span>
          </div>
        </div>
      </div>

      {/* Node Table */}
      <div className="bg-[#0D0F17]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">Cluster Nodes</h2>
        {statusLoading ? (
          <p className="text-slate-400 text-xs font-mono">Loading cluster state…</p>
        ) : statusError ? (
          <p className="text-red-400 text-xs font-mono">Error: {statusError.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="text-left py-2">Node ID</th>
                  <th className="text-left py-2">Address</th>
                  <th className="text-left py-2">Region</th>
                  <th className="text-left py-2">State</th>
                  <th className="text-left py-2">Term</th>
                  <th className="text-left py-2">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((n, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2 text-[#00F5D4]">{n.node_id}</td>
                    <td className="py-2 text-slate-400">{n.addr}</td>
                    <td className="py-2 text-slate-400">{n.region || '—'}</td>
                    <td className="py-2">
                      <span className={`flex items-center gap-1 ${statusColor(n.state)}`}>
                        <StatusIcon state={n.state} />
                        {n.state}
                      </span>
                    </td>
                    <td className="py-2 text-white">{n.term}</td>
                    <td className="py-2 text-slate-400">{n.last_seen_ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Events */}
      <div className="bg-[#0D0F17]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">Live Events (SSE)</h2>
        <div className="space-y-1">
          {sseLive.length === 0 ? (
            <p className="text-slate-500 text-xs font-mono">No events received yet…</p>
          ) : (
            sseLive.map((ev, i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[#00F5D4] text-xs font-mono">
                  {ev.event_type || 'event'}
                </span>
                <span className="text-slate-400 text-[10px]">
                  {new Date(ev.timestamp_ms || 0).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-[#0D0F17]/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{title}</span>
      </div>
      <span className="text-3xl font-extrabold text-white font-mono">{value}</span>
    </div>
  );
}

export default withAuth(ClusterPage);
