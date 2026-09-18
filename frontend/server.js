const express = require('express')
const next = require('next')
const proxy = require('http-proxy-middleware')
const http = require('http')
const { URL } = require('url')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PQ_SHIELD_BACKEND = process.env.VARDHAN_BACKEND_URL || 'http://127.0.0.1:8081'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'RETRACTED-STAGING-TOKEN'

console.log(`> pq_shield backend: ${PQ_SHIELD_BACKEND}`)

// ── Path rewrites: Frontend endpoints → pq_shield admin API endpoints ──
// The Flatlogic template calls paths like /api/v1/status, /api/v1/ledger/records
// these map to pq_shield's actual routes.
const pathRewrites = {
    '/api/v1/status': '/api/v1/metrics',               // system-wide metrics
    '/api/v1/ledger/records': '/api/v1/ledger/export',  // ledger entries
}

function rewritePath(originalPath) {
    const keys = Object.keys(pathRewrites).sort((a, b) => b.length - a.length)
    for (const key of keys) {
        if (originalPath === key || originalPath.startsWith(key + '/') || originalPath.startsWith(key + '?')) {
            return originalPath.replace(key, pathRewrites[key])
        }
    }
    return originalPath
}

// ── SSE proxy: dedicated handler for /api/v1/events ──────────────────────
// http-proxy-middleware v0.19 doesn't handle streaming/SSE reliably, so we
// use a raw Node.js http request to forward the EventStream response.
function proxySse(backendUrl, token, req, res) {
    const parsed = new URL(backendUrl)
    const lib = parsed.protocol === 'https:' ? require('https') : http

    const path = rewritePath(req.url || '')
    const options = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
    }

    const backendReq = lib.request(options, (backendRes) => {
        res.writeHead(backendRes.statusCode, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-PQ-Proxied': 'true',
        })
        backendRes.pipe(res)
    })

    backendReq.on('error', (err) => {
        console.error('SSE proxy error:', err.message)
        if (!res.headersSent) {
            res.writeHead(502)
        }
        res.end(JSON.stringify({ error: 'Backend unavailable', details: err.message }))
    })

    backendReq.end()
}

// ── REST proxy: http-proxy-middleware for all other /api/v1/* calls ──────
const pqShieldProxy = proxy({
    target: PQ_SHIELD_BACKEND,
    changeOrigin: true,
    logLevel: dev ? 'debug' : 'silent',
    pathRewrite: (path, req) => rewritePath(path),
    onProxyReq: (proxyReq, req, res) => {
        // Replace frontend JWT with pq_shield admin token
        proxyReq.setHeader('Authorization', 'Bearer ' + ADMIN_TOKEN)
    },
    onProxyRes: (proxyRes) => {
        proxyRes.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        proxyRes.headers['X-PQ-Proxied'] = 'true'
    },
})

app.prepare().then(() => {
    const server = express()

    // SSE endpoint — must come before the REST proxy
    server.get('/api/v1/events', (req, res) => {
        proxySse(PQ_SHIELD_BACKEND, ADMIN_TOKEN, req, res)
    })

    // REST proxy for all other pq_shield admin API calls (before Next.js catch-all)
    server.use('/api/v1', pqShieldProxy)

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })
})
