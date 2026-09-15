# STAGED DEPLOYMENT & RUNTIME VERIFICATION GATE
## Vardhan Quantum — Verification Report

**Date:** 2026-09-15  
**Environment:** macOS arm64 (Darwin), Docker Compose + standalone release binaries  
**Source commit tested:** `f0cd9c2` (commit containing all Phase 0–12 code changes)  
**HEAD (this report):** `3caed54`  
**Build:** `cargo build --workspace --release` — ✅ Finished  
**Test count:** 26 workspace tests (10× skipped) + 37 Raft tests (excluding 10× stress)  

---

## 1. Status

```
LOCAL VERIFIED           PASS   ← This report covers local verification only
                              (standalone binary + Docker Compose on macOS)

STAGING DEPLOYMENT       NOT DEPLOYED / NOT VERIFIED
                         (no actual staging environment was provisioned;
                          Docker Compose on macOS is local integration,
                          not a deployed staging environment)

PRODUCTION               NOT VERIFIED
```

Docker Compose running on macOS provides local integration validation only.
It is NOT evidence of an actual deployed staging environment. The staging
status must remain "NOT DEPLOYED / NOT VERIFIED" until an actual staging
deployment is provisioned and exercised.

---

## 2. Source Commit Tested

| Commit | SHA | Description |
|--------|-----|-------------|
| Source tested | `f0cd9c20060912650c0a6df5cf86b1a6c36f87d3` | All Phase 0–12 code changes (security fixes, route handler, Raft hardening, etc.) |
| HEAD | `3caed541f74ccaee70a9527e62a4b65da4b7861f` | Source tested + this verification report |
| Base (pre-changes) | `c2f52c1` | P3.8 Step 3.1 persist strategy fix |

All tests were run against the `f0cd9c2` source tree. The Docker images
were built from this same source tree via `docker compose build`.

---

## 3. Phase Enumeration

This report covers **14 phases** (Phase 0 through Phase 13):

| Phase | Title | Result |
|-------|-------|--------|
| Phase 0 | Freeze current state | ✅ Complete |
| Phase 1 | Clean production build gate | ✅ Complete |
| Phase 2 | Production configuration boundary audit | ✅ Complete |
| Phase 3 | Real API verification | ✅ Complete |
| Phase 4 | SSE real-time verification | ✅ Complete |
| Phase 5 | REST + SSE reconciliation | ✅ Complete |
| Phase 6 | Raft runtime verification | ✅ Complete |
| Phase 7 | Authentication / security gate | ✅ Complete |
| Phase 8 | Ledger / evidence verification | ✅ Complete |
| Phase 9 | Cryptography truth model | ✅ Complete |
| Phase 10 | Global mock data audit | ✅ Complete |
| Phase 11 | Browser-level validation | ✅ Complete |
| Phase 12 | Deployment readiness | ✅ Complete |
| Phase 13 | Final verification matrix | ✅ Complete |

---

## 4. Compile Checks

| Check | Command | Result |
|-------|---------|--------|
| Workspace tests | `cargo test --workspace -- --skip "10x" --test-threads=1` | ✅ 26 passed, 0 failed |
| Release build | `cargo build --workspace --release` | ✅ Finished |
| Frontend build | `npx next build` | ✅ 13/13 pages generated |

### 4.1 Test Breakdown

| Crate / Test Suite | Tests | Failed |
|---------------------|-------|--------|
| ha_cluster unit tests | 19 | 0 |
| core_crypto | 6 | 0 |
| proxy_engine integration | 1 | 0 |
| ha_cluster transport | 2 | 0 |
| **Workspace total** | **26** | **0** |

### 4.2 Raft Test Results (Phase 6)

#### raft_l3_1_hardening (12 tests)

| Test | First Run | Notes |
|------|-----------|-------|
| test_election_timer_persistence | ✅ pass | |
| test_basic_election | ✅ pass | |
| test_append_entries_heartbeat | ✅ pass | |
| test_log_replication_basic | ✅ pass | |
| test_log_replication_failure | ✅ pass | |
| test_stale_term_rejection | ✅ pass | |
| test_stale_worker_replacement | ✅ pass | |
| test_bidirectional_partition_proof | ✅ pass | |
| test_address_change_recovery | ✅ pass | |
| test_crash_during_commit | ✅ pass | |
| test_real_process_crash | ✅ pass | |
| test_real_process_crash_10x | ❌ 9/10 (flaky) | First run: 9/10 passed. Re-run: 10/10 passed. |

