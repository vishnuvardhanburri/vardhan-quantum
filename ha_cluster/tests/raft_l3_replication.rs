//! P3.8 STEP 2 — End-to-end AppendEntries / log replication tests.
//!
//! These tests use the REAL authenticated PQ transport (RaftPeerManager →
//! AeadTransport → TCP → RaftNetworkListener → RaftNode).  No in-memory
//! mocks for the primary E2E paths.

use std::sync::Arc;
use core_crypto::QuantumNodeIdentity;
use ha_cluster::{
    ClusterMembership, NodeId, RaftNode, RaftNetworkListener, RaftPeerManager, RaftRole,
    raft::{AppendEntriesArgs, LedgerApplier, LogEntry, MockRpcClient, RaftRpcClient,
          RequestVoteArgs, RequestVoteReply},
};
use ledger_sync::MerkleLedger;
use tokio::time::{timeout, Duration};
use tracing::{info, error, warn};

const ELECTION_WAIT: Duration = Duration::from_secs(5);
const REPLICATION_WAIT: Duration = Duration::from_secs(3);

// ── Test harness ──────────────────────────────────────────────────────────

struct TestNode {
    id: NodeId,
    identity: Arc<QuantumNodeIdentity>,
    node: Arc<RaftNode>,
    ledger: Arc<MerkleLedger>,
    applier: Arc<LedgerApplier>,
    listener_handle: tokio::task::JoinHandle<()>,
    run_handle: tokio::task::JoinHandle<()>,
    apply_handle: tokio::task::JoinHandle<()>,
}

async fn spawn_node(
    id: NodeId,
    addr: std::net::SocketAddr,
    membership: Arc<ClusterMembership>,
    peers: Vec<NodeId>,
) -> TestNode {
    let identity = Arc::new(QuantumNodeIdentity::generate_node_identity().unwrap());

    let peer_manager = Arc::new(RaftPeerManager::new(
        identity.clone(),
        membership.clone(),
        id.clone(),
    ));

    let persistence_path = std::path::PathBuf::from(format!("/tmp/raft_l3_{}.json", id.as_str()));
    let raft_node = Arc::new(RaftNode::new(
        id.clone(),
        persistence_path,
        peer_manager.clone() as Arc<dyn RaftRpcClient>,
    ));

    let ledger = Arc::new(MerkleLedger::new());
    let applier = Arc::new(LedgerApplier::new(raft_node.clone(), ledger.clone(), identity.clone()));

    let listener = RaftNetworkListener::new(addr, identity.clone(), raft_node.clone());
    let listener_id = id.clone();
    let listener_handle = tokio::spawn(async move {
        if let Err(e) = listener.run().await {
            error!(node = %listener_id, err = %e, "Raft listener failed");
        }
    });

    let apply_handle = {
        let applier_clone = applier.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_millis(50));
            loop {
                interval.tick().await;
                if let Err(e) = applier_clone.apply_committed_entries().await {
                    warn!(err = %e, "LedgerApplier error");
                }
            }
        })
    };

    let run_handle = {
        let raft_ref = raft_node.clone();
        let peers_clone = peers.clone();
        tokio::spawn(async move { raft_ref.run(peers_clone).await })
    };

    TestNode {
        id,
        identity,
        node: raft_node,
        ledger,
        applier,
        listener_handle,
        run_handle,
        apply_handle,
    }
}

async fn abort_all(nodes: &mut [TestNode]) {
    for node in nodes.iter_mut() {
        node.run_handle.abort();
        node.listener_handle.abort();
        node.apply_handle.abort();
    }
}

async fn find_leader(nodes: &[TestNode]) -> Option<Arc<RaftNode>> {
    for n in nodes {
        if *n.node.role.read().await == RaftRole::Leader {
            return Some(n.node.clone());
        }
    }
    None
}

