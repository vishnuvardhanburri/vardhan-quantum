pub mod compliance;
pub mod telemetry;
pub mod admin;
pub mod prometheus_metrics;
pub mod otel;

use std::net::{SocketAddr, IpAddr};
use std::path::PathBuf;
use std::time::{Duration, Instant};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tracing::{info, warn};
use std::sync::Arc;
use tokio::sync::Semaphore;
use dashmap::DashMap;

use core_crypto::QuantumNodeIdentity;
use proxy_engine::run_responder;
use proxy_engine::transport::AeadTransport;
use crate::telemetry::{TelemetryEngine, InternalMsg};
use crate::admin::{run_admin_server, AdminState};
use crate::prometheus_metrics::PrometheusMetrics;
use audit_ledger::LedgerWriter;
use ha_cluster::{ClusterMembership, NodeState, NodeId, drain::ActiveSessionCounter};

const MAX_GLOBAL_CONCURRENCY: usize = 10_000;
const MAX_CONCURRENT_PER_IP: u32 = 1_000;
const HANDSHAKE_TIMEOUT_SECS: u64 = 5;
const IDLE_TIMEOUT_SECS: u64 = 30;

pub struct IngressShield {
    pub listen_addr: SocketAddr,
    pub upstream_addr: SocketAddr,
    pub identity: Arc<QuantumNodeIdentity>,
    pub global_limit: Arc<Semaphore>,
    pub ip_limits: Arc<DashMap<IpAddr, u32>>,
    pub telemetry: Arc<TelemetryEngine>,
    pub prometheus: Arc<PrometheusMetrics>,
    pub ledger_path: Option<PathBuf>,
    /// P3.4: HA cluster membership. When present, the accept loop refuses new
    /// connections if the local node is Draining or Dead.
    pub cluster: Option<Arc<ClusterMembership>>,
    /// P3.4: Active session counter for graceful drain coordination.
    pub session_counter: Option<ActiveSessionCounter>,
    /// P3.4: This node's stable cluster identity (when HA is configured).
    pub self_node_id: Option<NodeId>,
}

impl IngressShield {
    fn init_internals(listen_addr: SocketAddr, upstream_addr: SocketAddr, identity: Arc<QuantumNodeIdentity>) -> (Self, Option<PathBuf>) {
        // P2: Initialize durable ledger if VARDHAN_LEDGER_PATH is set.
        let ledger_path = std::env::var("VARDHAN_LEDGER_PATH").ok().map(PathBuf::from);

        let (ledger, ledger_path_stored) = if let Some(ref path) = ledger_path {
            match LedgerWriter::open(path, &identity) {
                Ok(lw) => {
                    info!(path = %path.display(), "P2: Durable audit ledger opened");
                    (Some(Arc::new(lw)), Some(path.clone()))
                }
                Err(e) => {
                    // Ledger chain broken or IO error — refuse to start
                    panic!("FATAL: Cannot open audit ledger at {}: {e}", path.display());
                }
            }
        } else {
            info!("P2: VARDHAN_LEDGER_PATH not set — running without durable ledger (events broadcast only)");
            (None, None)
        };

        let prometheus = Arc::new(PrometheusMetrics::new().expect("FATAL: Failed to initialize Prometheus registry"));
        let telemetry = Arc::new(TelemetryEngine::new(ledger, Some(identity.clone()), prometheus.clone()));

        let shield = Self {
            listen_addr,
            upstream_addr,
            identity,
            global_limit: Arc::new(Semaphore::new(MAX_GLOBAL_CONCURRENCY)),
            ip_limits: Arc::new(DashMap::new()),
            telemetry,
            prometheus,
            ledger_path: ledger_path_stored.clone(),
            cluster: None,
            session_counter: None,
            self_node_id: None,
        };
        (shield, ledger_path_stored)
    }

    pub fn new(listen_addr: SocketAddr, upstream_addr: SocketAddr, identity: Arc<QuantumNodeIdentity>) -> Self {
        let (shield, _) = Self::init_internals(listen_addr, upstream_addr, identity);
        shield
    }

