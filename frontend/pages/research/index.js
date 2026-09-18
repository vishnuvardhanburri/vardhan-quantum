import React, { useState } from "react";
import { Container, Row, Col, Badge } from "reactstrap";
import Head from "next/head";
import Link from "next/link";

export default function ResearchPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Post-Quantum Cryptography",
    "Enterprise Security",
    "Threat Research",
    "Distributed Systems",
    "Adversarial ML",
    "Kubernetes Security",
    "Cloud Security",
    "Identity",
    "Network Security",
    "Incident Research",
    "Security Engineering",
    "Vardhan Research"
  ];

  const papers = [
    {
      id: "pqc-kem-fips203",
      category: "Post-Quantum Cryptography",
      title: "Module-Lattice Key Encapsulation in High-Throughput Proxy Enclaves",
      abstract: "Empirical latency and entropy distribution profiling of FIPS 203 ML-KEM-1024 execution in synchronous streaming wire environments under adversarial network load.",
      citations: "NIST FIPS 203 · IEEE S&P 2025 · ACM CCS",
      date: "September 2026",
      doi: "vq-res-2026-0901"
    },
    {
      id: "raft-byzantine-partition",
      category: "Distributed Systems",
      title: "Raft State Machine Convergence Under Sovereign Network Partitions",
      abstract: "Formal verification of append-only log replay, commit index synchronization, and term election boundaries across multi-region sovereign nodes with peer AEAD framing.",
      citations: "USENIX OSDI · IEEE TDSC · ACM PODC",
      date: "August 2026",
      doi: "vq-res-2026-0814"
    },
    {
      id: "adversarial-ml-subordination",
      category: "Adversarial ML",
      title: "Deterministic Containment of Autonomous AI Security Decision Engines",
      abstract: "Architectural boundaries subordinating probabilistic neural threat classifiers to deterministic RBAC and formal cryptographic policy matrices to prevent model evasion attacks.",
      citations: "NDSS 2026 · USENIX Security · MITRE ATT&CK",
      date: "July 2026",
      doi: "vq-res-2026-0722"
    },
    {
      id: "merkle-evidence-verification",
      category: "Security Engineering",
      title: "Continuous Merkle Hash Chain Custody with ML-DSA-87 Signatures",
      abstract: "Design and implementation of an append-only, fsynced JSONL audit ledger enabling mathematical tamper-detection without reliance on centralized third-party trust authorities.",
      citations: "ACM SIGSAC · IEEE Security & Privacy · NIST SP 800-92",
      date: "June 2026",
      doi: "vq-res-2026-0618"
    },
    {
      id: "k8s-ingress-ebpf-isolation",
      category: "Kubernetes Security",
      title: "eBPF-Assisted Micro-Perimeter Ingress Isolation in Multi-Tenant Clusters",
      abstract: "Preventing container escape and lateral kernel transit through zero-allocation socket re-direction and monotonic sequence number validation at the host boundary.",
      citations: "USENIX ATC · KubeCon CloudNativeSecurity · CNCF",
      date: "May 2026",
      doi: "vq-res-2026-0511"
    },
    {
      id: "harvest-now-decrypt-later",
      category: "Threat Research",
      title: "Mitigating 'Harvest Now, Decrypt Later' Adversarial State Campaigns",
      abstract: "Analysis of nation-state passive optical fiber tapping and bulk encrypted traffic retention targeting non-PQC TLS handshakes across sovereign financial backbones.",
      citations: "CISA / NSA Alert Series · ENISA Threat Landscape",
      date: "April 2026",
      doi: "vq-res-2026-0402"
    }
  ];

  const filteredPapers = selectedCategory === "All"
    ? papers
    : papers.filter(p => p.category === selectedCategory);

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#111111", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Head>
        <title>Quantum Security Research | Vardhan Quantum</title>
        <meta name="description" content="Peer-reviewed research and formal technical papers from the Vardhan Quantum Cryptographic Engineering Group." />
      </Head>

      <section style={{ padding: "100px 0 60px", borderBottom: "1px solid #EEEEEE", background: "radial-gradient(ellipse at top, rgba(37, 99, 235, 0.12) 0%, rgba(0, 0, 0, 0) 70%)" }}>
        <Container>
          <div className="text-center">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
              ACADEMIC & THREAT RESEARCH
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: "800", marginTop: "12px", letterSpacing: "-0.02em", color: "#111111" }}>
              Vardhan Quantum Research Group
            </h1>
            <p style={{ color: "#666666", maxWidth: "720px", margin: "16px auto 0", fontSize: "16px", lineHeight: "1.6" }}>
              Publishing foundational cryptographic research, formal verification proofs, and empirical threat intelligence across 12 critical security disciplines.
            </p>

            {/* Category Filter Pills */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-sm px-3 py-2 mr-2 mb-2 font-weight-bold`}
                  style={{
                    borderRadius: "20px",
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                    background: selectedCategory === cat ? "#2563EB" : "rgba(255,255,255,0.04)",
                    border: selectedCategory === cat ? "1px solid #2563EB" : "1px solid rgba(255,255,255,0.14)",
                    color: selectedCategory === cat ? "#000000" : "#FFFFFF",
                    boxShadow: selectedCategory === cat ? "0 0 15px rgba(37, 99, 235, 0.12)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section style={{ padding: "80px 0" }}>
        <Container>
          <Row>
            {filteredPapers.map((paper) => (
              <Col lg={6} key={paper.id} className="mb-4">
                <div style={{
                  background: "#FFFFFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "14px",
                  padding: "30px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.7)"
                }}>
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ fontSize: "11px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", fontWeight: "700" }}>
                        {paper.category}
                      </span>
                      <span style={{ fontSize: "11px", color: "#666666", fontFamily: "monospace" }}>
                        {paper.date}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", lineHeight: "1.4", color: "#111111" }}>
                      {paper.title}
                    </h3>

                    <p style={{ fontSize: "14px", color: "#666666", lineHeight: "1.7", marginBottom: "20px" }}>
                      {paper.abstract}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid #EEEEEE", paddingTop: "16px" }}>
                    <div style={{ fontSize: "11px", color: "#666666", fontFamily: "monospace", marginBottom: "6px" }}>
                      REFERENCED CORPUS: {paper.citations}
                    </div>
                    <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", fontWeight: "700" }}>
                      DOC ID: {paper.doi}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <div style={{
            background: "#FFFFFF",
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            padding: "24px",
            marginTop: "30px",
            textAlign: "center"
          }}>
            <h5 style={{ fontWeight: "700", color: "#111111", marginBottom: "6px" }}>Peer Review & Academic Collaboration</h5>
            <p style={{ fontSize: "14px", color: "#666666", maxWidth: "680px", margin: "0 auto", lineHeight: "1.6" }}>
              The Vardhan Quantum research corpus integrates findings from IEEE, ACM, USENIX, NDSS, and NIST. Research synthesis leverages Google NotebookLM environments without introducing non-deterministic components into the runtime security enforcement path.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
