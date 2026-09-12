'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useSSE } from '@/lib/useApi';
import { Brain, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useState, useCallback } from 'react';

// AI Decisions are NOT yet produced by the backend. This page renders the UI
// structure cleanly and explicitly marks data as unavailable.
// When the orchestration_ai backend module produces a real endpoint, wire it here.

const placeholderDecisions = [];

export default function AiDecisionsPage() {
  const [decisions] = useState(placeholderDecisions);
  const [sseEvents, setSseEvents] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseEvents((prev) => {
      const next = [event, ...prev];
      return next.slice(0, 50);
    });
  }, []);
  const { connected } = useSSE(true, handleSSE);

  return (
    <DashboardLayout title="AI Decisions">
      <div className="space-y-8">
        {/* Status Banner */}
        <div className="panel rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-mono">
              AI decision data is not yet available from the backend (orchestration_ai module).
              This view will populate when the backend exposes /api/v1/ai/decisions.
            </span>
          </div>
        </div>

        {/* Decisions Table */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Operational Decisions ({decisions.length} shown)
          </h2>

          {decisions.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-mono">
                No AI decisions available. The orchestration_ai backend module
                will populate this table once integrated.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-panel text-slate-500">
                    <th className="text-left py-2">Decision ID</th>
                    <th className="text-left py-2">Reason</th>
                    <th className="text-left py-2">Confidence</th>
                    <th className="text-left py-2">Component</th>
                    <th className="text-left py-2">Action</th>
                    <th className="text-left py-2">Timestamp</th>
                    <th className="text-left py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((d) => (
                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2 text-[#00F5D4]">{d.id}</td>
                      <td className="py-2 text-slate-400">{d.reason}</td>
                      <td className="py-2">
                        <span className={`font-bold ${
                          d.confidence > 0.9 ? 'text-emerald-400' :
                          d.confidence > 0.7 ? 'text-amber-400' :
                          'text-red-400'
                        }`}>{d.confidence.toFixed(0)}%</span>
                      </td>
                      <td className="py-2 text-slate-400">{d.component}</td>
                      <td className="py-2 text-slate-300">{d.action}</td>
                      <td className="py-2 text-slate-500">{d.timestamp}</td>
                      <td className="py-2">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          {d.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SSE Feed */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Live Events (SSE: {connected ? 'LIVE' : 'DISCONNECTED'})
          </h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {sseEvents.length === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono">No events received</p>
            ) : (
              sseEvents.slice(0, 20).map((ev, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-slate-300 text-xs font-mono">{ev.event_type || 'event'}</span>
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
