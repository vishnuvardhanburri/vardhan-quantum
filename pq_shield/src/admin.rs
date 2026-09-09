use axum::{
    routing::{get, post},
    Router,
    response::sse::{Event, Sse},
    response::IntoResponse,
    Json,
    extract::State,
    http::StatusCode,
    http::header,
    middleware::{self, Next},
    extract::Request,
};
use std::sync::Arc;
use std::path::PathBuf;
use tokio::sync::broadcast;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt;
use std::convert::Infallible;
use tower_http::cors::{CorsLayer, AllowOrigin};
use tower_http::limit::RequestBodyLimitLayer;
use crate::telemetry::{MetricsSnapshot, QuantumEvent};
use tokio::sync::RwLock;
use subtle::ConstantTimeEq;
use std::collections::VecDeque;
use core_crypto::QuantumNodeIdentity;
use audit_ledger::{LedgerEntry, schema};
use serde::Serialize;
use ha_cluster::{ClusterMembership, NodeId, NodeState};

#[derive(Clone)]
pub struct AdminState {
    pub metrics: Arc<RwLock<MetricsSnapshot>>,
    pub event_tx: broadcast::Sender<QuantumEvent>,
    pub history: Arc<RwLock<VecDeque<QuantumEvent>>>,
    /// True once the ring buffer has evicted at least one event.
    pub history_wrapped: Arc<std::sync::atomic::AtomicBool>,
    pub admin_token: String,
    /// Gateway identity — needed to sign the evidence export manifest.
    pub identity: Arc<QuantumNodeIdentity>,
    /// Path to the live ledger file, if configured.
    pub ledger_path: Option<PathBuf>,
    pub prometheus: Arc<crate::prometheus_metrics::PrometheusMetrics>,
    /// P3.4: Cluster membership for /cluster/peers endpoint.
    pub cluster: Option<Arc<ClusterMembership>>,
    /// P3.4: This node's stable cluster identity, for targeted drain.
    pub self_node_id: Option<NodeId>,
}

async fn auth_middleware(State(state): State<AdminState>, req: Request, next: Next) -> Result<axum::response::Response, StatusCode> {
    if req.method() == axum::http::Method::OPTIONS {
        return Ok(next.run(req).await);
    }

    let expected_bearer = format!("Bearer {}", state.admin_token);

    if let Some(auth_header) = req.headers().get(header::AUTHORIZATION) {
        if auth_header.as_bytes().ct_eq(expected_bearer.as_bytes()).into() {
            return Ok(next.run(req).await);
        }
    }
    Err(StatusCode::UNAUTHORIZED)
}

pub async fn run_admin_server(state: AdminState) {
    let origins_str = std::env::var("VARDHAN_ADMIN_CORS_ORIGIN")
        .expect("FATAL: VARDHAN_ADMIN_CORS_ORIGIN must be explicitly set (e.g., 'null' for local files)");

    let cors_origin = if origins_str == "*" {
        AllowOrigin::any()
    } else {
        let origins: Vec<axum::http::HeaderValue> = origins_str
            .split(',')
            .filter_map(|s| s.trim().parse().ok())
            .collect();
        AllowOrigin::list(origins)
    };

    let cors = CorsLayer::new()
        .allow_origin(cors_origin)
        .allow_methods([axum::http::Method::GET, axum::http::Method::POST, axum::http::Method::OPTIONS])
        .allow_headers([
            header::AUTHORIZATION,
            header::CONTENT_TYPE,
            axum::http::header::HeaderName::from_static("last-event-id")
        ]);

    let app = Router::new()
        .route("/metrics", get(prometheus_metrics))
        .route("/api/v1/metrics", get(get_metrics))
        .route("/api/v1/events", get(sse_handler))
        // P2: ledger endpoints
        .route("/api/v1/ledger/status", get(ledger_status))
        .route("/api/v1/ledger/export", get(ledger_export))
        // P3.4: cluster endpoints
        .route("/api/v1/cluster/peers", get(cluster_peers))
        .route("/api/v1/cluster/drain", post(cluster_drain))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .layer(RequestBodyLimitLayer::new(1024 * 1024))
        .layer(cors)
        .with_state(state);

    let admin_port = std::env::var("VARDHAN_ADMIN_PORT")
        .unwrap_or_else(|_| "8081".to_string());
    let bind_addr = format!("0.0.0.0:{}", admin_port);
    let listener = tokio::net::TcpListener::bind(&bind_addr).await.unwrap();
    tracing::info!("Admin / Telemetry API running on http://{}", bind_addr);
    axum::serve(listener, app).await.unwrap();
}

