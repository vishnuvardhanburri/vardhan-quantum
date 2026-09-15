//! # auth_service
//!
//! Production authentication backend for the Vardhan Quantum control plane.
//!
//! ## Design summary
//!
//! - Credentials: Argon2id PHC hashes in a `sled` embedded KV store
//! - Sessions: 32-byte OsRng opaque tokens in a `DashMap` (in-process)
//! - Expiry: 8h hard cap + 30min idle sliding window
//! - Rate limiting: 10 failures / 15min per source IP
//! - Audit: every login success/failure/logout emitted to `audit_ledger`
//!
//! ## No plaintext credentials in logs
//!
//! Password fields are never in any `Debug`-derived or `Serialize`-derived
//! struct. Usernames in audit events are BLAKE3-hashed.

pub mod credentials;
pub mod middleware;
pub mod rate_limit;
pub mod session;
pub mod store;

use std::sync::Arc;

use axum::{
    extract::{Json, State},
    http::{header, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use serde::Deserialize;

use crate::{
    rate_limit::RateLimiter,
    session::{SessionStore, SessionToken},
    store::CredentialStore,
};

pub use middleware::require_session;
pub use session::AuthenticatedUser;

// ── Shared state ──────────────────────────────────────────────────────────────

#[derive(Clone)]
pub struct AuthState {
    pub credentials: Arc<CredentialStore>,
    pub sessions: Arc<SessionStore>,
    pub rate_limiter: Arc<RateLimiter>,
    /// Optional durable ledger for audit events.
    pub ledger: Option<Arc<audit_ledger::LedgerWriter>>,
    /// Node identity for signing audit ledger entries with ML-DSA-87.
    pub identity: Option<Arc<core_crypto::QuantumNodeIdentity>>,
}

// ── Request type — NOT Debug to prevent password leaking into tracing ─────────

#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

// ── Router ────────────────────────────────────────────────────────────────────

/// Build the auth sub-router.
/// Mount this on your app **before** the session middleware layer.
pub fn auth_router(state: AuthState) -> Router {
    Router::new()
        .route("/api/v1/auth/login",   post(login_handler))
        .route("/api/v1/auth/logout",  post(logout_handler))
        .route("/api/v1/auth/session", get(session_info_handler))
        .with_state(state)
}

// ── Handlers ──────────────────────────────────────────────────────────────────

/// POST /api/v1/auth/login — unauthenticated, rate-limited
pub async fn login_handler(
    State(state): State<AuthState>,
    headers: axum::http::HeaderMap,
    Json(req): Json<LoginRequest>,
) -> impl IntoResponse {
    let ip = resolve_ip(&headers);

    // Rate limit check (before any crypto work)
    if state.rate_limiter.is_blocked(ip) {
        tracing::warn!(ip = %ip, "Login rate-limited");
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(serde_json::json!({ "error": "Too many attempts. Try again later." })),
        );
    }

    // Constant-time credential check (always runs Argon2 even for unknown usernames)
    let ok = state.credentials.verify(&req.username, &req.password).await;

    if ok {
        state.rate_limiter.reset(ip);
        let token = state.sessions.create(&req.username, ip).await;

        emit_audit(&state, serde_json::json!({
            "event_type": "LoginSuccess",
            "username_hash": blake3_hex(&req.username),
            "ip": ip.to_string(),
            "session_prefix": &token.as_str()[..8],
        }));

        tracing::info!(username_hash = %blake3_hex(&req.username), ip = %ip, "LoginSuccess");

        (StatusCode::OK, Json(serde_json::json!({
            "token": token.as_str(),
            "expires_in": session::SESSION_HARD_EXPIRY_SECS,
        })))
    } else {
        state.rate_limiter.record_failure(ip);

        emit_audit(&state, serde_json::json!({
            "event_type": "LoginFailure",
            "ip": ip.to_string(),
            // No username — prevents enumeration via audit log
        }));

        tracing::warn!(ip = %ip, "LoginFailure");

        (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Invalid credentials" })))
    }
}

/// POST /api/v1/auth/logout — requires valid session
pub async fn logout_handler(
    State(state): State<AuthState>,
    headers: axum::http::HeaderMap,
) -> impl IntoResponse {
    let ip = resolve_ip(&headers);
    let token_str = match extract_bearer_from_headers(&headers) {
        Some(t) => t,
        None => return (StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "error": "Missing Authorization header" }))),
    };

    let token = SessionToken::from_str(&token_str);

    if let Some(entry) = state.sessions.remove(&token).await {
        emit_audit(&state, serde_json::json!({
            "event_type": "Logout",
            "username_hash": blake3_hex(&entry.username),
            "ip": ip.to_string(),
        }));
        tracing::info!(username_hash = %blake3_hex(&entry.username), ip = %ip, "Logout");
        (StatusCode::OK, Json(serde_json::json!({ "status": "logged_out" })))
    } else {
        (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Invalid or expired session" })))
    }
}

/// GET /api/v1/auth/session — requires valid session
pub async fn session_info_handler(
    State(state): State<AuthState>,
    headers: axum::http::HeaderMap,
) -> impl IntoResponse {
    let token_str = match extract_bearer_from_headers(&headers) {
        Some(t) => t,
        None => return (StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "error": "Missing Authorization header" }))),
    };

    let token = SessionToken::from_str(&token_str);

    match state.sessions.get_info(&token).await {
        Some(info) => (StatusCode::OK, Json(serde_json::json!({
            "username": info.username,
            "issued_at_ms": info.issued_at_ms,
            "expires_in": info.expires_in_secs,
        }))),
        None => (StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "error": "Invalid or expired session" }))),
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn resolve_ip(headers: &axum::http::HeaderMap) -> std::net::IpAddr {
    headers
        .get("x-forwarded-for")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.split(',').next())
        .and_then(|s| s.trim().parse().ok())
        .or_else(|| {
            headers
                .get("x-real-ip")
                .and_then(|h| h.to_str().ok())
                .and_then(|s| s.trim().parse().ok())
        })
        .unwrap_or(std::net::IpAddr::V4(std::net::Ipv4Addr::LOCALHOST))
}

fn blake3_hex(s: &str) -> String {
    hex::encode(blake3::hash(s.as_bytes()).as_bytes())
}

fn extract_bearer_from_headers(headers: &axum::http::HeaderMap) -> Option<String> {
    let hdr = headers.get(header::AUTHORIZATION)?.to_str().ok()?;
    hdr.strip_prefix("Bearer ").map(|s| s.to_string())
}

fn emit_audit(state: &AuthState, event: serde_json::Value) {
    if let (Some(ledger), Some(identity)) = (&state.ledger, &state.identity) {
        if let Err(e) = ledger.append(event, identity) {
            tracing::error!("Failed to write auth audit event: {e}");
        }
    }
}
