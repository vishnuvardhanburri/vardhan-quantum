# Stage 1: Build Environment
FROM rust:1.80-slim-bookworm AS builder

WORKDIR /usr/src/vardhan-quantum-proxy

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace files
COPY Cargo.toml Cargo.lock ./
COPY core_crypto ./core_crypto
COPY proxy_engine ./proxy_engine
COPY ledger_sync ./ledger_sync
COPY ledger_persistence ./ledger_persistence
COPY quantum_network ./quantum_network
COPY quantum_node ./quantum_node
COPY quantum_tui ./quantum_tui
COPY pq_shield ./pq_shield
COPY enterprise_tenant ./enterprise_tenant
COPY saas_metering ./saas_metering
COPY load_tester ./load_tester
COPY poc_auditor ./poc_auditor

# Build release binaries
RUN cargo build --release -p pq_shield -p quantum_node

# Stage 2: Minimal Distroless Runtime Environment
FROM gcr.io/distroless/cc-debian12:nonroot

WORKDIR /app

# Copy binaries from builder
COPY --from=builder /usr/src/vardhan-quantum-proxy/target/release/pq_shield /app/pq_shield
COPY --from=builder /usr/src/vardhan-quantum-proxy/target/release/quantum_node /app/quantum_node

# Expose Ingress Interceptor Port and Telemetry/Gossip Ports
EXPOSE 8080 9090 7001

USER nonroot:nonroot

ENTRYPOINT ["/app/pq_shield"]
