# Vardhan Quantum Proxy

![Vardhan Technologies](https://img.shields.io/badge/Vardhan_Technologies-Post--Quantum_AI_Ledger-00F5D4?style=for-the-badge&logo=shield&logoColor=black)
![Rust](https://img.shields.io/badge/Rust-Edition_2024-blue?style=for-the-badge&logo=rust)
![Post-Quantum](https://img.shields.io/badge/FIPS_203%20%7C%20204-Quantum_Safe-8A2BE2?style=for-the-badge)

The **Vardhan Quantum Proxy** is an enterprise-grade, zero-touch ingress interceptor designed to retroactively secure legacy infrastructure against Cryptographically Relevant Quantum Computers (CRQCs). It transparently wraps existing HTTP/TCP/gRPC traffic in NIST-standardized **FIPS 203 (ML-KEM)** and **FIPS 204 (ML-DSA)** cryptography, providing immediate compliance with **DORA (Article 9)** and **NIS2 (Article 21)** without requiring any modifications to legacy code.

---

## 🛑 The Threat Landscape: Existing Loopholes & Problems

Modern enterprise architectures (especially in financial clearing and critical infrastructure) suffer from three critical cryptographic loopholes:

1. **"Harvest Now, Decrypt Later" (HNDL):** 
   State-sponsored adversaries are actively recording petabytes of encrypted TLS 1.2/1.3 traffic. While classical AES-256 remains safe, the asymmetric key exchanges (RSA, ECDH) used to establish those sessions are mathematically vulnerable to Shor's Algorithm. Once a quantum computer comes online, the entire backlog of harvested data can be decrypted retroactively.
2. **The Crypto-Agility Trap:** 
   Legacy systems have cryptographic primitives hardcoded deeply into their application layers (e.g., embedded Java/C# microservices). Updating these applications to support new post-quantum algorithms takes years of refactoring, testing, and downtime.
3. **Rigid Compliance & Siloed Telemetry:** 
   CISOs struggle to prove cryptographic finality to auditors. Traditional proxies (like Envoy or Nginx) do not natively produce cryptographic entropy proofs or immutable ledgers verifying that data was quantum-shielded at the edge.

## 🚀 The Vardhan Approach: Zero-Touch Ingress Interception

Instead of rewriting the enterprise, we intercept the threat at the network edge:

1. **Zero-Touch Ingress (`pq_shield`):** 
   We deploy an asynchronous Rust proxy right in front of the enterprise WAN. It catches raw TCP streams, calculates real-time Shannon Entropy (targeting ~7.998 bits/byte), and envelopes the stream in AES-256-GCM using session keys derived via Post-Quantum ML-KEM. The legacy app continues speaking plaintext HTTP/gRPC, completely unaware of the quantum armor shielding it.
2. **Decentralized Epidemic Gossip (`quantum_network`):** 
   Unlike centralized proxies, Vardhan nodes form a dynamically discovering, loop-free P2P mesh. This ensures high availability and eliminates single points of cryptographic failure.
3. **Cryptographic Proof Ledgers (`ledger_sync` & `poc_auditor`):** 
   Every gigabyte of traffic shielded is hashed using BLAKE3 and signed via ML-DSA. This creates an immutable, verifiable Merkle chain that generates automated PDF compliance reports (proving DORA/NIS2 adherence) and tamper-proof billing receipts for multi-tenant SaaS environments.

---

## 🏗️ Core Architecture & Crates

* **`core_crypto`**: The beating heart. Wraps `fips203` (ML-KEM-1024) and `fips204` (ML-DSA-87) with `zeroize` memory protection.
* **`proxy_engine`**: High-throughput AES-256-GCM framing and HKDF-SHA-256 key derivation.
* **`pq_shield`**: The raw TCP edge interceptor that wraps legacy traffic (Benchmarked at **1.7 Million req/sec** locally).
* **`quantum_node` / `quantum_network`**: The async CLI daemon and epidemic P2P mesh network for block propagation.
* **`ledger_sync` & `ledger_persistence`**: Cryptographic Merkle chain with Write-Ahead Logging (WAL) and Argon2 key vaults.
* **`enterprise_tenant` & `saas_metering`**: Phase 2 primitives offering isolated SLA tiering and atomic, lock-free invoice hashing.
* **`poc_auditor`**: A pure-Rust engine that generates CISO-ready PDF Audit Reports proving quantum compliance.
* **`quantum_tui`**: A live `ratatui` Command & Control Center rendering Shannon Entropy scores and plaintext/ciphertext split-screens.

---

## ⚡ Deployment & Quickstart

Designed for sub-15 minute onboarding via the `deploy_pack` module:

### 1. Edge Container Deployment
Our Dockerfile utilizes a multi-stage `rust:slim-bookworm` build targeting a zero-attack-surface `distroless` runtime. 
```bash
./scripts/deploy_edge_node.sh TENANT_ENTERPRISE_01
```

### 2. CISO Command & Control Center
To view the real-time telemetry, Shannon Entropy, and live cryptographic interception:
```bash
cargo run --release -p quantum_tui
```

### 3. Generate DORA/NIS2 Audit Reports
To automatically generate a PDF compliance report for enterprise risk committees:
```bash
cargo run --release -p poc_auditor
```

---

*Vardhan Technologies &mdash; Securing the critical infrastructure of tomorrow against the cryptographically relevant quantum computers of today.*
