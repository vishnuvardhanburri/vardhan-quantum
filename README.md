# Vardhan Quantum Proxy

![Vardhan Technologies](https://img.shields.io/badge/Vardhan_Technologies-Post--Quantum_AI_Ledger-00F5D4?style=for-the-badge&logo=shield&logoColor=black)
![Rust](https://img.shields.io/badge/Rust-1.80%2B-blue?style=for-the-badge&logo=rust)
![Post-Quantum](https://img.shields.io/badge/FIPS_203%20%7C%20204-Quantum_Safe-8A2BE2?style=for-the-badge)

The **Vardhan Quantum Proxy** is a zero-touch, high-throughput post-quantum ingress interceptor and P2P gossip mesh network. It transparently wraps legacy enterprise traffic (HTTP/gRPC) in FIPS 203 (ML-KEM-1024) and FIPS 204 (ML-DSA-87) post-quantum lattice cryptography to ensure immediate compliance with **DORA (Article 9)** and **NIS2 (Article 21)** mandates.

## Core Architecture

- **`pq_shield`**: Zero-touch ingress interceptor acting as a transparent edge proxy.
- **`proxy_engine`**: High-throughput AES-256-GCM framing and HKDF-SHA-256 session key derivation.
- **`core_crypto`**: The cryptographic beating heart leveraging NIST-standardized ML-KEM and ML-DSA.
- **`quantum_node` / `quantum_network`**: A decentralized, epidemic P2P mesh network for loop-free gossip and consensus.
- **`ledger_sync` & `ledger_persistence`**: Cryptographic Merkle chain with Write-Ahead Logging (WAL) and Argon2-secured Key Vaults.
- **`quantum_tui` (Command & Control Center)**: A live `ratatui`-based telemetry dashboard rendering Shannon Entropy scores and split-screen plaintext vs. ciphertext streams.
- **`enterprise_tenant` & `saas_metering`**: Phase 2 commercial primitives offering isolated SLA tiering and BLAKE3-hashed, tamper-proof invoice receipts for SaaS billing.

## Enterprise Edge Deployment

Designed for sub-15 minute onboarding via the `deploy_pack` module:

- **Distroless Runtime**: Minimal `cc-debian12:nonroot` OCI containers.
- **Kubernetes Helm Charts**: Production-ready scaling templates with `SecurityContext` hardening.
- **Automated CISO Onboarding**: 1-click bootstrap scripts.

```bash
# 1-Click Edge Deployment
./scripts/deploy_edge_node.sh TENANT_ENTERPRISE_01
```

## Dashboard & Telemetry

The **Quantum Midnight** TUI provides enterprise CISOs with real-time visibility into the ingress transformations, tracking latency, cryptographic entropy (~7.998 bits/byte indicating HNDL-impervious noise), and active P2P quorum finality.

```bash
# Launch the Command & Control Center
cargo run --release -p quantum_tui
```

## Performance

Built purely in asynchronous Rust (`tokio`), the engine incurs zero garbage-collection latency spikes. Local benchmark tests report **> 260,000 req/sec** encapsulation throughput with microsecond overhead.

---
*Vardhan Technologies &mdash; Securing the critical infrastructure of tomorrow against the cryptographically relevant quantum computers of today.*
