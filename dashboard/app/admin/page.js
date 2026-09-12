'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Settings, Server, Database, Shield, Bell, Copy } from 'lucide-react';
import { useClusterStatus, useClusterPeers, useMetrics, useRaftStatus, drainNode } from '@/lib/useApi';
import { useState, useCallback } from 'react';
import { useSSE } from '@/lib/useApi';

export default function AdminPage() {
  const { data: clusterStatus, loading: clusterLoading, refetch: refetchCluster } = useClusterStatus();
  const { data: peers, loading: peersLoading } = useClusterPeers();
  const { data: metrics, loading: metricsLoading } = useMetrics();
  const { data: raftStatus, loading: raftLoading } = useRaftStatus();
  const [drainResult, setDrainResult] = useState(null);
  const [drainLoading, setDrainLoading] = useState(false);
  const [drainError, setDrainError] = useState(null);

  const handleDrain = async () => {
    setDrainLoading(true);
    setDrainError(null);
    try {
      const result = await drainNode();
      setDrainResult(result);
      refetchCluster();
    } catch (err) {
      setDrainError(err.message);
    } finally {
      setDrainLoading(false);
    }
  };

  const [sseEvents, setSseEvents] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseEvents((prev) => {
      const next = [event, ...prev];
      return next.slice(0, 50);
    });
  }, []);
  const { connected } = useSSE(true, handleSSE);

  return (
    <DashboardLayout title="Administration">
      <div className="space-y-8">
        {/* Cluster Configuration */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <Server className="w-4 h-4" /> Cluster Configuration
          </h2>
          {clusterLoading ? (
            <p className="text-sm text-slate-400">Loading cluster state…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ConfigCard
                title="Node Identity"
                value={clusterStatus?.healthy_nodes?.[0]?.node_id || 'unknown'}
                subtitle="This node's stable identifier"
              />
              <ConfigCard
                title="Region"
                value={clusterStatus?.healthy_nodes?.[0]?.region || 'unset'}
                subtitle="VARDHAN_REGION"
              />
              <ConfigCard
                title="Quorum"
                value={clusterStatus ? `${clusterStatus.healthy_count}/${clusterStatus.node_count}` : '—'}
                subtitle="Healthy nodes (lex smallest = leader)"
              />
            </div>
          )}
        </div>

        {/* Operational Controls */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Operational Controls
          </h2>

          <button
            onClick={handleDrain}
            disabled={drainLoading}
            className="flex items-center gap-3 px-4 py-3 text-sm font-mono font-medium rounded-lg bg-white/5 border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 disabled:opacity-50 transition-all duration-200"
          >
            <span>Drain Node</span>
            <span className="text-[10px] text-slate-500">
              ({drainLoading ? 'PROCESSING…' : 'SIGTERM also drains'})
            </span>
          </button>

          {drainError && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-400 font-mono">
              Error: {drainError}
            </div>
          )}

          {drainResult && (
            <div className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto">
                {JSON.stringify(drainResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Raft Consensus State */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Raft Consensus State
          </h2>
          {raftLoading ? (
            <p className="text-sm text-slate-400">Loading Raft state…</p>
          ) : raftStatus?.error ? (
            <p className="text-sm text-red-400 font-mono">
              Raft node not available: {raftStatus.error}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-[12px]">
              <ConfigCard title="Node ID" value={raftStatus?.node_id || '—'} subtitle="This Raft node" />
              <ConfigCard title="Role" value={raftStatus?.role || '—'} subtitle={raftStatus?.role === 'Leader' ? 'Cluster leader' : 'Follower/Candidate'} />
              <ConfigCard title="Current Term" value={raftStatus?.current_term ?? 0} subtitle="Raft term" />
              <ConfigCard title="Commit Index" value={raftStatus?.commit_index ?? 0} subtitle="Applied to state machine" />
              <ConfigCard title="Leader ID" value={raftStatus?.leader_id || '—'} subtitle="Current Raft leader" />
            </div>
          )}
          {!raftLoading && !raftStatus?.error && raftStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-[12px]">
              <ConfigCard title="Last Log Index" value={raftStatus.last_log_index ?? 0} subtitle="Log entries" />
              <ConfigCard title="Last Log Term" value={raftStatus.last_log_term ?? 0} subtitle="Term of last entry" />
              <ConfigCard title="Peers" value={raftStatus.configured_peer_count ?? 0} subtitle="Configured peers" />
              <ConfigCard title="Voted For" value={raftStatus.voted_for || '—'} subtitle="Last vote cast" />
            </div>
          )}
        </div>

        {/* Telemetry Summary */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Telemetry Summary
          </h2>
          {metricsLoading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ConfigCard title="Requests/sec" value={metrics?.requests_per_sec ?? 0} subtitle="per second" />
              <ConfigCard title="Active Sessions" value={metrics?.active_sessions ?? 0} subtitle="PQ sessions" />
              <ConfigCard title="Handshake Rate" value={metrics?.handshakes_per_sec ?? 0} subtitle="per second" />
              <ConfigCard title="Ledger Entries" value={metrics?.successful_handshakes ?? 0} subtitle="total" />
            </div>
          )}
        </div>

        {/* Live Events */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Live Events (SSE: {connected ? 'LIVE' : 'DISCONNECTED'})
          </h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {sseEvents.length === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono">No events received yet</p>
            ) : (
              sseEvents.slice(0, 30).map((ev, i) => (
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

function ConfigCard({ title, value, subtitle }) {
  return (
    <div className="bg-surface-card border border-panel rounded-xl p-4">
      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{title}</span>
      <span className="text-2xl font-bold text-white block mt-1">{value}</span>
      <span className="text-[11px] text-slate-500 font-mono">{subtitle}</span>
    </div>
  );
}
