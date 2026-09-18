import React, { useState } from "react";
import { Container, Row, Col, Badge, Button } from "reactstrap";
import Head from "next/head";
import Link from "next/link";

export default function PlatformPage() {
  const [selectedSubsystem, setSelectedSubsystem] = useState("pq-shield");
  const [flowStep, setFlowStep] = useState(1);

  const subsystems = [
    {
      id: "pq-shield",
      title: "PQ Shield Ingress Gateway",
      crate: "backend/pq_shield",
      tag: "TLS & Protocol Termination",
      role: "Front-line high-concurrency Axum gateway terminating incoming post-quantum connections. Enforces Shannon entropy minimum threshold (>= 7.90 b/B), sliding-window anti-replay filter (32,768 nonces), and IP token-bucket rate limiting.",
      spec: "Axum 0.7 · Tokio Multi-threaded · Hyper 1.0 · DashMap Session Cache",
      metrics: { latency: "< 0.22ms", throughput: "100 Gbps", memory: "16MB / core" }
    },
    {
      id: "proxy-engine",
      title: "Proxy Engine & Wire Framing",
      crate: "backend/proxy_engine",
      tag: "Zero-Copy AEAD Re-Encryption",
      role: "Bidirectional streaming re-encryption pipeline. Encapsulates incoming frames into authenticated `VQ01` (0x56513031) wire format with monotonic 64-bit sequence counters, 96-bit CSPRNG nonces, AES-256-GCM tags, and BLAKE3 integrity digests.",
      spec: "AES-256-GCM · 96-bit Nonce · BLAKE3 Hash · Zero-Allocation BytesMut",
      metrics: { latency: "< 0.15ms", throughput: "40 Gbps/core", memory: "Zero-copy" }
    },
    {
      id: "core-crypto",
      title: "Core Cryptographic Suite",
      crate: "backend/core_crypto",
      tag: "FIPS 203 & 204 Implementation",
      role: "Memory-safe direct binding to standardized NIST post-quantum primitives: FIPS 203 ML-KEM-1024 for quantum-resistant key encapsulation and FIPS 204 ML-DSA-87 for high-assurance tamper-evident digital signatures.",
      spec: "FIPS 203 (ML-KEM-1024) · FIPS 204 (ML-DSA-87) · AVX-512 SIMD NTT",
      metrics: { latency: "0.38ms decaps", security: "256+ Quantum Bits", standard: "NIST Category 5" }
    },
    {
      id: "ha-cluster",
      title: "HA Cluster & Raft Consensus",
      crate: "backend/ha_cluster",
      tag: "Distributed State Quorum",
      role: "High-availability Raft consensus core managing distributed cluster membership, leader elections, and log replication. Peers communicate over mutual AEAD transport with 50ms heartbeat monitoring and graceful node drain state machines.",
      spec: "Raft Consensus · Term State Machine · Mutual AEAD Mesh · Log Fsync",
      metrics: { heartbeat: "50ms", electionTimeout: "150-300ms", quorum: "floor(N/2)+1" }
    },
    {
      id: "audit-ledger",
      title: "Merkle-Linked Audit Ledger",
      crate: "backend/audit_ledger",
      tag: "Tamper-Evident Chain of Custody",
      role: "Append-only, fsynced JSONL ledger recording every administrative authentication, node drain transition, and security alert. Each record calculates a BLAKE3 Merkle chain link signed with the sovereign ML-DSA-87 master key.",
      spec: "Append-Only JSONL · BLAKE3 Merkle Digest · FIPS 204 Signatures · Fsync",
      metrics: { writeSpeed: "100k records/s", proofLatency: "< 0.05ms", auditability: "DORA Sealed" }
    },
    {
      id: "identity-auth",
      title: "Identity & RBAC Engine",
      crate: "backend/auth_service",
      tag: "Memory-Hard Argon2id",
      role: "Sovereign access control utilizing memory-hard Argon2id (m=64MB, t=3, p=4) with constant-time dummy sentinel verification to completely eliminate timing side-channels and username enumeration attacks.",
      spec: "Argon2id (m=64MB) · Constant-Time Dummy Evaluation · Sled Embedded DB",
      metrics: { hashTime: "42ms", entropy: "CSPRNG OsRng", roles: "4 Discrete RBAC Levels" }
    },
    {
      id: "pq-verify",
      title: "Cryptographic Proof Verifier",
      crate: "backend/audit_ledger::verify",
      tag: "Mathematical Proof Validation",
      role: "Autonomous verification utility proving parent-hash continuity, monotonic block ordering, and digital signature authenticity across the entire distributed ledger without reliance on external certificate authorities.",
      spec: "BLAKE3 Tree Proofs · ML-DSA-87 Verification · Zero-Trust Math",
      metrics: { verifyThroughput: "250,000 blocks/s", chainIntegrity: "100% Deterministic" }
    },
    {
      id: "telemetry",
      title: "Live SSE Telemetry Stream",
      crate: "backend/pq_shield::admin",
      tag: "Real-Time Observability",
      role: "Low-latency Server-Sent Events (SSE) telemetry pipeline streaming live Shannon wire entropy, active proxy connection counts, Raft consensus terms, and immediate threat alerts to authenticated SOC consoles.",
      spec: "HTTP/2 SSE · Bounded Broadcast Channel · Microsecond Timestamping",
      metrics: { streamLatency: "< 1ms", broadcastCap: "10,000 subscribers" }
    }
  ];

  const current = subsystems.find(s => s.id === selectedSubsystem) || subsystems[0];

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#111111", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Head>
        <title>Platform Subsystems | Vardhan Quantum</title>
        <meta name="description" content="Detailed engineering specification of the Vardhan Quantum post-quantum security platform subsystems." />
      </Head>

      {/* Header */}
      <section style={{ padding: "110px 0 60px", borderBottom: "1px solid #EEEEEE", background: "radial-gradient(ellipse at top, rgba(37, 99, 235, 0.12) 0%, rgba(0, 0, 0, 0) 70%)" }}>
        <Container>
          <div className="text-center">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700" }}>
              ENGINEERING ARCHITECTURE SPECIFICATION
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: "900", marginTop: "12px", letterSpacing: "-0.02em", color: "#111111" }}>
              Vardhan Quantum Security Subsystems
            </h1>
            <p style={{ color: "#666666", maxWidth: "720px", margin: "16px auto 0", fontSize: "16px", lineHeight: "1.6" }}>
              A strictly decoupled, memory-safe Rust platform engineered to defend high-consequence enterprise workloads against harvest-now-decrypt-later adversaries.
            </p>
          </div>
        </Container>
      </section>

      {/* Interactive Subsystem Radar & Inspector */}
      <section style={{ padding: "70px 0", borderBottom: "1px solid #EEEEEE" }}>
        <Container>
          <Row>
            {/* Subsystems List */}
            <Col lg={5} className="mb-4 mb-lg-0">
              <div className="text-uppercase mb-3" style={{ fontSize: "12px", color: "#2563EB", fontWeight: "700", letterSpacing: "0.08em" }}>
                CORE SOVEREIGN SUBSYSTEMS (CLICK TO INSPECT)
              </div>
              <div className="d-flex flex-column gap-2">
                {subsystems.map((sub) => {
                  const isSelected = sub.id === selectedSubsystem;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubsystem(sub.id)}
                      style={{
                        background: isSelected ? "rgba(37, 99, 235, 0.12)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "1px solid #2563EB" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderLeft: isSelected ? "4px solid #2563EB" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "14px 18px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      className="mb-2"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ fontWeight: "700", color: isSelected ? "#2563EB" : "#FFFFFF", fontSize: "14px" }}>
                          {sub.title}
                        </span>
                        <span style={{ fontSize: "11px", color: "#666666", fontFamily: "monospace" }}>
                          {sub.crate}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: isSelected ? "#FFFFFF" : "#71717A", marginTop: "4px" }}>
                        {sub.tag}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Col>

            {/* Subsystem Deep Inspector Card */}
            <Col lg={7}>
              <div className="text-uppercase mb-3" style={{ fontSize: "12px", color: "#2563EB", fontWeight: "700", letterSpacing: "0.08em" }}>
                SUBSYSTEM OPERATIONAL PROFILE
              </div>
              <div className="vq-glass-card p-4 p-md-5 h-100" style={{ border: "1px solid #E0E0E0" }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="vq-badge-yellow mb-2 d-inline-block">
                      {current.tag}
                    </span>
                    <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#111111", margin: "4px 0" }}>
                      {current.title}
                    </h3>
                    <code style={{ fontSize: "12px", color: "#2563EB" }}>{current.crate}</code>
                  </div>
                  <span className="badge badge-dark p-2" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #E0E0E0", fontFamily: "monospace", fontSize: "11px" }}>
                    RUST 2021 EDITION
                  </span>
                </div>

                <p style={{ color: "#333333", fontSize: "14px", lineHeight: "1.7", margin: "18px 0" }}>
                  {current.role}
                </p>

                <div className="p-3 mb-4 rounded" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0" }}>
                  <div style={{ fontSize: "11px", color: "#666666", fontFamily: "monospace", marginBottom: "4px" }}>
                    CRYPTOGRAPHIC & RUNTIME CONSTRAINTS
                  </div>
                  <div style={{ fontSize: "13px", color: "#111111", fontFamily: "monospace", fontWeight: "600" }}>
                    {current.spec}
                  </div>
                </div>

                <div className="row">
                  {Object.entries(current.metrics).map(([key, val]) => (
                    <div className="col-4" key={key}>
                      <div style={{ fontSize: "10px", color: "#666666", textTransform: "uppercase", fontFamily: "monospace" }}>
                        {key}
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color: "#2563EB", fontFamily: "monospace", marginTop: "2px" }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 d-flex justify-content-between align-items-center" style={{ borderTop: "1px solid #EEEEEE" }}>
                  <span style={{ fontSize: "12px", color: "#666666" }}>
                    Formal Verification: <strong>Deterministic Bounds Active</strong>
                  </span>
                  <Link href="/architecture">
                    <a className="btn btn-outline-light btn-sm font-weight-bold" style={{ borderColor: "#2563EB", color: "#2563EB" }}>
                      View Wire Flow Diagram →
                    </a>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Packet Ingress Flow Simulator */}
      <section style={{ padding: "80px 0" }}>
        <Container>
          <div className="text-center mb-5">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700" }}>
              STEP-BY-STEP WIRE INGRESS WALKTHROUGH
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", marginTop: "8px" }}>
              Zero-Plaintext Ingress Data Path
            </h2>
            <p style={{ color: "#666666", maxWidth: "600px", margin: "10px auto 0", fontSize: "15px" }}>
              How an untrusted TCP frame traverses post-quantum filtration and consensus without disclosing plaintexts.
            </p>

            <div className="d-flex justify-content-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <button
                  key={step}
                  onClick={() => setFlowStep(step)}
                  className="btn btn-sm mr-2"
                  style={{
                    background: flowStep === step ? "#2563EB" : "rgba(255,255,255,0.05)",
                    color: flowStep === step ? "#000000" : "#FFFFFF",
                    fontWeight: "700",
                    border: flowStep === step ? "none" : "1px solid rgba(255,255,255,0.15)",
                    fontFamily: "monospace"
                  }}
                >
                  Step 0{step}
                </button>
              ))}
            </div>
          </div>

          <div className="vq-glass-card p-4 p-md-5 text-center">
            {flowStep === 1 && (
              <div>
                <span className="vq-badge-yellow mb-2 d-inline-block">STAGE 01 // AF_XDP KERNEL INGRESS</span>
                <h4 style={{ fontSize: "22px", fontWeight: "800", margin: "8px 0" }}>Raw TCP Frame Capture & Magic Byte Check</h4>
                <p style={{ color: "#666666", maxWidth: "650px", margin: "0 auto 16px" }}>
                  Frame arrives at line rate via eBPF kernel bypass. The header is parsed with zero memory allocation to assert magic bytes <code>0x56513031</code> (`VQ01`).
                </p>
                <div className="p-3 rounded d-inline-block font-family-monospace" style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#2563EB", fontSize: "13px" }}>
                  [0x56 0x51 0x30 0x31] → MAGIC_ASSERT_OK (Kernel Zero-Copy)
                </div>
              </div>
            )}

            {flowStep === 2 && (
              <div>
                <span className="vq-badge-yellow mb-2 d-inline-block">STAGE 02 // SHANNON WIRE ENTROPY PROBE</span>
                <h4 style={{ fontSize: "22px", fontWeight: "800", margin: "8px 0" }}>Shannon Entropy Measurement</h4>
                <p style={{ color: "#666666", maxWidth: "650px", margin: "0 auto 16px" }}>
                  Before expensive cryptographic operations occur, the payload byte frequency distribution is evaluated. Frames with Shannon entropy below 7.90 b/B are instantly dropped.
                </p>
                <div className="p-3 rounded d-inline-block font-family-monospace" style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#2563EB", fontSize: "13px" }}>
                  H(X) = -∑ P(x) log2 P(x) = 7.9994 bits/byte → PASS (VALID CIPHERTEXT)
                </div>
              </div>
            )}

            {flowStep === 3 && (
              <div>
                <span className="vq-badge-yellow mb-2 d-inline-block">STAGE 03 // SLIDING-WINDOW REPLAY FILTER</span>
                <h4 style={{ fontSize: "22px", fontWeight: "800", margin: "8px 0" }}>Monotonic Sequence Verification</h4>
                <p style={{ color: "#666666", maxWidth: "650px", margin: "0 auto 16px" }}>
                  The 64-bit sequence counter is verified against an in-memory 32,768-bit sliding window filter. Any replayed or heavily out-of-order nonce is discarded immediately.
                </p>
                <div className="p-3 rounded d-inline-block font-family-monospace" style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#2563EB", fontSize: "13px" }}>
                  SEQ_COUNTER: #194,821 · NONCE: 0x9F82A1B0... → REPLAY_CHECK_PASSED
                </div>
              </div>
            )}

            {flowStep === 4 && (
              <div>
                <span className="vq-badge-yellow mb-2 d-inline-block">STAGE 04 // AVX-512 SIMD NTT DECAPSULATION</span>
                <h4 style={{ fontSize: "22px", fontWeight: "800", margin: "8px 0" }}>FIPS 203 ML-KEM-1024 Decapsulation</h4>
                <p style={{ color: "#666666", maxWidth: "650px", margin: "0 auto 16px" }}>
                  Vectorized Number Theoretic Transforms perform modular polynomial ring arithmetic in 0.38ms, deriving the 32-byte post-quantum shared secret via HKDF-SHA256.
                </p>
                <div className="p-3 rounded d-inline-block font-family-monospace" style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#2563EB", fontSize: "13px" }}>
                  ML-KEM-1024 DECAPS (0.38ms) → SHARED_SECRET_DERIVED (32 BYTES)
                </div>
              </div>
            )}

            {flowStep === 5 && (
              <div>
                <span className="vq-badge-yellow mb-2 d-inline-block">STAGE 05 // APPEND-ONLY MERKLE COMMIT</span>
                <h4 style={{ fontSize: "22px", fontWeight: "800", margin: "8px 0" }}>BLAKE3 Hash Chain & FIPS 204 Seal</h4>
                <p style={{ color: "#666666", maxWidth: "650px", margin: "0 auto 16px" }}>
                  A structured cryptographic record is appended to the audit ledger, signed with FIPS 204 ML-DSA-87, fsynced to NVMe storage, and the frame is forwarded to upstream.
                </p>
                <div className="p-3 rounded d-inline-block font-family-monospace" style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#2563EB", fontSize: "13px" }}>
                  MERKLE_APPEND_LEAF #84092 → ML-DSA-87 SIGNED → DISPATCH_UPSTREAM
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
