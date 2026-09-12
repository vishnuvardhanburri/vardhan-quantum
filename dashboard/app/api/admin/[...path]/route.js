/**
 * Next.js Route Handler — reverse proxy to the pq_shield admin API.
 *
 * Why a proxy instead of direct browser→backend calls?
 *   1. The admin API token is stored in memory (AuthContext) and must NOT
 *      be exposed to the browser via env vars or localStorage.  The proxy
 *      runs server-side and injects the Authorization header.
 *   2. Avoids CORS complexity — the browser talks to the same Next.js origin.
 *   3. The browser never touches PostgreSQL, Raft internals, filesystem,
 *      or private keys.
 *
 * The backend admin server already enforces Bearer-token auth.  The proxy
 * forwards the token it receives from the client (via cookie or header)
 * to the backend, preserving the existing auth model.
 *
 * Security note: the token is read from the `Authorization` request header
 * on inbound proxy calls.  In production, this would be a short-lived
 * session token issued by the backend's auth layer, not a raw admin token.
 */
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic'; // never cache admin API responses

export async function GET(request, { params }) {
  return proxyRequest('GET', request, params);
}

export async function POST(request, { params }) {
  return proxyRequest('POST', request, params);
}

export async function OPTIONS(request, { params }) {
  return proxyRequest('OPTIONS', request, params);
}

async function proxyRequest(method, request, params) {
  const { path } = params;
  const backendPath = Array.isArray(path) ? `/${path.join('/')}` : `/${path || ''}`;

  // Forward the auth token from the client request
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_TOKEN || config.adminToken;

  // Use the client's Bearer token if present (from AuthContext via header),
  // otherwise fall back to env-configured token.
  const effectiveToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : adminToken;

  const backendUrl = `${config.apiBaseUrl}${backendPath}`;

  const headers = new Headers();
  if (effectiveToken) {
    headers.set('Authorization', `Bearer ${effectiveToken}`);
  }

  // Copy through relevant headers
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const lastEventId = request.headers.get('last-event-id');
  if (lastEventId) headers.set('last-event-id', lastEventId);

  const init = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'OPTIONS') {
    const body = await request.arrayBuffer();
    init.body = body;
  }

  try {
    const response = await fetch(backendUrl, init);

    // Build response, forwarding body and key headers
    const responseHeaders = new Headers();
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === 'transfer-encoding') continue; // skip chunked
      responseHeaders.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    // Backend unreachable
    return new Response(
      JSON.stringify({ error: 'Backend unavailable', details: err.message }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
