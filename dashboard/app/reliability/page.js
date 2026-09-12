'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useMetrics, useRaftStatus, useSSE } from '@/lib/useApi';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';

export default function ReliabilityPage() {
  const { data: metrics, loading, error } = useMetrics();
  const { data: raftStatus, loading: raftLoading } = useRaftStatus();
  const [sseEvents, setSseEvents] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseEvents((prev) => {
      const next = [event, ...prev];
      return next.slice(0, 100);
    });
  }, []);
  const { connected } = useSSE(true, handleSSE);

  // Latency history for chart
  const latencyHistory = useRef([]);
  const throughputHistory = useRef([]);

  useEffect(() => {
    if (metrics) {
      const now = Date.now();
      latencyHistory.current.push({ t: now, p50: metrics.latency_p50_us, p95: metrics.latency_p95_us, p99: metrics.latency_p99_us });
      throughputHistory.current.push({ t: now, rps: metrics.requests_per_sec });
      if (latencyHistory.current.length > 60) latencyHistory.current.shift();
      if (throughputHistory.current.length > 60) throughputHistory.current.shift();
    }
  }, [metrics]);

  const chartData = latencyHistory.current;
  const maxValue = Math.max(...chartData.map(d => d.p95), 100);

  return (
    <DashboardLayout title="Reliability">
      <div className="space-y-8">
        {/* Real-time Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCardCompact
            title="Request Rate"
            value={metrics?.requests_per_sec ?? 0}
            unit="req/s"
            trend={throughputHistory.current.length > 1 &&
              throughputHistory.current.at(-1).rps >= throughputHistory.current.at(-2).rps ? 'up' : 'down'}
          />
          <MetricCardCompact
            title="P95 Latency"
            value={metrics ? (metrics.latency_p95_us / 1000).toFixed(3) : 0}
            unit="ms"
            trend="none"
          />
          <MetricCardCompact
            title="P99 Latency"
            value={metrics ? (metrics.latency_p99_us / 1000).toFixed(3) : 0}
            unit="ms"
            trend="none"
          />
          <MetricCardCompact
            title="Active Sessions"
            value={metrics?.active_sessions ?? 0}
            unit="sessions"
            trend="none"
          />
          <MetricCardCompact
            title="Handshake Rate"
            value={metrics?.handshakes_per_sec ?? 0}
            unit="h/s"
            trend="none"
          />
          <MetricCardCompact
            title="Rejected Frames"
            value={metrics?.rejected_frames ?? 0}
            unit="frames"
            trend="none"
            warning={metrics?.rejected_frames > 0}
          />
          <MetricCardCompact
            title="Upstream Failures"
            value={metrics?.upstream_failures ?? 0}
            unit="failures"
            trend="none"
            warning={metrics?.upstream_failures > 0}
          />
          <MetricCardCompact
            title="KEM Entropy"
            value={metrics ? metrics.kem_entropy.toFixed(4) : '0.0000'}
            unit="bits/byte"
            trend="none"
          />
        </div>

        {/* Latency Chart */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Latency History (P95)
          </h2>
          {loading ? (
            <p className="text-sm text-slate-400">Loading telemetry…</p>
          ) : (
            <LatencyChart data={chartData} maxValue={maxValue} />
          )}
        </div>

        {/* Throughput Chart */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Throughput History
          </h2>
          <ThroughputChart data={throughputHistory.current} />
        </div>

        {/* Throughput Chart */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Throughput History
          </h2>
          <ThroughputChart data={throughputHistory.current} />
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
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-[12px]">
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Node ID</div>
                <div className="text-slate-100 font-mono">{raftStatus?.node_id || '—'}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Role</div>
                <div className={`font-mono ${raftStatus?.role === 'Leader' ? 'text-amber-400' : 'text-teal-400'}`}>
                  {raftStatus?.role || '—'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Term</div>
                <div className="text-slate-100 font-mono">{raftStatus?.current_term ?? 0}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Commit Index</div>
                <div className="text-slate-100 font-mono">{raftStatus?.commit_index ?? 0}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Leader ID</div>
                <div className="text-slate-100 font-mono">{raftStatus?.leader_id || '—'}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Peers</div>
                <div className="text-slate-100 font-mono">{raftStatus?.configured_peer_count ?? 0}</div>
              </div>
            </div>
          )}
          {!raftLoading && !raftStatus?.error && raftStatus?.match_index && Object.keys(raftStatus.match_index).length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] text-slate-500 font-mono uppercase mb-2">Replication State</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[12px]">
                {Object.entries(raftStatus.match_index).map(([peer, matchIdx]) => (
                  <div key={peer} className="panel bg-white/[0.02] rounded-lg p-2">
                    <span className="text-slate-500 font-mono">{peer}</span>
                    <span className="float-right text-slate-100">match={matchIdx}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Events */}
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

function MetricCardCompact({ title, value, unit, trend = 'none', warning = false }) {
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';
  const valueColor = warning ? 'text-amber-400' : 'text-white';
  return (
    <div className="panel rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500 font-mono uppercase">{title}</span>
        <TrendingUp className={`w-3 h-3 ${trendColor}`} />
      </div>
      <div className={`text-xl font-bold font-mono ${valueColor}`}>
        {value} <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function LatencyChart({ data, maxValue }) {
  if (data.length === 0) {
    return <p className="text-[10px] text-slate-500 font-mono py-8 text-center">No latency data yet</p>;
  }

  const chartHeight = 100;
  const chartWidth = 100; // percentage-based
  const padding = 5;
  const plotHeight = chartHeight - 2 * padding;
  const plotWidth = data.length * 20;

  const getY = (val) => plotHeight - (val / maxValue) * plotHeight + padding;

  return (
    <div className="overflow-x-auto">
      <svg width={Math.max(plotWidth + 20, 300)} height={chartHeight} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <line
            key={pct}
            x1={padding}
            y1={padding + (plotHeight * pct / 100)}
            x2={plotWidth + padding}
            y2={padding + (plotHeight * pct / 100)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}
        {/* P95 line */}
        <polyline
          fill="none"
          stroke="var(--accent-teal)"
          strokeWidth="2"
          points={data.map((d, i) => `${padding + i * 20},${getY(d.p95)}`).join(' ')}
        />
        {/* P50 line */}
        <polyline
          fill="none"
          stroke="var(--accent-indigo)"
          strokeWidth="1"
          strokeOpacity="0.6"
          points={data.map((d, i) => `${padding + i * 20},${getY(d.p50)}`).join(' ')}
        />
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
        <span>P50 (indigo)</span>
        <span>P95 (teal)</span>
        <span>Max: {maxValue.toFixed(1)}µs</span>
      </div>
    </div>
  );
}

function ThroughputChart({ data }) {
  if (data.length === 0) {
    return <p className="text-[10px] text-slate-500 font-mono py-8 text-center">No throughput data yet</p>;
  }

  const chartHeight = 80;
  const padding = 2;
  const plotHeight = chartHeight - 2 * padding;
  const maxRps = Math.max(...data.map(d => d.rps), 1);
  const barWidth = 20;
  const gap = 5;
  const totalWidth = data.length * (barWidth + gap);

  return (
    <div className="overflow-x-auto">
      <svg width={totalWidth} height={chartHeight} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 50, 100].map((pct) => (
          <line
            key={pct}
            x1={0}
            y1={padding + (plotHeight * pct / 100)}
            x2={totalWidth}
            y2={padding + (plotHeight * pct / 100)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}
        {data.map((d, i) => {
          const barHeight = (d.rps / maxRps) * plotHeight;
          return (
            <rect
              key={i}
              x={i * (barWidth + gap)}
              y={chartHeight - padding - barHeight}
              width={barWidth}
              height={barHeight}
              fill="var(--accent-teal)"
              fillOpacity={0.8}
              rx={2}
            />
          );
        })}
      </svg>
      <div className="text-[10px] text-slate-500 font-mono mt-2">
        Max: {maxRps} req/s · Showing last {data.length} samples
      </div>
    </div>
  );
}
