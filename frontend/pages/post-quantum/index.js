import React, { useState } from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import Head from "next/head";
import Link from "next/link";

export default function PostQuantumPage() {
  const [selectedKem, setSelectedKem] = useState("ml-kem-1024");
  const [nttActive, setNttActive] = useState(false);

  const kemProfiles = {
    "ml-kem-512": {
      name: "FIPS 203 ML-KEM-512",
      nistCategory: "Category 1 (Equivalent to AES-128)",
      matrixDimension: "k = 2",
      modulus: "q = 3329",
      noiseEta: "η1 = 3, η2 = 2",
      publicKeyBytes: 800,
      ciphertextBytes: 768,
      sharedSecretBytes: 32,
      decapsLatency: "0.21ms",
      recommended: "Constrained IoT / Low-Power Edge"
    },
    "ml-kem-768": {
      name: "FIPS 203 ML-KEM-768",
      nistCategory: "Category 3 (Equivalent to AES-192)",
      matrixDimension: "k = 3",
      modulus: "q = 3329",
      noiseEta: "η1 = 2, η2 = 2",
      publicKeyBytes: 1184,
      ciphertextBytes: 1088,
      sharedSecretBytes: 32,
      decapsLatency: "0.29ms",
      recommended: "General Enterprise Ingress"
    },
    "ml-kem-1024": {
      name: "FIPS 203 ML-KEM-1024",
      nistCategory: "Category 5 (Highest NIST Security Level, ≥ AES-256)",
      matrixDimension: "k = 4",
      modulus: "q = 3329",
      noiseEta: "η1 = 2, η2 = 2",
      publicKeyBytes: 1568,
      ciphertextBytes: 1568,
      sharedSecretBytes: 32,
      decapsLatency: "0.38ms",
      recommended: "Sovereign Defense, Central Banks & Mission-Critical Quorum"
    }
  };

  const currentKem = kemProfiles[selectedKem];

  const cryptoSuite = [
    {
      standard: "FIPS 203 (NIST Standard)",
      primitive: "ML-KEM-1024",
      family: "Module-Lattice KEM (Kyber-1024)",
      securityLevel: "Category 5 (Equivalent to AES-256)",
      keySize: "Public Key: 1568 B | Ciphertext: 1568 B | Shared Secret: 32 B",
      role: "Key encapsulation and quantum-safe session secret agreement over wire transport."
    },
    {
      standard: "FIPS 204 (NIST Standard)",
      primitive: "ML-DSA-87",
      family: "Module-Lattice Digital Signature (Dilithium-5)",
      securityLevel: "Category 5 (Highest NIST Security Level)",
      keySize: "Public Key: 2592 B | Signature: 4595 B",
      role: "Tamper-evident signing of Merkle audit ledger records and cluster governance events."
    },
    {
      standard: "NIST SP 800-38D",
      primitive: "AES-256-GCM",
      family: "Authenticated Encryption with Associated Data (AEAD)",
      securityLevel: "256-bit symmetric strength",
      keySize: "Key: 32 B | IV/Nonce: 12 B | Tag: 16 B",
      role: "Stream re-encryption of wire frames in the proxy engine with zero-allocation slicing."
    },
    {
      standard: "RFC 5869",
      primitive: "HKDF-SHA256",
      family: "HMAC-based Extract-and-Expand Key Derivation",
      securityLevel: "256-bit entropy preservation",
      keySize: "Input: 32 B ML-KEM shared secret → Derived: AEAD session key",
      role: "Derivation of directional read/write session keys from post-quantum shared secrets."
    },
    {
      standard: "BLAKE3 Specification",
      primitive: "BLAKE3",
      family: "Cryptographic Tree Hash",
      securityLevel: "128-bit security level against all generic attacks",
      keySize: "Output Digest: 32 B (256 bits)",
      role: "Ultra-fast payload checksum verification and Sled API key hashing."
    },
    {
      standard: "RFC 9106 / OWASP",
      primitive: "Argon2id",
      family: "Memory-Hard Password Hashing",
      securityLevel: "Parameters: m=65,536 KiB (64 MB), t=3 iterations, p=4 lanes",
      keySize: "Salt: 32 B cryptographically secure random | Digest: 32 B",
      role: "Zero-knowledge credential protection with constant-time dummy sentinel evaluation."
    }
  ];

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#111111", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Head>
        <title>FIPS 203 & 204 Cryptographic Standards | Vardhan Quantum</title>
        <meta name="description" content="Formal post-quantum cryptographic primitives specification including ML-KEM-1024 and ML-DSA-87." />
      </Head>

      {/* Header */}
      <section style={{ padding: "110px 0 60px", borderBottom: "1px solid #EEEEEE", background: "radial-gradient(ellipse at top, rgba(37, 99, 235, 0.12) 0%, rgba(0, 0, 0, 0) 70%)" }}>
        <Container>
          <div className="text-center">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700" }}>
              NIST STANDARDIZED POST-QUANTUM CRYPTOGRAPHY
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: "900", marginTop: "12px", letterSpacing: "-0.02em", color: "#111111" }}>
              FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)
            </h1>
            <p style={{ color: "#666666", maxWidth: "740px", margin: "16px auto 0", fontSize: "16px", lineHeight: "1.6" }}>
              Mathematical formulation, lattice parameter bounds, and AVX-512 SIMD NTT hardware execution in the Vardhan Quantum defense platform.
            </p>
          </div>
        </Container>
      </section>

      {/* Interactive Module-LWE Parameter Visualizer */}
      <section style={{ padding: "70px 0", borderBottom: "1px solid #EEEEEE" }}>
        <Container>
          <div className="text-center mb-5">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
              INTERACTIVE LATTICE MATRIX EXPLORER
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", marginTop: "8px" }}>
              Module Learning With Errors (M-LWE) Parameters
            </h2>
            <p style={{ color: "#666666", maxWidth: "680px", margin: "10px auto 0", fontSize: "15px" }}>
              Explore how polynomial ring dimension <code>k</code> scales quantum resistance and wire framing packet overhead.
            </p>

            <div className="d-flex justify-content-center gap-2 mt-4">
              {["ml-kem-512", "ml-kem-768", "ml-kem-1024"].map((kId) => (
                <button
                  key={kId}
                  onClick={() => setSelectedKem(kId)}
                  className="btn btn-sm mr-2 font-weight-bold"
                  style={{
                    background: selectedKem === kId ? "#2563EB" : "rgba(255,255,255,0.04)",
                    color: selectedKem === kId ? "#000000" : "#FFFFFF",
                    border: selectedKem === kId ? "none" : "1px solid rgba(255,255,255,0.15)",
                    fontFamily: "monospace",
                    padding: "8px 18px",
                    borderRadius: "8px"
                  }}
                >
                  {kId.toUpperCase()} {kId === "ml-kem-1024" ? "(Enforced)" : ""}
                </button>
              ))}
            </div>
          </div>

          <Row>
            {/* Visual Polynomial Ring Card */}
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="vq-glass-card p-4 p-md-5 h-100" style={{ border: "1px solid #E0E0E0" }}>
                <span className="vq-badge-yellow mb-2 d-inline-block">
                  POLYNOMIAL RING R_q
                </span>
                <h4 style={{ fontSize: "22px", fontWeight: "800", color: "#111111", margin: "6px 0 16px" }}>
                  Ring Arithmetic: R_q = ℤ_q[X] / (X^256 + 1)
                </h4>

                <div className="p-3 mb-4 rounded" style={{ background: "#050505", border: "1px solid #E0E0E0", fontFamily: "monospace", fontSize: "13px" }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: "#666666" }}>Polynomial Modulus:</span>
                    <strong style={{ color: "#2563EB" }}>{currentKem.modulus}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: "#666666" }}>Matrix Rank (Dimension):</span>
                    <strong style={{ color: "#2563EB" }}>{currentKem.matrixDimension}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: "#666666" }}>Centered Binomial Noise:</span>
                    <strong style={{ color: "#111111" }}>{currentKem.noiseEta}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "#666666" }}>SIMD Decapsulation Latency:</span>
                    <strong style={{ color: "#2563EB" }}>{currentKem.decapsLatency}</strong>
                  </div>
                </div>

                <p style={{ color: "#333333", fontSize: "13px", lineHeight: "1.7" }}>
                  Under the Module-LWE assumption, finding the short error vector <code>s</code> from <code>b = A·s + e</code> is equivalent to solving the Shortest Independent Vectors Problem (SIVP) on algebraic lattices, an NP-hard problem immune to Shor's and Grover's quantum algorithms.
                </p>

                <div className="p-2 rounded mt-3" style={{ background: "rgba(37, 99, 235, 0.12)", border: "1px solid #E0E0E0", fontSize: "11px", color: "#2563EB", fontFamily: "monospace" }}>
                  ★ Selected Tier: {currentKem.recommended}
                </div>
              </div>
            </Col>

            {/* Wire Payload Overhead Breakdown */}
            <Col lg={6}>
              <div className="vq-glass-card p-4 p-md-5 h-100">
                <span className="vq-badge-white mb-2 d-inline-block">
                  WIRE PROTOCOL FOOTPRINT
                </span>
                <h4 style={{ fontSize: "22px", fontWeight: "800", color: "#111111", margin: "6px 0 16px" }}>
                  Frame Encapsulation Budget
                </h4>

                <div className="mb-4">
                  <div className="d-flex justify-content-between text-muted small mb-1">
                    <span>Public Key (Client Enclave)</span>
                    <strong style={{ color: "#111111" }}>{currentKem.publicKeyBytes} bytes</strong>
                  </div>
                  <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${(currentKem.publicKeyBytes / 1600) * 100}%`, height: "100%", background: "#2563EB" }} />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between text-muted small mb-1">
                    <span>Ciphertext (Wire Transport)</span>
                    <strong style={{ color: "#111111" }}>{currentKem.ciphertextBytes} bytes</strong>
                  </div>
                  <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${(currentKem.ciphertextBytes / 1600) * 100}%`, height: "100%", background: "#FFFFFF" }} />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between text-muted small mb-1">
                    <span>Derived Shared Secret (AEAD Wire Key)</span>
                    <strong style={{ color: "#2563EB" }}>{currentKem.sharedSecretBytes} bytes (256-bit)</strong>
                  </div>
                  <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: "20%", height: "100%", background: "#2563EB" }} />
                  </div>
                </div>

                <div className="p-3 rounded" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", fontSize: "12px", color: "#666666" }}>
                  <strong>NIST Security Level:</strong> {currentKem.nistCategory}. Provides unbroken forward-secrecy against 4096-qubit fault-tolerant quantum computers running Shor's factoring algorithm.
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Full Cryptographic Primitives Table */}
      <section style={{ padding: "80px 0" }}>
        <Container>
          <div className="text-center mb-5">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
              COMPREHENSIVE DEFENSE PLATFORM SUITE
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", marginTop: "8px" }}>
              Verified Cryptographic Algorithms
            </h2>
            <p style={{ color: "#666666", maxWidth: "650px", margin: "10px auto 0" }}>
              Strict adherence to standardized NIST, RFC, and OWASP specifications. Zero proprietary or unvetted cryptographic algorithms.
            </p>
          </div>

          <div className="vq-glass-card p-4">
            <div className="table-responsive">
              <Table dark hover className="mb-0" style={{ background: "transparent" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #EEEEEE", color: "#2563EB", fontFamily: "monospace", fontSize: "11px" }}>
                    <th>STANDARD</th>
                    <th>PRIMITIVE</th>
                    <th>FAMILY / MATHEMATICS</th>
                    <th>SECURITY PROFILE</th>
                    <th>KEY / ARTIFACT SIZES</th>
                    <th>PLATFORM ROLE</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoSuite.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #EEEEEE", fontSize: "13px" }}>
                      <td style={{ fontFamily: "monospace", color: "#666666", fontSize: "11px" }}>
                        {c.standard}
                      </td>
                      <td style={{ fontWeight: "700", color: "#2563EB", fontFamily: "monospace" }}>
                        {c.primitive}
                      </td>
                      <td style={{ color: "#111111" }}>
                        {c.family}
                      </td>
                      <td>
                        <span className="badge" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563EB", border: "1px solid #E0E0E0" }}>
                          {c.securityLevel}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "11px", color: "#CBD5E1" }}>
                        {c.keySize}
                      </td>
                      <td style={{ color: "#666666", fontSize: "12px" }}>
                        {c.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
