'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Server,
  Activity,
  FileCheck,
  Cpu,
  Network,
  Lock,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

export function VisionSidebar() {
  const pathname = usePathname();
  const [modulesOpen, setModulesOpen] = useState(true);

  const securityModules = [
    { label: 'Security Posture', href: '/security' },
    { label: 'Infrastructure Nodes', href: '/infrastructure' },
    { label: 'Raft Consensus', href: '/consensus' },
    { label: 'Wire Network & AEAD', href: '/network' },
    { label: 'Telemetry & P95', href: '/reliability' },
    { label: 'Evidence & Merkle Log', href: '/evidence' },
    { label: 'AI Intelligence', href: '/intelligence' },
    { label: 'Admin & API Keys', href: '/admin' },
  ];

  return (
    <aside className="w-[260px] shrink-0 h-screen sticky top-0 flex flex-col p-4 bg-[#060B26]/95 border-r border-white/10 select-none overflow-y-auto font-sans z-40 backdrop-blur-xl">
      {/* Vardhan Quantum Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0075FF] via-[#00F5D4] to-[#8A2BE2] flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(0,245,212,0.4)] text-sm tracking-wider">
            V
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] absolute -top-0.5 -right-0.5 shadow-[0_0_8px_#00F5D4] ring-2 ring-[#060B26]" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold tracking-wider text-xs text-white">
            VARDHAN <span className="text-[#00F5D4]">QUANTUM</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 font-medium">
            FIPS 203 / 204 DEFENSE
          </span>
        </div>
      </div>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {/* Main Dashboard Link */}
        <Link
          href="/"
          className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all font-medium text-xs ${
            pathname === '/'
              ? 'bg-[#0075FF] text-white shadow-[0_10px_20px_rgba(0,117,255,0.35)]'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-wide">Command Center</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-white/70" />
        </Link>

        {/* Section Label: QUANTUM CORE */}
        <div className="pt-4 pb-2 px-3 text-[10px] font-bold tracking-widest text-[#718096] uppercase">
          CORE ASSURANCE
        </div>

        {/* Expandable Core Modules */}
        <div>
          <button
            onClick={() => setModulesOpen(!modulesOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#0F1535] border border-white/5 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-[#00F5D4]" />
              </div>
              <span className="font-semibold">Security Modules</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                modulesOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {modulesOpen && (
            <div className="ml-7 mt-1.5 pl-3 border-l border-white/10 space-y-1">
              {securityModules.map((sub, idx) => {
                const isActive = pathname === sub.href;
                return (
                  <Link
                    key={idx}
                    href={sub.href}
                    className={`flex items-center gap-3 py-1.5 px-2 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-[#8F9BBA] hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]' : 'bg-[#4A5568]'
                      }`}
                    />
                    <span>{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Secondary Navigation */}
        <Link
          href="/infrastructure"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0F1535] border border-white/5 flex items-center justify-center">
              <Server className="w-3.5 h-3.5 text-[#0075FF]" />
            </div>
            <span>Cluster Mesh</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        <Link
          href="/consensus"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0F1535] border border-white/5 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-[#A855F7]" />
            </div>
            <span>Raft Consensus</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        <Link
          href="/admin"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0F1535] border border-white/5 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-[#00F5D4]" />
            </div>
            <span>Identity & Access</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </Link>
      </nav>

      {/* Vardhan Quantum Defense Assurance Card */}
      <div className="mt-4 p-4 rounded-2xl relative overflow-hidden bg-gradient-to-br from-[#0075FF]/30 via-[#0F1535] to-[#1F2666]/90 border border-[#00F5D4]/20 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="w-7 h-7 rounded-lg bg-[#00F5D4]/20 border border-[#00F5D4]/40 flex items-center justify-center mb-2.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#00F5D4]" />
        </div>
        <h4 className="text-white text-xs font-bold mb-0.5">Post-Quantum Active</h4>
        <p className="text-[11px] text-[#8F9BBA] font-mono leading-tight">
          FIPS 203 ML-KEM-1024 <br/>FIPS 204 ML-DSA-87
        </p>
      </div>
    </aside>
  );
}
