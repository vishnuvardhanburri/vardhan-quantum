/**
 * Vardhan Quantum Dashboard — Runtime configuration.
 *
 * IMPORTANT: The browser must never know the backend URL or admin token.
 * The frontend only talks to the Next.js route-handler proxy at /api/admin/*.
 * The proxy (server-side) reads VARDHAN_BACKEND_URL and ADMIN_TOKEN from
 * the server environment and injects them when forwarding to pq_shield.
 *
 * The admin token entered by the user on the login screen is stored in
 * memory only (window.__VARDHAN_ADMIN_TOKEN__) and forwarded via the
 * Authorization header.  It is NOT a NEXT_PUBLIC_* variable.
 */
export const config = {
  /** Client-side proxy path — browser never sees the backend URL directly */
  apiProxyPath: '/api/admin',
  /** Admin Bearer token is entered at login and stored in-memory only */
  adminToken: '',
  /** SSE reconnect backoff (ms) upper bound */
  sseReconnectMaxDelayMs: 30000,
  /** SSE reconnect backoff (ms) start */
  sseReconnectMinDelayMs: 1000,
  /** API request timeout (ms) */
  apiTimeoutMs: 10000,
};
