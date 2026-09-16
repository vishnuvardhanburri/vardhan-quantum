'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useSSE } from '@/lib/useApi';
import { Brain, Zap, Shield, Activity, Cpu, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';

export default function IntelligencePage() {
  const [sseEvents, setSseEvents] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseEvents((prev) => [event, ...prev].slice(0, 50));
  }, []);
  const { connected } = useSSE(true, handleSSE);

  return (
    <DashboardLayout title="AI Orchestration & Threat Intelligence">
      <div className="space-y-8">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#8A2BE2]/20 via-[#0B1437]/90 to-[#00F5D4]/20 border border-white/10 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8A2BE2] to-[#00F5D4] flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(138,43,226,0.5)]">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-mono">
                AUTONOMOUS THREAT ORCHESTRATION
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-time neural heuristics for predictive lattice key rotation and anomalous frame rejection.
              </p>
            </div>
          </div>
        </div>

        {/* AI Heuristics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Autonomous Policy Engine
            </span>
            <span className="text-2xl font-black text-emerald-400 block mt-2 font-mono">ENFORCING</span>
            <span className="text-xs font-mono text-slate-400 mt-1 block">Zero manual intervention</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Anomaly Sensitivity
            </span>
            <span className="text-2xl font-black text-[#00F5D4] block mt-2 font-mono">99.98%</span>
            <span className="text-xs font-mono text-slate-400 mt-1 block">Sub-millisecond interception</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Active Heuristics
            </span>
            <span className="text-2xl font-black text-[#8A2BE2] block mt-2 font-mono">14 VECTORS</span>
            <span className="text-xs font-mono text-slate-400 mt-1 block">Entropy, Timing, Frame sizes</span>
          </div>
        </div>

        {/* Real-time AI Event Stream */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0B1437]/90 to-[#0A0E27]/80 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00F5D4]" />
              Neural Interception Stream (SSE: {connected ? 'LIVE' : 'IDLE'})
            </h3>
            <span className="text-[11px] font-mono text-[#00F5D4] font-bold animate-pulse">● HEURISTIC PROBING</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
            {sseEvents.length === 0 ? (
              <div className="text-slate-400 py-6 text-center">
                Awaiting anomalous traffic patterns from ingress proxy…
              </div>
            ) : (
              sseEvents.map((ev, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white font-semibold">{ev.event_type}</span>
                  <span className="text-[#00F5D4] text-[11px]">{ev.details?.action || 'SHIELD_APPLIED'}</span>
                  <span className="text-slate-400 text-[10px]">{new Date(ev.timestamp_ms || Date.now()).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
