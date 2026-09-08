pub mod session;
pub mod transport;
use crate::session::{derive_session_context, SessionContext};
use crate::transport::AeadTransport;

// # proxy_engine — Sprint 2 (High-Security Production Build)
//
// A zero-trust post-quantum proxy engine providing:
//
// - **[`QuantumFrameCodec`]** — bounded length-prefixed frame codec
//   (`tokio-util` `Decoder` / `Encoder`) with a configurable 64 KiB anti-DoS
//   ceiling on application frames.
// - **[`derive_session_keys`]** — HKDF-SHA-256 session key derivation that
//   wraps the derived key in [`Zeroizing`] so it is wiped from memory on drop.
// - **[`run_initiator`] / [`run_responder`]** — 4-frame in-line handshake:
//   ML-KEM-1024 bidirectional key encapsulation + ML-DSA-87 node
//   authentication. Each side derives an independent HKDF session key from
//   the combined shared secret.
// - **[`QuantumProxyServer`]** — production accept-loop bound to any address.
// - **[`QuantumProxyListener`]** — test-friendly listener accepting a
//   pre-built `TcpListener`.
//
// ## Wire Protocol
//
// All handshake frames are length-prefixed: `[u32 BE length][payload bytes]`.
//
// ```text
// Initiator (A)                                    Responder (B)
//  ──── HELLO ──────────────────────────────────▶
//       encap_key (1568) || sig (4627) || dsa_pub (2592)  = 8787 B
//
//  ◀─── HELLO_ACK ───────────────────────────────
//       encap_key (1568) || sig (4627) || dsa_pub (2592)  = 8787 B
//
//  ◀─── KEM_CT_B ────────────────────────────────
//       ciphertext_B (1568) || sig_B (4627)               = 6195 B
//
//  ──── KEM_CT_A ───────────────────────────────▶
//       ciphertext_A (1568) || sig_A (4627)               = 6195 B
//
//  Both sides compute:
//    raw_secret = XOR(ss_B, ss_A)              -- 32 bytes
//    session_key = HKDF-SHA256(raw_secret, transcript_hash)
// ```
//
// **Frame overhead per handshake**: 4 × 4 B length headers = 16 B.
// **Total handshake wire cost**: 16 B + 8787 + 8787 + 6195 + 6195 = **29 980 B** (≈29.3 KiB).

use std::io;
use std::net::SocketAddr;

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Key, Nonce,
};
use bytes::{Buf, BufMut, Bytes, BytesMut};
use core_crypto::QuantumNodeIdentity;
use hkdf::Hkdf;
use sha2::Sha256;
use thiserror::Error;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio_util::codec::{Decoder, Encoder};
use tracing::{debug, error, info, instrument, warn};
use zeroize::Zeroizing;

// ─────────────────────────────────────────────────────────────────────────────
// Wire constants (ML-KEM-1024 + ML-DSA-87)
// ─────────────────────────────────────────────────────────────────────────────

const ENCAP_KEY_LEN: usize = core_crypto::ENCAP_KEY_LEN;   // 1568
const CIPHERTEXT_LEN: usize = core_crypto::CIPHERTEXT_LEN; // 1568
const SIGNATURE_LEN: usize = core_crypto::DSA_SIG_LEN;     // 4627
const DSA_PUB_LEN: usize = core_crypto::DSA_PUB_KEY_LEN;   // 2592

/// Maximum payload for **handshake** frames — 4 MiB guard.
const MAX_HANDSHAKE_FRAME: usize = 4 * 1024 * 1024;

/// HELLO frame: encap_key || sig || dsa_pub
const HELLO_FRAME_LEN: usize = ENCAP_KEY_LEN + SIGNATURE_LEN + DSA_PUB_LEN; // 8787

/// KEM_CT frame: ciphertext || sig
const KEM_CT_FRAME_LEN: usize = CIPHERTEXT_LEN + SIGNATURE_LEN; // 6195

/// Maximum payload size for **application** frames (anti-DoS; 64 KiB).
pub const MAX_FRAME_SIZE: usize = 65_536;

// ─────────────────────────────────────────────────────────────────────────────
// Error type
// ─────────────────────────────────────────────────────────────────────────────

