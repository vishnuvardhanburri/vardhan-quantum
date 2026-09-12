'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useClusterPeers, useRaftStatus, useSSE } from '@/lib/useApi';
import { Server, Shield, MapPin, Thermometer, BarChart3 } from 'lucide-react';
import { useState, useCallback } from 'react';

const stateColors = {
  healthy: 'text-emerald-400',
  degraded: 'text-amber-400',
  draining: 'text-orange-400',
  dead: 'text-red-400',
};

const stateIcons = {
  healthy: '●',
  degraded: '⚠',
  draining: '⟲',
  dead: '✗',
};

export default function InfrastructurePage() {
  const { data: peers, loading, error, refetch } = useClusterPeers();
  const { data: raftStatus, loading: raftLoading } = useRaftStatus();
  const [sseEvents, setSseEvents] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseEvents((prev) => {
      const next = [event, ...prev];
      return next.slice(0, 50);
    });
  }, []);
  const { connected } = useSSE(true, handleSSE);

  const nodes = peers?.nodes || [];

  return (
    <DashboardLayout title="Infrastructure" backButton={false}>
      <div className="space-y-8">
        {/* Cluster Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="panel rounded-xl p-4">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Total Nodes</span>
            <span className="text-2xl font-bold text-white block mt-1">{peers?.node_count ?? 0}</span>
          </div>
          <div className="panel rounded-xl p-4">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Healthy</span>
            <span className="text-2xl font-bold text-emerald-400 block mt-1">
              {peers?.nodes?.filter(n => n.state === 'healthy').length ?? 0}
            </span>
          </div>
          <div className="panel rounded-xl p-4">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Degraded</span>
            <span className="text-2xl font-bold text-amber-400 block mt-1">
              {peers?.nodes?.filter(n => n.state === 'degraded').length ?? 0}
            </span>
          </div>
          <div className="panel rounded-xl p-4">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Draining</span>
            <span className="text-2xl font-bold text-orange-400 block mt-1">
              {peers?.nodes?.filter(n => n.state === 'draining').length ?? 0}
            </span>
          </div>
          <div className="panel rounded-xl p-4">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Dead</span>
            <span className="text-2xl font-bold text-red-400 block mt-1">
              {peers?.nodes?.filter(n => n.state === 'dead').length ?? 0}
            </span>
          </div>
        </div>

        {/* Node Table */}
        <div className="panel rounded-xl p-6 shadow-card overflow-hidden">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">Cluster Nodes</h2>
          {loading ? (
            <p className="text-sm text-slate-400">Loading cluster nodes…</p>
          ) : error ? (
            <p className="text-sm text-red-400">Error: {error.message}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-panel text-slate-500">
                    <th className="text-left py-2">Node ID</th>
                    <th className="text-left py-2">Address</th>
                    <th className="text-left py-2">Region</th>
                    <th className="text-left py-2">State</th>
                    <th className="text-left py-2">Term</th>
                    <th className="text-left py-2">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((node, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2 text-[#00F5D4] flex items-center gap-2">
                        <Server className="w-3 h-3" />
                        {node.node_id}
                      </td>
                      <td className="py-2 text-slate-400">{node.addr}</td>
                      <td className="py-2 text-slate-400">
                        {node.region ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {node.region}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2">
                        <span className={`flex items-center gap-1 ${stateColors[node.state] || 'text-slate-400'}`}>
                          {stateIcons[node.state] || '●'} {node.state}
                        </span>
                      </td>
                      <td className="py-2 text-white">{node.term || 0}</td>
                      <td className="py-2 text-slate-500">{node.last_seen_ms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Raft Consensus State */}
        <div className="panel rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-panel">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400/70" />
              <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                Raft Consensus State
              </h2>
            </div>
            <span className={`text-[10px] font-mono ${raftLoading ? 'text-slate-500' : 'text-emerald-400'}`}>
              ● {raftLoading ? 'LOADING' : 'REAL-TIME'}
            </span>
          </div>
          {raftLoading ? (
            <p className="text-[12px] text-slate-500 font-mono">Loading Raft state…</p>
          ) : raftStatus?.error ? (
            <p className="text-[12px] text-red-400 font-mono">
              Raft node not available: {raftStatus.error}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
              <div className="panel bg-white/[0.02] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Node ID</span>
                <div className="text-slate-100 font-mono mt-1">{raftStatus?.node_id || '—'}</div>
              </div>
              <div className="panel bg-white/[0.02] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Role</span>
                <div className={`font-mono mt-1 ${raftStatus?.role === 'Leader' ? 'text-amber-400' : 'text-teal-400'}`}>
                  {raftStatus?.role || '—'}
                </div>
              </div>
              <div className="panel bg-white/[0.02] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Term</span>
                <div className="text-slate-100 font-mono mt-1">{raftStatus?.current_term ?? 0}</div>
              </div>
              <div className="panel bg-white/[0.02] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Commit Index</span>
                <div className="text-slate-100 font-mono mt-1">{raftStatus?.commit_index ?? 0}</div>
              </div>
            </div>
          )}
          {!raftLoading && !raftStatus?.error && raftStatus && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-[12px]">
              <div className="panel bg-white/[0.02] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Last Log Index</span>
                <div className="text-slate-100 font-mono mt-1">{raftStatus.last_log_index ?? 0}</div>
              </div>
              <div className="panel bg-white/[0.02] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Last Log Term</span>
                <div className="text-slate-100 font-mono mt-1">{raftStatus.last_log_term ?? 0}</div>
              </div>
              <div className="panel bg-white/[0.02] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Peers Configured</span>
                <div className="text-slate-100 font-mono mt-1">{raftStatus.configured_peer_count ?? 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Live Events */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Recent Events (SSE: {connected ? 'LIVE' : 'DISCONNECTED'})
          </h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {sseEvents.length === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono">No events received yet</p>
            ) : (
              sseEvents.map((ev, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-slate-300 text-xs font-mono">{ev.event_type || 'event'}</span>
                  <span className="text-slate-500 text-[10px]">{new Date(ev.timestamp_ms || 0).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