async fn prometheus_metrics(State(state): State<AdminState>) -> impl IntoResponse {
    let body = state.prometheus.encode();
    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/plain; version=0.0.4; charset=utf-8")],
        body,
    )
}

async fn get_metrics(State(state): State<AdminState>) -> impl IntoResponse {
    let m = state.metrics.read().await.clone();
    (StatusCode::OK, Json(m))
}

// ── P2: Ledger status endpoint ──────────────────────────────────────────────

#[derive(Serialize)]
struct LedgerStatus {
    configured: bool,
    ledger_file: Option<String>,
    entry_count_estimate: Option<u64>,
    message: &'static str,
}

async fn ledger_status(State(state): State<AdminState>) -> impl IntoResponse {
    match &state.ledger_path {
        None => Json(LedgerStatus {
            configured: false,
            ledger_file: None,
            entry_count_estimate: None,
            message: "VARDHAN_LEDGER_PATH not configured — durable ledger inactive",
        }),
        Some(path) => {
            // Count lines quickly without full parse
            let count = std::fs::read_to_string(path)
                .map(|s| s.lines().filter(|l| !l.trim().is_empty()).count() as u64)
                .ok();
            Json(LedgerStatus {
                configured: true,
                ledger_file: Some(path.display().to_string()),
                entry_count_estimate: count,
                message: "Durable ledger active — ML-DSA-87 signed, BLAKE3 chained",
            })
        }
    }
}

// ── P2: Evidence export endpoint ────────────────────────────────────────────

#[derive(Serialize)]
struct ExportManifest {
    schema_version: u32,
    export_timestamp_ms: u128,
    entry_count: u64,
    tip_hash: String,
    signer_pub_fingerprint: String,
    verifier_version: &'static str,
    /// ML-DSA-87 signature over `BLAKE3(export_timestamp_ms_le64 || entry_count_le64 || tip_hash_bytes32)`
    manifest_signature: String,
}

