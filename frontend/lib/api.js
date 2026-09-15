/**
 * Vardhan Quantum Dashboard — Typed API client.
 *
 * All communication with the backend goes through this client, which
 * forwards through the Next.js route handler proxy so the browser never
 * connects directly to PostgreSQL, Raft internals, filesystem, or
 * private keys.
 *
 * Authentication uses a Bearer token stored in memory (AuthContext).
 * On 401/403 the caller is expected to redirect to the login screen.
 */
import { config } from './config';

class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getToken() {
  // Token is user-supplied via the login screen and stored in memory only.
  // It is NEVER read from NEXT_PUBLIC_* env vars — those would be inlined
  // into the browser bundle and expose the secret.
  if (typeof window !== 'undefined' && window.__VARDHAN_ADMIN_TOKEN__) {
    return window.__VARDHAN_ADMIN_TOKEN__;
  }
  return null;
}

export function setAuthToken(token) {
  if (typeof window !== 'undefined') {
    window.__VARDHAN_ADMIN_TOKEN__ = token ? String(token) : '';
  }
}

export function getAuthToken() {
  return getToken();
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    window.__VARDHAN_ADMIN_TOKEN__ = '';
  }
}

export async function apiRequest(path, options = {}) {
  const url = `/api/admin${path}`;
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401 || response.status === 403) {
      throw new ApiError(response.status, 'Unauthorized', null);
    }

    if (!response.ok) {
      let data = null;
      try {
        data = await response.json();
      } catch (_) {
        data = await response.text();
      }
      throw new ApiError(response.status, `HTTP ${response.status}`, data);
    }

    // SSE/event-stream responses have no body to parse as JSON
    if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
      return response;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }
    return JSON.parse(text);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Typed fetchers for each backend endpoint ───────────────────────────────

export async function loginWithCredentials(username, password) {
  const data = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (data && data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function logoutSession() {
  try {
    await apiRequest('/api/v1/auth/logout', { method: 'POST' });
  } finally {
    clearAuthToken();
  }
}

export async function fetchSessionInfo() {
  const data = await apiRequest('/api/v1/auth/session');
  return data;
}

export async function fetchAdminProfile() {
  const data = await apiRequest('/api/v1/admin/profile');
  return data;
}

export async function updateAdminProfile(profile) {
  const data = await apiRequest('/api/v1/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
  return data;
}

export async function changeAdminPassword(passwordData) {
  const data = await apiRequest('/api/v1/admin/password', {
    method: 'POST',
    body: JSON.stringify(passwordData),
  });
  return data;
}

export async function fetchSettings() {
  const data = await apiRequest('/api/v1/settings');
  return data;
}

export async function updateSettings(settings) {
  const data = await apiRequest('/api/v1/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return data;
}

export async function fetchMetrics() {
  const data = await apiRequest('/api/v1/metrics');
  return data;
}

export async function fetchClusterPeers() {
  const data = await apiRequest('/api/v1/cluster/peers');
  return data;
}

export async function fetchClusterStatus() {
  const data = await apiRequest('/api/v1/cluster/status');
  return data;
}

export async function fetchLedgerStatus() {
  const data = await apiRequest('/api/v1/ledger/status');
  return data;
}

export async function fetchRaftStatus() {
  const data = await apiRequest('/api/v1/raft/status');
  return data;
}

export async function exportEvidence() {
  const data = await apiRequest('/api/v1/ledger/export', { method: 'GET' });
  return data;
}

export async function drainNode() {
  const data = await apiRequest('/api/v1/cluster/drain', { method: 'POST' });
  return data;
}

// ── Session Management (Priority 4.1 & 4.6) ───────────────────────────────

export async function fetchSessions() {
  return apiRequest('/api/v1/sessions');
}

export async function revokeSession(sessionId) {
  return apiRequest(`/api/v1/sessions/${encodeURIComponent(sessionId)}/revoke`, { method: 'POST' });
}

export async function flushSessions(confirm = false) {
  return apiRequest('/api/v1/sessions/flush', {
    method: 'POST',
    body: JSON.stringify({ confirm }),
  });
}

// ── API Key Management (Priority 4.2) ──────────────────────────────────────

export async function fetchApiKeys() {
  return apiRequest('/api/v1/admin/api-keys');
}

export async function createApiKey(name, expiresInDays) {
  return apiRequest('/api/v1/admin/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name, expires_in_days: expiresInDays || null }),
  });
}

export async function deleteApiKey(id) {
  return apiRequest(`/api/v1/admin/api-keys/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchPrometheusMetrics() {
  const text = await apiRequest('/metrics');
  return text;
}

// ── SSE ────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to the backend SSE event stream.
 * @param {(event: any) => void} onEvent — called for each SSE event
 * @param {(err: Error) => void} onError — called on connection errors
 * @param {() => void} onClose — called when the stream closes
 * @returns {{ close: () => void }} — call close() to unsubscribe
 */
export function subscribeEvents(onEvent, onError, onClose) {
  let reconnectDelay = config.sseReconnectMinDelayMs;
  let eventSource = null;

  const connect = () => {
    // We use the route-handler proxy which appends the auth token.
    const token = getToken();
    // EventSource doesn't support custom headers.
    // We pass the token via query string so the proxy can authenticate the request.
    const url = token
      ? `/api/admin/api/v1/events?token=${encodeURIComponent(token)}`
      : '/api/admin/api/v1/events';

    eventSource = new EventSource(url);

    eventSource.onmessage = (e) => {
      reconnectDelay = config.sseReconnectMinDelayMs;
      try {
        onEvent(JSON.parse(e.data));
      } catch (_) {
        onEvent(e.data);
      }
    };

    eventSource.onerror = (err) => {
      eventSource?.close();
      onError(err);
      // Bounded backoff reconnect
      reconnectDelay = Math.min(reconnectDelay * 1.5, config.sseReconnectMaxDelayMs);
      setTimeout(connect, reconnectDelay);
    };

    eventSource.addEventListener('close', onClose);
  };

  connect();

  return {
    close: () => {
      eventSource?.close();
      eventSource = null;
    },
  };
}
