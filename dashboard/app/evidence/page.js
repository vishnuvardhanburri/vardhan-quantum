'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useLedgerStatus, useSSE } from '@/lib/useApi';
import { FileText, Download, CheckCircle, XCircle, Clock, Copy } from 'lucide-react';
import { useState, useCallback } from 'react';

export default function EvidenceExplorerPage() {
  const { data: ledgerStatus, loading, error } = useLedgerStatus();
  const [exportResult, setExportResult] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);

  const [sseEvents, setSseEvents] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseEvents((prev) => {
      const next = [event, ...prev];
      return next.slice(0, 100);
    });
  }, []);
  const { connected } = useSSE(true, handleSSE);

  const handleExport = async () => {
    setExportLoading(true);
    setExportError(null);
    try {
      const result = await exportEvidenceBundle();
      setExportResult(result);
    } catch (err) {
      setExportError(err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const statusConfig = {
    configured: ledgerStatus?.configured,
    entryCount: ledgerStatus?.entry_count_estimate ?? 0,
    message: ledgerStatus?.message || '',
    filePath: ledgerStatus?.ledger_file,
  };

  const getVerificationStatus = () => {
    if (!ledgerStatus?.configured) return { label: 'Not Configured', color: 'text-tertiary', icon: Clock };
    if (statusConfig.entryCount > 0) return { label: 'Verified', color: 'text-emerald-400', icon: CheckCircle };
    return { label: 'Pending', color: 'text-amber-400', icon: Clock };
  };

  const vStatus = getVerificationStatus();
  const VIcon = vStatus.icon;

  return (
    <DashboardLayout title="Evidence Explorer">
      <div className="space-y-8">
        {/* Ledger Status */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Audit Ledger Status
          </h2>
          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : error ? (
            <p className="text-sm text-red-400">Error: {error.message}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Status</span>
                <span className={`flex items-center gap-2 mt-1 text-lg font-bold ${vStatus.color}`}>
                  <VIcon className="w-5 h-5" />
                  {vStatus.label}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Entries</span>
                <span className="text-2xl font-bold text-white block mt-1">
                  {statusConfig.entryCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Cryptography</span>
                <span className="text-sm text-slate-300 block mt-1">
                  ML-DSA-87 signatures, BLAKE3 chain
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Ledger File</span>
                <span className="text-xs text-slate-400 break-all mt-1 font-mono">
                  {statusConfig.filePath || 'Not configured'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Evidence Bundle Export */}
        <div className="panel rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Evidence Bundle Export
            </h2>
            <button
              onClick={handleExport}
              disabled={exportLoading || !ledgerStatus?.configured}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-lg bg-white/5 border border-white/10 hover:border-[#00F5D4]/50 hover:bg-[#00F5D4]/10 hover:text-[#00F5D4] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Download className="w-3.5 h-3.5 text-[#00F5D4]" />
              {exportLoading ? 'EXPORTING…' : 'EXPORT BUNDLE'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mb-3">
            Export includes: ledger.jsonl, public_key.hex, schema.json, manifest.json, INSTRUCTIONS.md
            <br />
            Manifest is ML-DSA-87 signed over BLAKE3(timestamp || entry_count || tip_hash).
          </p>

          {exportError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono mb-4">
              <XCircle className="w-4 h-4" />
              Export failed: {exportError}
            </div>
          )}

          {exportResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Exported</span>
                <span className="text-sm text-white block">{exportResult.exported ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Entry Count</span>
                <span className="text-sm text-white block">{exportResult.entry_count}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Tip Hash</span>
                <span className="text-xs text-slate-300 break-all font-mono">{exportResult.tip_hash}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Export Dir</span>
                <span className="text-xs text-slate-400 break-all font-mono">{exportResult.export_dir}</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Events Feed */}
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">
            Ledger Events (SSE: {connected ? 'LIVE' : 'DISCONNECTED'})
          </h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {sseEvents.length === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono">No ledger events received yet</p>
            ) : (
              sseEvents.map((ev, i) => (
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
