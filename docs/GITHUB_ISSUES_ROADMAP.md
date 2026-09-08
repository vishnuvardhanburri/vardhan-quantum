# Vardhan Post-Quantum Ingress Engine: GitHub Issues & Roadmap

This document defines the formal GitHub Issues tracker for the Vardhan Quantum Proxy engineering roadmap.

---

## 🟢 Completed & Frozen Milestones (Ready to Tag / Close)

### Issue #1: [P1 FREEZE] Non-Blocking Telemetry Engine & Live SSE Replay
* **Labels:** `telemetry`, `frozen`, `p1`
* **Status:** CLOSED (Commit `4073fe7`)
* **Description:**
  - Non-blocking crossbeam channel decoupling telemetry from data plane.
  - Snapshot gauge `requests_per_sec` driven by completed upstream requests.
  - Monotonic `successful_handshakes`, `upstream_failures`, and `frames_rejected_total` counters.
  - SSE circular replay buffer with explicit `HTTP 410 Gone` expired sequence handling.
  - Bearer token authentication and CORS header validation.

### Issue #2: [P2 FREEZE] Durable BLAKE3 Audit Ledger & ML-DSA-87 Verifier
* **Labels:** `security`, `audit`, `fips204`, `frozen`, `p2`
* **Status:** CLOSED (Commit `4073fe7`)
* **Description:**
  - Append-only write-ahead log (`audit_ledger` crate) with BLAKE3 Merkle chain.
  - FIPS 204 ML-DSA-87 digital signatures per entry.
  - Crash-safe torn write truncation and continuous recovery.
  - Standalone offline verification tool (`pq_verify`) validating sequence, chain hash, and signature.
  - Complete acceptance test harness (`p2_verify_gate.sh`) validating tampered bundle rejection.

### Issue #3: [P3.1 FREEZE] OpenTelemetry Tracing & Typed Prometheus Observability
* **Labels:** `observability`, `opentelemetry`, `prometheus`, `frozen`, `p3`
* **Status:** CLOSED (Commit `4073fe7`)
* **Description:**
  - Integrated `opentelemetry = "0.32"`, `opentelemetry-otlp`, and `tracing-opentelemetry = "0.33"`.
  - OTLP HTTP trace export for `session.handshake` and `proxy.forward` spans with attributes.
  - Typed Prometheus registry (`proxy_requests_total`, `proxy_request_duration_seconds`, etc.).
  - Retained backward-compatible JSON `/api/v1/metrics` format.
  - Sustained load test: 79.2k+ req/sec, 0 errors, 7µs p50 latency.

### Issue #4: [P3.3 FREEZE] KMS/HSM-Backed Key Protection & Zeroizing DEK
* **Labels:** `kms`, `hsm`, `security`, `frozen`, `p3`
* **Status:** CLOSED (Commit `4073fe7`)
* **Description:**
  - Extended `KeyProtector` trait with envelope encryption v2 (`wrapped_dek`).
  - Ephemeral 256-bit DEK generated per envelope, securely scrubbed via `zeroize::Zeroizing`.
  - AWS KMS adapter with multi-version key history and automatic key rotation support.
  - PKCS#11 hardware module adapter (`HsmKeyProtector`).
  - Production guardrail: immediately exits if `VARDHAN_ENV=production` and `local-dev` is configured.
  - Fail-fast on KMS outage (HTTP 503) and IAM AccessDenied.
  - Acceptance gate: 80,040 req/sec sustained post-quantum traffic through KMS-unwrapped proxy.

---

## 🟡 Open Roadmap Issues (Upcoming Implementation)

### Issue #5: [P3.4] High Availability & Multi-Node Gateway Cluster
* **Labels:** `clustering`, `high-availability`, `p3`
* **Status:** OPEN (Next Up)
* **Description:**
  - Multi-node cluster membership and peer discovery.
  - Distributed heartbeat protocol and node health checking.
  - Active-active and active-passive failover mechanisms.
  - Graceful session migration and draining during rolling upgrades.

### Issue #6: [P3.5] Distributed Multi-Node Telemetry & Cluster Aggregation
* **Labels:** `telemetry`, `observability`, `p3`
* **Status:** OPEN
* **Description:**
  - Aggregation of cluster-wide post-quantum metrics across edge nodes.
  - Distributed Shannon entropy monitoring across geographic regions.
  - Federated Prometheus scraping endpoint for multi-node deployments.

### Issue #7: [P3.6] Kubernetes Production Hardening & Cloud-Native Packaging
* **Labels:** `kubernetes`, `devops`, `helm`, `p3`
* **Status:** OPEN
* **Description:**
  - Production Helm charts with configurable KMS/HSM secret providers.
  - Distroless minimal container images with non-root security context.
  - Readiness and liveness probes hooked into gateway cryptographic health.
  - PodDisruptionBudgets and horizontal pod autoscaling metrics.

### Issue #8: [P3.7] Security Validation & Fuzzing Harness
* **Labels:** `security`, `fuzzing`, `testing`, `p3`
* **Status:** OPEN
* **Description:**
  - Differential fuzzing on ML-KEM-1024 decapsulation and ML-DSA-87 signature verification.
  - Constant-time verification against timing side-channel attacks.
  - Automated cryptographic fault injection in CI pipeline.

### Issue #9: [P3.8] Reproducible Performance Benchmarking & Kernel Bypass
* **Labels:** `performance`, `ebpf`, `benchmarking`, `p3`
* **Status:** OPEN
* **Description:**
  - Automated soak testing for 24h+ memory leak detection.
  - Kernel bypass exploration (eBPF / AF_XDP Zero-Copy) for 10M+ req/sec dark pool latency.
  - Standardized microbenchmark harness comparing ML-KEM NTT implementations.

---

## 💡 Note on GitHub PAT Permissions
To sync these issues directly to the GitHub Issues tab using GitHub CLI:
1. Navigate to: **GitHub -> Settings -> Developer Settings -> Personal Access Tokens**
2. In the permissions for your token (`github_pat_11BOGJ...`), enable:
   - **Repository permissions -> Issues:** `Read and Write`
3. Run the sync command: `gh issue create`