async fn ledger_export(State(state): State<AdminState>) -> axum::response::Response {
    let Some(ledger_path) = &state.ledger_path else {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            "Durable ledger not configured. Set VARDHAN_LEDGER_PATH and restart.",
        ).into_response();
    };

    // Determine export directory: VARDHAN_EXPORT_PATH / {timestamp_ms}
    let export_base = std::env::var("VARDHAN_EXPORT_PATH")
        .unwrap_or_else(|_| "/tmp/vardhan_exports".to_string());
    let timestamp_ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let export_dir = PathBuf::from(&export_base).join(format!("{timestamp_ms}"));

    if let Err(e) = std::fs::create_dir_all(&export_dir) {
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Cannot create export dir: {e}")).into_response();
    }

    // 1. Copy ledger file
    let dest_ledger = export_dir.join("ledger.jsonl");
    if let Err(e) = std::fs::copy(ledger_path, &dest_ledger) {
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Cannot copy ledger: {e}")).into_response();
    }

    // 2. Read all entries to get count and tip_hash
    let content = match std::fs::read_to_string(&dest_ledger) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Cannot read ledger copy: {e}")).into_response(),
    };

    let mut entry_count = 0u64;
    let mut tip_hash = "0".repeat(64);

    for line in content.lines() {
        if line.trim().is_empty() { continue; }
        if let Ok(entry) = serde_json::from_str::<LedgerEntry>(line) {
            entry_count += 1;
            tip_hash = hex::encode(entry.canonical_hash());
        }
    }

    // 3. Write public key
    let pub_key_bytes = state.identity.dsa_public_key_bytes();
    let pub_key_hex = hex::encode(&pub_key_bytes);
    let pub_key_path = export_dir.join("public_key.hex");
    if let Err(e) = std::fs::write(&pub_key_path, &pub_key_hex) {
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Cannot write public key: {e}")).into_response();
    }

    // 4. Write schema.json
    let schema_path = export_dir.join("schema.json");
    if let Err(e) = schema::write_schema(&schema_path) {
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Cannot write schema: {e}")).into_response();
    }

    // 4.5 Write INSTRUCTIONS.md
    let instructions_path = export_dir.join("INSTRUCTIONS.md");
    let instructions = "# Offline Audit Verification\n\
This bundle contains a cryptographically sound, independently verifiable audit ledger.\n\
\n\
To verify the evidence offline:\n\
1. Ensure you have the `pq_verify` standalone binary.\n\
2. Run: `pq_verify --evidence-dir .`\n\
\n\
The verifier will check chain integrity (BLAKE3), sequence integrity, and all ML-DSA-87 signatures.\n";
    let _ = std::fs::write(&instructions_path, instructions);

    // 5. Build signed manifest
    let signer_pub_fingerprint = hex::encode(
        core_crypto::QuantumNodeIdentity::hash_ledger_block(&pub_key_bytes)
    );
    let tip_hash_bytes = hex::decode(&tip_hash).unwrap_or_default();

    // Canonical manifest bytes for signing
    let mut manifest_canonical = Vec::with_capacity(8 + 8 + 32);
    manifest_canonical.extend_from_slice(&(timestamp_ms as u64).to_le_bytes());
    manifest_canonical.extend_from_slice(&entry_count.to_le_bytes());
    manifest_canonical.extend_from_slice(&tip_hash_bytes);
    let manifest_canonical_hash = core_crypto::QuantumNodeIdentity::hash_ledger_block(&manifest_canonical);

    let manifest_signature = match state.identity.sign_payload(&manifest_canonical_hash) {
        Ok(sig) => hex::encode(sig),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Cannot sign manifest: {e}")).into_response(),
    };

    let manifest = ExportManifest {
        schema_version: 1,
        export_timestamp_ms: timestamp_ms,
        entry_count,
        tip_hash: tip_hash.clone(),
        signer_pub_fingerprint,
        verifier_version: "0.1.0",
        manifest_signature,
    };

    let manifest_path = export_dir.join("manifest.json");
    match serde_json::to_string_pretty(&manifest) {
        Ok(s) => {
            if let Err(e) = std::fs::write(&manifest_path, s) {
                return (StatusCode::INTERNAL_SERVER_ERROR, format!("Cannot write manifest: {e}")).into_response();
            }
        }
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Cannot serialize manifest: {e}")).into_response(),
    }

    tracing::info!(
        export_dir = %export_dir.display(),
        entry_count,
        tip_hash = %&tip_hash[..16],
        "P2: Evidence bundle exported"
    );

    (StatusCode::OK, Json(serde_json::json!({
        "exported": true,
        "export_dir": export_dir.display().to_string(),
        "entry_count": entry_count,
        "tip_hash": tip_hash,
        "files": ["ledger.jsonl", "public_key.hex", "schema.json", "manifest.json", "INSTRUCTIONS.md"]
    }))).into_response()
}

// ── SSE handler (unchanged P1 logic) ────────────────────────────────────────

type SseResponse = axum::response::Response;

