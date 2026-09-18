# P4 — Frontend ↔ Backend Security Contract Audit

**Baseline commit:** `487062b` (`feat: Complete frontend redesign with Flatlogic admin template`)  
**Status:** PLANNED  
**Scope:** `frontend/` ↔ `backend/pq_shield/src/admin.rs`  
**Prerequisites:** Credentials rotated (see `/tmp/credential_rotation.json`)

---

## 1. Enumerate Every Frontend API Call

Catalog every `axios.*` call in `frontend/pages/`, `frontend/components/`, and `frontend/redux/`:

| File | Method | URL | Purpose |
|---|---|---|---|
| `pages/admin/dashboard/index.js` | GET | `/api/v1/metrics` | System telemetry |
| `pages/admin/dashboard/index.js` | GET | `/api/v1/raft/status` | Raft consensus state |
| `pages/admin/dashboard/index.js` | GET | `/api/v1/sessions` | Active admin sessions |
| `pages/admin/dashboard/index.js` | POST | `/api/v1/ledger/verify` | Ledger chain verification |
| `pages/admin/dashboard/index.js` | POST | `/api/v1/cluster/drain` | Node drain operation |
| `pages/topology/index.js` | GET | `/api/v1/cluster/peers` | Cluster topology |
| `pages/index.js` | POST | `/api/v1/ledger/verify` | Ledger verification (landing) |
| `redux/actions/auth.js` | POST | `/api/auth/signin/local` | Local JWT login |
| `redux/actions/auth.js` | GET | `/api/auth/session` | Session check |

**Total:** 9 distinct API call patterns across 4 files + Redux actions.

## 2. Match Every Call to a Real Axum Route

Cross-reference each frontend call against `pq_shield/src/admin.rs` route table:

| Frontend Call | pq_shield Route | Match? |
|---|---|---|
| `/api/v1/metrics` (GET) | `/api/v1/metrics` (GET) | ✅ Exact match |
| `/api/v1/raft/status` (GET) | `/api/v1/raft/status` (GET) | ✅ Exact match |
| `/api/v1/sessions` (GET) | `/api/v1/sessions` (GET) | ✅ Exact match |
| `/api/v1/ledger/verify` (POST) | `/api/v1/ledger/verify` (POST) | ✅ NEW — added in this commit |
| `/api/v1/cluster/drain` (POST) | `/api/v1/cluster/drain` (POST) | ✅ Exact match |
| `/api/v1/cluster/peers` (GET) | `/api/v1/cluster/peers` (GET) | ✅ Exact match |
| `/api/auth/signin/local` (POST) | `/api/v1/auth/login` (POST) | ⚠️ Path mismatch — frontend uses `/api/auth/` (Next.js API route), pq_shield uses `/api/v1/auth/` |

**Gap found:** The frontend's local login API route (`pages/api/auth/signin/local.js`)
is a Next.js server-side handler that generates a local JWT. It does NOT call pq_shield.
The frontend's `/api/auth/session` check also goes to the local JWT, not pq_shield.

**Action:** Decide whether pq_shield should have its own auth endpoint
(`/api/v1/auth/login`) that returns a JWT signed by pq_shield, or whether the
Express proxy should intercept `/api/v1/auth/*` and validate against pq_shield's
admin token. The current design separates frontend auth from pq_shield auth.

## 3. Verify Request/Response Schemas

For each matched call, verify the JSON schema of requests and responses:

- **`/api/v1/metrics`** — Returns `MetricsSnapshot` struct. Frontend expects
  `requests_per_sec`, `active_sessions`, `successful_handshakes`. ✅ Align.
- **`/api/v1/raft/status`** — Returns Raft state. Frontend expects `leader_id`,
  `current_term`, `commit_index`. ✅ Align.
- **`/api/v1/ledger/verify`** — Returns `{chain_valid, blocks_verified, root_hash,
  signer_pub_fingerprint}`. Frontend expects `verification` object with
  `chain_valid`, `blocks_verified`, `root_hash`. ✅ Align.
- **`/api/v1/cluster/drain`** — Accepts `{node_id}`. Returns drain result.
  Frontend sends `{node_id: selectedNode}`. ✅ Align.
- **`/api/v1/cluster/peers`** — Returns array of nodes. Frontend maps peers.
  ✅ Align.

**Action:** Add schema validation tests (JSON schema assertions) for each endpoint.

## 4. Verify Authentication & Authorization

### Auth flow:
1. User logs into frontend → local JWT stored in `localStorage`
2. Frontend calls `/api/v1/*` through Express proxy
3. Express proxy's `onProxyReq` replaces JWT Bearer with pq_shield admin token
4. pq_shield's `auth_middleware` validates the Bearer token via constant-time comparison

### Tests to run:
- [ ] 401 when no Bearer token on direct pq_shield call
- [ ] 401 when wrong token on direct pq_shield call
- [ ] Proxy correctly strips frontend JWT and substitutes admin token (verify via `X-PQ-Proxied` header)
- [ ] Admin token never appears in browser bundle (grep JS chunks for token value)
- [ ] Admin token never appears in localStorage (only JWT stored)
- [ ] `/api/v1/ledger/verify` requires auth (401 without token)

