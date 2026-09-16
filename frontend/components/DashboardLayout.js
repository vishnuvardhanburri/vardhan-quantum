'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import { PersonaProvider, usePersona } from '@/components/PersonaContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { useClusterStatus, useRaftStatus, useMetrics } from '@/lib/useApi';
import { useSSE } from '@/lib/useSSE';
import { useAuth } from '@/components/AuthProvider';
import { Terminal, X } from 'lucide-react';

function TechnicalDiagnosticsHUD() {
  const { techMode, toggleTechMode } = usePersona();
  const { data: raftStatus } = useRaftStatus(2000);
  const { data: metrics } = useMetrics(2000);

  if (!techMode) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 lg:w-96 rounded-2xl bg-black/95 border border-[#00F5D4] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl font-mono text-xs text-[#00F5D4]">
      <div className="flex items-center justify-between border-b border-[#00F5D4]/30 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00F5D4]" />
          <span className="font-bold tracking-wider uppercase text-white">ENGINE TECHNICAL APERTURE</span>
        </div>
        <button
          onClick={toggleTechMode}
          className="p-1 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
        <div>
          <span className="text-slate-500 block">Raft Term:</span>
          <span className="text-white font-bold">#{raftStatus?.current_term ?? 1}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Consensus Role:</span>
          <span className="text-[#00F5D4] font-bold uppercase">{raftStatus?.role || 'LEADER'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Commit Index:</span>
          <span className="text-[#8A2BE2] font-bold">{raftStatus?.commit_index ?? 0}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Last Log Index:</span>
          <span className="text-white font-bold">{raftStatus?.last_log_index ?? 0}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Inbound Cipher:</span>
          <span className="text-white font-bold">ML-KEM-1024</span>
        </div>
        <div>
          <span className="text-slate-500 block">Digital Signature:</span>
          <span className="text-white font-bold">ML-DSA-87 (FIPS 204)</span>
        </div>
        <div>
          <span className="text-slate-500 block">Shannon Entropy:</span>
          <span className="text-emerald-400 font-bold">{metrics?.nonce_entropy ? metrics.nonce_entropy.toFixed(4) : '7.9992'} / 8.0</span>
        </div>
        <div>
          <span className="text-slate-500 block">Active AEAD Tx/Rx:</span>
          <span className="text-white font-bold">{metrics?.active_sessions ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

function DashboardLayoutInner({ children, title }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: clusterStatus, refetch: refetchCluster } = useClusterStatus();
  const [sseConnected, setSseConnected] = useState(false);
  const { isAuthenticated, isReady } = useAuth();

  const { connected } = useSSE(true, () => {});
  useEffect(() => {
    setSseConnected(connected);
  }, [connected]);

  useEffect(() => {
    if (isReady && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isReady, isAuthenticated, pathname, router]);

  const handleRefresh = () => {
    refetchCluster?.();
  };

  return (
    <div className="flex h-screen bg-[#05060A] text-white overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#05060A]">
        <TopBar
          title={title}
          clusterStatus={clusterStatus}
          sseConnected={sseConnected}
          onRefresh={handleRefresh}
        />
        <main className="flex-1 overflow-y-auto bg-grid-pattern bg-[#05060A] p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
      <TechnicalDiagnosticsHUD />
    </div>
  );
}

export function DashboardLayout({ children, title }) {
  return (
    <SidebarProvider>
      <PersonaProvider>
        <DashboardLayoutInner title={title}>{children}</DashboardLayoutInner>
      </PersonaProvider>
    </SidebarProvider>
  );
}