    /// P3.4: Create an HA-aware shield with cluster membership and session counter.
    pub fn new_with_cluster(
        listen_addr: SocketAddr,
        upstream_addr: SocketAddr,
        identity: Arc<QuantumNodeIdentity>,
        self_node_id: NodeId,
        cluster: Arc<ClusterMembership>,
        session_counter: ActiveSessionCounter,
    ) -> Self {
        let (mut shield, _) = Self::init_internals(listen_addr, upstream_addr, identity);
        shield.cluster = Some(cluster);
        shield.session_counter = Some(session_counter);
        shield.self_node_id = Some(self_node_id);
        shield
    }

    pub async fn run_interceptor_loop(
        &self,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let listener = TcpListener::bind(self.listen_addr).await?;
        info!(addr = %self.listen_addr, upstream = %self.upstream_addr, "pq_shield Quantum Reverse Proxy Active");

        // Boot admin plane
        let admin_token = std::env::var("VARDHAN_ADMIN_TOKEN")
            .expect("FATAL: VARDHAN_ADMIN_TOKEN must be strictly provided in environment.");

        let admin_state = AdminState {
            metrics: self.telemetry.snapshot.clone(),
            event_tx: self.telemetry.event_broadcast.clone(),
            history: self.telemetry.history.clone(),
            history_wrapped: self.telemetry.history_wrapped.clone(),
            admin_token,
            identity: Arc::clone(&self.identity),
            ledger_path: self.ledger_path.clone(),
            prometheus: self.prometheus.clone(),
            cluster: self.cluster.clone(),
            self_node_id: self.self_node_id.clone(),
        };
        tokio::spawn(async move {
            run_admin_server(admin_state).await;
        });

        loop {
            let (mut client_stream, peer_addr) = listener.accept().await?;
            let _ = client_stream.set_nodelay(true);
            let ip = peer_addr.ip();

            // P3.4: Refuse new connections when this node is Draining or Dead.
            if let Some(ref cluster) = self.cluster {
                let self_state = if let Some(ref self_id) = self.self_node_id {
                    // Prefer stable node_id lookup
                    cluster.all_nodes().await
                        .iter()
                        .find(|n| &n.node_id == self_id)
                        .map(|n| n.state)
                } else {
                    // Fallback: match by listen address
                    cluster.all_nodes().await
                        .iter()
                        .find(|n| n.addr == self.listen_addr)
                        .map(|n| n.state)
                };
                if matches!(self_state, Some(NodeState::Draining) | Some(NodeState::Dead)) {
                    warn!(peer = %peer_addr, "Node is Draining — rejecting new connection");
                    continue;
                }
            }

            let permit = match self.global_limit.clone().try_acquire_owned() {
                Ok(p) => p,
                Err(_) => {
                    warn!("Global concurrency limit reached. Rejecting {}", peer_addr);
                    continue;
                }
            };

            {
                let mut count = self.ip_limits.entry(ip).or_insert(0);
                if *count >= MAX_CONCURRENT_PER_IP {
                    warn!("Per-IP concurrency limit reached for {}. Rejecting.", ip);
                    continue;
                }
                *count += 1;
            }

            let upstream_addr = self.upstream_addr;
            let identity = Arc::clone(&self.identity);
            let ip_limits = Arc::clone(&self.ip_limits);
            let tx = self.telemetry.tx.clone();
            let session_counter = self.session_counter.clone();

            tokio::spawn(async move {
                // P3.4: Track active session for drain coordination.
                if let Some(ref sc) = session_counter { sc.increment(); }
                struct SessionGuard { sc: Option<ActiveSessionCounter> }
                impl Drop for SessionGuard {
                    fn drop(&mut self) {
                        if let Some(ref sc) = self.sc { sc.decrement(); }
                    }
                }
                let _session_guard = SessionGuard { sc: session_counter };

                struct IpGuard {
                    ip: IpAddr,
                    map: Arc<DashMap<IpAddr, u32>>,
                }
                impl Drop for IpGuard {
                    fn drop(&mut self) {
                        if let Some(mut count) = self.map.get_mut(&self.ip) {
                            if *count > 0 { *count -= 1; }
                        }
                    }
                }
                let _ip_guard = IpGuard { ip, map: ip_limits };
                let _global_guard = permit;

                let (session, sid) = {
                    let handshake_span = tracing::info_span!(
                        "session.handshake",
                        peer.addr = %peer_addr,
                        session.id = tracing::field::Empty,
                        pq.kem = "ML-KEM-1024",
                        pq.sig = "ML-DSA-87"
                    );
                    let _guard = handshake_span.enter();
                    let handshake_start = Instant::now();
                    let handshake_future = run_responder(&mut client_stream, &identity);
                    match tokio::time::timeout(Duration::from_secs(HANDSHAKE_TIMEOUT_SECS), handshake_future).await {
                        Ok(Ok(s)) => {
                            let sid = hex::encode(&s.session_id[..8]);
                            handshake_span.record("session.id", &sid);
                            let handshake_us = handshake_start.elapsed().as_micros() as u64;
                            let _ = tx.try_send(InternalMsg::HandshakeCompleted(sid.clone(), handshake_us));
                            (s, sid)
                        },
                        Ok(Err(_e)) => {
                            let _ = tx.try_send(InternalMsg::FrameRejected);
                            return;
                        }
                        Err(_) => { return; }
                    }
                };

                let upstream_future = TcpStream::connect(upstream_addr);
                let mut upstream_stream = match tokio::time::timeout(Duration::from_secs(5), upstream_future).await {
                    Ok(Ok(s)) => {
                        let _ = tx.try_send(InternalMsg::UpstreamConnected(hex::encode(&session.session_id[..8])));
                        s
                    },
                    _ => {
                        let _ = tx.try_send(InternalMsg::UpstreamFailed(hex::encode(&session.session_id[..8])));
                        return;
                    }
                };
                let _ = upstream_stream.set_nodelay(true);

                let mut transport = AeadTransport::new(
                    client_stream,
                    session.server_to_client_key,
                    session.client_to_server_key,
                    session.session_id,
                    true
                );

                let mut upstream_buf = [0u8; 65536];

                loop {
                    tokio::select! {
                        frame_result = tokio::time::timeout(Duration::from_secs(IDLE_TIMEOUT_SECS), transport.read_frame()) => {
                            match frame_result {
                                Ok(Ok(Some(plaintext))) => {
                                    let req_start = Instant::now();
                                    let forward_span = tracing::info_span!("proxy.forward", session.id = %sid, bytes = plaintext.len());
                                    let write_result = {
                                        let _f_guard = forward_span.enter();
                                        upstream_stream.write_all(&plaintext).await
                                    };
                                    if write_result.is_err() {
                                        let _ = tx.try_send(InternalMsg::UpstreamFailed(sid.clone()));
                                        break;
                                    }
                                    let _ = tx.try_send(InternalMsg::LatencySample(req_start.elapsed().as_micros() as u64));
                                    let _ = tx.try_send(InternalMsg::RequestCompleted);
                                    if fastrand::usize(..) % 50 == 0 {
                                        let mut sample = vec![0u8; 12];
                                        fastrand::fill(&mut sample);
                                        let _ = tx.try_send(InternalMsg::NonceEntropySample(sample));
                                    }
                                }
                                Ok(Ok(None)) => break,
                                Ok(Err(_)) => {
                                    let _ = tx.try_send(InternalMsg::FrameRejected);
                                    break;
                                }
                                Err(_) => break,
                            }
                        }

                        n_result = tokio::time::timeout(Duration::from_secs(IDLE_TIMEOUT_SECS), upstream_stream.read(&mut upstream_buf)) => {
                            match n_result {
                                Ok(Ok(0)) => break,
                                Ok(Ok(n)) => {
                                    if transport.write_frame(&upstream_buf[..n]).await.is_err() { break; }
                                }
                                Ok(Err(_)) => break,
                                Err(_) => break,
                            }
                        }
                    }
                }
                let _ = tx.try_send(InternalMsg::SessionClosed(sid));
            });
        }
    }
}
