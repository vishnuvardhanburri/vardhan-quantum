import React, { useState } from "react";
import { Container, Row, Col, Badge } from "reactstrap";
import Head from "next/head";
import Link from "next/link";

export default function ArchitecturePage() {
  const [selectedByteField, setSelectedByteField] = useState("magic");

  const wireFields = {
    magic: {
      name: "Wire Header Magic (0x56513031)",
      offset: "Bytes 0 - 3 (4 bytes)",
      value: "0x56 0x51 0x30 0x31 ('VQ01')",
      description: "Asserted on ingress by AF_XDP kernel filter. Packets lacking this prefix are dropped instantly before TLS or AEAD parsing."
    },
    sequence: {
      name: "Monotonic Sequence Counter",
      offset: "Bytes 4 - 11 (8 bytes, uint64_t)",
      value: "0x00 0x00 0x00 0x00 0x00 0x02 0xF9 0x15 (#194,837)",
      description: "Strictly increasing counter per wire tunnel. Evaluated against 32,768 sliding-window bitmask to eliminate packet replay and sequence spoofing."
    },
    nonce: {
      name: "AEAD Initialization Vector (IV)",
      offset: "Bytes 12 - 23 (12 bytes, 96 bits)",
      value: "0x9F 0x82 0xA1 0xB0 0x29 0x38 0x47 0xC2 0x01 0x4A 0x89 0xFE",
      description: "Cryptographically secure random nonce generated per frame via OS CSPRNG. Combined with sequence counter to guarantee uniqueness under AES-256-GCM."
    },
    tag: {
      name: "Authentication Tag (Polyval)",
      offset: "Bytes 24 - 39 (16 bytes, 128 bits)",
      value: "0xB8 0x10 0x9F 0xE4 0x61 0xC7 0x00 0x12 0x7A 0x44 0xD9 0x2E 0x01 0xF4 0x8A 0xC9",
      description: "NIST SP 800-38D integrity tag. Guarantees authenticity and prevents bit-flipping attacks in transit. Zero-plaintext disclosure if tag fails."
    },
    payload: {
      name: "Encrypted Ciphertext Payload",
      offset: "Bytes 40 - N (Variable size)",
      value: "0x33 0x00 0x91 0xE2 0xA5 0xB7 0xC4 0x08 ... [Encrypted User Data]",
      description: "Raw HTTP/2 or TCP frame encrypted with AES-256-GCM using directional session keys derived from FIPS 203 ML-KEM-1024 shared secret."
    },
    blake3: {
      name: "BLAKE3 Checksum Digest",
      offset: "Trailer (32 bytes, 256 bits)",
      value: "0xFA 0x92 0xD1 0x84 0x3B 0x10 0xE7 0xC9 ... [Tree Digest]",
      description: "Ultra-fast tree-hash verifying payload integrity and committed to the append-only Merkle audit ledger for non-repudiation."
    }
  };

  const currentField = wireFields[selectedByteField];

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#111111", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Head>
        <title>Technical Architecture & Wire Protocol | Vardhan Quantum</title>
        <meta name="description" content="Formal control and data plane technical architecture diagram and wire protocol framing specification." />
      </Head>

      {/* Header */}
      <section style={{ padding: "110px 0 60px", borderBottom: "1px solid #EEEEEE", background: "radial-gradient(ellipse at top, rgba(37, 99, 235, 0.12) 0%, rgba(0, 0, 0, 0) 70%)" }}>
        <Container>
          <div className="text-center">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700" }}>
              FORMAL PLATFORM SPECIFICATION
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: "900", marginTop: "12px", letterSpacing: "-0.02em", color: "#111111" }}>
              Technical Architecture & Wire Protocol
            </h1>
            <p style={{ color: "#666666", maxWidth: "720px", margin: "16px auto 0", fontSize: "16px", lineHeight: "1.6" }}>
              Strict decoupling of Control Plane governance from line-rate Data Plane wire transport in memory-safe Rust.
            </p>
          </div>
        </Container>
      </section>

      {/* Decoupled Architecture Model */}
      <section style={{ padding: "70px 0", borderBottom: "1px solid #EEEEEE" }}>
        <Container>
          <div className="vq-glass-card p-4 p-md-5 mb-5" style={{ background: "#050505", border: "1px solid #E0E0E0" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span className="vq-badge-yellow mb-1 d-inline-block">PLANE SEPARATION</span>
                <h4 style={{ fontSize: "20px", fontWeight: "800", margin: "4px 0" }}>Control Plane vs Data Plane Architecture</h4>
              </div>
              <span className="badge" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563EB", border: "1px solid #2563EB" }}>
                ZERO-SHARED STATE
              </span>
            </div>

            <Row>
              {/* Control Plane Box */}
              <Col lg={6} className="mb-4 mb-lg-0">
                <div className="p-4 rounded h-100" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 style={{ fontSize: "16px", fontWeight: "800", color: "#111111", margin: 0 }}>
                      Control Plane (Governance & Consensus)
                    </h5>
                    <span className="badge badge-secondary">ADMIN PORT 8081</span>
                  </div>
                  <ul className="list-unstyled mb-0" style={{ fontSize: "13px", color: "#CBD5E1", lineHeight: "1.9" }}>
                    <li><strong style={{ color: "#2563EB" }}>auth_service:</strong> Memory-hard Argon2id (m=64MB) authentication with constant-time sentinel evaluation</li>
                    <li><strong style={{ color: "#2563EB" }}>ha_cluster:</strong> Distributed Raft state machine replication, heartbeat monitoring (50ms), and node drain controller</li>
                    <li><strong style={{ color: "#2563EB" }}>audit_ledger:</strong> Append-only Merkle hash chain signing every operational event with FIPS 204 ML-DSA-87</li>
                    <li><strong style={{ color: "#2563EB" }}>admin_api:</strong> Authenticated REST/SSE endpoints exposing real-time telemetry and session revocation</li>
                  </ul>
                </div>
              </Col>

              {/* Data Plane Box */}
              <Col lg={6}>
                <div className="p-4 rounded h-100" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 style={{ fontSize: "16px", fontWeight: "800", color: "#2563EB", margin: 0 }}>
                      Data Plane (High-Concurrency Wire Transport)
                    </h5>
                    <span className="badge badge-warning" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563EB" }}>WIRE PORT 8080</span>
                  </div>
                  <ul className="list-unstyled mb-0" style={{ fontSize: "13px", color: "#CBD5E1", lineHeight: "1.9" }}>
                    <li><strong style={{ color: "#111111" }}>pq_shield:</strong> Ingress TLS termination, line-rate Shannon entropy filtering (>= 7.90 b/B), and rate limiting</li>
                    <li><strong style={{ color: "#111111" }}>core_crypto:</strong> FIPS 203 ML-KEM-1024 decapsulation via AVX-512 SIMD NTT (0.38ms execution)</li>
                    <li><strong style={{ color: "#111111" }}>proxy_engine:</strong> Low-overhead streaming re-encryption packaging data into authenticated `VQ01` wire frames</li>
                    <li><strong style={{ color: "#111111" }}>anti_replay:</strong> In-memory 32,768-bit sliding window rejecting duplicate or out-of-bounds nonces</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </div>

          {/* Interactive Wire Frame Byte Structure Inspector */}
          <div className="text-center mb-5">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
              INTERACTIVE WIRE SPECIFICATION
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", marginTop: "8px" }}>
              `VQ01` Authenticated Wire Frame Byte Layout
            </h2>
            <p style={{ color: "#666666", maxWidth: "680px", margin: "10px auto 0", fontSize: "15px" }}>
              Click any byte segment to inspect offset boundaries, bit widths, and runtime cryptographic validation.
            </p>
          </div>

          {/* Visual Byte Strip */}
          <div className="vq-glass-card p-4 mb-4" style={{ background: "#050505" }}>
            <div className="d-flex flex-wrap gap-2 justify-content-between mb-4">
              {[
                { id: "magic", label: "MAGIC (4B)" },
                { id: "sequence", label: "SEQUENCE (8B)" },
                { id: "nonce", label: "NONCE (12B)" },
                { id: "tag", label: "TAG (16B)" },
                { id: "payload", label: "PAYLOAD (NB)" },
                { id: "blake3", label: "BLAKE3 (32B)" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedByteField(f.id)}
                  className="btn flex-fill font-weight-bold"
                  style={{
                    background: selectedByteField === f.id ? "#2563EB" : "rgba(255, 255, 255, 0.04)",
                    color: selectedByteField === f.id ? "#000000" : "#FFFFFF",
                    border: selectedByteField === f.id ? "none" : "1px solid rgba(255, 255, 255, 0.15)",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    padding: "10px 14px",
                    borderRadius: "6px"
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Selected Field Details */}
            <div className="p-4 rounded" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 style={{ fontSize: "18px", fontWeight: "800", color: "#2563EB", margin: 0 }}>
                  {currentField.name}
                </h5>
                <span className="badge badge-dark font-family-monospace" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#111111" }}>
                  {currentField.offset}
                </span>
              </div>

              <div className="p-2 my-3 rounded font-family-monospace" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#2563EB", fontSize: "13px" }}>
                HEX: {currentField.value}
              </div>

              <p style={{ color: "#333333", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                {currentField.description}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
