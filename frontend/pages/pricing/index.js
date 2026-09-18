import React, { useState } from "react";
import { Container, Row, Col, FormGroup, Label, Input, Button } from "reactstrap";
import Head from "next/head";
import Link from "next/link";

export default function EnterpriseDeploymentPage() {
  const [tunnels, setTunnels] = useState(50000);
  const [hsmUnits, setHsmUnits] = useState(4);
  const [regions, setRegions] = useState(5);

  const throughputGbps = Math.min(400, Math.round((tunnels / 1000) * 0.4 * hsmUnits));
  const decapsLatencyMs = (0.42 - (hsmUnits * 0.01)).toFixed(2);

  const models = [
    {
      tier: "Sovereign Private Ingress",
      headline: "Dedicated Air-Gapped Appliance",
      investment: "Enterprise Sovereign Tier",
      description: "Air-gapped or VPC-isolated ingress gateway running on customer-dedicated bare-metal hardware with PKCS#11 hardware security module (HSM) key isolation.",
      controls: [
        "Dedicated single-tenant bare-metal ingress units",
        "Customer-controlled KMS / PKCS#11 HSM root keys",
        "Hardware-enforced FIPS 203 & FIPS 204 primitives",
        "Append-only Merkle evidence ledger with local SAN replication",
        "Sub-millisecond wire re-encryption latency (< 0.38ms)",
        "99.999% High Availability Raft cluster"
      ],
      operations: [
        "24/7/365 Dedicated Cryptographic Engineering response",
        "Zero-trust protocol downgrade protection (Disallow RSA/ECC)",
        "Custom compliance proof export (DORA / SOC2 / ISO 27001)"
      ]
    },
    {
      tier: "Global Sovereign Tier",
      headline: "Multi-Region Distributed Quorum (£15M – £25M+ Annual)",
      investment: "£15,000,000 – £25,000,000+ Annual",
      description: "Mission-critical global post-quantum infrastructure tier for central banks, defense departments, sovereign identity authorities, and financial market utilities.",
      controls: [
        "Sovereign multi-region distributed Raft consensus (Cross-continent)",
        "Zero-knowledge key rotation across sovereign jurisdictions",
        "Continuous formal verification of wire framing & state transitions",
        "Post-quantum mutual TLS (ML-KEM-1024 / ML-DSA-87)",
        "Hardware root-of-trust with physical tamper-evident sealing",
        "Deterministic policy enforcement with verified mathematical bounds"
      ],
      operations: [
        "Guaranteed 15-minute RTO / Zero-RPO replication",
        "Embedded Senior Security Architecture & Cryptanalysis team",
        "Bespoke red-team adversarial evaluation & quantum harvest audits",
        "Unlimited custom ingress wire nodes with sovereign jurisdiction locking"
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: "#F5F5F5", color: "#0A0A0A", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Head>
        <title>Enterprise Security Deployment | Vardhan Quantum</title>
        <meta name="description" content="Enterprise deployment models and architecture sizing calculator for Vardhan Quantum." />
      </Head>

      {/* Header */}
      <section style={{ padding: "120px 0 60px", borderBottom: "1px solid rgba(0,0,0,0.08)", background: "radial-gradient(ellipse at top, rgba(37, 99, 235, 0.08) 0%, rgba(0, 0, 0, 0) 70%)" }}>
        <Container>
          <div className="text-center">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700" }}>
              ENTERPRISE COMMERCIAL ARCHITECTURE
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: "900", marginTop: "12px", letterSpacing: "-0.02em", color: "#111111" }}>
              Sovereign Security Deployment Models
            </h1>
            <p style={{ color: "#666666", maxWidth: "700px", margin: "16px auto 0", fontSize: "16px", lineHeight: "1.6" }}>
              High-assurance post-quantum infrastructure engineered for organizations where cryptographic compromise carries national or catastrophic consequences.
            </p>
          </div>
        </Container>
      </section>

      {/* Interactive Deployment Sizing & TCO Calculator */}
      <section style={{ padding: "70px 0", borderBottom: "1px solid #EEEEEE" }}>
        <Container>
          <div className="text-center mb-5">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
              INTERACTIVE ARCHITECTURE SIZING CALCULATOR
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", marginTop: "8px" }}>
              Cluster Capacity & Hardware Estimation
            </h2>
            <p style={{ color: "#666666", maxWidth: "650px", margin: "10px auto 0", fontSize: "15px" }}>
              Simulate aggregate wire throughput and hardware requirements based on your concurrent tunnel load.
            </p>
          </div>

          <Row>
            {/* Slider Controls */}
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="vq-glass-card p-4 p-md-5 h-100" style={{ border: "1px solid #E0E0E0" }}>
                <h5 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px" }}>
                  Deployment Parameters
                </h5>

                <FormGroup className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label style={{ fontSize: "13px", fontWeight: "600", color: "#111111", margin: 0 }}>
                      Concurrent Post-Quantum Tunnels
                    </Label>
                    <span style={{ fontFamily: "monospace", color: "#2563EB", fontWeight: "800", fontSize: "15px" }}>
                      {tunnels.toLocaleString()} sessions
                    </span>
                  </div>
                  <Input
                    type="range"
                    min="5000"
                    max="500000"
                    step="5000"
                    value={tunnels}
                    onChange={(e) => setTunnels(parseInt(e.target.value, 10))}
                    className="w-100"
                    style={{ accentColor: "#2563EB" }}
                  />
                  <small style={{ color: "#666666" }}>
                    Active bidirectional AES-256-GCM wire channels with monotonic sequence counters.
                  </small>
                </FormGroup>

                <FormGroup className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label style={{ fontSize: "13px", fontWeight: "600", color: "#111111", margin: 0 }}>
                      Bare-Metal VQ-1000 PCIe Accelerators
                    </Label>
                    <span style={{ fontFamily: "monospace", color: "#2563EB", fontWeight: "800", fontSize: "15px" }}>
                      {hsmUnits} units
                    </span>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={hsmUnits}
                    onChange={(e) => setHsmUnits(parseInt(e.target.value, 10))}
                    className="w-100"
                    style={{ accentColor: "#2563EB" }}
                  />
                  <small style={{ color: "#666666" }}>
                    Hardware SIMD Number Theoretic Transform engines for line-rate ML-KEM decapsulation.
                  </small>
                </FormGroup>

                <FormGroup className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label style={{ fontSize: "13px", fontWeight: "600", color: "#111111", margin: 0 }}>
                      Distributed Raft Quorum Regions
                    </Label>
                    <span style={{ fontFamily: "monospace", color: "#2563EB", fontWeight: "800", fontSize: "15px" }}>
                      {regions} regions
                    </span>
                  </div>
                  <Input
                    type="range"
                    min="3"
                    max="9"
                    step="2"
                    value={regions}
                    onChange={(e) => setRegions(parseInt(e.target.value, 10))}
                    className="w-100"
                    style={{ accentColor: "#2563EB" }}
                  />
                  <small style={{ color: "#666666" }}>
                    Odd number of global sovereign enclaves ensuring zero split-brain Byzantine tolerance.
                  </small>
                </FormGroup>
              </div>
            </Col>

            {/* Calculated Throughput & Output Manifest */}
            <Col lg={6}>
              <div className="vq-glass-card p-4 p-md-5 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>
                      Calculated Performance Profile
                    </h5>
                    <span className="vq-badge-yellow">ACTIVE PROFILE</span>
                  </div>

                  <Row className="mb-4">
                    <Col sm={6} className="mb-3">
                      <div className="p-3 rounded" style={{ background: "#050505", border: "1px solid #E0E0E0" }}>
                        <div style={{ fontSize: "11px", color: "#666666", fontFamily: "monospace" }}>PEAK WIRE THROUGHPUT</div>
                        <div style={{ fontSize: "26px", fontWeight: "900", color: "#2563EB", fontFamily: "monospace", marginTop: "4px" }}>
                          {throughputGbps} Gbps
                        </div>
                        <small style={{ color: "#666666" }}>Full Duplex Line Rate</small>
                      </div>
                    </Col>

                    <Col sm={6} className="mb-3">
                      <div className="p-3 rounded" style={{ background: "#050505", border: "1px solid #E0E0E0" }}>
                        <div style={{ fontSize: "11px", color: "#666666", fontFamily: "monospace" }}>DECAPSULATION LATENCY</div>
                        <div style={{ fontSize: "26px", fontWeight: "900", color: "#111111", fontFamily: "monospace", marginTop: "4px" }}>
                          &lt; {decapsLatencyMs}ms
                        </div>
                        <small style={{ color: "#666666" }}>AVX-512 Vectorized NTT</small>
                      </div>
                    </Col>
                  </Row>

                  <div className="p-3 rounded mb-4 font-family-monospace" style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", fontSize: "12px" }}>
                    <div className="text-muted mb-1">// Sovereign Deployment Architecture Manifest</div>
                    <div>• Quorum Topology: <strong>{regions} Regions ({Math.floor(regions / 2) + 1} of {regions} majority)</strong></div>
                    <div>• Cryptographic Suite: <strong>FIPS 203 ML-KEM-1024 + FIPS 204 ML-DSA-87</strong></div>
                    <div>• Memory-Locked Heap: <strong>{(tunnels * 0.002).toFixed(1)} GB mlock RAM</strong></div>
                    <div>• Regulatory Compliance: <strong>DORA Sealed · NIS2 High-Assurance</strong></div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <Link href="/contact">
                    <a className="btn btn-primary btn-block py-3 font-weight-bold text-dark text-uppercase" style={{ background: "#2563EB", border: "none", color: "#000000", fontWeight: "800" }}>
                      Request Architectural Proposal
                    </a>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Enterprise Deployment Tiers */}
      <section style={{ padding: "80px 0" }}>
        <Container>
          <Row>
            {models.map((tier, idx) => (
              <Col lg={6} key={idx} className="mb-4">
                <div className="vq-glass-card p-4 p-md-5 h-100 d-flex flex-column justify-content-between" style={{
                  border: idx === 1 ? "1px solid #2563EB" : "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: idx === 1 ? "0 10px 40px rgba(37, 99, 235, 0.12)" : "none"
                }}>
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className={idx === 1 ? "vq-badge-yellow" : "vq-badge-white"}>
                        {tier.tier}
                      </span>
                      <strong style={{ color: idx === 1 ? "#2563EB" : "#FFFFFF", fontFamily: "monospace", fontSize: "13px" }}>
                        {tier.investment}
                      </strong>
                    </div>

                    <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#111111", marginBottom: "14px" }}>
                      {tier.headline}
                    </h3>
                    <p style={{ color: "#666666", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
                      {tier.description}
                    </p>

                    <h6 style={{ fontSize: "12px", color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "700", marginBottom: "12px" }}>
                      Cryptographic & Architectural Controls
                    </h6>
                    <ul className="list-unstyled mb-4" style={{ fontSize: "13px", color: "#333333", lineHeight: "1.9" }}>
                      {tier.controls.map((c, i) => (
                        <li key={i} className="d-flex align-items-start mb-1">
                          <span style={{ color: "#2563EB", marginRight: "8px", fontWeight: "bold" }}>✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>

                    <h6 style={{ fontSize: "12px", color: "#111111", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "700", marginBottom: "12px" }}>
                      Operational Guarantees
                    </h6>
                    <ul className="list-unstyled mb-4" style={{ fontSize: "13px", color: "#666666", lineHeight: "1.8" }}>
                      {tier.operations.map((op, i) => (
                        <li key={i} className="d-flex align-items-start mb-1">
                          <span style={{ color: "#666666", marginRight: "8px" }}>•</span>
                          <span>{op}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/contact">
                    <a className="btn btn-block py-2 font-weight-bold text-uppercase mt-3" style={{
                      background: idx === 1 ? "#2563EB" : "rgba(255,255,255,0.06)",
                      color: idx === 1 ? "#000000" : "#FFFFFF",
                      border: idx === 1 ? "none" : "1px solid rgba(255,255,255,0.2)",
                      fontWeight: "700"
                    }}>
                      Engage Architecture Review
                    </a>
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
}
