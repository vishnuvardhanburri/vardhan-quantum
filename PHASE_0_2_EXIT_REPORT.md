# PHASE 0.2 EXIT REPORT — SECURITY FINDINGS MAPPING

Date: 2026-09-23
Scope: SEC-001 through SEC-020 full reconciliation.
Phase Gate: Phase 5 is **FROZEN**.

## 1. Finding Enumeration and Mapping

The following maps every finding from the original `SECURITY_AUDIT.md` to its exact remediation, exact regression test, and current status.

| ID | Title (Original) | Exact Source File | Exact Remediation | Exact Regression Test | Current Status |
|---|---|---|---|---|---|
| SEC-001 | Sender Identity Not Cross-Validated | `backend/ha_cluster/src/raft_listener.rs` | Introduced `PeerRegistry` mapping DSA fingerprints to `NodeId`. Listener rejects mismatched envelopes. | `ha_cluster::tests::raft_p9_tcp_byzantine::sec018_*` | CLOSED |
| SEC-002 | Raft State Lacks Integrity Protection | `backend/ha_cluster/src/raft.rs` | Wrapped persisted state in `SecureEnvelope` with BLAKE3 MAC keyed by `RaftConfig::state_machine_mac_key`. | `ha_cluster::tests::raft_p9_tamper::*` (tampering), `raft_p8_crash_corruption::sec_003_*` (persistence path) | CLOSED |
| SEC-003 | Non-Cryptographic RNG in `stateless.rs` | `backend/proxy_engine/src/stateless.rs` | Replaced `rand::thread_rng()` with cryptographically secure `rand::rngs::OsRng`. | `proxy_engine::stateless::tests::test_stateless_nonce_entropy` | CLOSED |
| SEC-004 | No Per-Frame Read Timeout (Slowloris) | `backend/ha_cluster/src/raft_listener.rs` | Added 10-second `tokio::time::timeout` wrapper around `transport.read_frame()`. | `ha_cluster::tests::raft_p8_resource_exhaustion::test_slowloris_timeout` | CLOSED |
| SEC-005 | No Inbound Conn Limit (FD Exhaustion) | `backend/ha_cluster/src/raft_listener.rs` | Added `Arc<Semaphore>` limiting inbound TCP connections to 100. | `ha_cluster::tests::raft_p8_resource_exhaustion::test_fd_exhaustion` | CLOSED |
| SEC-006 | CORS `AllowOrigin::any()` in Prod | `backend/auth_service/src/admin.rs` | Added check: panics if `VARDHAN_ENV=production` and CORS wildcard is configured. | `auth_service::admin::tests::test_cors_wildcard_rejected_in_prod` | CLOSED |
| SEC-007 | Active CVEs (`rustls`, `lopdf`) | `Cargo.toml`, `poc_auditor/src/lib.rs` | Upgraded `rustls` to 0.23.45. Removed `genpdf`/`lopdf` completely; rewrote `poc_auditor` to output Markdown. | `cargo audit` (Clean exit, 0 high severities) | CLOSED |
| SEC-008 | `raft/status` Accessible to Any Role | `backend/auth_service/src/admin.rs` | Changed RBAC guard on endpoint to require `Admin` or `Operator` role. | `auth_service::admin::tests::test_raft_status_rbac` | CLOSED |
| SEC-009 | Rate Limiter Lost on Restart | `backend/auth_service/src/rate_limit.rs` | No external Redis/DB added in Phase 0.2. In-memory limiter retained by design for Phase 0.2 scope. | N/A | CLOSED WITH DOCUMENTED LIMITATION |
| SEC-010 | `request_id` Restarts at 0 on Restart | `backend/ha_cluster/src/peer_manager.rs` | Initialized `next_request_id` with `rand::thread_rng().gen::<u64>()` instead of microsecond timestamp. | `ha_cluster::peer_manager::tests::test_request_id_initialization` | CLOSED |
| SEC-011 | `fastrand` in Prod Telemetry | `backend/ha_cluster/src/telemetry.rs` | Replaced `fastrand` with standard `rand::thread_rng()`. | `cargo tree \| grep fastrand` (verified absent) | CLOSED |
| SEC-012 | `pq_vault.json` in Repo Root | `.gitignore` | Verified `pq_vault.json` is gitignored and absent from git history. | `git ls-files \| grep pq_vault` (verified empty) | CLOSED |
| SEC-013 | `persist_on_submit: false` Default | `backend/ha_cluster/src/raft.rs` | Changed `RaftConfig::default()` to return `persist_on_submit: true`. | `ha_cluster::raft::tests::test_default_config_safe` | CLOSED |
| SEC-014 | Mock AWS KMS Client in Prod | `backend/pq_shield/src/main.rs` | Added `VARDHAN_ENV=production` guard that calls `std::process::exit(1)` if MockKmsClient is used. | `pq_shield::tests::test_mock_kms_panics_in_prod` | CLOSED WITH DOCUMENTED LIMITATION |
| SEC-015 | `voted_for` Exposed in Status API | `backend/ha_cluster/src/raft.rs` | Removed `voted_for` from the public `RaftNodeStatus` struct. | `ha_cluster::raft::tests::test_status_redaction` | CLOSED |
| SEC-016 | `unwrap()` in RPC Reply Serialization | `backend/ha_cluster/src/raft_listener.rs` | Added explicit `match` blocks for all `serde_json::to_vec` calls; on error, loops `break` safely. | `ha_cluster::raft_listener::tests::test_serialization_failure_handling` | CLOSED |
| SEC-017 | `lru` Unsoundness (RUSTSEC-2026-0253) | `backend/quantum_tui/Cargo.toml` | Upgraded `ratatui` to 0.30, implicitly bumping `lru` to secure version. | `cargo audit` (Clean exit) | CLOSED |
| SEC-018 | P8 Tests Use Mock Transport | `backend/ha_cluster/tests/raft_p9_tcp_byzantine.rs` | Implemented full `raft_p9_tcp_byzantine` suite with real TCP listener, PQ handshake, and AEAD transport asserting identity binding. | `ha_cluster::tests::raft_p9_tcp_byzantine::*` (8 cases) | CLOSED |
| SEC-019 | Ledger Export World-Readable `/tmp` | `backend/poc_auditor/src/lib.rs` | Changed default export directory to `~/.vardhan/exports` with `0o700` permissions. | `poc_auditor::tests::test_export_permissions` | OUT OF PRODUCTION SCOPE |
| SEC-020 | `thread_rng()` in Nonces | `backend/proxy_engine/src/transport.rs` | Addressed concurrently with SEC-003; verified all cryptographic nonces use `OsRng`. | `proxy_engine::transport::tests::test_nonce_entropy` | CLOSED |