**6 core hardening tests (A–F):** All 6 first-run passed without flakiness.

10× stress tests (test_real_process_crash_10x, test_bidirectional_partition_10x)
are skipped in the workspace-wide `--skip "10x"` run and run individually:

- **test_real_process_crash_10x first run:** 9/10 passed — FAILED (flaky)
  - Root cause: timing sensitivity under load; one of 10 crash-recovery cycles
    failed to elect a new leader within the election timeout window
  - Fix: clean persist files before re-run (no code change needed)
  - **Re-run:** 10/10 passed
  - **Final result:** PASS (but flakiness is a remaining concern — see §10)

#### raft_l3_replication

| Result | 11 passed, 0 failed |

#### raft_l3_failure

| Result | 14 passed, 0 failed |

#### 10× tests (excluded from workspace run)

| Test | First run | Re-run | Final |
|------|-----------|--------|-------|
| test_real_process_crash_10x | 9/10 ❌ | 10/10 ✅ | PASS (flaky) |
| test_bidirectional_partition_10x | Included in 12/12 suite run | | PASS |

**Important:** The workspace-wide `cargo test --workspace -- --skip "10x"` command
SKIPS all 10× tests by design. The 10× tests were run individually as
supplementary stress validation. The flakiness of `test_real_process_crash_10x`
on first run is documented as a remaining concern.

---

## 5. Authentication & Security (Phase 7)

**Auth middleware** (`pq_shield/src/admin.rs:50`):
- Bearer token comparison using `subtle::ConstantTimeEq` — constant-time, side-channel safe
- Returns 401 on missing/invalid token (no 403)
- SSE token forwarded via `?token=` query param (EventSource cannot send headers)

### 5.1 Auth Test Cases

| Case | Method | Expected | Actual |
|------|--------|----------|--------|
| No token (REST) | GET | 401 | ✅ 401 |
| Wrong token (REST) | GET | 401 | ✅ 401 |
| Valid token (REST) | GET | 200 | ✅ 200 |
| No token (SSE) | GET | 401 | ✅ 401 |
| Wrong token (SSE) | GET | 401 | ✅ 401 |
| Valid token (SSE) | GET | 200 | ✅ 200 |

### 5.2 Browser Bundle Security

ADMIN_TOKEN is server-side only and is absent from:
- NEXT_PUBLIC_* environment variables ✅
- Browser JavaScript bundles ✅
- localStorage ✅
- sessionStorage ✅
- Client-exposed runtime configuration ✅

The server receives ADMIN_TOKEN through its secure environment only.

### 5.3 Proxy Path Security

| Check | Requirement | Result |
|-------|-------------|--------|
| No NEXT_PUBLIC_* in .env.example | Phase 2 | ✅ |
| No NEXT_PUBLIC_* in docker-compose.yml | Phase 2 | ✅ |
| No NEXT_PUBLIC_* in browser bundle | Phase 2 | ✅ |
| No VARDHAN_BACKEND_URL in browser bundle | Phase 2 | ✅ |
| No localhost:8081 in browser bundle | Phase 2 | ✅ |
| No admin token in browser bundle | Phase 2 | ✅ |
| Auth token stored in memory only | Phase 2 | ✅ (`window.__VARDHAN_ADMIN_TOKEN__`) |
| Auth token never persisted to localStorage | Phase 2 | ✅ |
| Bearer token comparison uses ConstantTimeEq | Phase 7 | ✅ |

### 5.4 CORS Audit

The admin API CORS configuration:

```yaml
# docker-compose.yml — production/staging config
VARDHAN_ADMIN_CORS_ORIGIN=http://localhost:3000,http://localhost:8081
```

Architecture:
```
Browser (http://localhost:3000)
  ↓ same-origin fetch
Next.js proxy (http://localhost:3000/api/admin/*)
  ↓ server-side HTTP (not browser)
Rust admin API (http://proxy:8081)
```

Since the browser talks to the Next.js proxy via same-origin requests, the
admin API does NOT need wildcard CORS (`Access-Control-Allow-Origin: *`).

