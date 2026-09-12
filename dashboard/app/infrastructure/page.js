'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useClusterPeers, useSSE } from '@/lib/useApi';
import { Server, Shield, MapPin, Thermometer } from 'lucide-react';
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
