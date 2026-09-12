'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchMetrics,
  fetchClusterStatus,
  fetchClusterPeers,
  fetchLedgerStatus,
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
export function useApi(fetchFn, deps = []) {
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
  }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * Convenience hooks for each backend endpoint.
 */
export const useMetrics = () => useApi(fetchMetrics, [fetchMetrics]);
export const useClusterStatus = () => useApi(fetchClusterStatus, [fetchClusterStatus]);
export const useClusterPeers = () => useApi(fetchClusterPeers, [fetchClusterPeers]);
export const useLedgerStatus = () => useApi(fetchLedgerStatus, [fetchLedgerStatus]);
export const usePrometheusMetrics = () => useApi(fetchPrometheusMetrics, [fetchPrometheusMetrics]);

export async function exportEvidenceBundle() {
  return exportEvidence();
}

export async function drainNodeRequest() {
  return drainNode();
}
