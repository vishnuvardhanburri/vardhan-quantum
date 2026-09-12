use crate::raft::{
    AppendEntriesArgs, AppendEntriesReply, RaftRpcClient, RaftRpcEnvelope, RaftRpcType,
    RequestVoteArgs, RequestVoteReply,
};
use crate::{ClusterMembership, NodeId};
use core_crypto::QuantumNodeIdentity;
use proxy_engine::{run_initiator, transport::AeadTransport};
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio::net::TcpStream;
use tokio::sync::{mpsc, oneshot, RwLock};
use tokio::time::{timeout, Duration};
use tracing::{error, info, warn};

/// A request to be sent by the PeerWorker.
pub enum PeerRequest {
    RequestVote {
        request_id: u64,
        args: RequestVoteArgs,
        response_tx: oneshot::Sender<Result<Vec<u8>, String>>,
    },
    AppendEntries {
        request_id: u64,
        args: AppendEntriesArgs,
        response_tx: oneshot::Sender<Result<Vec<u8>, String>>,
    },
}

impl PeerRequest {
    fn request_id(&self) -> u64 {
        match self {
            PeerRequest::RequestVote { request_id, .. } => *request_id,
            PeerRequest::AppendEntries { request_id, .. } => *request_id,
        }
    }

    fn rpc_type(&self) -> RaftRpcType {
        match self {
            PeerRequest::RequestVote { .. } => RaftRpcType::RequestVote,
            PeerRequest::AppendEntries { .. } => RaftRpcType::AppendEntries,
        }
    }

    fn payload(&self) -> Vec<u8> {
        match self {
            PeerRequest::RequestVote { args, .. } => serde_json::to_vec(args).unwrap(),
            PeerRequest::AppendEntries { args, .. } => serde_json::to_vec(args).unwrap(),
        }
    }

    fn take_response_tx(self) -> oneshot::Sender<Result<Vec<u8>, String>> {
        match self {
            PeerRequest::RequestVote { response_tx, .. } => response_tx,
            PeerRequest::AppendEntries { response_tx, .. } => response_tx,
        }
    }
}

/// Manages authenticated PQ connections to Raft peers via dedicated worker tasks.
#[derive(Clone)]
pub struct RaftPeerManager {
    inner: Arc<RaftPeerManagerInner>,
}

struct RaftPeerManagerInner {
    identity: Arc<QuantumNodeIdentity>,
    membership: Arc<ClusterMembership>,
    self_node_id: NodeId,
    workers: RwLock<HashMap<NodeId, mpsc::Sender<PeerRequest>>>,
    next_request_id: AtomicU64,
}

impl RaftPeerManager {
    pub fn new(
        identity: Arc<QuantumNodeIdentity>,
        membership: Arc<ClusterMembership>,
        self_node_id: NodeId,
    ) -> Self {
        Self {
            inner: Arc::new(RaftPeerManagerInner {
                identity,
                membership,
                self_node_id,
                workers: RwLock::new(HashMap::new()),
                next_request_id: AtomicU64::new(0),
            }),
        }
    }

    /// P3.8: Delegate to inner for test access / external callers.
    pub async fn get_or_spawn_worker(&self, to: NodeId) -> Result<mpsc::Sender<PeerRequest>, String> {
        self.inner.get_or_spawn_worker(to).await
    }
}

impl RaftPeerManagerInner {
    pub async fn get_or_spawn_worker(&self, to: NodeId) -> Result<mpsc::Sender<PeerRequest>, String> {
        info!(to = %to, "get_or_spawn_worker called");
        {
            let workers = self.workers.read().await;
            if let Some(tx) = workers.get(&to) {
                info!(to = %to, "Worker already exists");
                return Ok(tx.clone());
            }
        }

        let nodes = self.membership.all_nodes().await;
        let node = nodes
            .into_iter()
            .find(|n| n.node_id == to)
            .ok_or_else(|| format!("Node {} not found in membership", to))?;
        let addr = node.addr;
        info!(to = %to, addr = %addr, "Spawning new worker");

        let (tx, rx) = mpsc::channel::<PeerRequest>(100);
        let identity = Arc::clone(&self.identity);
        let to_id = to.clone();
        let self_id = self.self_node_id.clone();

        tokio::spawn(async move {
            if let Err(e) = run_peer_worker(addr, identity, to_id.clone(), self_id, rx).await {
                error!(peer = %to_id, err = %e, "Peer worker terminated fatally");
            }
        });

        let mut workers = self.workers.write().await;
        workers.insert(to, tx.clone());
        Ok(tx)
    }
}

impl RaftRpcClient for RaftPeerManager {
    fn send_request_vote(
        &self,
        to: NodeId,
        args: RequestVoteArgs,
    ) -> Pin<Box<dyn Future<Output = Result<RequestVoteReply, String>> + Send>> {
        let inner = Arc::clone(&self.inner);
        Box::pin(async move {
            let tx = inner.get_or_spawn_worker(to.clone()).await?;
            let request_id = inner.next_request_id.fetch_add(1, Ordering::SeqCst);
            let (response_tx, response_rx) = oneshot::channel();

            let req = PeerRequest::RequestVote {
                request_id,
                args,
                response_tx,
            };

            tx.send(req)
                .await
                .map_err(|_| "Peer worker closed".to_string())?;
            let resp_bytes = timeout(Duration::from_secs(2), response_rx)
                .await
                .map_err(|_| "RPC timeout".to_string())?
                .map_err(|_| "Response channel closed".to_string())?;

            let bytes = resp_bytes.map_err(|e| e)?;
            serde_json::from_slice(&bytes)
                .map_err(|e| format!("Deserialize RequestVoteReply failed: {}", e))
        })
    }

