//! In-process session store.
//!
//! Sessions are held in a `DashMap` keyed by opaque session tokens.
//! They are NOT persisted — a process restart invalidates all sessions.
//!
//! ## Expiry model
//!
//! - Hard expiry: `SESSION_HARD_EXPIRY_SECS` (8 hours) after issuance
//! - Sliding window: `SESSION_IDLE_TIMEOUT_SECS` (30 minutes) after last activity
//! - Whichever comes first wins
//!
//! ## Token format
//!
//! 32 bytes from `OsRng` encoded as lowercase hex (64 characters).
//! This provides 256 bits of entropy — far beyond brute-force feasibility.

use std::net::IpAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};

use dashmap::DashMap;
use rand::{rngs::OsRng, RngCore};

/// Hard session lifetime: 8 hours.
pub const SESSION_HARD_EXPIRY_SECS: u64 = 8 * 60 * 60;
/// Inactivity timeout: 30 minutes.
pub const SESSION_IDLE_TIMEOUT_SECS: u64 = 30 * 60;

/// Opaque session token: 32 random bytes as lowercase hex.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct SessionToken(String);

impl SessionToken {
    /// Generate a new cryptographically random session token.
    pub fn generate() -> Self {
        let mut bytes = [0u8; 32];
        OsRng.fill_bytes(&mut bytes);
        Self(hex::encode(bytes))
    }

    pub fn from_str(s: &str) -> Self {
        Self(s.to_string())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

/// A single active session entry.
#[derive(Debug, Clone)]
pub struct SessionEntry {
    pub username: String,
    pub issued_at: Instant,
    pub last_activity: Instant,
    pub ip: IpAddr,
}

impl SessionEntry {
    fn is_expired(&self) -> bool {
        let hard_expired = self.issued_at.elapsed() > Duration::from_secs(SESSION_HARD_EXPIRY_SECS);
        let idle_expired = self.last_activity.elapsed() > Duration::from_secs(SESSION_IDLE_TIMEOUT_SECS);
        hard_expired || idle_expired
    }
}

/// Non-sensitive session info returned by `GET /api/v1/auth/session`.
pub struct SessionInfo {
    pub username: String,
    pub issued_at_ms: u64,
    pub expires_in_secs: u64,
}

/// Thread-safe in-memory session store.
#[derive(Clone)]
pub struct SessionStore {
    inner: Arc<DashMap<String, SessionEntry>>,
}

impl SessionStore {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(DashMap::new()),
        }
    }

    /// Create a new session for `username` from `ip`.
    /// Returns the issued `SessionToken`.
    pub async fn create(&self, username: &str, ip: IpAddr) -> SessionToken {
        let token = SessionToken::generate();
        let entry = SessionEntry {
            username: username.to_string(),
            issued_at: Instant::now(),
            last_activity: Instant::now(),
            ip,
        };
        self.inner.insert(token.as_str().to_string(), entry);
        token
    }

    /// Validate a token and update `last_activity`.
    ///
    /// Returns `Some(username)` if valid, `None` if missing or expired.
    /// Expired sessions are eagerly removed from the map.
    pub async fn validate(&self, token: &SessionToken) -> Option<String> {
        if let Some(mut entry) = self.inner.get_mut(token.as_str()) {
            if entry.is_expired() {
                drop(entry);
                self.inner.remove(token.as_str());
                return None;
            }
            entry.last_activity = Instant::now();
            Some(entry.username.clone())
        } else {
            None
        }
    }

    /// Remove a session (logout). Returns the removed entry if it existed.
    pub async fn remove(&self, token: &SessionToken) -> Option<SessionEntry> {
        self.inner.remove(token.as_str()).map(|(_, v)| v)
    }

    /// Return non-sensitive session metadata for the info endpoint.
    pub async fn get_info(&self, token: &SessionToken) -> Option<SessionInfo> {
        if let Some(entry) = self.inner.get(token.as_str()) {
            if entry.is_expired() {
                return None;
            }
            let elapsed = entry.issued_at.elapsed().as_secs();
            let remaining = SESSION_HARD_EXPIRY_SECS.saturating_sub(elapsed);
            // issued_at_ms: approximate wall clock ms (Instant is monotonic, not wall clock,
            // so we compute from now back by elapsed)
            let now_ms = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64;
            let issued_at_ms = now_ms.saturating_sub(entry.issued_at.elapsed().as_millis() as u64);

            Some(SessionInfo {
                username: entry.username.clone(),
                issued_at_ms,
                expires_in_secs: remaining,
            })
        } else {
            None
        }
    }

    /// Return the number of currently active (non-expired) sessions.
    pub fn active_count(&self) -> usize {
        self.inner
            .iter()
            .filter(|e| !e.is_expired())
            .count()
    }
}

// Needed for axum State
pub struct AuthenticatedUser {
    pub username: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::Ipv4Addr;

    fn ip() -> IpAddr { IpAddr::V4(Ipv4Addr::LOCALHOST) }

    #[tokio::test]
    async fn test_create_and_validate() {
        let store = SessionStore::new();
        let token = store.create("alice", ip()).await;
        let user = store.validate(&token).await;
        assert_eq!(user.as_deref(), Some("alice"));
    }

    #[tokio::test]
    async fn test_invalid_token_rejected() {
        let store = SessionStore::new();
        let fake = SessionToken::from_str("0".repeat(64).as_str());
        assert!(store.validate(&fake).await.is_none());
    }

    #[tokio::test]
    async fn test_logout_invalidates_session() {
        let store = SessionStore::new();
        let token = store.create("bob", ip()).await;
        assert!(store.validate(&token).await.is_some());
        store.remove(&token).await;
        assert!(store.validate(&token).await.is_none());
    }

    #[tokio::test]
    async fn test_token_has_64_hex_chars() {
        let t = SessionToken::generate();
        assert_eq!(t.as_str().len(), 64);
        assert!(t.as_str().chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[tokio::test]
    async fn test_two_tokens_are_unique() {
        let t1 = SessionToken::generate();
        let t2 = SessionToken::generate();
        assert_ne!(t1, t2);
    }

    #[tokio::test]
    async fn test_active_count() {
        let store = SessionStore::new();
        assert_eq!(store.active_count(), 0);
        let _t1 = store.create("alice", ip()).await;
        let _t2 = store.create("bob",   ip()).await;
        assert_eq!(store.active_count(), 2);
    }
}
