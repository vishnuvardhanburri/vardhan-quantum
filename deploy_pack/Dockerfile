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
    adduser --system --uid 10001 --ingroup appgroup appuser

# Copy workspace files
COPY --chown=appuser:appgroup Cargo.toml Cargo.lock ./
COPY --chown=appuser:appgroup backend ./backend


# P3.6: Build as non-root user
RUN chown appuser:appgroup /usr/src/vardhan-quantum-proxy
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

# Expose Ingress Interceptor Port and Telemetry/Gossip Ports + Admin API Port
EXPOSE 8080 9090 7001 8081

USER nonroot:nonroot

ENTRYPOINT ["/app/pq_shield"]
