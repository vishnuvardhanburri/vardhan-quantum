/**
 * Next.js Route Handler — reverse proxy to the pq_shield admin API.
 *
 * Security: the browser must never see VARDHAN_BACKEND_URL or ADMIN_TOKEN.
 * The frontend talks only to /api/admin/* (this proxy). The proxy runs
 * server-side and reads VARDHAN_BACKEND_URL from process.env.
 *
 * The admin token is user-supplied (login screen) and stored in memory only.
 * It is forwarded via the Authorization header (or query param for SSE,
 * since EventSource cannot send custom headers).
 */
import http from 'http';
import https from 'https';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

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

  // ── Auth gate ──────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url, 'http://localhost');
  const queryToken = searchParams.get('token');

  const effectiveToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : queryToken;

  if (!effectiveToken) {
    return new Response(
      JSON.stringify({ error: 'Authentication required', details: 'No valid Bearer token provided' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ── Server-side backend URL (never NEXT_PUBLIC_*) ───────────────────
  const backendUrl = process.env.VARDHAN_BACKEND_URL;
  if (!backendUrl) {
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration', details: 'VARDHAN_BACKEND_URL is not set' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = `${backendUrl}${backendPath}`;

  // ── SSE: use Node.js http for true streaming ────────────────────────
  const isSse = backendPath.includes('events') || !!searchParams.has('token') ||
    request.headers.get('accept')?.includes('text/event-stream');

  if (isSse) {
    return proxySse(url, effectiveToken, request);
  }

  // ── REST: use fetch ──────────────────────────────────────────────────
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${effectiveToken}`);

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const lastEventId = request.headers.get('last-event-id');
  if (lastEventId) headers.set('last-event-id', lastEventId);

  const init = { method, headers };
  if (method !== 'GET' && method !== 'OPTIONS') {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(url, init);
    const responseHeaders = new Headers();
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === 'transfer-encoding') continue;
      responseHeaders.set(key, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Backend unavailable', details: err.message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Stream the SSE response using Node.js http module.
 * Creates a Web ReadableStream that wraps the Node.js response stream,
 * using the same pattern that works for native SSE in Next.js route handlers.
 */
function proxySse(backendUrl, token, request) {
  return new Promise((resolve) => {
    const parsed = new URL(backendUrl);
    const lib = parsed.protocol === 'https:' ? https : http;

    const headers = { Authorization: `Bearer ${token}` };
    const lastEventId = request.headers.get('last-event-id');
    if (lastEventId) headers['last-event-id'] = lastEventId;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers,
    };

    const req = lib.request(options, (res) => {
      const responseHeaders = new Headers();
      for (const [key, value] of Object.entries(res.headers)) {
        if (key.toLowerCase() === 'transfer-encoding') continue;
        if (key.toLowerCase() === 'connection') continue;
        responseHeaders.set(key, value);
      }
      responseHeaders.set('Cache-Control', 'no-cache');
      responseHeaders.set('Content-Type', 'text/event-stream');

      // Use the same ReadableStream pattern that works in the test handler.
      // We prime the stream with an SSE comment to ensure headers are flushed
      // immediately by Next.js (it buffers until first chunk).
      const stream = new ReadableStream({
        start(controller) {
          // Prime with an SSE comment line so the client gets headers immediately
          controller.enqueue(new TextEncoder().encode(":connected\n\n"));
          res.on('data', (chunk) => {
            const ok = controller.enqueue(new Uint8Array(chunk));
            if (!ok) {
              res.pause();
            }
          });
          res.on('end', () => controller.close());
          res.on('error', (err) => controller.error(err));
        },
        cancel() {
          res.destroy();
        },
      });

      resolve(new Response(stream, {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: responseHeaders,
      }));
    });

    req.on('error', (err) => {
      resolve(new Response(
        JSON.stringify({ error: 'Backend unavailable', details: err.message }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      ));
    });

    req.end();
  });
}