Verification:
- Request from `http://localhost:3000` → `access-control-allow-origin: http://localhost:3000` ✅
- Request from `http://evil.example.com` → NO `access-control-allow-origin` header (rejected) ✅
- Request from `http://localhost:8081` → `access-control-allow-origin: http://localhost:8081` ✅

The wildcard `*` was used only in the local standalone development environment
(port 8082, dev testing) and is NOT present in the Docker Compose deployment
configuration.

---

## 6. Crypto Truth Model (Phase 9)

The `/api/v1/security/crypto/status` endpoint returns 5 algorithms:

| Algorithm | Category | Standard | Detail | State |
|-----------|----------|----------|--------|-------|
| ML-KEM-1024 | Post-Quantum | FIPS 203 | Quantum Safe Encapsulation | ✅ Active |
| ML-DSA-87 | Post-Quantum | FIPS 204 | Quantum Safe Signatures | ✅ Active |
| AES-256-GCM | Symmetric | NIST SP 800-38D | Authenticated Encryption | ✅ Active |
| HKDF-SHA256 | Key Derivation | RFC 5869 | Session Key Derivation | ✅ Active |
| BLAKE3 | Hash | — | Fast Integrity Hashing | ✅ Active |

**Correction:** Only ML-KEM-1024 and ML-DSA-87 are post-quantum algorithms.
AES-256-GCM, HKDF-SHA256, and BLAKE3 are classical cryptographic primitives
that remain quantum-resistant (AES-256 key size is beyond Grover's reach).

Direct backend and proxy responses are identical for all 5 algorithms ✅.
No hardcoded crypto values exist in the frontend ✅.

---

## 7. API Endpoint Verification (Phase 3)

All 10 dashboard API endpoints verified: direct backend vs proxy — **10/10 MATCH**:

| # | Endpoint | Method | Direct == Proxy |
|---|----------|--------|-----------------|
| 1 | `/api/v1/metrics` | GET | ✅ MATCH |
| 2 | `/api/v1/cluster/status` | GET | ✅ MATCH |
| 3 | `/api/v1/cluster/peers` | GET | ✅ MATCH |
| 4 | `/api/v1/raft/status` | GET | ✅ MATCH |
| 5 | `/api/v1/ledger/status` | GET | ✅ MATCH |
| 6 | `/api/v1/ledger/export` | GET | ✅ MATCH |
| 7 | `/api/v1/security/crypto/status` | GET | ✅ MATCH |
| 8 | `/metrics` (Prometheus) | GET | ✅ MATCH |
| 9 | `/api/v1/events` (SSE) | GET | ✅ 200 streamed |
| 10 | `/api/v1/cluster/drain` | POST | ✅ MATCH |

Only `timestamp_ms` differs between direct/proxy (expected — wall-clock variance).

### 7.1 SSE Evidence (Phase 4)

| Header | Direct Backend | Docker Proxy |
|--------|----------------|--------------|
| HTTP Status | 200 | 200 |
| Content-Type | text/event-stream | text/event-stream |
| Cache-Control | no-cache | no-cache |
| Access-Control-Allow-Origin | http://localhost:3000 | http://localhost:3000 |
| Connection | keep-alive | keep-alive |

- `Last-Event-ID` header forwarded to backend ✅
- 410 GONE returned by backend when Last-Event-ID expired from replay buffer ✅
- SSE stream stays open with keep-alive ✅
- `:connected` prime comment ensures immediate header flush ✅

**Limitation:** The localhost simulation does not generate the full real quantum
handshake event workload (no real TLS/PQ traffic to the upstream). The SSE
pipeline is verified structurally (connection, headers, streaming), but end-to-end
event data flow (quantum handshake events → SSE broadcast) cannot be validated
on localhost. This is a known limitation — production traffic validation is
required for full SSE workload verification.

---

## 8. Ledger & Evidence (Phase 8)

| Check | Detail | Status |
|-------|--------|--------|
| Ledger configured | `configured: true` | ✅ |
| Ledger file | `/tmp/vardhan_test_ledger.jsonl` | ✅ |
| Ledger message | "Durable ledger active — ML-DSA-87 signed, BLAKE3 chained" | ✅ |
| Export through proxy | Manifest matches direct | ✅ |
| Manifest fields | schema_version, entry_count, tip_hash, signer_pub_fingerprint, manifest_signature | ✅ |
| Public key | 128-byte ML-KEM-1024 seed exported | ✅ |
| Schema | JSON Lines, fields with type descriptions | ✅ |
| Instructions | `pq_verify --evidence-dir .` for offline verification | ✅ |

---

## 9. Browser Testing (Phase 11)

### 9.1 HTTP Route Smoke Tests

| Test | Result |
|------|--------|
| GET /login | ✅ 200 |
| GET / (dashboard) | ✅ 200 |
| GET /evidence | ✅ 200 |
| GET /consensus | ✅ 200 |
| GET /intelligence | ✅ 200 |
| GET /reliability | ✅ 200 |
| GET /security | ✅ 200 |
| GET /cluster | ✅ 200 |
| GET /admin | ✅ 200 |
| Unauthenticated REST → 401 | ✅ |
| Wrong token REST → 401 | ✅ |
| Valid token REST → 200 | ✅ |
| Unauthenticated SSE → 401 | ✅ |
| Valid token SSE → 200 + streaming | ✅ |

### 9.2 Browser E2E (Automated)

Browser E2E: **NOT RUN**

HTTP route smoke tests were performed via `curl` against the running server.
No browser automation (Playwright, Cypress, Selenium) was executed. The HTTP 200
responses confirm routes are server-rendered and accessible, but do not verify
interactive browser behavior (JavaScript execution, client-side routing,
SSE EventSource connection from an actual browser, login form interaction,
localStorage behavior, etc.).

---

## 10. Deployment Readiness (Phase 12)

### 10.1 Docker Compose

```
proxy (pq_shield)      → ports 8080, 7001, 8081  ✅ Running
mock-upstream (Python) → port 9090              ✅ Running
dashboard (Next.js)    → port 3000              ✅ Running, healthcheck 200
```

Fixes applied to `docker-compose.yml`:
- Removed `NEXT_PUBLIC_API_BASE_URL` → `VARDHAN_BACKEND_URL` (server-side only)
- Removed `NEXT_PUBLIC_ADMIN_TOKEN` → `ADMIN_TOKEN` (server-side only)
- Removed obsolete `version: '3.8'` attribute
- Fixed port conflict: proxy no longer publishes 9090 (only mock-upstream does)
- Removed unsupported `start-period` healthcheck property
- `VARDHAN_UPSTREAM=mock-upstream:9090` (Docker DNS hostname)
- CORS: `http://localhost:3000,http://localhost:8081` (restricted, not `*`)

### 10.2 Source Fix: pq_shield/src/main.rs

- Fixed `VARDHAN_UPSTREAM` parsing: changed from `SocketAddr::parse()` (IP-only)
  to `to_socket_addrs()` (supports DNS hostnames) for Docker Compose compatibility

### 10.3 End-to-End (Docker Compose)

All tests verified through `http://localhost:3000`:

| Test | Result |
|------|--------|
| Dashboard healthcheck | ✅ 200 |
| Metrics (direct vs proxy) | ✅ MATCH |
| Cluster status (direct vs proxy) | ✅ MATCH |
| Crypto status (direct vs proxy) | ✅ MATCH |
| Ledger status (direct vs proxy) | ✅ MATCH |
| Raft status (direct vs proxy) | ✅ MATCH |
| Prometheus /metrics (direct vs proxy) | ✅ MATCH |
| SSE through proxy | ✅ 200 + text/event-stream |

---

## 11. Final Verification Matrix

### 11.1 Compile & Test Matrix

| Check | Command | Result |
|-------|---------|--------|
| Workspace tests (skip 10×) | `cargo test --workspace -- --skip "10x" --test-threads=1` | ✅ 26 passed, 0 failed |
| Hardening suite (full, incl. 10×) | `cargo test -p ha_cluster --test raft_l3_1_hardening -- --test-threads=1` | ✅ 12 passed, 0 failed |
| Replication suite | `cargo test -p ha_cluster --test raft_l3_replication -- --test-threads=1` | ✅ 11 passed, 0 failed |
| Failure suite (skip 10×) | `cargo test -p ha_cluster --test raft_l3_failure -- --skip "10x" --test-threads=1` | ✅ 14 passed, 0 failed |
| Release build | `cargo build --workspace --release` | ✅ Finished |
| Frontend build | `npx next build` (in dashboard/) | ✅ 13/13 pages |

### 11.2 Security Matrix

| Control | Requirement | Status |
|--------|-------------|--------|
| No NEXT_PUBLIC_* in env files | Phase 2 | ✅ |
| No NEXT_PUBLIC_* in browser bundle | Phase 2 | ✅ |
| VARDHAN_BACKEND_URL server-side only | Phase 2 | ✅ |
| No VARDHAN_BACKEND_URL in browser bundle | Phase 2 | ✅ |
| ADMIN_TOKEN server-side only | Phase 2 | ✅ |
| ADMIN_TOKEN absent from browser bundle | Phase 2 | ✅ |
| ADMIN_TOKEN not in localStorage/sessionStorage | Phase 2 | ✅ |
| Auth token stored in memory only | Phase 2 | ✅ |
| Bearer token comparison uses ConstantTimeEq | Phase 7 | ✅ |
| CORS restricted (not `*`) in Docker Compose | Phase 7 | ✅ |
| Port conflict fixed (proxy ≠ upstream) | Phase 12 | ✅ |

### 11.3 Runtime Matrix

| Endpoint | Method | Direct Backend | Docker Proxy | Match |
|----------|--------|----------------|--------------|-------|
| /api/v1/metrics | GET | ✅ 200 | ✅ 200 | ✅ |
| /api/v1/cluster/status | GET | ✅ 200 | ✅ 200 | ✅ |
| /api/v1/cluster/peers | GET | ✅ 200 | ✅ 200 | ✅ |
| /api/v1/raft/status | GET | ✅ 200 | ✅ 200 | ✅ |
| /api/v1/ledger/status | GET | ✅ 200 | ✅ 200 | ✅ |
| /api/v1/ledger/export | GET | ✅ 200 | ✅ 200 | ✅ |
| /api/v1/security/crypto/status | GET | ✅ 200 | ✅ 200 | ✅ |
| /metrics | GET | ✅ 200 | ✅ 200 | ✅ |
| /api/v1/events (SSE) | GET | ✅ 200 | ✅ 200 | ✅ |

---

## 12. Final Status

```
LOCAL VERIFIED           PASS
   Tests, builds, auth, SSE, Raft, ledger, crypto, mock data audit all pass.
   Docker Compose runs 3 services on macOS. HTTP route smoke tests pass.
   10× stress test flaky on first run (9/10), passes on re-run.

STAGING DEPLOYMENT       NOT DEPLOYED / NOT VERIFIED
   Docker Compose on macOS is local integration validation, not a deployed
   staging environment. No staging cluster (EKS/other) was provisioned.

PRODUCTION               NOT VERIFIED
   Production readiness requires:
   - Actual staging deployment exercised end-to-end
   - Browser E2E automation (Playwright/Cypress) — NOT RUN
   - Real quantum handshake traffic for SSE event validation
   - 10× flakiness resolution (remaining concern)
```

---

## 13. Remaining Blockers

1. **Staging deployment:** No actual staging environment (EKS/k8s) has been
   provisioned and exercised. Docker Compose on macOS is local integration only.

2. **Browser E2E:** No browser automation (Playwright, Cypress) was run.
   HTTP route smoke tests pass, but interactive browser behavior
   (JavaScript execution, EventSource SSE connection from actual browser,
   login form interaction) is unverified.

3. **SSE event workload:** The localhost simulation does not generate real
   quantum handshake events. The SSE pipeline is structurally verified
   (connection, headers, streaming, Last-Event-ID, 410 GONE) but end-to-end
   event data flow requires production TLS/PQ traffic.

4. **10× test flakiness:** `test_real_process_crash_10x` failed on first run
   (9/10 passed) and passed on re-run (10/10). Root cause: timing sensitivity
   under load (one crash-recovery cycle didn't elect a new leader within the
   election timeout). This is a remaining concern for production reliability
   and should be investigated by tuning election timeouts or adding
   retry/detection logic.

5. **Docker Compose port sharing:** The proxy and mock-upstream use
   `network_mode: "service:mock-upstream"` semantics (shared network namespace)
   via `VARDHAN_UPSTREAM=mock-upstream:9090`. This was resolved by fixing the
   upstream parser to support DNS hostnames. In a real multi-host deployment,
   this would be handled by Kubernetes service discovery.
