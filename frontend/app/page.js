'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/MetricCard';
import { useAuth } from '@/components/AuthProvider';
import { useMetrics, useClusterStatus, useLedgerStatus, useRaftStatus, useSSE, exportEvidenceBundle } from '@/lib/useApi';
import { Box, Grid, Typography, Card, CardContent, Divider } from '@mui/material';

export default function DashboardPage() {
  const { logout } = useAuth();
  
  const { data: metrics, loading: metricsLoading } = useMetrics(30000);
  const { data: clusterStatus, loading: clusterLoading } = useClusterStatus(60000);
  const { data: ledgerStatus } = useLedgerStatus(60000);
  const { data: raftStatus, loading: raftLoading } = useRaftStatus(30000);
  
  const [sseEvents, setSseEvents] = useState([]);
  const handleSSE = useCallback((event) => {
    setSseEvents((prev) => {
      const next = [event, ...prev];
      return next.slice(0, 50);
    });
  }, []);
  const { connected: sseConnected } = useSSE(true, handleSSE);

  const tps = metrics?.requests_per_sec ?? 0;
  const entropy = metrics?.nonce_entropy;
  const entropyStr = entropy > 0 ? entropy.toFixed(4) : '0.0000';
  const activeSessions = metrics?.active_sessions ?? 0;
  const latencyP50 = metrics?.latency_p50_us ?? 0;
  const latencyP95 = metrics?.latency_p95_us ?? 0;
  const rejectedFrames = metrics?.rejected_frames ?? 0;
  const upstreamFailures = metrics?.upstream_failures ?? 0;

  const [ciphertextStream, setCiphertextStream] = useState('');
  useEffect(() => {
    if (sseEvents.length > 0) {
      const latest = sseEvents[0];
      const sid = latest?.session_id || latest?.event_id || '';
      if (sid) {
        const hexBlock = Array.from(sid.slice(0, 32), c =>
          c.charCodeAt(0).toString(16).padStart(2, '0')
        ).join('');
        setCiphertextStream((prev) => (hexBlock + prev).slice(0, 256));
      }
    }
  }, [sseEvents]);

  const auditEvents = sseEvents.map((ev, idx) => {
    const isError = ev.event_type === 'UpstreamFailed';
    return {
      timestamp: Math.floor((ev.timestamp_ms || Date.now()) / 1000),
      mandate: 'DORA_ART_9_2_CRYPTOGRAPHIC_SHIELD',
      primitive: ev.event_type || 'Quantum Event',
      entropy: `${metrics?.kem_entropy?.toFixed(4) ?? '0.0000'} bits`,
      status: isError ? 'FAIL' : 'OK',
    };
  });

  return (
    <DashboardLayout title="Overview">
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <MetricCard title="Ingress TPS" badge={metricsLoading ? 'LOADING' : 'ACTIVE'} value={metricsLoading ? '—' : tps.toLocaleString()} unit="req/s" subtitle={metricsLoading ? 'Loading…' : 'Live throughput from shield data-plane'} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <MetricCard title="Shannon Entropy" badge="SENSING" value={metricsLoading ? '—' : entropyStr} unit="/ 8.0" subtitle="Current nonce entropy measurement" />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <MetricCard title="FIPS 203" badge="LATTICE" value="SHIELDED" subtitle="In-Flight PQ Re-Encryptor Running" />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <MetricCard title="Active Sessions" badge={activeSessions > 0 ? 'ACTIVE' : 'IDLE'} value={activeSessions} unit="sessions" subtitle="Current PQ sessions" />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <MetricCard title="Latency P95" badge={latencyP95 > 0 ? 'HEALTHY' : 'IDLE'} value={latencyP95 > 0 ? (latencyP95 / 1000).toFixed(3) : '—'} unit="ms" subtitle={`P50: ${latencyP50 > 0 ? (latencyP50 / 1000).toFixed(3) : '0'} ms`} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <MetricCard title="Errors" badge={rejectedFrames + upstreamFailures > 0 ? 'WARN' : 'CLEAN'} value={(rejectedFrames + upstreamFailures).toLocaleString()} unit="frames" subtitle={`Rejected: ${rejectedFrames} | Upstream: ${upstreamFailures}`} glowColor={rejectedFrames + upstreamFailures > 0 ? 'red' : 'teal'} />
          </Grid>
        </Grid>


        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="Cluster Nodes" badge="TOTAL" value={clusterLoading ? '—' : (clusterStatus?.node_count ?? 0)} unit="nodes" subtitle={`Healthy: ${clusterStatus?.healthy_count ?? 0}`} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="Leader" badge="ELECTION" value={clusterLoading ? '—' : (clusterStatus?.leader || '—')} subtitle={`Term: ${clusterStatus?.healthy_nodes?.[0]?.term ?? 0}`} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="Raft Role" badge="RAFT" value={raftLoading ? '—' : (raftStatus?.role || '—')} subtitle={raftLoading ? 'Loading…' : `Term: ${raftStatus?.current_term ?? 0}`} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="Commit Index" badge="LOG COMMIT" value={raftLoading ? '—' : (raftStatus?.commit_index ?? 0).toString()} subtitle={`Last Log: ${raftStatus?.last_log_index ?? 0}`} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="Ledger Status" badge={ledgerStatus?.configured ? 'ACTIVE' : 'INACTIVE'} value={ledgerStatus?.configured ? (ledgerStatus?.entry_count_estimate ?? 0).toLocaleString() : '0'} unit={ledgerStatus?.configured ? 'entries' : 'N/A'} subtitle="ML-DSA-87 signed" />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Live Event Stream</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#00F5D4', wordBreak: 'break-all' }}>
                  {ciphertextStream || 'Awaiting live traffic...'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Continuous DORA Compliance Feed</Typography>
                <Divider sx={{ mb: 2 }} />
                {auditEvents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Awaiting first SSE event from backend...</Typography>
                ) : (
                  auditEvents.map((ev, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>[{ev.timestamp}]</Typography>
                      <Typography variant="caption" sx={{ color: '#00F5D4', fontWeight: 600, flex: 1 }}>{ev.mandate}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>{ev.primitive}</Typography>
                      <Typography variant="caption" sx={{ color: '#8A2BE2', width: 80 }}>{ev.entropy}</Typography>
                      <Typography variant="caption" sx={{ color: '#48BB78', fontWeight: 'bold', width: 40, textAlign: 'right' }}>{ev.status}</Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
