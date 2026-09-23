# PHASE 0.2 Exit Report

Date: 2026-09-23
Scope: blocker fixes only. Phase 5 remains FROZEN.

## Verdict

Phase 0.2 is **OPEN**. SEC-003 and SEC-018 remediation tests pass, but the workspace gates remain non-GREEN because seven real-network Raft test targets still require migration to the explicit SEC-018 peer-binding contract. No Phase 5 work was started.

## SEC Status

| Item | Status | Evidence / limitation |
|---|---|---|
| SEC-001 | OPEN | Not addressed in this blocker pass. |
| SEC-002 | OPEN | Not addressed in this blocker pass. |
| SEC-003 | CLOSED | Production path is now `RaftNode -> persist_state_with -> versioned envelope on disk -> RaftNode reload`. With `persist_on_submit=true` and `state_machine_mac_key=Some([0x42; 32])`, valid reload succeeds; payload, MAC, legacy plaintext, and truncation are rejected and follow the explicit fresh-start recovery policy. The test exercises `RaftNode::submit_entry`, `RaftNode::persist_state`, and `RaftNode::with_config` reload, not serde alone. |
| SEC-004 through SEC-017 | OPEN | Not addressed in this blocker pass. |
| SEC-018 | CLOSED WITH DOCUMENTED LIMITATION | Handshake public-key fingerprints are retained in `SessionContext`; the Raft listener requires an explicit fingerprint-to-`NodeId` binding and rejects unknown, stale, forged, and mismatched envelope senders before dispatch. Four listener identity unit tests and the real TCP + PQ + AEAD forged-sender test pass. Deployment must provision the peer binding registry; an unconfigured peer is fail-closed. |
| SEC-019 | OUT OF PRODUCTION SCOPE | Dashboard remains a PoC surface. |

Checkpoint and ledger integrity tests remain separate from SEC-003 persistence integrity and were not used as proof of Raft snapshot protection.

## Compile Blockers

Resolved:

- `Zeroizing<[u8; 32]>` callers now dereference keys before `AeadTransport::new`.
- `chain_tip()` and `canonical_hash()` Result values are handled explicitly.
- All explicit `RaftConfig` literals provide `state_machine_mac_key`.

Focused HaCluster test compilation succeeds.

## Verification

### `cargo audit`

**PASS (exit 0)**: `rustls` is upgraded to 0.23.45. `lopdf 0.26.0` remains only through the PoC-only `poc_auditor -> genpdf` path and is explicitly listed in `.cargo/audit.toml` (`RUSTSEC-2026-0187`) with a documented migration exception. The audit still reports 11 visible allowed warnings: unmaintained `encoding`, `fxhash`, `instant`, `lzw`, `paste`, `rusttype`, `serde_cbor`, `stb_truetype`, `stdweb`, and unsound `lru` advisories `RUSTSEC-2026-0002` and `RUSTSEC-2026-0253`. They remain documented and visible; they were not hidden by removing an unused dependency.

### SEC-018 evidence

```text
cargo test -p ha_cluster --test raft_p9_tcp_byzantine -- --test-threads=1
```

Result: **PASS, exit 0, 1/1**: `raft_p9_tcp_byzantine_sender_identity_must_be_rejected`. Listener unit cases: `valid_sender_matches_authenticated_peer`, `forged_sender_does_not_match_authenticated_peer`, `stale_authenticated_peer_is_rejected`, and `envelope_sender_must_match_handshake_binding`, **4/4**.

### SEC-003 evidence

```text
cargo test -p ha_cluster --test raft_p8_crash_corruption -- --test-threads=1
```

Result: **PASS, exit 0, 11/11**: `sec_003_production_persistence_integrity_and_recovery`, `p8_5a_torn_raft_state_write`, `p8_5b_torn_ledger_write`, `p8_5c_torn_checkpoint_write`, `p8_6a_corrupted_ledger_entry`, `p8_6b_corrupted_checkpoint_merkle_root`, `p8_6c_corrupted_checkpoint_signature`, `p8_6d_corrupted_checkpoint_chain`, `p8_6e_corrupted_raft_state`, `p8_6f_corrupted_ledger_mid_chain`, and `p8_6g_pq_verify_detects_corruption`.

### Workspace tests

```text
cargo test --workspace --no-fail-fast
cargo test --workspace --no-fail-fast -- --test-threads=1
```

The captured concurrent command exited **101** with seven failed targets: `raft_l3_1_hardening`, `raft_l3_2_checkpoints`, `raft_l3_failure`, `raft_l3_replication`, `raft_l3_validation`, `raft_p8_key_compromise`, and `raft_p8_soak`. The first failing operation in the original L3.1/L3.2 runs was leader election; exact error: `Election timed out — no stable leader: Elapsed(())`. The invariant was authenticated Raft peers must elect and exchange RPCs. Classification: stale test harness/API contract for the listener-binding failures. L3.1 and L3 failure have since been migrated and their isolated recovery tests pass. The migrated L3.2 suite is 23/27: `test_c12_tail_truncation_detected` fails `left: 9, right: 10`; `test_c22_restart_during_commitment` fails raw state parse with `missing field current_term`; `test_c23_new_leader_recovery` fails `Node node-b should have checkpoint`; and `test_c24_cross_node_consistency` fails `Node node-a should have exactly 1 checkpoint` (`left: 0, right: 1`). The other listed targets still need migration and are not claimed fixed.

The required serial command was started after the latest edits but was stopped while the pre-migration L3.1 binary was running its real-process-crash loop. Its captured pre-migration result was 8 passed and 4 failed. Post-migration isolated evidence is now PASS for `test_address_change_recovery`, `test_crash_during_commit`, `test_durable_log_recovery`, and `test_real_process_crash` (2 tests, including 10/10 crash iterations). No serial workspace exit code is claimed because that full command was terminated; no serial GREEN claim is made.

## Phase Gate

Phase 5 is **FROZEN** until all critical/high findings, dependency audit findings, normal-concurrency failures, and remaining build/verification prerequisites are resolved and evidenced.
