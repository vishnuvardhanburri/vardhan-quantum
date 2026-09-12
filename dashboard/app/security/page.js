'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useSSE } from '@/lib/useApi';

export default function SecurityPage() {
  const [sseEvents, setSseEvents] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseEvents((prev) => {
      const next = [event, ...prev];
      return next.slice(0, 100);
    });
  }, []);
  const { connected } = useSSE(true, handleSSE);

  return (
    <DashboardLayout title="Security Operations">
      <div className="space-y-8">
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Security Posture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase">PQ Shield</span>
              <span className="text-2xl font-bold text-emerald-400 block mt-1">ACTIVE</span>
              <span className="text-[11px] text-slate-500 font-mono">FIPS 203 / ML-KEM-1024</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase">Signature</span>
              <span className="text-2xl font-bold text-emerald-400 block mt-1">VALID</span>
              <span className="text-[11px] text-slate-500 font-mono">FIPS 204 / ML-DSA-87</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase">Ledger</span>
              <span className="text-2xl font-bold text-[#00F5D4] block mt-1">SIGNED</span>
              <span className="text-[11px] text-slate-500 font-mono">BLAKE3 chained</span>
            </div>
          </div>
        </div>

        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Security Events (SSE: {connected ? 'LIVE' : 'DISCONNECTED'})
          </h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {sseEvents.filter(ev =>
              ev.event_type?.includes('Reject') ||
              ev.event_type?.includes('Failed')
            ).length === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono">No security events</p>
            ) : (
              sseEvents
                .filter(ev =>
                  ev.event_type?.includes('Reject') ||
                  ev.event_type?.includes('Failed')
                )
                .slice(0, 30)
                .map((ev, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-red-500/5 border border-red-500/20">
                    <span className="text-red-400 text-xs font-mono">{ev.event_type}</span>
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
