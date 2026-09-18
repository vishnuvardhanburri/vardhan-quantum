import React, { useState } from "react";
import { Container, Row, Col, Button, Badge } from "reactstrap";
import Head from "next/head";
import Link from "next/link";

export default function SecurityPage() {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(null);

  const defenseLayers = [
    {
      num: "01",
      name: "Cryptographic Protection",
      description: "Post-quantum key encapsulation (FIPS 203 ML-KEM-1024) and signatures (FIPS 204 ML-DSA-87) establish an uncompromisable cryptographic foundation against 'Harvest Now, Decrypt Later' quantum adversaries.",
      tech: "core_crypto · ML-KEM-1024 · ML-DSA-87",
      mitigation: "Neutralizes Shor's factoring and discrete logarithm attacks."
    },
    {
      num: "02",
      name: "Identity & Credential Hardening",
      description: "Memory-hard Argon2id (m=64MB, t=3, p=4) credential verification with constant-time dummy comparisons preventing username enumeration and timing side-channel attacks.",
      tech: "auth_service · Argon2id · Dummy Sentinel",
      mitigation: "Defeats GPU/ASIC password cracking and timing side-channels."
    },
    {
      num: "03",
      name: "Protocol Enforcement",
      description: "Strict wire framing enforcing `VQ01` magic bytes, monotonic sequence numbers, 96-bit nonces, and Shannon entropy thresholds to detect and reject malformed or obfuscated payloads.",
      tech: "proxy_engine · Wire Framing · Shannon Entropy",
      mitigation: "Drops low-entropy obfuscated payloads and protocol fuzzing attempts."
    },
    {
      num: "04",
      name: "Runtime & Resource Controls",
      description: "Token bucket rate limiting per client IP, bounded concurrency semaphores, connection pools, and memory safeguards isolating ingress resources from denial-of-service pressure.",
      tech: "pq_shield · Token Bucket · DashMap",
      mitigation: "Prevents memory exhaustion and connection flood exhaustion."
    },
    {
      num: "05",
      name: "Telemetry Integrity",
      description: "Continuous real-time SSE observability with unalterable timestamping, monotonic transaction counters, and Raft term tracking to ensure monitoring blinded-state detection.",
      tech: "pq_shield::admin · SSE Event Stream",
      mitigation: "Detects telemetry blackout attacks and dropped monitoring taps."
    },
    {
      num: "06",
      name: "Threat Detection",
      description: "Sliding-window replay detection, protocol anomaly inspection, and entropy distribution profiling executing in the microsecond critical path of incoming proxy connections.",
      tech: "pq_shield · Replay Filter · Anti-Spoofing",
      mitigation: "Instantly discards duplicate nonces and replayed TLS frames."
    },
    {
      num: "07",
      name: "Deterministic Policy Engine",
      description: "Role-Based Access Control (RBAC) and cryptographic routing policies enforced deterministically. AI and heuristics remain strictly subordinate to authorization boundaries.",
      tech: "auth_service::authorization · Least Privilege",
      mitigation: "Subordinates probabilistic models to hard mathematical boundaries."
    },
    {
      num: "08",
      name: "Automated Containment",
      description: "Instant session revocation by safe ID, automated node drain state machine, and isolated candidate eviction ensuring compromised nodes cannot corrupt cluster consensus.",
      tech: "ha_cluster::drain · Session Revocation",
      mitigation: "Severs compromised nodes before Byzantine consensus corruption occurs."
    },
    {
      num: "09",
      name: "Verifiable Evidence",
      description: "Append-only, fsynced JSONL Merkle audit ledger signed with ML-DSA-87. Every administrative action, authentication attempt, and cluster election is provably recorded.",
      tech: "audit_ledger · Merkle Hash Chain · ML-DSA-87",
      mitigation: "Guarantees mathematically provable, non-repudiable audit trails."
    },
    {
      num: "10",
      name: "Disaster Recovery & Sovereign Failover",
      description: "Distributed multi-region Raft state replication, deterministic log replaying, and air-gapped root recovery ensuring sovereign continuity under severe network partitions.",
      tech: "ha_cluster · Distributed Raft · Air-gapped Recovery",
      mitigation: "Survives transoceanic cable cuts and complete region outages."
    }
  ];

  const runSimulation = () => {
    setSimulating(true);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 700);
    setTimeout(() => setSimStep(3), 1400);
    setTimeout(() => setSimStep(4), 2100);
    setTimeout(() => {
      setSimulating(false);
      setSimStep("COMPLETED");
    }, 2800);
  };

  const current = defenseLayers[selectedLayer];

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#111111", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Head>
        <title>Layered Defense Architecture | Vardhan Quantum</title>
        <meta name="description" content="10-layer defense depth architecture and adversarial attack interception model." />
      </Head>

      {/* Header */}
      <section style={{ padding: "110px 0 60px", borderBottom: "1px solid #EEEEEE", background: "radial-gradient(ellipse at top, rgba(37, 99, 235, 0.12) 0%, rgba(0, 0, 0, 0) 70%)" }}>
        <Container>
          <div className="text-center">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700" }}>
              10-LAYER SOVEREIGN DEFENSE DEPTH
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: "900", marginTop: "12px", letterSpacing: "-0.02em", color: "#111111" }}>
              Defense-in-Depth Architecture Model
            </h1>
            <p style={{ color: "#666666", maxWidth: "720px", margin: "16px auto 0", fontSize: "16px", lineHeight: "1.6" }}>
              Ten synchronized security layers engineered to contain threats before they reach critical compute boundaries or upstream services.
            </p>
          </div>
        </Container>
      </section>

      {/* Interactive Layer Inspector & Simulation */}
      <section style={{ padding: "70px 0", borderBottom: "1px solid #EEEEEE" }}>
        <Container>
          {/* Attack Simulator Bar */}
          <div className="vq-glass-card p-4 mb-5" style={{ border: "1px solid #E0E0E0", background: "#050505" }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
              <div>
                <span className="vq-badge-yellow mb-1 d-inline-block">ADVERSARIAL ATTACK SIMULATOR</span>
                <h4 style={{ fontSize: "20px", fontWeight: "800", margin: "4px 0" }}>Test Infiltration Interception</h4>
                <p style={{ color: "#666666", fontSize: "13px", margin: 0 }}>
                  Simulate an incoming quantum harvest probe traversing the 10-layer defense stack.
                </p>
              </div>
              <Button
                onClick={runSimulation}
                disabled={simulating}
                className="mt-3 mt-md-0 font-weight-bold text-dark text-uppercase"
                style={{ background: "#2563EB", border: "none", color: "#000000", fontWeight: "800" }}
              >
                {simulating ? "Evaluating Threat..." : "⚡ Simulate Infiltration"}
              </Button>
            </div>

            {simStep && (
              <div className="mt-4 p-3 rounded" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", fontFamily: "monospace", fontSize: "12px" }}>
                {simStep === 1 && <div style={{ color: "#2563EB" }}>[STAGE 1] Inbound TCP probe detected. Magic byte assert OK. Evaluating Shannon entropy...</div>}
                {simStep === 2 && <div style={{ color: "#2563EB" }}>[STAGE 2] Shannon entropy probe = 7.9994 b/B. Checking sliding-window anti-replay filter...</div>}
                {simStep === 3 && <div style={{ color: "#2563EB" }}>[STAGE 3] Classical RSA-4096 downgrade attempt detected. Ingress severed with TCP RST.</div>}
                {simStep === 4 && <div style={{ color: "#2563EB" }}>[STAGE 4] Event `CLASSICAL_DOWNGRADE_BLOCKED` written to Merkle ledger with ML-DSA-87 signature.</div>}
                {simStep === "COMPLETED" && (
                  <div style={{ color: "#111111" }}>
                    ✓ <strong>INFILTRATION INTERCEPTED:</strong> Threat neutralized at Layer 01 & 03. Zero plaintext disclosed.
                  </div>
                )}
              </div>
            )}
          </div>

          <Row>
            {/* Layers List */}
            <Col lg={5} className="mb-4 mb-lg-0">
              <div className="d-flex flex-column gap-2">
                {defenseLayers.map((layer, idx) => {
                  const isSelected = idx === selectedLayer;
                  return (
                    <div
                      key={layer.num}
                      onClick={() => setSelectedLayer(idx)}
                      style={{
                        background: isSelected ? "rgba(37, 99, 235, 0.12)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "1px solid #2563EB" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderLeft: isSelected ? "4px solid #2563EB" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      className="mb-2"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <span style={{ fontFamily: "monospace", color: isSelected ? "#2563EB" : "#A1A1AA", fontWeight: "800", marginRight: "10px" }}>
                            {layer.num}
                          </span>
                          <span style={{ fontWeight: "700", color: isSelected ? "#2563EB" : "#FFFFFF", fontSize: "14px" }}>
                            {layer.name}
                          </span>
                        </div>
                        {isSelected && <span style={{ color: "#2563EB" }}>→</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Col>

            {/* Layer Detail Inspector */}
            <Col lg={7}>
              <div className="vq-glass-card p-4 p-md-5 h-100 d-flex flex-column justify-content-between" style={{ border: "1px solid #E0E0E0" }}>
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="vq-badge-yellow mb-2 d-inline-block">LAYER {current.num} ENFORCEMENT</span>
                      <h3 style={{ fontSize: "26px", fontWeight: "900", color: "#111111", margin: "4px 0" }}>
                        {current.name}
                      </h3>
                      <code style={{ fontSize: "12px", color: "#2563EB" }}>{current.tech}</code>
                    </div>
                  </div>

                  <p style={{ color: "#333333", fontSize: "15px", lineHeight: "1.7", margin: "20px 0" }}>
                    {current.description}
                  </p>

                  <div className="p-3 rounded mb-4" style={{ background: "#050505", border: "1px solid #E0E0E0" }}>
                    <div style={{ fontSize: "11px", color: "#666666", fontFamily: "monospace", marginBottom: "4px" }}>
                      THREAT MITIGATION EFFECT
                    </div>
                    <div style={{ fontSize: "13px", color: "#2563EB", fontWeight: "700" }}>
                      {current.mitigation}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "12px", color: "#666666" }}>
                    Status: <strong>Deterministic Enforced</strong>
                  </span>
                  <Link href="/platform">
                    <a className="btn btn-outline-light btn-sm font-weight-bold" style={{ borderColor: "#2563EB", color: "#2563EB" }}>
                      Inspect Subsystem Architecture →
                    </a>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}
