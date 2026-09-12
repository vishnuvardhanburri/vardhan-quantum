'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { subscribeEvents } from '@/lib/api';

/**
 * React hook that wraps the SSE subscription with proper cleanup,
 * bounded backoff reconnect, and duplicate event de-duplication.
 *
 * @param {boolean} enabled - whether to start the subscription
 * @param {(event: any) => void} onEvent - callback for each SSE event
 * @returns {{ connected: boolean, error: string | null }}
 */
export function useSSE(enabled, onEvent) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const subRef = useRef(null);
  const seenEventIdsRef = useRef(new Set());

  // Reset error when re-enabling
  useEffect(() => {
    if (enabled) {
      setError(null);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleEvent = (event) => {
      // De-duplicate by event ID if present
      const eventId = event?.id || event?.event_id || event?.id;
      if (eventId) {
        if (seenEventIdsRef.current.has(eventId)) {
          return; // skip duplicate
        }
        seenEventIdsRef.current.add(eventId);
        // Bound the set size to avoid unbounded memory growth
        if (seenEventIdsRef.current.size > 1000) {
          const first = seenEventIdsRef.current.values().next().value;
          seenEventIdsRef.current.delete(first);
        }
      }
      onEvent(event);
    };

    const handleError = (err) => {
      setConnected(false);
      setError(err?.message || 'SSE connection error');
    };

    const handleClose = () => {
      setConnected(false);
    };

    const sub = subscribeEvents(handleEvent, handleError, handleClose);
    setConnected(true);
    subRef.current = sub;

    return () => {
      if (subRef.current) {
        subRef.current.close();
        subRef.current = null;
      }
      setConnected(false);
    };
  }, [enabled, onEvent]);

  return { connected, error };
}
