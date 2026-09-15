'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchMetrics,
  fetchClusterStatus,
  fetchClusterPeers,
  fetchLedgerStatus,
  fetchRaftStatus,
  exportEvidence,
  drainNode,
  fetchPrometheusMetrics,
} from '@/lib/api';
import { useSSE } from '@/lib/useSSE';

// Re-export useSSE for convenient single-source imports
export { useSSE };

/**
 * Generic data-fetch hook with loading / error / empty states.
 */
export function useApi(fetchFn, deps = [], pollingIntervalMs = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();

    if (pollingIntervalMs) {
      const interval = setInterval(refetch, pollingIntervalMs);
      return () => clearInterval(interval);
    }
  }, [refetch, pollingIntervalMs]);

  return { data, loading, error, refetch };
}

/**
 * Convenience hooks for each backend endpoint.
 */
export const useMetrics = (interval) => useApi(fetchMetrics, [fetchMetrics], interval);
export const useClusterStatus = (interval) => useApi(fetchClusterStatus, [fetchClusterStatus], interval);
export const useClusterPeers = (interval) => useApi(fetchClusterPeers, [fetchClusterPeers], interval);
export const useLedgerStatus = (interval) => useApi(fetchLedgerStatus, [fetchLedgerStatus], interval);
export const useRaftStatus = (interval) => useApi(fetchRaftStatus, [fetchRaftStatus], interval);
export const usePrometheusMetrics = (interval) => useApi(fetchPrometheusMetrics, [fetchPrometheusMetrics], interval);

export async function exportEvidenceBundle() {
  return exportEvidence();
}

export async function drainNodeRequest() {
  return drainNode();
}
