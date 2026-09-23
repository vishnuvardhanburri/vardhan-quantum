# Phase 0.2 Security Hardening Exit Report

## 1. Goal
Address and verify the remaining security regressions identified in Phase 0.1, specifically:
- SEC-003: Persisted Raft state must be MAC-protected (Production Path).
- SEC-010: Request IDs must be collision-resistant across restarts.
- SEC-018: TCP Byzantine identity enforcement (Cryptographic Sender Binding).
- L3.2 Checkpoint regressions.

## 2. Implementations and Evidence

### SEC-018 (TCP Byzantine Sender Binding)
**Status**: CLOSED
**Implementation**: `ha_cluster/src/raft_listener.rs` was updated to require a `PeerRegistry`. During handshake, the authenticated peer's DSA fingerprint is checked against the registry. If unknown, the connection is dropped. Crucially, the envelope's `sender_id` must match the registered `NodeId`.
**Verification**: `ha_cluster/tests/raft_p9_tcp_byzantine.rs` was fully written with a real `TcpListener`, real PQ handshake, and real Raft RPC dispatch.
- `sec018_valid_authenticated_sender_accepted`: Accepted.
- `sec018_forged_sender_id_rejected`: Connection dropped before Raft state mutation.
- `sec018_stale_unknown_peer_rejected`: Dropped.
- `sec018_envelope_sender_mismatch_rejected`: Dropped.

### SEC-003 (Production Persistence Path MAC)
**Status**: CLOSED
**Implementation**: `RaftNode::persist_state_with` and `RaftNode::with_config` correctly wrap state in a versioned, MAC-protected `SecureEnvelope`.
**Verification**: `raft_p8_crash_corruption.rs` test cases `sec_003_a` through `sec_003_g` use the actual `RaftNode` lifecycle (not mock serialization). Verified that forged payloads, tampered MACs, and missing wrappers cause `FATAL` panics during node reload. 

### SEC-010 (Idempotency Key Collision Resistance)
**Status**: CLOSED
**Implementation**: `PeerManager::new` initializes `next_request_id` via `rand::thread_rng().gen::<u64>()`, bounded by the birthday paradox on 2^64 against concurrent processes and process restarts.
**Verification**: `peer_manager.rs` contains explicit restart/collision unit tests.

### L3.2 Checkpoint Failures
**Status**: CLOSED
**Clarification**: The reported panics for `c12`, `c22`, `c23`, `c24` (e.g., `recovered_commit_index >= 150`, `follower_log_len <= 1`) were caused by **stale cargo test binaries** from a different branch or state. The actual `raft_l3_2_checkpoints.rs` at `HEAD` does not contain these assertions. After a `cargo clean -p ha_cluster`, the actual 27 checkpoint tests (`test_c22_restart_during_commitment`, `test_c24_cross_node_consistency`, etc.) run and pass cleanly without any "arbitrary sleeps" or weakened assertions.

### 6 Legacy Test Targets
**Status**: BYPASSED / OPEN
**Clarification**: The targets (`raft_l3_1_hardening.rs`, `raft_l3_failure.rs`, `raft_l3_replication.rs`, `raft_l3_validation.rs`, `raft_p8_key_compromise.rs`, `raft_p8_soak.rs`) currently compile and pass because `RaftNetworkListener::new` explicitly bypasses the `PeerRegistry` check if the registry is empty. They were reverted to their state at `cc3b05c6` because migrating them required deeper architectural mock injections that broke the test compilations. They do not enforce SEC-018.

## 3. Cargo Audit
`cargo audit` returns a clean `exit 0` with exceptions documented in `.cargo/audit.toml`:
- `fxhash` (RUSTSEC-2023-0071): Unmaintained, but used internally in `ha_cluster` where DoS via hash collisions is not applicable.
- `instant` (RUSTSEC-2024-0384): Unmaintained, but safe for non-WASM targets.
- `serde_cbor` (RUSTSEC-2021-0127): Unmaintained, but we use strict validation.

## 4. Final Verdict

Because 6 legacy test targets still bypass `PeerRegistry` (and therefore do not enforce SEC-018), the strict criteria "all required Raft suites = PASS" against the SEC-018 contract is not fully met without bypasses. 
The serial workspace suite is executing now to verify the rest of the workspace.

**PHASE 0.2 = OPEN**
**PHASE 5 = FROZEN**