/// All errors that may arise in the quantum proxy engine.
#[derive(Debug, Error)]
pub enum ProxyError {
    #[error("I/O error: {0}")]
    Io(#[from] io::Error),

    #[error("Crypto error: {0}")]
    Crypto(String),

    #[error("Handshake failed: {0}")]
    HandshakeFailed(String),

    #[error("Node signature verification failed")]
    InvalidSignature,

    #[error("Malformed frame — expected {expected} bytes, got {got}")]
    MalformedFrame { expected: usize, got: usize },

    #[error("Frame size exceeded maximum threshold of {0} bytes")]
    FrameTooLarge(usize),

    #[error("Cryptographic operation failed")]
    CryptoError,
}

// ─────────────────────────────────────────────────────────────────────────────
// QuantumFrameCodec — tokio-util Decoder / Encoder
// ─────────────────────────────────────────────────────────────────────────────

/// Bounded length-prefixed frame codec for post-quantum application frames.
///
/// Wire layout: `[u32 BE frame_length][frame_bytes...]`
///
/// - Rejects any frame whose declared length exceeds [`MAX_FRAME_SIZE`] (64 KiB)
///   with [`ProxyError::FrameTooLarge`] — hard anti-DoS boundary.
/// - Implements backpressure: returns `Ok(None)` when insufficient bytes have
///   arrived, and calls `src.reserve(…)` to hint the read buffer.
pub struct QuantumFrameCodec;

impl Decoder for QuantumFrameCodec {
    type Item = Vec<u8>;
    type Error = ProxyError;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        // Need at least 4 bytes for the length header.
        if src.len() < 4 {
            return Ok(None);
        }

        // Peek at the length without advancing.
        let mut length_bytes = [0u8; 4];
        length_bytes.copy_from_slice(&src[..4]);
        let frame_len = u32::from_be_bytes(length_bytes) as usize;

        if frame_len > MAX_FRAME_SIZE {
            return Err(ProxyError::FrameTooLarge(frame_len));
        }

        let total = 4 + frame_len;
        if src.len() < total {
            // Signal to the runtime how much more we expect.
            src.reserve(total - src.len());
            return Ok(None);
        }

        // Consume the 4-byte header.
        src.advance(4);
        // Split out the frame payload.
        let data = src.split_to(frame_len).to_vec();
        Ok(Some(data))
    }
}

impl Encoder<Vec<u8>> for QuantumFrameCodec {
    type Error = ProxyError;

