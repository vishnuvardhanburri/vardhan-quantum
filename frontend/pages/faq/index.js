import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import Head from "next/head";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  const faqs = [
    {
      q: "What is Vardhan Quantum?",
      a: "Vardhan Quantum is a high-assurance post-quantum security ingress platform built in memory-safe Rust. It sits between incoming network traffic and critical enterprise services, enforcing FIPS 203/204 post-quantum cryptography, sliding-window replay defense, multi-node Raft consensus, and append-only Merkle-linked audit logging. [Status: Implemented]"
    },
    {
      q: "How does Vardhan use post-quantum cryptography?",
      a: "Post-quantum primitives are used at two distinct boundaries: (1) Wire transport encapsulation using FIPS 203 ML-KEM-1024 to negotiate forward-secret session keys immune to Shor's algorithm, and (2) Digital signatures using FIPS 204 ML-DSA-87 to cryptographically seal every audit ledger record and cluster governance transaction. [Status: Implemented]"
    },
    {
      q: "Which PQC algorithms are supported?",
      a: "Officially finalized NIST standards: ML-KEM-1024 (FIPS 203) for key encapsulation, ML-DSA-87 (FIPS 204) for digital signatures, alongside AES-256-GCM (NIST SP 800-38D), BLAKE3, and Argon2id. We do not support unstandardized or proprietary algorithms. [Status: Implemented]"
    },
    {
      q: "How are keys protected?",
      a: "Root keys are loaded from disk with memory-locked buffers (`mlock`) and protected by a Key Encryption Key (KEK) using AES-256-GCM. Active session keys exist only in process RAM and are zeroized on drop. [Status: Implemented; Hardware HSM/PKCS#11 integration planned for Phase 5 enterprise tier]"
    },
    {
      q: "Can customers use their own KMS/HSM?",
      a: "In the Enterprise Deployment tier, customers can integrate AWS KMS, Google Cloud KMS, HashiCorp Vault, or on-premises PKCS#11 Hardware Security Modules (HSMs) for root KEK derivation and unwrap operations. [Status: Planned enterprise capability]"
    },
    {
      q: "How does cluster failover work?",
      a: "Nodes communicate via mutual AEAD heartbeats in `ha_cluster`. If the Raft Leader fails to send heartbeats within the randomized election timeout (150–300ms), followers increment their term, transition to Candidate, and initiate an election. The node with the most up-to-date log achieves quorum and becomes Leader. [Status: Implemented]"
    },
    {
      q: "How does Raft protect state?",
      a: "Raft guarantees strong consistency through append-only log replication across a majority quorum of nodes. Uncommitted entries from partitioned leaders are discarded upon new leader convergence, ensuring zero split-brain state mutations. [Status: Implemented for cluster topology; application-state replication planned]"
    },
    {
      q: "How are sessions authenticated?",
      a: "Sessions use 64-character high-entropy cryptographic tokens generated from OS-level CSPRNG (`rand::rngs::OsRng`). Tokens are indexed in-memory using concurrent `DashMap` structures and verified with monotonic idle (30 min) and absolute (24 hour) expiry windows. [Status: Implemented; Distributed session synchronization planned]"
    },
    {
      q: "How is replay prevented?",
      a: "Every wire frame in `proxy_engine` carries a strictly increasing 64-bit sequence counter and a unique 96-bit AEAD nonce. `pq_shield` maintains a sliding-window replay filter in memory that rejects any sequence number already seen or trailing outside the window. [Status: Implemented]"
    },
    {
      q: "How is audit evidence generated?",
      a: "Every administrative event, login, policy decision, or cluster transition invokes `audit_ledger::LedgerWriter`. It constructs a structured record with UTC timestamp, actor, event type, and parent block hash, calculates a SHA-256 Merkle chain hash, signs it with ML-DSA-87, and writes it directly to disk with `fsync`. [Status: Implemented]"
    },
    {
      q: "What happens during node failure?",
      a: "If an ingress node fails or becomes unresponsive, health probes detect the failure immediately. In high-availability configurations, upstream balancers reroute traffic to surviving nodes. In `ha_cluster`, surviving nodes maintain consensus as long as a quorum (floor(N/2)+1) remains reachable. [Status: Implemented]"
    },
    {
      q: "What happens when KMS becomes unavailable?",
      a: "If the root KMS is unreachable during node bootstrap, the node fails closed and refuses to start. If KMS becomes unavailable during runtime, existing in-memory active session keys continue serving traffic until session rotation, while new root key unwrap operations block safely. [Status: Implemented]"
    },
    {
      q: "How does Vardhan handle telemetry loss?",
      a: "Under the Data Truth Rule, telemetry disconnects do not trigger fallback to synthetic estimates. UI dashboards immediately show `AWAITING TELEMETRY` or `DATA NOT AVAILABLE`. The security engine continues enforcing deterministic policies independently of whether observability scrapers are connected. [Status: Implemented]"
    },
    {
      q: "How does Vardhan isolate compromised components?",
      a: "Administrators can invoke the `POST /api/v1/cluster/drain` endpoint to gracefully decommission a suspect node, terminate active ingress sessions, and evict the node from the Raft consensus group without interrupting peer quorum. [Status: Implemented]"
    },
    {
      q: "How are administrative actions controlled?",
      a: "Administrative routes on port 8081 require authenticated session tokens or the bootstrap bearer token. Enforced by Role-Based Access Control (RBAC) with 4 discrete roles (Admin, Auditor, Operator, ReadOnly) mapped to granular permissions. [Status: Implemented]"
    },
    {
      q: "How is customer data isolated?",
      a: "Vardhan Quantum functions as an inline cryptographic proxy. Application payload data is re-encrypted on the fly and never stored to disk. Only cryptographic metadata, packet sequence numbers, and audit events are durably recorded in the ledger. [Status: Implemented]"
    },
    {
      q: "How is evidence verified?",
      a: "The `pq_verify` module parses the ledger sequentially from genesis. It re-computes each block's Merkle hash using the previous block's hash, asserts sequence continuity, and validates the ML-DSA-87 signature against the node's public identity. Any modified byte breaks the cryptographic proof immediately. [Status: Implemented]"
    },
    {
      q: "What deployment models are supported?",
      a: "Three models: (1) Self-hosted sovereign container/bare-metal via `deploy_pack`, (2) VPC-peered private cloud ingress (AWS, GCP, Azure, Sovereign clouds), and (3) Global Multi-Region Sovereign Quorum with hardware HSM root isolation. [Status: Models 1 & 2 Implemented; Model 3 Enterprise Deployment]"
    }
  ];

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#111111", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Head>
        <title>Technical Architecture FAQ | Vardhan Quantum</title>
        <meta name="description" content="18 core technical architecture questions and answers for enterprise security teams evaluating Vardhan Quantum." />
      </Head>

      <section style={{ padding: "100px 0 60px", borderBottom: "1px solid #EEEEEE", background: "radial-gradient(ellipse at top, rgba(37, 99, 235, 0.12) 0%, rgba(0, 0, 0, 0) 70%)" }}>
        <Container>
          <div className="text-center">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
              ENTERPRISE AUDIT & VERIFICATION
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: "800", marginTop: "12px", letterSpacing: "-0.02em", color: "#111111" }}>
              Technical Architecture FAQ
            </h1>
            <p style={{ color: "#666666", maxWidth: "700px", margin: "16px auto 0", fontSize: "16px", lineHeight: "1.6" }}>
              Precise answers to architectural, cryptographic, and operational questions. Every answer transparently distinguishes implemented capability from planned roadmaps.
            </p>
          </div>
        </Container>
      </section>

      <section style={{ padding: "80px 0" }}>
        <Container>
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{
                background: "#FFFFFF",
                border: openIndex === idx ? "1px solid #2563EB" : "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                marginBottom: "16px",
                overflow: "hidden",
                boxShadow: openIndex === idx ? "0 4px 20px rgba(37, 99, 235, 0.12)" : "none",
                transition: "all 0.2s ease"
              }}>
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-100 text-left p-4 d-flex justify-content-between align-items-center bg-transparent border-0"
                  style={{ cursor: "pointer", color: "#111111" }}
                >
                  <span style={{ fontSize: "16px", fontWeight: "700", paddingRight: "16px", color: openIndex === idx ? "#2563EB" : "#FFFFFF" }}>
                    {idx + 1}. {faq.q}
                  </span>
                  <span style={{ fontSize: "22px", color: "#2563EB", fontWeight: "700" }}>
                    {openIndex === idx ? "−" : "+"}
                  </span>
                </button>

                {openIndex === idx && (
                  <div style={{ padding: "0 24px 24px", color: "#666666", fontSize: "14px", lineHeight: "1.8", borderTop: "1px solid #EEEEEE" }}>
                    <div style={{ paddingTop: "16px" }}>
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
