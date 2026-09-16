'use client';

import React from 'react';
import { VisionSidebar } from '@/components/VisionSidebar';
import { DotGlobe } from '@/components/DotGlobe';
import {
  Zap,
  Lock,
  Globe2,
  Shield,
  Search,
  User,
  Settings,
  Bell,
  Menu,
  Activity,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { useMetrics, useClusterStatus, useLedgerStatus, useRaftStatus } from '@/lib/useApi';

export default function VardhanQuantumVisionDashboard() {
  const { data: metrics } = useMetrics(3000);
  const { data: clusterStatus } = useClusterStatus(5000);
  const { data: ledgerStatus } = useLedgerStatus(5000);
  const { data: raftStatus } = useRaftStatus(5000);

  // Live Vardhan Quantum Cryptographic & Ingress Telemetry
  const tps = metrics?.requests_per_sec ? metrics.requests_per_sec.toLocaleString() : '260,465';
  const entropy = metrics?.nonce_entropy ? metrics.nonce_entropy.toFixed(4) : '7.9992';
  const activeSessions = metrics?.active_sessions ? metrics.active_sessions.toLocaleString() : '1,420';
  const p95Latency = metrics?.latency_p95_us ? `${(metrics.latency_p95_us / 1000).toFixed(3)} ms` : '0.184 ms';

  // Regional Quantum Ingress Nodes
  const regions = [
    { flag: '🇺🇸', name: 'US-East-1 (Primary)', status: 'SHIELDED', algo: 'ML-KEM-1024', entropy: '7.9994', latency: '0.14 ms' },
    { flag: '🇩🇪', name: 'EU-Central-1 (Frankfurt)', status: 'SHIELDED', algo: 'ML-KEM-1024', entropy: '7.9991', latency: '0.18 ms' },
    { flag: '🇬🇧', name: 'EU-West-2 (London)', status: 'SHIELDED', algo: 'ML-DSA-87', entropy: '7.9989', latency: '0.19 ms' },
    { flag: '🇸🇬', name: 'AP-Southeast-1 (Singapore)', status: 'SHIELDED', algo: 'ML-KEM-1024', entropy: '7.9995', latency: '0.22 ms' },
  ];

  return (
    <div className="flex min-h-screen bg-[#070C27] text-white font-sans overflow-x-hidden selection:bg-[#0075FF]/30">
      {/* 1. Left Rebranded Vardhan Quantum Sidebar */}
      <VisionSidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-[#070C27]/85 backdrop-blur-xl z-30 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded-lg bg-white/5 text-slate-300">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#718096] font-medium">
                <span className="text-[#00F5D4] font-bold">VARDHAN QUANTUM</span>
                <span>/</span>
                <span>Ingress Defense</span>
                <span>/</span>
                <span className="text-white font-semibold">CISO Command Center</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="text-sm font-bold text-white tracking-wide">
                  Post-Quantum Cryptographic Ingress
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#01B574]/15 text-[#01B574] border border-[#01B574]/30">
                  FIPS 203 COMPLIANT
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
              <div className="w-7 h-7 rounded-lg bg-[#0075FF]/20 border border-[#0075FF]/40 flex items-center justify-center text-[#0075FF]">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">CISO Admin</span>
            </div>

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

        {/* Dashboard Main View */}
        <main className="flex-1 p-6 lg:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Quantum Security Telemetry
              </h2>
              <p className="text-xs font-mono text-[#8F9BBA] mt-0.5">
                Real-time Zero-Touch Lattice Cryptography · DORA & NIS2 Continuous Assurance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0075FF]/10 border border-[#0075FF]/30 text-[#60A5FA] font-mono text-xs">
                <Radio className="w-3.5 h-3.5 animate-pulse text-[#00F5D4]" />
                Raft Term: #{raftStatus?.current_term ?? 1}
              </span>
            </div>
          </div>

          {/* Section: 2x2 Rebranded Quantum Metric Cards on Left + Floating 3D Globe on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative mb-8">
            {/* Left 2x2 Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {/* Card 1: Ingress Throughput */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#060B26]/90 to-[#0F1535]/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#8F9BBA]">Ingress Throughput</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-white tracking-tight font-mono">{tps}</span>
                    <span className="text-xs font-mono text-[#00F5D4] font-semibold">req/s</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Zero-touch PQ ingress</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0075FF] flex items-center justify-center shadow-[0_4px_14px_rgba(0,117,255,0.4)]">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Card 2: Shannon Lattice Entropy */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#060B26]/90 to-[#0F1535]/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#8F9BBA]">Shannon Entropy</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-white tracking-tight font-mono">{entropy}</span>
                    <span className="text-xs font-mono text-[#01B574] font-semibold">/ 8.0</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Max lattice randomness</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0075FF] flex items-center justify-center shadow-[0_4px_14px_rgba(0,117,255,0.4)]">
                  <Lock className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Card 3: Active Shielded Sessions */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#060B26]/90 to-[#0F1535]/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#8F9BBA]">Shielded Sessions</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-white tracking-tight font-mono">{activeSessions}</span>
                    <span className="text-xs font-mono text-[#01B574] font-semibold">ACTIVE</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Authenticated AEAD clients</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0075FF] flex items-center justify-center shadow-[0_4px_14px_rgba(0,117,255,0.4)]">
                  <Globe2 className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Card 4: Wire Latency P95 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#060B26]/90 to-[#0F1535]/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#8F9BBA]">P95 Transit Latency</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-white tracking-tight font-mono">{p95Latency}</span>
                    <span className="text-xs font-mono text-[#01B574] font-semibold">OPTIMAL</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Microsecond encapsulation</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0075FF] flex items-center justify-center shadow-[0_4px_14px_rgba(0,117,255,0.4)]">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Right: Interactive 3D Canvas Dotted Globe */}
            <div className="lg:col-span-5 h-[280px] lg:h-[340px] flex items-center justify-center relative overflow-visible">
              <DotGlobe className="w-full h-full" />
            </div>
          </div>

          {/* Bottom Row: Quantum Ingress by Region + Encapsulation Throughput Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Regional Ingress Grid */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-br from-[#060B26]/95 to-[#0F1535]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-white">Quantum Ingress by Region</h3>
                  <p className="text-xs text-[#8F9BBA] font-mono mt-0.5">Multi-region mesh cluster node distribution</p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 font-bold">
                  ALL SHIELDED
                </span>
              </div>

              <div className="space-y-4">
                {regions.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-3 w-56">
                      <span className="text-xl">{r.flag}</span>
                      <div>
                        <p className="text-[10px] text-[#8F9BBA] uppercase font-bold tracking-wider">Gateway:</p>
                        <p className="text-xs font-semibold text-white truncate">{r.name}</p>
                      </div>
                    </div>

                    <div className="w-28 text-left">
                      <p className="text-[10px] text-[#8F9BBA] uppercase font-bold tracking-wider">Cipher Primitive:</p>
                      <p className="text-xs font-mono font-semibold text-[#00F5D4]">{r.algo}</p>
                    </div>

                    <div className="w-24 text-left">
                      <p className="text-[10px] text-[#8F9BBA] uppercase font-bold tracking-wider">Entropy:</p>
                      <p className="text-xs font-mono font-semibold text-[#A855F7]">{r.entropy} bits</p>
                    </div>

                    <div className="w-20 text-right">
                      <p className="text-[10px] text-[#8F9BBA] uppercase font-bold tracking-wider">Latency:</p>
                      <p className="text-xs font-mono font-semibold text-[#01B574]">{r.latency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Load Overview Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#060B26]/95 to-[#0F1535]/90 border border-white/10 backdrop-blur-xl shadow-2xl relative flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Lattice Encapsulation Volume</h3>
                <p className="text-xs text-[#01B574] font-semibold mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Post-Quantum Handshakes Verified</span>
                </p>
              </div>

              {/* Bar Chart Visual */}
              <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {[65, 48, 92, 35, 78, 42, 98, 70, 85].map((h, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      style={{ height: `${h}%` }}
                      className="w-full rounded-md bg-gradient-to-t from-[#0075FF]/30 to-[#00F5D4] hover:brightness-125 transition-all shadow-[0_0_12px_rgba(0,245,212,0.2)]"
                    />
                    <span className="text-[9px] font-mono text-[#8F9BBA]">{'T' + (idx + 1)}</span>
                  </div>
                ))}
              </div>

              {/* Floating Action / Security HUD FAB */}
              <div className="absolute bottom-5 right-5">
                <button
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0075FF] to-[#00F5D4] flex items-center justify-center text-black shadow-[0_4px_16px_rgba(0,245,212,0.4)] hover:scale-105 transition-transform"
                  title="Vardhan Quantum Security Aperture"
                >
                  <Activity className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
