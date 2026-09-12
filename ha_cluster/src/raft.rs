use crate::{ClusterNode, NodeId};
use core_crypto::QuantumNodeIdentity;
use futures::future::join_all;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::future::Future;
use std::io::{Read, Write};
use std::path::PathBuf;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{sleep, Duration, Instant};
use tracing::{info, warn};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LogEntry {
    pub term: u64,
    pub index: u64,
    pub client_id: String,
    pub request_id: String,
    pub data: Vec<u8>, // The serialized LedgerBlock payload
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RaftPersistentState {
    pub current_term: u64,
    pub voted_for: Option<NodeId>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RequestVoteArgs {
    pub term: u64,
    pub candidate_id: NodeId,
    pub last_log_index: u64,
    pub last_log_term: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RequestVoteReply {
    pub term: u64,
    pub vote_granted: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppendEntriesArgs {
    pub term: u64,
    pub leader_id: NodeId,
    pub prev_log_index: u64,
    pub prev_log_term: u64,
    pub entries: Vec<LogEntry>,
    pub leader_commit: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppendEntriesReply {
    pub term: u64,
    pub success: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum RaftRpcType {
    RequestVote,
    AppendEntries,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RaftRpcEnvelope {
    pub version: u16,
    pub rpc_type: RaftRpcType,
    pub sender_id: NodeId,
    pub receiver_id: NodeId,
    pub request_id: u64,
    pub payload: Vec<u8>,
}

#[derive(PartialEq, Eq, Clone, Copy, Debug)]
pub enum RaftRole {
    Follower,
    Candidate,
    Leader,
}

const ELECTION_TIMEOUT_MIN: u64 = 150;
const ELECTION_TIMEOUT_MAX: u64 = 300;
const HEARTBEAT_INTERVAL_MS: u64 = 100;

/// Interface for sending Raft RPCs.
/// Decouples the consensus logic from the network transport.
pub trait RaftRpcClient: Send + Sync {
    fn send_request_vote(
        &self,
        to: NodeId,
        args: RequestVoteArgs,
    ) -> Pin<Box<dyn Future<Output = Result<RequestVoteReply, String>> + Send>>;
    fn send_append_entries(
        &self,
        to: NodeId,
        args: AppendEntriesArgs,
    ) -> Pin<Box<dyn Future<Output = Result<AppendEntriesReply, String>> + Send>>;
}

impl<T: RaftRpcClient + ?Sized> RaftRpcClient for Arc<T> {
    fn send_request_vote(
        &self,
        to: NodeId,
        args: RequestVoteArgs,
    ) -> Pin<Box<dyn Future<Output = Result<RequestVoteReply, String>> + Send>> {
        self.as_ref().send_request_vote(to, args)
    }

    fn send_append_entries(
        &self,
        to: NodeId,
        args: AppendEntriesArgs,
    ) -> Pin<Box<dyn Future<Output = Result<AppendEntriesReply, String>> + Send>> {
        self.as_ref().send_append_entries(to, args)
    }
}

pub struct RaftNode {
    pub id: NodeId,
    pub role: RwLock<RaftRole>,
    pub current_term: Arc<RwLock<u64>>,
    pub voted_for: Arc<RwLock<Option<NodeId>>>,
    pub log: Arc<RwLock<Vec<LogEntry>>>,
    pub commit_index: Arc<RwLock<u64>>,
    pub last_applied: Arc<RwLock<u64>>,
    pub last_heartbeat: Arc<RwLock<Instant>>,
    pub persistence_path: PathBuf,
    pub rpc_client: Arc<dyn RaftRpcClient>,
    pub next_index: Arc<RwLock<HashMap<NodeId, u64>>>,
    pub match_index: Arc<RwLock<HashMap<NodeId, u64>>>,
}

impl RaftNode {
    pub fn new(id: NodeId, persistence_path: PathBuf, rpc_client: Arc<dyn RaftRpcClient>) -> Self {
        let state = Self::load_persistent_state(&persistence_path).unwrap_or(RaftPersistentState {
            current_term: 0,
            voted_for: None,
        });

        Self {
            id,
            role: RwLock::new(RaftRole::Follower),
            current_term: Arc::new(RwLock::new(state.current_term)),
            voted_for: Arc::new(RwLock::new(state.voted_for)),
            log: Arc::new(RwLock::new(Vec::new())),
            commit_index: Arc::new(RwLock::new(0)),
            last_applied: Arc::new(RwLock::new(0)),
            last_heartbeat: Arc::new(RwLock::new(Instant::now())),
            next_index: Arc::new(RwLock::new(HashMap::new())),
            match_index: Arc::new(RwLock::new(HashMap::new())),
            persistence_path,
            rpc_client,
        }
    }

    fn load_persistent_state(path: &PathBuf) -> Option<RaftPersistentState> {
        let mut file = OpenOptions::new().read(true).open(path).ok()?;
        let mut buf = Vec::new();
        file.read_to_end(&mut buf).ok()?;
        serde_json::from_slice(&buf).ok()
    }

    pub async fn persist_state(&self) -> std::io::Result<()> {
        let term = *self.current_term.read().await;
        let voted_for = self.voted_for.read().await.clone();
        let state = RaftPersistentState {
            current_term: term,
            voted_for,
        };
        let bytes = serde_json::to_vec(&state).unwrap();

        let tmp_path = self.persistence_path.with_extension("tmp");
        std::fs::write(&tmp_path, bytes)?;
        std::fs::rename(tmp_path, &self.persistence_path)
    }

    pub async fn update_term(&self, new_term: u64) {
        {
            let mut term = self.current_term.write().await;
            *term = new_term;
            let mut voted = self.voted_for.write().await;
            *voted = None;
        }
        // Persist after releasing write locks (persist_state reads them).
        let _ = self.persist_state().await;
    }

    /// P3.8 STEP 2: Submit a log entry as leader. Returns index of the appended entry.
    pub async fn submit_entry(&self, entry: LogEntry) -> Result<u64, String> {
        {
            let role = *self.role.read().await;
            if role != RaftRole::Leader {
                return Err("Node is not the leader".to_string());
            }
        }
        let mut log = self.log.write().await;
        let index = (log.len() as u64) + 1;
        log.push(entry);
        Ok(index)
    }

    /// P3.8 STEP 2: Initialize leader state (next_index, match_index) after winning election.
    pub async fn init_leader_state(&self, peers: &[NodeId]) {
        let log_len = {
            let log = self.log.read().await;
            log.len() as u64
        };
        let mut next_idx = self.next_index.write().await;
        let mut match_idx = self.match_index.write().await;
        for peer in peers {
            if peer != &self.id {
                next_idx.insert(peer.clone(), log_len + 1);
                match_idx.insert(peer.clone(), 0);
            }
        }
    }

    pub async fn handle_request_vote(&self, args: RequestVoteArgs) -> RequestVoteReply {
        let reply_term;
        let mut vote_granted = false;
        let mut stepped_down = false;
        let mut vote_changed = false;

        {
            let mut term = self.current_term.write().await;
            let mut voted_for = self.voted_for.write().await;

            if args.term > *term {
                *term = args.term;
                *voted_for = None;
                stepped_down = true;
            }

            reply_term = *term;
            if args.term == *term
                && (voted_for.is_none() || voted_for.as_ref() == Some(&args.candidate_id))
            {
                let log = self.log.read().await;
                let last_idx = log.len() as u64;
                let last_term = log.last().map(|e| e.term).unwrap_or(0);

                if args.last_log_term > last_term
                    || (args.last_log_term == last_term && args.last_log_index >= last_idx)
                {
                    vote_granted = true;
                    *voted_for = Some(args.candidate_id.clone());
                    vote_changed = true;
                }
            }
            // term + voted_for write locks released here
        }

        // Raft: if RPC term > currentTerm, convert to follower (step down).
        if stepped_down {
            let mut role_lock = self.role.write().await;
            if *role_lock != RaftRole::Follower {
                *role_lock = RaftRole::Follower;
            }
        }

        // Persist after releasing write locks (persist_state reads them).
        // Call whenever term or voted_for changed — not just on step-down.
        if stepped_down || vote_changed {
            let _ = self.persist_state().await;
        }
        *self.last_heartbeat.write().await = Instant::now();

        RequestVoteReply {
            term: reply_term,
            vote_granted,
        }
    }

    pub async fn handle_append_entries(&self, args: AppendEntriesArgs) -> AppendEntriesReply {
        let reply_term;
        let mut stepped_down = false;
        {
            let mut term = self.current_term.write().await;
            reply_term = *term;

            if args.term < *term {
                return AppendEntriesReply {
                    term: reply_term,
                    success: false,
                };
            }

            if args.term > *term {
                *term = args.term;
                let mut voted = self.voted_for.write().await;
                *voted = None;
                stepped_down = true;
            }
            // persist_state must run after write locks are released
        }

        // Reset heartbeat timer outside the current_term lock block.
        *self.last_heartbeat.write().await = Instant::now();

        // Raft: if AppendEntries term > currentTerm, convert to follower (step down).
        if stepped_down {
            let mut role_lock = self.role.write().await;
            if *role_lock != RaftRole::Follower {
                *role_lock = RaftRole::Follower;
            }
            let _ = self.persist_state().await;
        }

        let mut log = self.log.write().await;

        if args.prev_log_index > 0 {
            if args.prev_log_index as usize > log.len()
                || (log.len() > 0
                    && log[(args.prev_log_index - 1) as usize].term != args.prev_log_term)
            {
                return AppendEntriesReply {
                    term: reply_term,
                    success: false,
                };
            }
        }

        if !args.entries.is_empty() {
            // Raft log matching: entries must be inserted starting at prev_log_index
            // (which is the count of entries the follower already has that are confirmed).
            let prev_idx = args.prev_log_index as usize;

            // Truncate any conflicting entries from prev_idx onwards.
            // The leader is the authority on log contents; any entries beyond
            // prev_idx that the leader doesn't know about are from a discarded
            // leader and must be removed.
            log.truncate(prev_idx);

            // Append the new entries.
            log.extend(args.entries.clone());
        }

        let mut commit_idx = self.commit_index.write().await;
        *commit_idx = std::cmp::min(args.leader_commit, log.len() as u64);

        AppendEntriesReply {
            term: reply_term,
            success: true,
        }
    }

    pub async fn start_election(&self, peers: &[NodeId]) -> Result<bool, String> {
        info!(node_id = %self.id, "DEBUG_START_ELECTION_ENTERED");

        // Phase 1: Atomically bump term, record self-vote, and persist.
        // Locks MUST be released before calling persist_state() — persist_state
        // reads the same locks, and tokio::RwLock is NOT reentrant.
        let cur_term;
        {
            info!(node_id = %self.id, "DEBUG_BEFORE_TERM_WRITE");
            let mut term = self.current_term.write().await;
            *term += 1;
            cur_term = *term;
            info!(node_id = %self.id, "DEBUG_AFTER_TERM_WRITE term={}", cur_term);

            info!(node_id = %self.id, "DEBUG_BEFORE_VOTED_FOR_WRITE");
            let mut voted = self.voted_for.write().await;
            *voted = Some(self.id.clone());
            info!(node_id = %self.id, "DEBUG_AFTER_VOTED_FOR_WRITE");

            info!(node_id = %self.id, "DEBUG_BEFORE_ROLE_WRITE");
            let mut role_lock = self.role.write().await;
            *role_lock = RaftRole::Candidate;
            info!(node_id = %self.id, "DEBUG_AFTER_ROLE_WRITE");
        } // ← all write locks (term, voted_for, role) released HERE

        // Phase 2: Persist now that all locks are released.
        let _ = self.persist_state().await;

        info!(
            node_id = %self.id,
            term = cur_term,
            "ELECTION_START"
        );

        let last_idx;
        let last_term;
        {
            let log = self.log.read().await;
            last_idx = log.len() as u64;
            last_term = log.last().map(|e| e.term).unwrap_or(0);
        }

        let args = RequestVoteArgs {
            term: cur_term,
            candidate_id: self.id.clone(),
            last_log_index: last_idx,
            last_log_term: last_term,
        };

        let mut votes = 1; // self
        info!(candidate_id = %self.id, "DEBUG_BEFORE_REQUEST_VOTE_LOOP");
        for peer in peers {
            info!(
                candidate_id = %self.id,
                term = args.term,
                target_id = %peer,
                last_log_index = last_idx,
                last_log_term = last_term,
                "REQUEST_VOTE_SENT"
            );
            info!(candidate_id = %self.id, target_id = %peer, "DEBUG_CALLING_RPC");
            if let Ok(reply) = self
                .rpc_client
                .send_request_vote(peer.clone(), args.clone())
                .await
            {
                info!(
                    candidate_id = %self.id,
                    voter_id = %peer,
                    term = reply.term,
                    vote_granted = reply.vote_granted,
                    "REQUEST_VOTE_RESPONSE_RECEIVED"
                );
                if reply.vote_granted {
                    votes += 1;
                }
            }
        }

        info!(
            candidate_id = %self.id,
            term = args.term,
            votes = votes,
            "VOTE_COUNT"
        );

        if votes >= (peers.len() + 1) / 2 + 1 {
            info!(node_id = %self.id, term = args.term, "LEADER_TRANSITION");
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub async fn advance_commit_index(&self, match_indices: &HashMap<NodeId, u64>) {
        let mut commit_idx = self.commit_index.write().await;
        let term = *self.current_term.read().await;
        let log = self.log.read().await;

        let mut possible_commits: Vec<u64> = match_indices.values().cloned().collect();
        possible_commits.push(log.len() as u64);
        possible_commits.sort_by(|a, b| b.cmp(a));

        let quorum = (match_indices.len() + 1) / 2 + 1;
        if let Some(&n) = possible_commits.get(quorum - 1) {
            if n > *commit_idx && n > 0 && log[(n - 1) as usize].term == term {
                *commit_idx = n;
            }
        }
    }

    pub fn get_randomized_timeout() -> Duration {
        let millis = rand::thread_rng().gen_range(150..300);
        Duration::from_millis(millis)
    }

    pub async fn run(&self, peers: Vec<NodeId>) {
        info!(node_id = %self.id, "Raft run loop starting");
        let mut ticker = tokio::time::interval(Duration::from_millis(HEARTBEAT_INTERVAL_MS));
        loop {
            ticker.tick().await;
            let role = *self.role.read().await;
            match role {
                RaftRole::Follower | RaftRole::Candidate => {
                    let last_hb = *self.last_heartbeat.read().await;
                    let timeout = Duration::from_millis(rand::thread_rng().gen_range(ELECTION_TIMEOUT_MIN..ELECTION_TIMEOUT_MAX));

                    if last_hb.elapsed() >= timeout {
                        info!(node_id = %self.id, "Election timeout reached, starting election");

                        // Transition to Candidate
                        {
                            let mut role_lock = self.role.write().await;
                            *role_lock = RaftRole::Candidate;
                        }
                        *self.last_heartbeat.write().await = Instant::now();

                        // Start election
                        let peer_ids: Vec<NodeId> = peers.iter()
                            .filter(|&p| p != &self.id)
                            .cloned()
                            .collect();

                        info!(node_id = %self.id, "DEBUG_BEFORE_START_ELECTION_CALL");
                        if let Ok(true) = self.start_election(&peer_ids).await {
                            info!(node_id = %self.id, "DEBUG_AFTER_START_ELECTION_CALL won=true");
                            info!(node_id = %self.id, "Won election, becoming leader");
                            let mut role_lock = self.role.write().await;
                            *role_lock = RaftRole::Leader;
                        } else {
                            info!(node_id = %self.id, "DEBUG_AFTER_START_ELECTION_CALL won=false");
                            info!(node_id = %self.id, "Failed to win election, returning to follower");
                            let mut role_lock = self.role.write().await;
                            *role_lock = RaftRole::Follower;
                        }
                    }
                }
                RaftRole::Leader => {
                    // Initialize leader state on first transition to Leader.
                    let needs_init = {
                        let ni = self.next_index.read().await;
                        ni.is_empty()
                    };
                    if needs_init {
                        let peer_ids: Vec<NodeId> = peers.iter()
                            .filter(|&p| p != &self.id)
                            .cloned()
                            .collect();
                        self.init_leader_state(&peer_ids).await;
                        info!(node_id = %self.id, "Leader state initialized (next_index/match_index)");
                    }

                    // Phase 1: Build AppendEntries args for each peer from the
                    // leader's log, using per-peer next_index.
                    let cur_term = *self.current_term.read().await;
                    let commit_idx = *self.commit_index.read().await;
                    let peer_ids: Vec<NodeId> = peers.iter()
                        .filter(|&p| p != &self.id)
                        .cloned()
                        .collect();

                    type AppendReplyFut = Pin<Box<
                        dyn std::future::Future<
                            Output = (NodeId, Result<AppendEntriesReply, String>, u64, u64),
                        > + Send,
                    >>;
                    let mut append_futures: Vec<AppendReplyFut> = Vec::new();
                    {
                        let log = self.log.read().await;
                        let next_indices = self.next_index.read().await;

                        for peer in &peer_ids {
                            let next_idx = next_indices.get(peer).copied().unwrap_or(1);
                            let prev_log_index = next_idx.saturating_sub(1);
                            let prev_log_term = if prev_log_index > 0
                                && (prev_log_index as usize) <= log.len()
                            {
                                log[(prev_log_index - 1) as usize].term
                            } else {
                                0
                            };
                            let entries: Vec<LogEntry> = if (next_idx as usize) <= log.len() {
                                log[((next_idx - 1) as usize)..].to_vec()
                            } else {
                                vec![]
                            };
                            let entries_len = entries.len() as u64;

                            let args = AppendEntriesArgs {
                                term: cur_term,
                                leader_id: self.id.clone(),
                                prev_log_index,
                                prev_log_term,
                                entries,
                                leader_commit: commit_idx,
                            };

                            let client = self.rpc_client.clone();
                            let peer_id = peer.clone();
                            append_futures.push(Box::pin(async move {
                                let reply = client.send_append_entries(peer_id.clone(), args).await;
                                (peer_id, reply, prev_log_index, entries_len)
                            }));
                        }
                    } // log + next_index read locks released

                    // Phase 2: Send all AppendEntries concurrently, then process replies.
                    let replies = join_all(append_futures).await;

                    let mut should_step_down = false;
                    for (peer, result, prev_log_index, entries_len) in replies {
                        match result {
                            Ok(reply) => {
                                if reply.term > cur_term {
                                    should_step_down = true;
                                    warn!(
                                        node_id = %self.id,
                                        peer = %peer,
                                        reply_term = reply.term,
                                        current_term = cur_term,
                                        "Leader stepping down: stale-term AppendEntries reply"
                                    );
                                }
                                if reply.success {
                                    // matchIndex[n] = max(matchIndex[n], prevLogIndex + len(entries))
                                    let new_match = prev_log_index + entries_len;
                                    let mut match_map = self.match_index.write().await;
                                    let cur_match = match_map.get(&peer).copied().unwrap_or(0);
                                    if new_match > cur_match {
                                        match_map.insert(peer.clone(), new_match);
                                    }
                                    drop(match_map);
                                    // nextIndex[n] = matchIndex[n] + 1
                                    let mut next_map = self.next_index.write().await;
                                    let new_next = new_match + 1;
                                    let cur_next = next_map.get(&peer).copied().unwrap_or(1);
                                    if new_next > cur_next {
                                        next_map.insert(peer.clone(), new_next);
                                    }
                                } else {
                                    // Failed append: decrement nextIndex and retry on next tick
                                    let mut next_map = self.next_index.write().await;
                                    let cur_next = next_map.get(&peer).copied().unwrap_or(1);
                                    if cur_next > 1 {
                                        next_map.insert(peer.clone(), cur_next - 1);
                                    }
                                    warn!(
                                        node_id = %self.id,
                                        peer = %peer,
                                        prev_log_index = prev_log_index,
                                        "AppendEntries rejected by follower, backtracking nextIndex"
                                    );
                                }
                            }
                            Err(e) => {
                                warn!(
                                    node_id = %self.id,
                                    peer = %peer,
                                    err = %e,
                                    "AppendEntries RPC failed, will retry next tick"
                                );
                            }
                        }
                    }

                    // Step down if any reply carried a higher term.
                    if should_step_down {
                        let mut role_lock = self.role.write().await;
                        *role_lock = RaftRole::Follower;
                        info!(node_id = %self.id, "Stepped down to Follower (higher-term reply)");
                    }

                    // Phase 3: Advance commit index based on match_index quorum.
                    {
                        let match_clone: HashMap<NodeId, u64> =
                            self.match_index.read().await.clone();
                        self.advance_commit_index(&match_clone).await;
                    }
                }
            }
        }
    }
}

pub struct LedgerApplier {
    pub raft_node: Arc<RaftNode>,
    pub ledger: Arc<ledger_sync::MerkleLedger>,
    pub identity: Arc<QuantumNodeIdentity>,
    pub applied_requests: RwLock<HashMap<(String, String), u64>>,
}

impl LedgerApplier {
    pub fn new(
        raft_node: Arc<RaftNode>,
        ledger: Arc<ledger_sync::MerkleLedger>,
        identity: Arc<QuantumNodeIdentity>,
    ) -> Self {
        Self {
            raft_node,
            ledger,
            identity,
            applied_requests: RwLock::new(HashMap::new()),
        }
    }

    pub async fn apply_committed_entries(&self) -> Result<(), String> {
        let mut last_applied = self.raft_node.last_applied.write().await;
        let commit_index = *self.raft_node.commit_index.read().await;

        while *last_applied < commit_index {
            let index = *last_applied + 1;
            let log = self.raft_node.log.read().await;

            if index as usize > log.len() {
                break;
            }

            let entry = &log[(index - 1) as usize];

            let mut applied = self.applied_requests.write().await;
            if applied.contains_key(&(entry.client_id.clone(), entry.request_id.clone())) {
                *last_applied = index;
                continue;
            }

            let block = ledger_sync::LedgerBlock::new(
                index - 1, // Raft log is 1-based; ledger chain index is 0-based
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
                self.get_prev_hash(&log, index).await,
                [0u8; 32],
                &entry.data,
                &self.identity,
            )
            .map_err(|e| e.to_string())?;

            self.ledger
                .append_block(block, &self.identity.dsa_public_key_bytes())
                .await
                .map_err(|e| e.to_string())?;

            applied.insert((entry.client_id.clone(), entry.request_id.clone()), index);
            *last_applied = index;
        }
        Ok(())
    }

    async fn get_prev_hash(&self, _log: &[LogEntry], _index: u64) -> [u8; 32] {
        self.ledger.latest_hash().await
    }
}

/// Mock implementation of RaftRpcClient for unit tests.
pub struct MockRpcClient {
    pub cluster: Arc<RwLock<HashMap<NodeId, Arc<RaftNode>>>>,
}

impl MockRpcClient {
    pub fn new(cluster: Arc<RwLock<HashMap<NodeId, Arc<RaftNode>>>>) -> Self {
        Self { cluster }
    }
}

impl RaftRpcClient for MockRpcClient {
    fn send_request_vote(
        &self,
        to: NodeId,
        args: RequestVoteArgs,
    ) -> Pin<Box<dyn Future<Output = Result<RequestVoteReply, String>> + Send>> {
        let cluster = self.cluster.clone();
        Box::pin(async move {
            let cluster = cluster.read().await;
            let node = cluster
                .get(&to)
                .ok_or_else(|| "Node not found".to_string())?;
            Ok(node.handle_request_vote(args).await)
        })
    }

    fn send_append_entries(
        &self,
        to: NodeId,
        args: AppendEntriesArgs,
    ) -> Pin<Box<dyn Future<Output = Result<AppendEntriesReply, String>> + Send>> {
        let cluster = self.cluster.clone();
        Box::pin(async move {
            let cluster = cluster.read().await;
            let node = cluster
                .get(&to)
                .ok_or_else(|| "Node not found".to_string())?;
            Ok(node.handle_append_entries(args).await)
        })
    }
}
