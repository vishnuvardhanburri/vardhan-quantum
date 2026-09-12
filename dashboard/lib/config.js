/**
 * Vardhan Quantum Dashboard — Runtime configuration.
 *
 * Reads backend admin API connection details from environment variables
 * injected at build time. Next.js inlines NEXT_PUBLIC prefixed vars.
 * Falls back to development defaults only when not overridden.
 */
export const config = {
  /** Base URL of the pq_shield admin / telemetry API */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081',
  /** Admin Bearer token (may be empty; user enters it via login screen) */
  adminToken: process.env.NEXT_PUBLIC_ADMIN_TOKEN || '',
  /** SSE reconnect backoff (ms) upper bound */
  sseReconnectMaxDelayMs: 30000,
  /** SSE reconnect backoff (ms) start */
  sseReconnectMinDelayMs: 1000,
  /** API request timeout (ms) */
  apiTimeoutMs: 10000,
};