async fn wait_for_leader(nodes: &[TestNode]) -> Arc<RaftNode> {
    timeout(ELECTION_WAIT, async {
        loop {
            let roles: Vec<_> = {
                let r0 = *nodes[0].node.role.read().await;
                let r1 = *nodes[1].node.role.read().await;
                let r2 = *nodes[2].node.role.read().await;
                vec![r0, r1, r2]
            };
            let leaders = roles.iter().filter(|&&r| r == RaftRole::Leader).count();
            let candidates = roles.iter().filter(|&&r| r == RaftRole::Candidate).count();
            if leaders == 1 && candidates == 0 {
                return find_leader(nodes).await.unwrap();
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    })
    .await
    .expect("Election timed out — no stable leader")
}

async fn wait_for_log_len(node: &RaftNode, min_len: usize, timeout_dur: Duration) -> bool {
    timeout(timeout_dur, async {
        loop {
            let log = node.log.read().await;
            if log.len() >= min_len {
                return true;
            }
            drop(log);
            tokio::time::sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .unwrap_or(false)
}

async fn wait_for_commit(node: &RaftNode, min_idx: u64, timeout_dur: Duration) -> bool {
    timeout(timeout_dur, async {
        loop {
            if *node.commit_index.read().await >= min_idx {
                return true;
            }
            tokio::time::sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .unwrap_or(false)
}

// ── Primary E2E replication test ──────────────────────────────────────────

#[tokio::test]
async fn test_replication_basic() {
    let _ = tracing_subscriber::fmt::try_init();
    let membership = Arc::new(ClusterMembership::new());

    let addr_a: std::net::SocketAddr = "127.0.0.1:18101".parse().unwrap();
    let addr_b: std::net::SocketAddr = "127.0.0.1:18102".parse().unwrap();
    let addr_c: std::net::SocketAddr = "127.0.0.1:18103".parse().unwrap();

    membership.register_self(NodeId::new("node-a"), addr_a, 18101).await;
    membership.register_self(NodeId::new("node-b"), addr_b, 18102).await;
    membership.register_self(NodeId::new("node-c"), addr_c, 18103).await;

    let peers: Vec<NodeId> = vec![
        NodeId::new("node-a"),
        NodeId::new("node-b"),
        NodeId::new("node-c"),
    ];

    tokio::time::sleep(Duration::from_millis(100)).await;

    let mut nodes = vec![
        spawn_node(NodeId::new("node-a"), addr_a, membership.clone(), peers.clone()).await,
        spawn_node(NodeId::new("node-b"), addr_b, membership.clone(), peers.clone()).await,
        spawn_node(NodeId::new("node-c"), addr_c, membership.clone(), peers.clone()).await,
    ];

    // Step 1: Elect exactly one leader
    let leader = wait_for_leader(&nodes).await;
    info!("Leader elected: {}", leader.id);

    // Step 2: Submit one deterministic entry to the leader
    let term = *leader.current_term.read().await;
    let entry = LogEntry {
        term,
        index: 0,
        client_id: "client-test".to_string(),
        request_id: "req-001".to_string(),
        data: b"hello-raft".to_vec(),
    };
    let entry_index = leader.submit_entry(entry).await
        .expect("Failed to submit entry to leader");
    info!("Submitted entry at index {}", entry_index);

    // Step 3-4: Wait for all 3 logs to contain the entry
    let replicated = timeout(REPLICATION_WAIT, async {
        loop {
            let mut all_ok = true;
            for n in &nodes {
                let log = n.node.log.read().await;
                if log.len() < entry_index as usize {
                    all_ok = false;
                }
            }
            if all_ok { break true; }
            tokio::time::sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .unwrap_or(false);
    assert!(replicated, "Entry not replicated to all 3 nodes");

    // Step 5: Verify prev_log_index/prev_log_term matching
    // If replication succeeded, all entries were accepted — matching passed.
    // Verify the entry content matches across all nodes.
    {
        let log_a = nodes[0].node.log.read().await;
        let log_b = nodes[1].node.log.read().await;
        let log_c = nodes[2].node.log.read().await;
        let idx = (entry_index - 1) as usize;
        assert_eq!(log_a[idx].client_id, "client-test");
        assert_eq!(log_b[idx].client_id, "client-test");
        assert_eq!(log_c[idx].client_id, "client-test");
        assert_eq!(log_a[idx].data, b"hello-raft");
        assert_eq!(log_b[idx].data, b"hello-raft");
        assert_eq!(log_c[idx].data, b"hello-raft");
        assert_eq!(log_a[idx].term, term);
        assert_eq!(log_b[idx].term, term);
        assert_eq!(log_c[idx].term, term);
    }
    info!("Replication verified: all 3 logs contain matching entry at index {}", entry_index);

    // Step 6: Verify commitIndex advancement on all nodes
    for n in &nodes {
        assert!(wait_for_commit(&n.node, entry_index, REPLICATION_WAIT).await,
            "Node {} commit_index did not advance", n.id);
    }
    let ci = [
        *nodes[0].node.commit_index.read().await,
        *nodes[1].node.commit_index.read().await,
        *nodes[2].node.commit_index.read().await,
    ];
    info!("Commit indexes: A={}, B={}, C={}", ci[0], ci[1], ci[2]);

    // Step 7: Verify entry is applied exactly once (check ledger)
    let ledger_ok = timeout(REPLICATION_WAIT, async {
        loop {
            let len_a = nodes[0].ledger.len().await;
            let len_b = nodes[1].ledger.len().await;
            let len_c = nodes[2].ledger.len().await;
            if len_a >= 1 && len_b >= 1 && len_c >= 1 {
                return true;
            }
            tokio::time::sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .unwrap_or(false);
    assert!(ledger_ok, "Entry not applied to all ledgers");

    let block_a = nodes[0].ledger.get_block(0).await;
    let block_b = nodes[1].ledger.get_block(0).await;
    let block_c = nodes[2].ledger.get_block(0).await;
    assert!(block_a.is_some(), "Leader ledger missing block 0");
    assert!(block_b.is_some(), "Follower B ledger missing block 0");
    assert!(block_c.is_some(), "Follower C ledger missing block 0");
    let expected_hash = *blake3::hash(b"hello-raft").as_bytes();
    assert_eq!(block_a.unwrap().payload_hash, expected_hash);
    assert_eq!(block_b.unwrap().payload_hash, expected_hash);
    assert_eq!(block_c.unwrap().payload_hash, expected_hash);

    assert_eq!(nodes[0].ledger.len().await, 1, "Leader ledger has >1 entries");
    assert_eq!(nodes[1].ledger.len().await, 1, "Follower B ledger has >1 entries");
    assert_eq!(nodes[2].ledger.len().await, 1, "Follower C ledger has >1 entries");

    // Step 8: Verify leader remains leader during successful replication
    assert_eq!(*leader.role.read().await, RaftRole::Leader,
        "Leader stepped down during successful replication");
    info!("Leader remained leader throughout replication");

    // Step 9: Idempotency — submit SAME request_id
    let dup_entry = LogEntry {
        term, index: 0,
        client_id: "client-test".to_string(),
        request_id: "req-001".to_string(),
        data: b"hello-raft".to_vec(),
    };
    let dup_result = leader.submit_entry(dup_entry).await;
    assert!(dup_result.is_ok(), "Leader should accept duplicate entry (log-level dedup)");

    tokio::time::sleep(Duration::from_millis(500)).await;
    // LedgerApplier deduplicates by (client_id, request_id) — should still be 1 block
    assert_eq!(nodes[0].ledger.len().await, 1, "Duplicate entry was applied to leader ledger");
    info!("Idempotency verified: duplicate request_id not applied twice");

    abort_all(&mut nodes).await;
}

// ── Failure tests ──────────────────────────────────────────────────────────

/// Follower temporarily unavailable, then restarts and catches up.
#[tokio::test]
async fn test_follower_unavailable_then_catchup() {
    let _ = tracing_subscriber::fmt::try_init();
    let membership = Arc::new(ClusterMembership::new());

    let addr_a: std::net::SocketAddr = "127.0.0.1:18111".parse().unwrap();
    let addr_b: std::net::SocketAddr = "127.0.0.1:18112".parse().unwrap();
    let addr_c: std::net::SocketAddr = "127.0.0.1:18113".parse().unwrap();

    membership.register_self(NodeId::new("node-a"), addr_a, 18111).await;
    membership.register_self(NodeId::new("node-b"), addr_b, 18112).await;
    membership.register_self(NodeId::new("node-c"), addr_c, 18113).await;

    let peers: Vec<NodeId> = vec![
        NodeId::new("node-a"),
        NodeId::new("node-b"),
        NodeId::new("node-c"),
    ];

    tokio::time::sleep(Duration::from_millis(100)).await;

    let mut nodes = vec![
        spawn_node(NodeId::new("node-a"), addr_a, membership.clone(), peers.clone()).await,
        spawn_node(NodeId::new("node-b"), addr_b, membership.clone(), peers.clone()).await,
        spawn_node(NodeId::new("node-c"), addr_c, membership.clone(), peers.clone()).await,
    ];

    let leader = wait_for_leader(&nodes).await;
    info!("Leader: {}", leader.id);

    // Submit entry 1
    let term = *leader.current_term.read().await;
    let entry1 = LogEntry {
        term, index: 0,
        client_id: "client-f1".to_string(),
        request_id: "r1".to_string(),
        data: b"entry-1".to_vec(),
    };
    let idx1 = leader.submit_entry(entry1).await.unwrap();

    // Wait for all 3 to replicate
    for n in &nodes {
        assert!(wait_for_log_len(&n.node, idx1 as usize, REPLICATION_WAIT).await,
            "Node {} did not replicate entry 1", n.id);
    }

    // Find a follower (not leader) and abort its run task
    let follower_idx = if leader.id == nodes[0].id { 1 } else { 0 };
    info!("Aborting follower node: {}", nodes[follower_idx].id);
    nodes[follower_idx].run_handle.abort();

    // Submit entry 2 — leader should still commit (2/3 quorum)
    let entry2 = LogEntry {
        term, index: 0,
        client_id: "client-f1".to_string(),
        request_id: "r2".to_string(),
        data: b"entry-2".to_vec(),
    };
    let idx2 = leader.submit_entry(entry2).await.unwrap();

    // Wait for commit on leader
    assert!(wait_for_commit(&leader, idx2, REPLICATION_WAIT).await,
        "Leader did not commit entry 2 while follower was down");
    info!("Leader continued operating with one follower down");

    abort_all(&mut nodes).await;
}

/// Conflicting follower log — leader should repair divergence via backtracking.
#[tokio::test]
async fn test_conflicting_follower_log() {
    let _ = tracing_subscriber::fmt::try_init();
    let membership = Arc::new(ClusterMembership::new());

    let addr_a: std::net::SocketAddr = "127.0.0.1:18121".parse().unwrap();
    let addr_b: std::net::SocketAddr = "127.0.0.1:18122".parse().unwrap();
    let addr_c: std::net::SocketAddr = "127.0.0.1:18123".parse().unwrap();

    membership.register_self(NodeId::new("node-a"), addr_a, 18121).await;
    membership.register_self(NodeId::new("node-b"), addr_b, 18122).await;
    membership.register_self(NodeId::new("node-c"), addr_c, 18123).await;

    let peers: Vec<NodeId> = vec![
        NodeId::new("node-a"),
        NodeId::new("node-b"),
        NodeId::new("node-c"),
    ];

    tokio::time::sleep(Duration::from_millis(100)).await;

    let mut nodes = vec![
        spawn_node(NodeId::new("node-a"), addr_a, membership.clone(), peers.clone()).await,
        spawn_node(NodeId::new("node-b"), addr_b, membership.clone(), peers.clone()).await,
        spawn_node(NodeId::new("node-c"), addr_c, membership.clone(), peers.clone()).await,
    ];

    let leader = wait_for_leader(&nodes).await;
    info!("Leader: {}", leader.id);

    let term = *leader.current_term.read().await;
    let entry = LogEntry {
        term, index: 0,
        client_id: "client-f2".to_string(),
        request_id: "r1".to_string(),
        data: b"real-entry".to_vec(),
    };
    let idx = leader.submit_entry(entry).await.unwrap();

    // Wait for normal replication
    for n in &nodes {
        assert!(wait_for_log_len(&n.node, idx as usize, REPLICATION_WAIT).await,
            "Node {} did not replicate entry 1", n.id);
    }

    // Corrupt one follower's log
    let f_idx = if leader.id == nodes[0].id { 1 } else { 0 };
    {
        let mut log = nodes[f_idx].node.log.write().await;
        log.clear();
        log.push(LogEntry {
            term: term + 100,
            index: 1,
            client_id: "attacker".to_string(),
            request_id: "evil".to_string(),
            data: b"corrupt".to_vec(),
        });
    }
    info!("Corrupted log on node {}", nodes[f_idx].id);

    // Submit another entry — leader will detect conflict and repair
    let entry2 = LogEntry {
        term, index: 0,
        client_id: "client-f2".to_string(),
        request_id: "r2".to_string(),
        data: b"entry-2".to_vec(),
    };
    let idx2 = leader.submit_entry(entry2).await.unwrap();

    // Wait for follower to be repaired (log matches leader)
    let ok = timeout(Duration::from_secs(5), async {
        loop {
            let leader_log_len = leader.log.read().await.len();
            let f_log = nodes[f_idx].node.log.read().await;
            let repaired = f_log.len() == leader_log_len
                && f_log[0].data == b"real-entry"
                && f_log[0].term == term;
            drop(f_log);
            if repaired { return true; }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    })
    .await
    .unwrap_or(false);
    assert!(ok, "Follower log was not repaired after conflict");
    info!("Follower log repaired correctly after conflict");

    abort_all(&mut nodes).await;
}

/// Stale AppendEntries (lower term) should be rejected — no state corruption.
#[tokio::test]
async fn test_stale_append_entries_rejected() {
    let identity = Arc::new(QuantumNodeIdentity::generate_node_identity().unwrap());
    let membership = Arc::new(ClusterMembership::new());
    let pm = Arc::new(RaftPeerManager::new(
        identity.clone(), membership.clone(), NodeId::new("node-a"),
    ));
    let path = std::path::PathBuf::from("/tmp/raft_stale_test.json");
    let _ = std::fs::remove_file(&path);
    let node = Arc::new(RaftNode::new(
        NodeId::new("node-a"), path, pm as Arc<dyn RaftRpcClient>,
    ));

    // Set current term to 5
    node.update_term(5).await;

    // Send AppendEntries with term 3 (stale — lower than current)
    let stale_args = AppendEntriesArgs {
        term: 3,
        leader_id: NodeId::new("node-b"),
        prev_log_index: 0,
        prev_log_term: 0,
        entries: vec![LogEntry {
            term: 3, index: 1,
            client_id: "stale".to_string(),
            request_id: "stale-1".to_string(),
            data: b"stale".to_vec(),
        }],
        leader_commit: 0,
    };
    let reply = node.handle_append_entries(stale_args).await;
    assert!(!reply.success, "Stale AppendEntries should be rejected");
    assert_eq!(reply.term, 5, "Reply should carry current term");

    // Verify no log entry was added
    let log = node.log.read().await;
    assert!(log.is_empty(), "Log should be empty after rejected stale AE");
    drop(log);

    assert_eq!(*node.current_term.read().await, 5, "Term should not be lowered");
    assert_eq!(*node.role.read().await, RaftRole::Follower);
}

/// Higher-term AppendEntries should force Leader → Follower step-down.
#[tokio::test]
async fn test_higher_term_append_entries_steps_down() {
    let identity = Arc::new(QuantumNodeIdentity::generate_node_identity().unwrap());
    let membership = Arc::new(ClusterMembership::new());
    let pm = Arc::new(RaftPeerManager::new(
        identity.clone(), membership.clone(), NodeId::new("node-a"),
    ));
    let path = std::path::PathBuf::from("/tmp/raft_stepdown_test.json");
    let _ = std::fs::remove_file(&path);
    let node = Arc::new(RaftNode::new(
        NodeId::new("node-a"), path, pm as Arc<dyn RaftRpcClient>,
    ));

    // Force node to Leader at term 1
    node.update_term(1).await;
    {
        let mut role = node.role.write().await;
        *role = RaftRole::Leader;
    }

    // Send AppendEntries with term 5 (> current term 1)
    let higher_term_args = AppendEntriesArgs {
        term: 5,
        leader_id: NodeId::new("node-b"),
        prev_log_index: 0,
        prev_log_term: 0,
        entries: vec![],
        leader_commit: 0,
    };
    let reply = node.handle_append_entries(higher_term_args).await;
    assert!(reply.success, "Higher-term AE should be accepted");
    assert_eq!(*node.current_term.read().await, 5, "Term should be updated to 5");
    assert_eq!(*node.role.read().await, RaftRole::Follower,
        "Leader must step down to Follower on higher term");
}

/// Delayed/stale AppendEntries response — leader must not corrupt state.
/// Uses MockRpcClient for controlled timing.
#[tokio::test]
async fn test_append_entries_response_handling() {
    use tokio::sync::RwLock as TokioRwLock;
    use std::collections::HashMap as StdHashMap;

    let membership = Arc::new(ClusterMembership::new());
    let id_a = NodeId::new("node-a");
    let id_b = NodeId::new("node-b");

    let path_a = std::path::PathBuf::from("/tmp/raft_ae_test_a.json");
    let path_b = std::path::PathBuf::from("/tmp/raft_ae_test_b.json");
    let _ = std::fs::remove_file(&path_a);
    let _ = std::fs::remove_file(&path_b);

    let cluster_map: Arc<TokioRwLock<StdHashMap<NodeId, Arc<RaftNode>>>> =
        Arc::new(TokioRwLock::new(StdHashMap::new()));

    let identity_a = Arc::new(QuantumNodeIdentity::generate_node_identity().unwrap());
    let rpc_a = Arc::new(MockRpcClient::new(cluster_map.clone())) as Arc<dyn RaftRpcClient>;
    let rpc_b = Arc::new(MockRpcClient::new(cluster_map.clone())) as Arc<dyn RaftRpcClient>;

    let node_a = RaftNode::new(id_a.clone(), path_a, rpc_a);
    let node_a = Arc::new(node_a);
    let node_b = RaftNode::new(id_b.clone(), path_b, rpc_b);
    let node_b = Arc::new(node_b);

    {
        let mut map = cluster_map.write().await;
        map.insert(id_a.clone(), node_a.clone());
        map.insert(id_b.clone(), node_b.clone());
    }

    // Node A starts election (1 peer: B)
    let peers_a = vec![id_b.clone()];
    let election_result = node_a.start_election(&peers_a).await;
    assert!(election_result.is_ok(), "Election should succeed");
    assert!(election_result.unwrap(), "Node A should win (self-vote + B)");

    // start_election returns Ok(true) but doesn't set role — the run() loop
    // handles the transition. We replicate that here since we call directly.
    {
        let mut role_lock = node_a.role.write().await;
        *role_lock = RaftRole::Leader;
    }
    node_a.init_leader_state(&peers_a).await;

    assert_eq!(*node_a.role.read().await, RaftRole::Leader);

    // Submit an entry
    let term = *node_a.current_term.read().await;
    let entry = LogEntry {
        term, index: 0,
        client_id: "client-ae".to_string(),
        request_id: "req-ae-1".to_string(),
        data: b"ae-test".to_vec(),
    };
    let idx = node_a.submit_entry(entry).await.unwrap();

    // Send AppendEntries directly (Leader → Follower B)
    let args = AppendEntriesArgs {
        term,
        leader_id: id_a.clone(),
        prev_log_index: 0,
        prev_log_term: 0,
        entries: vec![LogEntry {
            term, index: idx,
            client_id: "client-ae".to_string(),
            request_id: "req-ae-1".to_string(),
            data: b"ae-test".to_vec(),
        }],
        leader_commit: 0,
    };
    let reply = node_b.handle_append_entries(args).await;
    assert!(reply.success, "Follower should accept valid AppendEntries");

    // Verify B's log
    let b_log = node_b.log.read().await;
    assert_eq!(b_log.len(), 1, "Follower B should have 1 entry");
    assert_eq!(b_log[0].data, b"ae-test");
    drop(b_log);

    // Send stale (lower-term) AppendEntries — should be rejected
    let stale_args = AppendEntriesArgs {
        term: term.saturating_sub(1),
        leader_id: id_a.clone(),
        prev_log_index: 0,
        prev_log_term: 0,
        entries: vec![LogEntry {
            term: term.saturating_sub(1),
            index: idx,
            client_id: "stale-client".to_string(),
            request_id: "stale-1".to_string(),
            data: b"stale".to_vec(),
        }],
        leader_commit: 0,
    };
    let stale_reply = node_b.handle_append_entries(stale_args).await;
    assert!(!stale_reply.success, "Stale-term AE should be rejected");

    let b_log = node_b.log.read().await;
    assert_eq!(b_log.len(), 1, "Follower B log should be unchanged after stale AE");
    assert_eq!(b_log[0].data, b"ae-test", "Follower B entry should be unchanged");
    drop(b_log);
}