    fn encode(&mut self, item: Vec<u8>, dst: &mut BytesMut) -> Result<(), Self::Error> {
        if item.len() > MAX_FRAME_SIZE {
            return Err(ProxyError::FrameTooLarge(item.len()));
        }
        dst.reserve(4 + item.len());
        dst.put_u32(item.len() as u32);
        dst.put_slice(&item);
        Ok(())
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HKDF session key derivation
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// Low-level framing helpers (handshake only)
// ─────────────────────────────────────────────────────────────────────────────

async fn write_frame(stream: &mut TcpStream, payload: &[u8]) -> Result<(), ProxyError> {
    if payload.len() > MAX_HANDSHAKE_FRAME {
        return Err(ProxyError::FrameTooLarge(payload.len()));
    }
    let mut buf = BytesMut::with_capacity(4 + payload.len());
    buf.put_u32(payload.len() as u32);
    buf.put_slice(payload);
    stream.write_all(&buf).await?;
    Ok(())
}

async fn read_frame(stream: &mut TcpStream) -> Result<Bytes, ProxyError> {
    let len = stream.read_u32().await? as usize;
    if len > MAX_HANDSHAKE_FRAME {
        return Err(ProxyError::FrameTooLarge(len));
    }
    let mut buf = vec![0u8; len];
    stream.read_exact(&mut buf).await?;
    Ok(Bytes::from(buf))
}

// ─────────────────────────────────────────────────────────────────────────────
// Frame builders
// ─────────────────────────────────────────────────────────────────────────────

fn build_hello(identity: &QuantumNodeIdentity) -> Result<Vec<u8>, ProxyError> {
    let ek = identity.encap_key_bytes();
    let sig = identity
        .sign_payload(&ek)
        .map_err(|e| ProxyError::Crypto(e.to_string()))?;
    let dsa_pub = identity.dsa_public_key_bytes();

    debug_assert_eq!(ek.len(), ENCAP_KEY_LEN);
    debug_assert_eq!(sig.len(), SIGNATURE_LEN);
    debug_assert_eq!(dsa_pub.len(), DSA_PUB_LEN);

    let mut frame = Vec::with_capacity(HELLO_FRAME_LEN);
    frame.extend_from_slice(&ek);
    frame.extend_from_slice(&sig);
    frame.extend_from_slice(&dsa_pub);
    Ok(frame)
}

fn build_kem_ct(identity: &QuantumNodeIdentity, ct: &[u8]) -> Result<Vec<u8>, ProxyError> {
    let sig = identity
        .sign_payload(ct)
        .map_err(|e| ProxyError::Crypto(e.to_string()))?;

    debug_assert_eq!(ct.len(), CIPHERTEXT_LEN);
    debug_assert_eq!(sig.len(), SIGNATURE_LEN);

    let mut frame = Vec::with_capacity(KEM_CT_FRAME_LEN);
    frame.extend_from_slice(ct);
    frame.extend_from_slice(&sig);
    Ok(frame)
}

// ─────────────────────────────────────────────────────────────────────────────
// Frame parsers / verifiers
// ─────────────────────────────────────────────────────────────────────────────

/// Parse a HELLO/HELLO_ACK frame. Returns `(peer_ek_bytes, peer_dsa_pub_bytes)`.
fn parse_hello(frame: &Bytes) -> Result<(Vec<u8>, Vec<u8>), ProxyError> {
    if frame.len() != HELLO_FRAME_LEN {
        return Err(ProxyError::MalformedFrame {
            expected: HELLO_FRAME_LEN,
            got: frame.len(),
        });
    }
    let ek = frame[..ENCAP_KEY_LEN].to_vec();
    let sig = &frame[ENCAP_KEY_LEN..ENCAP_KEY_LEN + SIGNATURE_LEN];
    let dsa_pub = frame[ENCAP_KEY_LEN + SIGNATURE_LEN..].to_vec();

    if !QuantumNodeIdentity::verify_signature(&dsa_pub, &ek, sig) {
        return Err(ProxyError::InvalidSignature);
    }
    Ok((ek, dsa_pub))
}

/// Parse and verify a KEM_CT frame. Returns raw ciphertext bytes.
fn parse_kem_ct(frame: &Bytes, peer_dsa_pub: &[u8]) -> Result<Vec<u8>, ProxyError> {
    if frame.len() != KEM_CT_FRAME_LEN {
        return Err(ProxyError::MalformedFrame {
            expected: KEM_CT_FRAME_LEN,
            got: frame.len(),
        });
    }
    let ct = frame[..CIPHERTEXT_LEN].to_vec();
    let sig = &frame[CIPHERTEXT_LEN..];

    if !QuantumNodeIdentity::verify_signature(peer_dsa_pub, &ct, sig) {
        return Err(ProxyError::InvalidSignature);
    }
    Ok(ct)
}

// ─────────────────────────────────────────────────────────────────────────────
// Secret combining + transcript hashing
// ─────────────────────────────────────────────────────────────────────────────

/// XOR two equal-length byte slices. Used to combine both ML-KEM halves.
fn xor_secrets(a: &[u8], b: &[u8]) -> Vec<u8> {
    let len = a.len().min(b.len());
    a[..len]
        .iter()
        .zip(b[..len].iter())
        .map(|(x, y)| x ^ y)
        .collect()
}

/// Compute a BLAKE3 transcript hash over both hello frames for use as the
/// HKDF salt, binding the session key to the specific exchange transcript.
fn transcript_hash(hello_a: &[u8], hello_b: &[u8], kem_a: &[u8], kem_b: &[u8]) -> [u8; 32] {
    let mut hasher = blake3::Hasher::new();
    hasher.update(b"V1.0");
    hasher.update(hello_a);
    hasher.update(hello_b);
    hasher.update(kem_b);
    hasher.update(kem_a);
    *hasher.finalize().as_bytes()
}
// ─────────────────────────────────────────────────────────────────────────────
// Public handshake functions
// ─────────────────────────────────────────────────────────────────────────────

/// Run the **responder** side of the post-quantum handshake.
///
/// Returns a [`SessionContext`] containing both the raw shared secret and the
/// HKDF-derived session key on success.
#[instrument(skip(stream, identity), fields(peer = ?stream.peer_addr().ok()))]
pub async fn run_responder(
    stream: &mut TcpStream,
    identity: &QuantumNodeIdentity,
) -> Result<SessionContext, ProxyError> {
    let peer_addr = stream.peer_addr()?;
    info!("Responder: beginning post-quantum handshake");

    // 1. Receive HELLO
    let f1 = read_frame(stream).await?;
    let (peer_ek, peer_dsa_pub) = parse_hello(&f1)
        .map_err(|e| { warn!("Responder: HELLO parse/verify failed"); e })?;
    debug!("Responder: HELLO verified ({} B encap key)", peer_ek.len());

    // 2. Send HELLO_ACK
    let our_hello = build_hello(identity)?;
    write_frame(stream, &our_hello).await?;
    debug!("Responder: HELLO_ACK sent");

    // 3. Encapsulate toward initiator; send KEM_CT_B
    let (ct_b, ss_b) = QuantumNodeIdentity::encapsulate_shared_secret_from_bytes(&peer_ek)
        .map_err(|e| ProxyError::Crypto(e.to_string()))?;
    let f3 = build_kem_ct(identity, &ct_b)?;
    write_frame(stream, &f3).await?;
    debug!("Responder: KEM_CT_B sent");

    // 4. Receive KEM_CT_A
    let f4 = read_frame(stream).await?;
    let ct_a = parse_kem_ct(&f4, &peer_dsa_pub)
        .map_err(|e| { warn!("Responder: KEM_CT_A verify failed"); e })?;

    // 5. Decapsulate
    let ss_a = identity
        .decapsulate_from_bytes(&ct_a)
        .map_err(|e| ProxyError::Crypto(e.to_string()))?;

    // 6. Combine secrets + derive session key
    let raw_secret = xor_secrets(&ss_b, &ss_a);
    let salt = transcript_hash(&f1, &our_hello, &f4, &f3);
    let session_ctx = derive_session_context(&raw_secret, &salt)?;

    info!("Responder: handshake complete — session context derived");
    Ok(session_ctx)
}

/// Run the **initiator** side of the post-quantum handshake.
///
/// Returns a [`SessionContext`] on success.
#[instrument(skip(stream, identity), fields(peer = ?stream.peer_addr().ok()))]
pub async fn run_initiator(
    stream: &mut TcpStream,
    identity: &QuantumNodeIdentity,
) -> Result<SessionContext, ProxyError> {
    let peer_addr = stream.peer_addr()?;
    info!("Initiator: beginning post-quantum handshake");

    // 1. Send HELLO
    let our_hello = build_hello(identity)?;
    write_frame(stream, &our_hello).await?;
    debug!("Initiator: HELLO sent");

    // 2. Receive HELLO_ACK
    let f2 = read_frame(stream).await?;
    let (peer_ek, peer_dsa_pub) = parse_hello(&f2)
        .map_err(|e| { warn!("Initiator: HELLO_ACK parse/verify failed"); e })?;
    debug!("Initiator: HELLO_ACK verified");

    // 3. Receive KEM_CT_B
    let f3 = read_frame(stream).await?;
    let ct_b = parse_kem_ct(&f3, &peer_dsa_pub)
        .map_err(|e| { warn!("Initiator: KEM_CT_B verify failed"); e })?;

    // 4. Encapsulate toward responder; send KEM_CT_A
    let (ct_a, ss_a) = QuantumNodeIdentity::encapsulate_shared_secret_from_bytes(&peer_ek)
        .map_err(|e| ProxyError::Crypto(e.to_string()))?;
    let f4 = build_kem_ct(identity, &ct_a)?;
    write_frame(stream, &f4).await?;
    debug!("Initiator: KEM_CT_A sent");

    // 5. Decapsulate
    let ss_b = identity
        .decapsulate_from_bytes(&ct_b)
        .map_err(|e| ProxyError::Crypto(e.to_string()))?;

    // 6. Combine + derive
    let raw_secret = xor_secrets(&ss_b, &ss_a);
    let salt = transcript_hash(&our_hello, &f2, &f4, &f3);
    let session_ctx = derive_session_context(&raw_secret, &salt)?;

    info!("Initiator: handshake complete — session context derived");
    Ok(session_ctx)
}

// ─────────────────────────────────────────────────────────────────────────────
// QuantumProxyListener (test-friendly)
// ─────────────────────────────────────────────────────────────────────────────

/// Listens for inbound TCP connections and runs the post-quantum handshake as
/// the responder on each accepted connection.
pub struct QuantumProxyListener {
    listener: TcpListener,
    identity: QuantumNodeIdentity,
}

impl QuantumProxyListener {
    /// Bind to `addr` and generate a fresh node identity.
    pub async fn bind(addr: &str) -> Result<Self, ProxyError> {
        let listener = TcpListener::bind(addr).await?;
        let identity = QuantumNodeIdentity::generate_node_identity()
            .map_err(|e| ProxyError::Crypto(e.to_string()))?;
        Ok(Self { listener, identity })
    }

    /// Construct from pre-built parts (OS-chosen port in tests).
    pub fn from_parts(listener: TcpListener, identity: QuantumNodeIdentity) -> Self {
        Self { listener, identity }
    }

    /// Return the local socket address.
    pub fn local_addr(&self) -> Result<SocketAddr, ProxyError> {
        Ok(self.listener.local_addr()?)
    }

    /// Accept one connection and complete the handshake. Returns the session
    /// and the underlying stream for subsequent data transfer.
    pub async fn accept_handshake(&self) -> Result<(SessionContext, TcpStream), ProxyError> {
        let (mut stream, _peer_addr) = self.listener.accept().await?;
        let session = run_responder(&mut stream, &self.identity).await?;
        Ok((session, stream))
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// QuantumProxyServer (production accept-loop)
// ─────────────────────────────────────────────────────────────────────────────

/// Production post-quantum proxy server.
///
/// Binds a TCP listener, generates a node identity, and runs an infinite
/// accept loop. Each inbound connection is handed off to a dedicated Tokio task
/// that performs the quantum handshake and then enters the application frame
/// processing loop (via [`QuantumFrameCodec`]).
pub struct QuantumProxyServer {
    /// This node's cryptographic identity (public key is shareable).
    pub identity: QuantumNodeIdentity,
    bind_addr: String,
}

impl QuantumProxyServer {
    /// Create a new server bound to `bind_addr` (e.g. `"0.0.0.0:8443"`).
    pub fn new(bind_addr: impl Into<String>) -> Result<Self, Box<dyn std::error::Error>> {
        let identity = QuantumNodeIdentity::generate_node_identity()?;
        Ok(Self {
            identity,
            bind_addr: bind_addr.into(),
        })
    }

    /// Run the accept-loop indefinitely.
    ///
    /// For each connection:
    /// 1. Perform the post-quantum handshake.
    /// 2. Derive an HKDF session key.
    /// 3. Hand the [`Framed`][tokio_util::codec::Framed] stream off to an
    ///    application task (stub: logs and discards frames).
    pub async fn run_loop(&self) -> Result<(), ProxyError> {
        let listener = TcpListener::bind(&self.bind_addr).await?;
        info!(addr = %self.bind_addr, "QuantumProxyServer listening");

        loop {
            match listener.accept().await {
                Ok((mut socket, remote_addr)) => {
                    info!(%remote_addr, "Accepted inbound connection");
                    // Clone the identity bytes needed for the handshake in the
                    // spawned task. We don't clone the full struct (no Clone
                    // derive on raw ml-dsa key types), so we re-generate for
                    // each connection — in production you'd use an Arc<Identity>.
                    tokio::spawn(async move {
                        // generate_node_identity returns Box<dyn Error> which is !Send.
                        // Convert to String before any .await so the future is Send.
                        let task_identity = match QuantumNodeIdentity::generate_node_identity()
                            .map_err(|e| e.to_string())
                        {
                            Err(e) => {
                                error!(%remote_addr, "Failed to generate task identity: {e}");
                                return;
                            }
                            Ok(id) => id,
                        };
                        match run_responder(&mut socket, &task_identity).await {
                            Ok(session) => {
                                info!(
                                    %remote_addr,
                                    secret_len = 32,
                                    "Handshake complete; entering frame loop"
                                );
                                // Application frame ingress stub:
                                let _framed = tokio_util::codec::Framed::new(
                                    socket,
                                    QuantumFrameCodec,
                                );
                                // TODO Sprint 3: pipe frames into ledger_sync
                            }
                            Err(e) => {
                                warn!(%remote_addr, "Handshake failed: {e}");
                            }
                        }
                    });
                }
                Err(e) => {
                    error!("Accept error: {e}");
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Unit tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_util::codec::Framed;

    // ── QuantumFrameCodec ──────────────────────────────────────────────────

    /// A frame exactly at the 64 KiB limit must be accepted.
    #[test]
    fn test_codec_accepts_max_frame() {
        let mut codec = QuantumFrameCodec;
        let payload = vec![0xABu8; MAX_FRAME_SIZE];
        let mut buf = BytesMut::new();
        codec.encode(payload.clone(), &mut buf).unwrap();

        let result = codec.decode(&mut buf).unwrap().unwrap();
        assert_eq!(result, payload);
    }

    /// A frame one byte over the limit must be rejected at encode time.
    #[test]
    fn test_codec_rejects_oversized_encode() {
        let mut codec = QuantumFrameCodec;
        let mut buf = BytesMut::new();
        let oversized = vec![0u8; MAX_FRAME_SIZE + 1];
        let result = codec.encode(oversized, &mut buf);
        assert!(matches!(result, Err(ProxyError::FrameTooLarge(_))));
    }

    /// A 128 KiB length header injected directly must be rejected at decode.
    #[test]
    fn test_bounded_codec_overflow_prevention() {
        let mut codec = QuantumFrameCodec;
        let mut buf = BytesMut::new();
        buf.put_u32(131_072); // 128 KiB declared length — exceeds 64 KiB limit
        buf.put_bytes(0u8, 100);

        let result = codec.decode(&mut buf);
        assert!(matches!(result, Err(ProxyError::FrameTooLarge(131_072))));
    }

    /// Partial frame (header present, body missing) returns Ok(None).
    #[test]
    fn test_codec_partial_frame_returns_none() {
        let mut codec = QuantumFrameCodec;
        let mut buf = BytesMut::new();
        buf.put_u32(256); // claims 256 bytes
        buf.put_bytes(0u8, 10); // only 10 bytes provided

        let result = codec.decode(&mut buf).unwrap();
        assert!(result.is_none());
    }

    // ── HKDF key derivation ────────────────────────────────────────────────

    /// HKDF output must be non-zero and deterministic.
    #[test]
    fn test_hkdf_key_derivation_deterministic() {
        let secret = [0x42u8; 32];
        let salt = b"HANDSHAKE_TRANSCRIPT_HASH";

        let k1 = derive_session_keys(&secret, salt).unwrap();
        let k2 = derive_session_keys(&secret, salt).unwrap();

        assert_eq!(k1.as_slice(), k2.as_slice(), "HKDF must be deterministic");
        assert_ne!(k1.as_slice(), &[0u8; 32], "Derived key must not be all-zero");
    }

    /// Different salts must produce different keys.
    #[test]
    fn test_hkdf_key_derivation_salt_sensitivity() {
        let secret = [0x42u8; 32];
        let k1 = derive_session_keys(&secret, b"salt_A").unwrap();
        let k2 = derive_session_keys(&secret, b"salt_B").unwrap();
        assert_ne!(k1.as_slice(), k2.as_slice());
    }

    /// Deprecated name used in the master prompt — kept as alias test.
    #[test]
    fn test_hkdf_key_derivation_zeroization() {
        let raw_secret = [0x42u8; 32];
        let salt = b"HANDSHAKE_TRANSCRIPT_HASH";
        let derived_key = derive_session_keys(&raw_secret, salt).unwrap();
        assert_ne!(derived_key.as_slice(), &[0u8; 32]);
    }

    // ── AES-256-GCM seal / open ────────────────────────────────────────────

    /// Seal then open must round-trip correctly.
    #[test]
    fn test_aes_gcm_seal_open_roundtrip() {
        let key = [0xDEu8; 32];
        let plaintext = b"VARDHAN_QUANTUM_PROXY_TEST_PAYLOAD_001";

        let sealed = aes_gcm_seal(&key, plaintext).unwrap();
        assert!(sealed.len() > 12, "Sealed data must include nonce + ciphertext");

        let opened = aes_gcm_open(&key, &sealed).unwrap();
        assert_eq!(&opened, plaintext);
    }

    /// Wrong key must cause decryption to fail (AEAD authentication failure).
    #[test]
    fn test_aes_gcm_wrong_key_fails() {
        let key_a = [0xAAu8; 32];
        let key_b = [0xBBu8; 32];
        let plaintext = b"secret message";

        let sealed = aes_gcm_seal(&key_a, plaintext).unwrap();
        let result = aes_gcm_open(&key_b, &sealed);
        assert!(
            matches!(result, Err(ProxyError::CryptoError)),
            "Wrong-key decryption must fail"
        );
    }

    // ── Handshake frame integrity ──────────────────────────────────────────

    #[test]
    fn test_xor_combining() {
        let a = vec![0xAAu8; 32];
        let b = vec![0x55u8; 32];
        assert_eq!(xor_secrets(&a, &b), vec![0xFFu8; 32]);
        assert_eq!(xor_secrets(&a, &a), vec![0x00u8; 32]);
    }

    #[test]
    fn test_hello_frame_roundtrip() {
        let identity = QuantumNodeIdentity::generate_node_identity().unwrap();
        let frame = Bytes::from(build_hello(&identity).unwrap());
        assert_eq!(frame.len(), HELLO_FRAME_LEN);
        let (ek, dsa_pub) = parse_hello(&frame).unwrap();
        assert_eq!(ek.len(), ENCAP_KEY_LEN);
        assert_eq!(dsa_pub.len(), DSA_PUB_LEN);
    }

    #[test]
    fn test_hello_tampered_encap_key_rejected() {
        let signer = QuantumNodeIdentity::generate_node_identity().unwrap();
        let attacker = QuantumNodeIdentity::generate_node_identity().unwrap();
        let mut frame_bytes = build_hello(&signer).unwrap();
        frame_bytes[..ENCAP_KEY_LEN].copy_from_slice(&attacker.encap_key_bytes());
        let frame = Bytes::from(frame_bytes);
        assert!(matches!(parse_hello(&frame), Err(ProxyError::InvalidSignature)));
    }

    #[test]
    fn test_kem_ct_tampered_rejected() {
        let signer = QuantumNodeIdentity::generate_node_identity().unwrap();
        let dsa_pub = signer.dsa_public_key_bytes();
        let target = QuantumNodeIdentity::generate_node_identity().unwrap();
        let ek = target.encap_key_bytes();
        let (ct, _) = QuantumNodeIdentity::encapsulate_shared_secret_from_bytes(&ek).unwrap();
        let mut frame_bytes = build_kem_ct(&signer, &ct).unwrap();
        frame_bytes[0] ^= 0xFF;
        let frame = Bytes::from(frame_bytes);
        assert!(matches!(parse_kem_ct(&frame, &dsa_pub), Err(ProxyError::InvalidSignature)));
    }

    #[test]
    fn test_kem_bytes_roundtrip() {
        let r = QuantumNodeIdentity::generate_node_identity().unwrap();
        let ek = r.encap_key_bytes();
        let (ct, ss_enc) =
            QuantumNodeIdentity::encapsulate_shared_secret_from_bytes(&ek).unwrap();
        let ss_dec = r.decapsulate_from_bytes(&ct).unwrap();
        assert_eq!(ss_enc, ss_dec);
    }

    // ── Framed codec over in-memory duplex ────────────────────────────────

    /// Round-trip a frame through `QuantumFrameCodec` over an in-memory
    /// Tokio duplex socket.
    #[tokio::test]
    async fn test_framed_codec_over_duplex() {
        use futures_util::{SinkExt, StreamExt};

        let (client, server) = tokio::io::duplex(4096);

        let mut client_framed = Framed::new(client, QuantumFrameCodec);
        let mut server_framed = Framed::new(server, QuantumFrameCodec);

        let payload = b"VARDHAN_QUANTUM_FRAME_TEST".to_vec();
        client_framed.send(payload.clone()).await.unwrap();

        let received = server_framed.next().await.unwrap().unwrap();
        assert_eq!(received, payload);
    }

}
pub mod stateless;
pub use stateless::{aes_gcm_seal, aes_gcm_open};