## 5. Verify Proxy Cannot Leak Admin Token

The Express proxy (`server.js`) holds `ADMIN_TOKEN` as a server-side env var:

- [ ] `grep -r "RETRACTED-STAGING-TOKEN" .next/` → should return nothing
- [ ] `grep -r "process.env.ADMIN_TOKEN" .next/static/` → should return nothing
- [ ] Verify `ADMIN_TOKEN` is not exposed via any API route in Next.js
- [ ] Verify SSE proxy (`proxySse`) does not log or echo the token
- [ ] Verify path rewrite logic doesn't allow path traversal (e.g., `/api/v1/../` tricks)

## 6. Test JWT → Admin-Token Translation

- [ ] Login as `admin@vardhan-quantum.com` → receive JWT from `/api/auth/signin/local`
- [ ] Use JWT as Bearer token on `/api/v1/metrics` via proxy → 200 (proxy swaps token)
- [ ] Use JWT directly on pq_shield:8081 → 401 (pq_shield rejects JWT, expects admin token)
- [ ] Use correct admin token directly on pq_shield:8081 → 200
- [ ] Token in localStorage matches JWT format (3 base64 segments, not raw admin token)

## 7. Test Revoked/Expired Sessions

- [ ] JWT expires after 7 days (verify `exp` claim in login handler)
- [ ] After JWT expiry, proxy calls to `/api/v1/*` still work (proxy swaps token regardless)
- [ ] Test logout flow: `localStorage.removeItem('token')` → dashboard redirects to /login
- [ ] Test `/api/v1/sessions` shows active sessions

## 8. Test SSE Authorization & Disconnect Cleanup

- [ ] SSE connection without Bearer token → 401
- [ ] SSE connection through proxy (no token in browser) → works (proxy adds token)
- [ ] SSE stream delivers `HandshakeCompleted`, `UpstreamConnected`, `SessionClosed` events
- [ ] SSE client disconnect properly closes backend connection (no resource leak)
- [ ] Proxy sends `:connected` comment to flush headers immediately

## 9. Test Ledger Verification Against Corrupted Records

- [ ] Generate traffic → ledger entries written
- [ ] Verify: `/api/v1/ledger/verify` returns `chain_valid: true`
- [ ] Deliberately corrupt one ledger line (change prev_hash)
- [ ] Re-verify: `/api/v1/ledger/verify` returns `chain_valid: false`
- [ ] Verify `blocks_verified` count matches actual entries

## 10. Remove Remaining Hardcoded Values

- [ ] Dashboard hardcoded telemetry data (lines 17-31 in `pages/admin/dashboard/index.js`)
- [ ] Replace with live API data where possible
- [ ] Mark fallback values clearly as "mock data" in UI
- [ ] `constants/config.js` has hardcoded IP addresses (`127.0.0.1:8080`, `127.0.0.1:8081`)
- [ ] These should come from environment variables (already done via `.env.local`, but verify)

## 11. Verify Displayed Security Claims

Cross-check every security-related text in the UI against actual implementation:

| UI Text | Implementation Match? |
|---|---|
| "FIPS 203 ML-KEM-1024" | ✅ pq_shield uses `pqcrypto` ML-KEM |
| "FIPS 204 ML-DSA-87" | ✅ pq_shield uses `pqcrypto` ML-DSA |
| "AES-256-GCM" | ✅ Used in `proxy_engine` frame encryption |
| "HKDF-SHA256" | ✅ Used in session key derivation |
| "BLAKE3" | ✅ Used in ledger `canonical_hash` |
| "256+ Quantum Bits" | ✅ ML-KEM-1024 has 256-bit quantum security |
| "NIST Category 5" | ✅ NIST Category 5 = 256-bit quantum security |

**Terminology fix applied:** Changed "Enforced Post-Quantum Cryptographic Parameters"
→ "Enforced Cryptographic Parameters" (since AES/HKDF/BLAKE3 are not PQ algorithms).

## 12. Run Everything from Clean Checkout

- [ ] `git clone` → fresh copy
- [ ] `cd frontend && docker compose up --build`
- [ ] `cd backend && cargo build --release`
- [ ] Run all 14 audit checks from Step 1-11
- [ ] Document pass/fail for each

## 13. Run Complete Docker Path

- [ ] Build frontend Docker image (`docker build -t vardhan-quantum-frontend .`)
- [ ] Build pq_shield Docker image (needs Rust Dockerfile)
- [ ] docker-compose up with both services
- [ ] Verify proxy, login, API, SSE all work through containers
- [ ] Verify `host.docker.internal` resolves correctly

## 14. Commit Audit Evidence Separately

- [ ] Save test scripts to `tests/p4-security-contract/`
- [ ] Save JSON schema files for each endpoint
- [ ] Save test results (pass/fail matrix)
- [ ] Commit with message: `P4: Security contract audit — endpoint mapping, auth verification, schema validation`
- [ ] Do NOT mix with UI changes — keep audit evidence in a separate commit