    fn send_append_entries(
        &self,
        to: NodeId,
        args: AppendEntriesArgs,
    ) -> Pin<Box<dyn Future<Output = Result<AppendEntriesReply, String>> + Send>> {
        let inner = Arc::clone(&self.inner);
        Box::pin(async move {
            let tx = inner.get_or_spawn_worker(to.clone()).await?;
            let request_id = inner.next_request_id.fetch_add(1, Ordering::SeqCst);
            let (response_tx, response_rx) = oneshot::channel();

            let req = PeerRequest::AppendEntries {
                request_id,
                args,
                response_tx,
            };

            tx.send(req)
                .await
                .map_err(|_| "Peer worker closed".to_string())?;
            let resp_bytes = timeout(Duration::from_secs(2), response_rx)
                .await
                .map_err(|_| "RPC timeout".to_string())?
                .map_err(|_| "Response channel closed".to_string())?;

            let bytes = resp_bytes.map_err(|e| e)?;
            serde_json::from_slice(&bytes)
                .map_err(|e| format!("Deserialize AppendEntriesReply failed: {}", e))
        })
    }
}

async fn run_peer_worker(
    addr: std::net::SocketAddr,
    identity: Arc<QuantumNodeIdentity>,
    to_id: NodeId,
    self_id: NodeId,
    mut rx: mpsc::Receiver<PeerRequest>,
) -> Result<(), String> {
    let mut backoff = Duration::from_millis(100);
    loop {
        info!(peer = %to_id, addr = %addr, "Attempting TCP connect");
        // 1. Connect and Handshake
        let connect_res = timeout(Duration::from_secs(5), TcpStream::connect(addr)).await;
        let mut stream = match connect_res {
            Ok(Ok(s)) => {
                info!(peer = %to_id, "TCP connected");
                s
            },
            Ok(Err(e)) => {
                error!(peer = %to_id, err = %e, "TCP connect failed, retrying in {:?}...", backoff);
                tokio::time::sleep(backoff).await;
                backoff = (backoff * 2).min(Duration::from_secs(30));
                continue;
            }
            Err(_) => {
                error!(peer = %to_id, "TCP connect timeout, retrying in {:?}...", backoff);
                tokio::time::sleep(backoff).await;
                backoff = (backoff * 2).min(Duration::from_secs(30));
                continue;
            }
        };

        info!(peer = %to_id, "Starting PQ handshake");
        let session = match run_initiator(&mut stream, &identity).await {
            Ok(s) => {
                info!(peer = %to_id, "PQ handshake successful");
                s
            },
            Err(e) => {
                error!(peer = %to_id, err = %e, "PQ handshake failed, retrying in {:?}...", backoff);
                tokio::time::sleep(backoff).await;
                backoff = (backoff * 2).min(Duration::from_secs(30));
                continue;
            }
        };

        let mut transport = AeadTransport::new(
            stream,
            session.client_to_server_key,
            session.server_to_client_key,
            session.session_id,
            session.session_salt,
            true,
        );
        info!(peer = %to_id, "Transport established");

        let mut pending_responses: HashMap<u64, oneshot::Sender<Result<Vec<u8>, String>>> =
            HashMap::new();
        backoff = Duration::from_millis(100); // Reset backoff on successful connection

        loop {
            tokio::select! {
                Some(req) = rx.recv() => {
                    let request_id = req.request_id();
                    let rpc_type = req.rpc_type();
                    let payload = req.payload();
                    let response_tx = req.take_response_tx();

                    let envelope = RaftRpcEnvelope {
                        version: 1,
                        rpc_type,
                        sender_id: self_id.clone(),
                        receiver_id: to_id.clone(),
                        request_id,
                        payload,
                    };
                    let env_bytes = serde_json::to_vec(&envelope).unwrap();

                    pending_responses.insert(request_id, response_tx);

                    info!(peer = %to_id, req_id = request_id, "Sending RPC frame");
                    if let Err(e) = transport.write_frame(&env_bytes).await {
                        error!(peer = %to_id, err = %e, "Transport write failed");
                        for (_, tx) in pending_responses.drain() {
                            let _ = tx.send(Err("Connection lost".to_string()));
                        }
                        break;
                    }
                }
                res = transport.read_frame() => {
                    match res {
                        Ok(Some(frame)) => {
                            let resp_env: RaftRpcEnvelope = match serde_json::from_slice(&frame) {
                                Ok(env) => env,
                                Err(e) => {
                                    error!(peer = %to_id, err = %e, "Deserialize resp env failed");
                                    continue;
                                }
                            };

                            info!(peer = %to_id, req_id = resp_env.request_id, "Received response frame");
                            if let Some(tx) = pending_responses.remove(&resp_env.request_id) {
                                let _ = tx.send(Ok(resp_env.payload));
                            } else {
                                warn!(peer = %to_id, req_id = resp_env.request_id, "Received response for unknown/stale request");
                            }
                        }
                        Ok(None) => {
                            info!(peer = %to_id, "Peer closed connection");
                            for (_, tx) in pending_responses.drain() {
                                let _ = tx.send(Err("Connection lost".to_string()));
                            }
                            break;
                        }
                        Err(e) => {
                            error!(peer = %to_id, err = %e, "Transport read failed");
                            for (_, tx) in pending_responses.drain() {
                                let _ = tx.send(Err("Connection lost".to_string()));
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
}
