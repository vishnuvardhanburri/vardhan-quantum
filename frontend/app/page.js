'use client';

import React from 'react';
import { VisionSidebar } from '@/components/VisionSidebar';
import { DotGlobe } from '@/components/DotGlobe';
import {
  Wallet,
  FileText,
  Globe2,
  ShoppingCart,
  Search,
  User,
  Settings,
  Bell,
  Menu,
} from 'lucide-react';
import { useMetrics, useClusterStatus } from '@/lib/useApi';

export default function VisionProDefaultDashboard() {
  const { data: metrics } = useMetrics(3000);
  const { data: clusterStatus } = useClusterStatus(5000);

  // Live telemetry mapped cleanly to the Vision UI PRO view
  const moneyVal = metrics?.requests_per_sec ? `$${(metrics.requests_per_sec * 0.2).toFixed(0)}` : '$53,000';
  const clientsVal = metrics?.active_sessions ? `+${metrics.active_sessions}` : '+3,462';
  const usersVal = clusterStatus?.healthy_count ? `${clusterStatus.healthy_count * 1150}` : '2,300';
  const salesVal = metrics?.total_requests ? `$${(metrics.total_requests * 0.05).toFixed(0)}` : '$103,430';

  const countries = [
    { flag: '🇺🇸', name: 'United States', sales: '2500', value: '$230,900', bounce: '29.9%' },
    { flag: '🇩🇪', name: 'Germany', sales: '3.900', value: '$440,000', bounce: '40.22%' },
    { flag: '🇬🇧', name: 'Great Britain', sales: '1.400', value: '$190,700', bounce: '23.44%' },
    { flag: '🇧🇷', name: 'Brasil', sales: '562', value: '$143,960', bounce: '32.14%' },
  ];

  return (
    <div className="flex min-h-screen bg-[#070C27] text-white font-sans overflow-x-hidden selection:bg-[#0075FF]/30">
      {/* 1. Left Vision UI PRO Sidebar */}
      <VisionSidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-[#070C27]/80 backdrop-blur-xl z-30 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded-lg bg-white/5 text-slate-300">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#718096] font-medium">
                <span>🏠</span>
                <span>/</span>
                <span>Dashboards</span>
                <span>/</span>
                <span className="text-white">Default</span>
              </div>
              <h1 className="text-sm font-bold text-white tracking-wide mt-0.5">Default</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Type here..."
                className="w-44 lg:w-56 pl-9 pr-4 py-1.5 rounded-xl bg-[#0F1535] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0075FF] transition-all"
              />
            </div>

            {/* Sign in button */}
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
              <User className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>

            {/* Action icons */}
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#0075FF] absolute top-1 right-1" />
            </button>
          </div>
        </header>

        {/* Dashboard Main View */}
        <main className="flex-1 p-6 lg:p-8 relative">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
            General Statistics
          </h2>

          {/* Section: 2x2 Stat Cards on Left + Floating 3D Globe on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative mb-8">
            {/* Left 2x2 Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {/* Card 1: Today's Money */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#060B26]/90 to-[#0F1535]/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#8F9BBA]">Today's Money</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-white tracking-tight">{moneyVal}</span>
                    <span className="text-xs font-bold text-[#01B574]">+55%</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0075FF] flex items-center justify-center shadow-[0_4px_14px_rgba(0,117,255,0.4)]">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Card 2: New Clients */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#060B26]/90 to-[#0F1535]/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#8F9BBA]">New Clients</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-white tracking-tight">{clientsVal}</span>
                    <span className="text-xs font-bold text-[#EE5D50]">-2%</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0075FF] flex items-center justify-center shadow-[0_4px_14px_rgba(0,117,255,0.4)]">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Card 3: Today's Users */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#060B26]/90 to-[#0F1535]/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#8F9BBA]">Today's Users</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-white tracking-tight">{usersVal}</span>
                    <span className="text-xs font-bold text-[#01B574]">+3%</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0075FF] flex items-center justify-center shadow-[0_4px_14px_rgba(0,117,255,0.4)]">
                  <Globe2 className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Card 4: Sales */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#060B26]/90 to-[#0F1535]/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#8F9BBA]">Sales</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-white tracking-tight">{salesVal}</span>
                    <span className="text-xs font-bold text-[#01B574]">+5%</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0075FF] flex items-center justify-center shadow-[0_4px_14px_rgba(0,117,255,0.4)]">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Right: Interactive 3D Canvas Dotted Globe */}
            <div className="lg:col-span-5 h-[280px] lg:h-[340px] flex items-center justify-center relative overflow-visible">
              <DotGlobe className="w-full h-full" />
            </div>
          </div>

          {/* Bottom Row: Sales by Country + Sales Overview Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sales by Country Table */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-br from-[#060B26]/95 to-[#0F1535]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
              <h3 className="text-base font-bold text-white mb-5">Sales by Country</h3>
              <div className="space-y-4">
                {countries.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-3 w-40">
                      <span className="text-xl">{c.flag}</span>
                      <div>
                        <p className="text-[10px] text-[#8F9BBA] uppercase font-bold tracking-wider">Country:</p>
                        <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                      </div>
                    </div>

                    <div className="w-24 text-left">
                      <p className="text-[10px] text-[#8F9BBA] uppercase font-bold tracking-wider">Sales:</p>
                      <p className="text-xs font-semibold text-white">{c.sales}</p>
                    </div>

                    <div className="w-24 text-left">
                      <p className="text-[10px] text-[#8F9BBA] uppercase font-bold tracking-wider">Value:</p>
                      <p className="text-xs font-semibold text-white">{c.value}</p>
                    </div>

                    <div className="w-20 text-right">
                      <p className="text-[10px] text-[#8F9BBA] uppercase font-bold tracking-wider">Bounce:</p>
                      <p className="text-xs font-semibold text-white">{c.bounce}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Overview Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#060B26]/95 to-[#0F1535]/90 border border-white/10 backdrop-blur-xl shadow-2xl relative flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Sales Overview</h3>
                <p className="text-xs text-[#01B574] font-semibold mt-0.5">
                  +5% more <span className="text-slate-400 font-normal">in 2026</span>
                </p>
              </div>

              {/* Bar Chart Mock / Visual */}
              <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {[60, 45, 90, 30, 75, 40, 95, 65, 80].map((h, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      style={{ height: `${h}%` }}
                      className="w-full rounded-md bg-gradient-to-t from-[#0075FF]/30 to-[#0075FF] hover:to-[#00F5D4] transition-all"
                    />
                    <span className="text-[9px] text-[#8F9BBA]">{'M' + (idx + 1)}</span>
                  </div>
                ))}
              </div>

              {/* Floating Settings FAB button (like in screenshot) */}
              <div className="absolute bottom-5 right-5">
                <button className="w-10 h-10 rounded-xl bg-[#0075FF] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,117,255,0.5)] hover:scale-105 transition-transform">
                  <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
