'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Shield, Users, Clock, Globe } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSSE } from '@/lib/useApi';

// Session data is currently not exposed via a dedicated backend endpoint.
// We show live SSE connection events as a proxy for session activity.
// When a /api/v1/sessions endpoint is added, wire it here.

const placeholderSessions = [
  {
    id: 'session-001',
    user: 'admin',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Control Plane)',
    started: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    status: 'active',
  },
];

export default function SessionsPage() {
  const [sessions, setSessions] = useState(placeholderSessions);
  const [sseEvents, setSseEvents] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseEvents((prev) => {
      const next = [event, ...prev];
      return next.slice(0, 100);
    });
  }, []);
  const { connected } = useSSE(true, handleSSE);

  // Derive sessions from SSE events (each HandshakeCompleted starts a session)
  useEffect(() => {
    const newSessions = sseEvents
      .filter((ev) => ev.event_type === 'HandshakeCompleted')
      .map((ev) => ({
        id: ev.session_id || ev.event_id,
        user: 'quantum-client',
        ip: 'remote',
        userAgent: ev.event_type,
        started: new Date(ev.timestamp_ms || 0).toISOString(),
        lastSeen: new Date(ev.timestamp_ms || 0).toISOString(),
        status: ev.event_type === 'SessionClosed' ? 'closed' : 'active',
      }));
    setSessions([...newSessions, ...placeholderSessions]);
  }, [sseEvents]);

  return (
    <DashboardLayout title="Login Activity & Active Sessions">
      <div className="space-y-8">
        {/* Status banner — sessions API not yet exposed by backend */}
        <div className="panel rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-mono">
              Session data is derived from SSE events. A dedicated /api/v1/sessions
              endpoint will provide structured session data when available.
            </span>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="panel rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Active Sessions ({sessions.filter(s => s.status === 'active').length})
            </h2>
            <span className={`text-[10px] font-mono ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
              SSE: {connected ? 'LIVE' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-panel text-slate-500">
                  <th className="text-left py-2">Session ID</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">IP</th>
                  <th className="text-left py-2">Started</th>
                  <th className="text-left py-2">Last Seen</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2 text-[#00F5D4] break-all">{s.id}</td>
                    <td className="py-2 text-slate-300">{s.user}</td>
                    <td className="py-2 text-slate-400">{s.ip}</td>
                    <td className="py-2 text-slate-500">{new Date(s.started).toLocaleString()}</td>
                    <td className="py-2 text-slate-500">{new Date(s.lastSeen).toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${
                        s.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Events */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Event Feed
          </h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {sseEvents.length === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono">No events received yet</p>
            ) : (
              sseEvents.slice(0, 30).map((ev, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-slate-300 text-xs font-mono">{ev.event_type || 'event'}</span>
                  <span className="text-slate-500 text-[10px]">{new Date(ev.timestamp_ms || 0).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
