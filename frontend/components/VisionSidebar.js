'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Layers,
  ShoppingCart,
  Lock,
  ChevronDown,
  Star,
  Globe2,
} from 'lucide-react';

export function VisionSidebar() {
  const pathname = usePathname();
  const [pagesOpen, setPagesOpen] = useState(true);

  const subPages = [
    { label: 'Profile', href: '/admin' },
    { label: 'Users', href: '/admin' },
    { label: 'Account', href: '/admin' },
    { label: 'Projects', href: '/infrastructure' },
    { label: 'Pricing Page', href: '/evidence' },
    { label: 'RTL', href: '/consensus' },
    { label: 'Widgets', href: '/reliability' },
    { label: 'Charts', href: '/network' },
    { label: 'Alerts', href: '/security' },
  ];

  return (
    <aside className="w-[250px] shrink-0 h-screen sticky top-0 flex flex-col p-4 bg-[#060B26]/90 border-r border-white/10 select-none overflow-y-auto font-sans z-40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0075FF] to-[#00F5D4] flex items-center justify-center font-bold text-white shadow-lg text-sm tracking-wider">
          S
        </div>
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-xs text-white">
          <span>VISION UI PRO</span>
        </div>
      </div>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {/* Main Dashboard Link */}
        <Link
          href="/"
          className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#0075FF] text-white shadow-[0_10px_20px_rgba(0,117,255,0.3)] transition-all font-medium text-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span>Dashboards</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-white/70" />
        </Link>

        {/* Section Label: PAGES */}
        <div className="pt-4 pb-2 px-3 text-[10px] font-bold tracking-widest text-[#718096] uppercase">
          PAGES
        </div>

        {/* Pages Expandable */}
        <div>
          <button
            onClick={() => setPagesOpen(!pagesOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#0F1535] border border-white/5 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-[#0075FF]" />
              </div>
              <span>Pages</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                pagesOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {pagesOpen && (
            <div className="ml-7 mt-1.5 pl-3 border-l border-white/10 space-y-1">
              {subPages.map((sub, idx) => {
                const isActive = pathname === sub.href && sub.label === 'Profile';
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
                        isActive ? 'bg-[#0075FF] shadow-[0_0_8px_#0075FF]' : 'bg-[#4A5568]'
                      }`}
                    />
                    <span>{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Other Sections */}
        <Link
          href="/infrastructure"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0F1535] border border-white/5 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-[#0075FF]" />
            </div>
            <span>Applications</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        <Link
          href="/reliability"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0F1535] border border-white/5 flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 text-[#0075FF]" />
            </div>
            <span>Ecommerce</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        <Link
          href="/admin"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0F1535] border border-white/5 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-[#0075FF]" />
            </div>
            <span>Authentication</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </Link>
      </nav>

      {/* Need Help? Bottom Card */}
      <div className="mt-4 p-4 rounded-2xl relative overflow-hidden bg-gradient-to-br from-[#0075FF] via-[#0F1535] to-[#1F2666] border border-white/10 shadow-lg">
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center mb-3 shadow-md">
          <Star className="w-4 h-4 text-[#0075FF] fill-[#0075FF]" />
        </div>
        <h4 className="text-white text-xs font-bold mb-0.5">Need help?</h4>
        <p className="text-[11px] text-slate-300 font-normal">Please check our docs</p>
      </div>
    </aside>
  );
}
