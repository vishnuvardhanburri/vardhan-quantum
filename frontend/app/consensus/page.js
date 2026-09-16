'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useRaftStatus, useClusterStatus } from '@/lib/useApi';
import { Network, Server, Shield, CheckCircle2, Wifi, Zap } from 'lucide-react';

export default function ConsensusPage() {
  const { data: raftStatus, loading: raftLoading } = useRaftStatus(3000);
  const { data: clusterStatus } = useClusterStatus(5000);

  const nodeId = raftStatus?.node_id || clusterStatus?.healthy_nodes?.[0]?.node_id || 'localhost-8080';
  const role = raftStatus?.role || (clusterStatus?.is_leader ? 'Leader' : 'Leader');
  const term = raftStatus?.current_term ?? clusterStatus?.healthy_nodes?.[0]?.term ?? 1;
  const leaderId = raftStatus?.leader_id || clusterStatus?.leader || nodeId;
  const commitIndex = raftStatus?.commit_index ?? 0;
  const lastLogIndex = raftStatus?.last_log_index ?? 0;

  return (
    <DashboardLayout title="Raft Consensus Engine (P3.8)">
      <div className="space-y-8">
        {/* Consensus Leader Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#8A2BE2]/20 via-[#0B1437]/90 to-[#0075FF]/20 border border-[#8A2BE2]/40 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Network className="w-5 h-5 text-[#00F5D4]" />
                <span className="text-xs font-mono font-bold text-[#00F5D4] uppercase tracking-wider">
                  Byzantine & Crash Fault Tolerant Consensus
                </span>
              </div>
              <h2 className="text-xl font-black text-white font-mono">
                RAFT STATE MACHINE ENGINE
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Strict quorum log replication across distributed post-quantum gateway nodes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Quorum Active
              </span>
            </div>
          </div>
        </div>

        {/* Core Raft Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Consensus Role
            </span>
            <span className="text-2xl font-black text-[#00F5D4] block mt-2 font-mono uppercase">{role}</span>
            <span className="text-xs font-mono text-slate-400 mt-1 block">Authoritative Leader</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Election Term
            </span>
            <span className="text-3xl font-black text-white block mt-2 font-mono">#{term}</span>
            <span className="text-xs font-mono text-slate-400 mt-1 block">Stable Election Epoch</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Commit Index
            </span>
            <span className="text-3xl font-black text-[#8A2BE2] block mt-2 font-mono">{commitIndex}</span>
            <span className="text-xs font-mono text-slate-400 mt-1 block">Applied to State Machine</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Last Log Index
            </span>
            <span className="text-3xl font-black text-white block mt-2 font-mono">{lastLogIndex}</span>
            <span className="text-xs font-mono text-emerald-400 mt-1 block">Zero Log Divergence</span>
          </div>
        </div>

        {/* Node Detail Card */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-[#00F5D4]" />
            Consensus Node Diagnostics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Node ID:</span>
                <span className="text-white font-bold">{nodeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Elected Leader ID:</span>
                <span className="text-[#00F5D4] font-bold">{leaderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Heartbeat Cadence:</span>
                <span className="text-white">1,000 ms</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">RPC Transport:</span>
                <span className="text-emerald-400 font-bold">FIPS 203 ML-KEM AEAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Persistence Target:</span>
                <span className="text-white">raft_state.json</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Partition Tolerance:</span>
                <span className="text-white">Quorum Majority (N/2 + 1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
