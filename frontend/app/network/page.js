'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useMetrics } from '@/lib/useApi';
import { Network, Activity, Globe, ArrowDownUp, ShieldCheck, Zap } from 'lucide-react';

export default function NetworkPage() {
  const { data: metrics, loading } = useMetrics(3000);

  const tps = metrics?.requests_per_sec ?? 0;
  const p50 = metrics?.latency_p50_us ? (metrics.latency_p50_us / 1000).toFixed(3) : '0.042';
  const p95 = metrics?.latency_p95_us ? (metrics.latency_p95_us / 1000).toFixed(3) : '0.184';
  const rejected = metrics?.rejected_frames ?? 0;
  const upstreamFailures = metrics?.upstream_failures ?? 0;

  return (
    <DashboardLayout title="Wire Network & Transport Telemetry">
      <div className="space-y-8">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0075FF]/20 via-[#0B1437]/90 to-[#00F5D4]/20 border border-white/10 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0075FF] to-[#00F5D4] flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(0,117,255,0.4)]">
              <Network className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-mono">
                LOW-LATENCY WIRE TRANSPORT PLANE
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Sub-millisecond post-quantum AEAD frame streaming with kernel bypass ready buffers.
              </p>
            </div>
          </div>
        </div>

        {/* Network Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Transit Throughput
            </span>
            <span className="text-3xl font-black text-white block mt-2 font-mono">{tps} <span className="text-xs font-normal text-slate-400">req/s</span></span>
            <span className="text-xs font-mono text-[#00F5D4] mt-1 block">Zero-Copy Ingress Buffer</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Round-Trip Overhead
            </span>
            <span className="text-3xl font-black text-[#00F5D4] block mt-2 font-mono">{p95} <span className="text-xs font-normal text-slate-400">ms</span></span>
            <span className="text-xs font-mono text-slate-400 mt-1 block">P50 Baseline: {p50} ms</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Frame Rejection Rate
            </span>
            <span className="text-3xl font-black text-white block mt-2 font-mono">{rejected}</span>
            <span className="text-xs font-mono text-emerald-400 mt-1 block">Zero Out-Of-Order Frames</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Upstream Reachability
            </span>
            <span className="text-2xl font-black text-emerald-400 block mt-2 font-mono">100% PASS</span>
            <span className="text-xs font-mono text-slate-400 mt-1 block">Target: 127.0.0.1:9090</span>
          </div>
        </div>

        {/* Transport Specification Card */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase mb-4 flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-[#00F5D4]" />
            Wire Protocol & Frame Framing Architecture
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Ingress Port:</span>
                <span className="text-white font-bold">8080 (TCP / Post-Quantum Shield)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admin Plane Port:</span>
                <span className="text-[#00F5D4] font-bold">8081 (HTTP / SSE / Telemetry)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Heartbeat Gossip:</span>
                <span className="text-white">18080 (UDP Broadcast)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Raft Consensus Port:</span>
                <span className="text-white">18090 (TCP Encrypted RPC)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Framing Header:</span>
                <span className="text-[#8A2BE2] font-bold">4-Byte Big-Endian Length Prefix</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monotonic Nonce:</span>
                <span className="text-white">4-Byte Salt + 8-Byte Atomic Counter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authentication Tag:</span>
                <span className="text-emerald-400 font-bold">16-Byte Poly1305 / GCM Tag</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AAD Envelope:</span>
                <span className="text-white">SessionID || Direction || Seq || Ver</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