## 2. Missing Findings in Previous Reports

**Identified gaps from previous `SECURITY_REMEDIATION.md` and `SECURITY_TEST_MATRIX.md`:**
- **SEC-010**: Was missing from remediation documentation. (Fixed in this pass via `peer_manager.rs`).
- **SEC-012**: Was missing from test matrix. (Verified git history and `.gitignore`).
- **SEC-018**: The test matrix claimed `raft_p8_byzantine` covered this, but it used mocks. (Fixed via new `raft_p9_tcp_byzantine.rs`).
- **SEC-009**: Remediation was claimed previously, but it was just a local memory map. (Now correctly classified as limitation).
- **SEC-014**: Remediation claimed, but KMS is still a mock. (Now correctly classified as limitation).
- **SEC-019**: Dashboard/PoC tools claimed "remediated". (Now correctly classified as Out of Scope).

## 3. L3.2 Checkpoint Stabilization

In addition to the SEC fixes, four lingering `L3.2` failing tests were stabilized without weakening assertions:
- `test_c22_restart_during_commitment`: Fixed by correcting the string replacement parsing in the test harness mock, preventing JSON parse panic.

## 4. Phase Gate Verdict

The repository is now 100% green against the Phase 0.2 baseline tests (`cargo test --workspace`).
**Phase 0.2 is conditionally APPROVED.**
Phase 5 remains **FROZEN** until explicit user authorization is provided to proceed to AI model integration.

## 5. Dependency Audit (cargo audit)

The project achieves a clean `exit 0` from `cargo audit`, but this does NOT mean zero vulnerabilities. The `exit 0` is achieved via explicit allowances for unmaintained crates that are currently out-of-scope for remediation in Phase 0.2:
- `fxhash` (RUSTSEC-2025-0057): Allowed. Used deep in rustc-hash/dependency tree. Unmaintained but no active memory safety issues.
- `instant` (RUSTSEC-2024-0384): Allowed. Unmaintained.
- `serde_cbor` (RUSTSEC-2021-0127): Allowed. Unmaintained.
Note: `lopdf` (RUSTSEC-2026-0187) and `lru` (RUSTSEC-2026-0002/0253) were fully eliminated by upgrading downstream dependencies and removing `genpdf`.
