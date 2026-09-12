'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { useClusterStatus } from '@/lib/useApi';
import { useSSE } from '@/lib/useSSE';

function DashboardLayoutInner({ children, title }) {
  const { setMobileOpen } = useSidebar();
  const { data: clusterStatus, refetch: refetchCluster } = useClusterStatus();
  const [sseConnected, setSseConnected] = useState(false);

  const { connected } = useSSE(true, () => {});
  useEffect(() => {
    setSseConnected(connected);
  }, [connected]);

  const handleRefresh = () => {
    refetchCluster();
  };

  return (
    <div className="flex h-screen bg-bg-space overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={title}
          clusterStatus={clusterStatus}
          sseConnected={sseConnected}
          onRefresh={handleRefresh}
        />
        <main className="flex-1 overflow-y-auto bg-bg-space">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children, title }) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner title={title}>{children}</DashboardLayoutInner>
    </SidebarProvider>
  );
}
