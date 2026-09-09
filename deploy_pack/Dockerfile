# Stage 1: Build Environment
FROM rust:slim-bookworm AS builder

WORKDIR /usr/src/vardhan-quantum-proxy

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    build-essential \
    clang \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# P3.6: Create non-root user for build step (prevents root-owned cache poisoning)
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 10001 --gid 10001 appuser

# Copy workspace files
COPY --chown=appuser:appgroup Cargo.toml Cargo.lock ./
COPY --chown=appuser:appgroup core_crypto ./core_crypto
COPY --chown=appuser:appgroup proxy_engine ./proxy_engine
COPY --chown=appuser:appgroup ledger_sync ./ledger_sync
COPY --chown=appuser:appgroup ledger_persistence ./ledger_persistence
COPY --chown=appuser:appgroup quantum_network ./quantum_network
COPY --chown=appuser:appgroup quantum_node ./quantum_node
COPY --chown=appuser:appgroup quantum_tui ./quantum_tui
COPY --chown=appuser:appgroup pq_shield ./pq_shield
COPY --chown=appuser:appgroup enterprise_tenant ./enterprise_tenant
COPY --chown=appuser:appgroup saas_metering ./saas_metering
COPY --chown=appuser:appgroup load_tester ./load_tester
COPY --chown=appuser:appgroup poc_auditor ./poc_auditor
COPY --chown=appuser:appgroup orchestration_ai ./orchestration_ai
COPY --chown=appuser:appgroup audit_ledger ./audit_ledger
COPY --chown=appuser:appgroup ha_cluster ./ha_cluster
COPY --chown=appuser:appgroup pq_verify ./pq_verify
COPY --chown=appuser:appgroup verifier ./verifier
COPY --chown=appuser:appgroup mock_upstream ./mock_upstream

# P3.6: Build as non-root user
USER appuser:appgroup

# Build release binaries
# P3.6: Include pq_verify for offline audit bundle verification
RUN cargo build --release -p pq_shield -p quantum_node -p pq_verify

# Stage 2: Minimal Distroless Runtime Environment
FROM gcr.io/distroless/cc-debian12:nonroot

WORKDIR /app

# Copy binaries from non-root builder
COPY --from=builder --chown=nonroot:nonroot /usr/src/vardhan-quantum-proxy/target/release/pq_shield /app/pq_shield
COPY --from=builder --chown=nonroot:nonroot /usr/src/vardhan-quantum-proxy/target/release/quantum_node /app/quantum_node
COPY --from=builder --chown=nonroot:nonroot /usr/src/vardhan-quantum-proxy/target/release/pq_verify /app/pq_verify

# Expose Ingress Interceptor Port and Telemetry/Gossip Ports
EXPOSE 8080 9090 7001

USER nonroot:nonroot

ENTRYPOINT ["/app/pq_shield"]