async fn sse_handler(
    State(state): State<AdminState>,
    headers: axum::http::HeaderMap,
) -> SseResponse {
    let last_event_id = headers
        .get("Last-Event-ID")
        .and_then(|h| h.to_str().ok().map(|s| s.to_string()));

    let history = state.history.read().await;
    let rx = state.event_tx.subscribe();

    let stream: Box<dyn tokio_stream::Stream<Item = Result<Event, Infallible>> + Send + Unpin>;

    if let Some(last_id) = last_event_id {
        let mut found = false;
        let mut replay_events = Vec::new();
        for ev in history.iter() {
            if found {
                replay_events.push(ev.clone());
            } else if ev.event_id == last_id {
                found = true;
            }
        }
        drop(history);

        if !found {
            let wrapped = state.history_wrapped.load(std::sync::atomic::Ordering::Relaxed);
            if wrapped {
                return (
                    StatusCode::GONE,
                    "Last-Event-ID has expired from the replay buffer. Full resync required.",
                ).into_response();
            }
        }

        let replay_stream = tokio_stream::iter(replay_events.into_iter().map(|evt| {
            let data = serde_json::to_string(&evt).unwrap();
            Ok::<Event, Infallible>(Event::default().id(evt.event_id).data(data))
        }));
        let live_stream = BroadcastStream::new(rx).filter_map(|res| match res {
            Ok(evt) => {
                let data = serde_json::to_string(&evt).unwrap();
                Some(Ok(Event::default().id(evt.event_id.clone()).data(data)))
            }
            Err(_) => None,
        });
        stream = Box::new(Box::pin(replay_stream.chain(live_stream)));
    } else {
        drop(history);
        let live_stream = BroadcastStream::new(rx).filter_map(|res| match res {
            Ok(evt) => {
                let data = serde_json::to_string(&evt).unwrap();
                Some(Ok(Event::default().id(evt.event_id.clone()).data(data)))
            }
            Err(_) => None,
        });
        stream = Box::new(Box::pin(live_stream));
    }

    Sse::new(stream)
        .keep_alive(axum::response::sse::KeepAlive::new())
        .into_response()
}

// ── P3.4 Cluster endpoints ────────────────────────────────────────────────────

/// GET /api/v1/cluster/peers — Returns all known cluster nodes with their state.
async fn cluster_peers(State(state): State<AdminState>) -> impl IntoResponse {
    match &state.cluster {
        Some(cluster) => {
            let peers = cluster.peer_snapshot().await;
            (StatusCode::OK, Json(serde_json::json!({
                "node_count": peers.len(),
                "nodes": peers,
            })))
        }
        None => (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(serde_json::json!({
                "error": "HA cluster not configured on this node"
            })),
        ),
    }
}

/// POST /api/v1/cluster/drain — Marks *this* node as Draining (admin-token protected).
/// The actual drain wait is handled by DrainController in main.rs on SIGTERM.
/// This endpoint is a soft-drain signal for orchestrators that prefer HTTP over SIGTERM.
async fn cluster_drain(State(state): State<AdminState>) -> impl IntoResponse {
    match (&state.cluster, &state.self_node_id) {
        (Some(cluster), Some(self_id)) => {
            let nodes = cluster.all_nodes().await;
            // Find THIS node in the membership table by our stable node_id.
            let self_entry = nodes.iter().find(|n| &n.node_id == self_id);
            match self_entry {
                Some(node) if matches!(node.state, NodeState::Draining) => {
                    (StatusCode::CONFLICT, Json(serde_json::json!({
                        "error": "Node is already draining"
                    })))
                }
                Some(_) => {
                    let _ = cluster.mark_draining(self_id).await;
                    tracing::warn!(node_id = %self_id, "Admin-initiated drain via /cluster/drain");
                    (StatusCode::OK, Json(serde_json::json!({
                        "status": "draining",
                        "node_id": self_id.as_str(),
                        "message": "Self node marked Draining. Send SIGTERM to complete graceful shutdown."
                    })))
                }
                None => {
                    // Self not yet in the membership table (e.g., before first heartbeat).
                    // Mark it draining anyway so the accept loop sees the state.
                    let _ = cluster.mark_draining(self_id).await;
                    tracing::warn!(node_id = %self_id, "Admin-initiated drain (self not yet in membership table)");
                    (StatusCode::OK, Json(serde_json::json!({
                        "status": "draining",
                        "node_id": self_id.as_str(),
                        "message": "Self node not yet in membership table — marked Draining anyway."
                    })))
                }
            }
        }
        (Some(_), None) => (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(serde_json::json!({
                "error": "HA cluster configured but node identity (VARDHAN_NODE_ID) is unknown"
            })),
        ),
        (None, _) => (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(serde_json::json!({
                "error": "HA cluster not configured on this node"
            })),
        ),
    }
}
