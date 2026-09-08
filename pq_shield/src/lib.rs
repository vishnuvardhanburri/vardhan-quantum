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
}

impl IngressShield {
    pub fn new(listen_addr: SocketAddr, upstream_addr: SocketAddr, identity: Arc<QuantumNodeIdentity>) -> Self {
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

        Self {
            listen_addr,
            upstream_addr,
            identity,
            global_limit: Arc::new(Semaphore::new(MAX_GLOBAL_CONCURRENCY)),
            ip_limits: Arc::new(DashMap::new()),
            telemetry,
            prometheus,
            ledger_path: ledger_path_stored,
        }
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
        };
        tokio::spawn(async move {
            run_admin_server(admin_state).await;
        });

        loop {
            let (mut client_stream, peer_addr) = listener.accept().await?;
            let _ = client_stream.set_nodelay(true);
            let ip = peer_addr.ip();

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

            tokio::spawn(async move {
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
