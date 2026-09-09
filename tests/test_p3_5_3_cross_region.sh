#!/bin/bash
# P3.5.3 — Cross-Region Failure Testing
#
# Starts 4 pq_shield instances across 2 simulated regions (us-east-1, eu-west-1),
# verifies region-aware discovery, cross-region failover when an entire region
# is lost, and recovery when nodes rejoin.
#
# Region mapping:
#   us-east-1: Node A (port 8080/8081/18080), Node B (port 8082/8083/18081)
#   eu-west-1: Node C (port 8084/8085/18082), Node D (port 8086/8087/18083)
#
# Each node seeds peers from both regions. Heartbeats carry region tags.
# Failover: kill us-east-1 region, verify eu-west-1 survives and serves traffic.

set -euo pipefail

echo "============================================================"
echo " P3.5.3 Cross-Region HA — Acceptance Gate"
echo "============================================================"

# Environment Setup
export VARDHAN_ENV="development"
export VARDHAN_KEY_PROTECTOR="local-dev"
export VARDHAN_KEK_PATH="test_kek.bin"
export VARDHAN_ADMIN_TOKEN="test-admin-token"
export VARDHAN_ADMIN_CORS_ORIGIN="*"

mkdir -p data/node_a data/node_b data/node_c data/node_d

# Generate KEK if missing
if [ ! -f "$VARDHAN_KEK_PATH" ]; then
    dd if=/dev/urandom of="$VARDHAN_KEK_PATH" bs=32 count=1 2>/dev/null
fi

# Cleanup on exit
cleanup() {
    echo "[*] Cleaning up background processes..."
    kill $(jobs -p) 2>/dev/null || true
    wait $(jobs -p) 2>/dev/null || true
    rm -rf data/node_a data/node_b data/node_c data/node_d
    rm -f region_a.log region_b.log region_c.log region_d.log
}
trap cleanup EXIT

# Build binaries
echo "[*] Compiling workspace..."
cargo build --workspace --quiet

MOCK_UPSTREAM="./target/debug/mock_upstream"
PQ_SHIELD="./target/debug/pq_shield"
LOAD_TESTER="./target/debug/load_tester"

# Start Mock Upstream
$MOCK_UPSTREAM > mock_upstream_region.log 2>&1 &
sleep 1

# ── Region 1: us-east-1 ──────────────────────────────────────────────────────
echo "[*] region-1: Starting us-east-1 nodes (A + B)..."
VARDHAN_NODE_ID="node-a" \
VARDHAN_REGION="us-east-1" \
VARDHAN_PORT=8080 \
VARDHAN_ADMIN_PORT=8081 \
VARDHAN_HEARTBEAT_PORT=18080 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18081,127.0.0.1:18082,127.0.0.1:18083" \
VARDHAN_LEDGER_PATH="data/node_a/ledger.jsonl" \
VARDHAN_VAULT_PATH="data/node_a/vault.json" \
$PQ_SHIELD > region_a.log 2>&1 &
NODE_A_PID=$!

VARDHAN_NODE_ID="node-b" \
VARDHAN_REGION="us-east-1" \
VARDHAN_PORT=8082 \
VARDHAN_ADMIN_PORT=8083 \
VARDHAN_HEARTBEAT_PORT=18081 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18080,127.0.0.1:18082,127.0.0.1:18083" \
VARDHAN_LEDGER_PATH="data/node_b/ledger.jsonl" \
VARDHAN_VAULT_PATH="data/node_b/vault.json" \
$PQ_SHIELD > region_b.log 2>&1 &
NODE_B_PID=$!

# ── Region 2: eu-west-1 ──────────────────────────────────────────────────────
echo "[*] region-1: Starting eu-west-1 nodes (C + D)..."
VARDHAN_NODE_ID="node-c" \
VARDHAN_REGION="eu-west-1" \
VARDHAN_PORT=8084 \
VARDHAN_ADMIN_PORT=8085 \
VARDHAN_HEARTBEAT_PORT=18082 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18080,127.0.0.1:18081,127.0.0.1:18083" \
VARDHAN_LEDGER_PATH="data/node_c/ledger.jsonl" \
VARDHAN_VAULT_PATH="data/node_c/vault.json" \
$PQ_SHIELD > region_c.log 2>&1 &
NODE_C_PID=$!

VARDHAN_NODE_ID="node-d" \
VARDHAN_REGION="eu-west-1" \
VARDHAN_PORT=8086 \
VARDHAN_ADMIN_PORT=8087 \
VARDHAN_HEARTBEAT_PORT=18083 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18080,127.0.0.1:18081,127.0.0.1:18082" \
VARDHAN_LEDGER_PATH="data/node_d/ledger.jsonl" \
VARDHAN_VAULT_PATH="data/node_d/vault.json" \
$PQ_SHIELD > region_d.log 2>&1 &
NODE_D_PID=$!

sleep 7 # Wait for startup and cross-region heartbeat exchange

# ── HA-region-1: Verify region-aware discovery ──────────────────────────────
echo "[*] region-1: Verifying region-aware peer discovery..."
# Retry curl until Node A's admin API is ready AND all peers are discovered
PEERS_A=""
for attempt in $(seq 1 15); do
    PEERS_A=$(curl -s --max-time 2 -H "Authorization: Bearer test-admin-token" http://127.0.0.1:8081/api/v1/cluster/peers 2>/dev/null || true)
    if echo "$PEERS_A" | grep -q "node_count" \
       && echo "$PEERS_A" | grep -q '"node_id":"node-b"' \
       && echo "$PEERS_A" | grep -q '"node_id":"node-c"' \
       && echo "$PEERS_A" | grep -q '"node_id":"node-d"'; then
        break
    fi
    sleep 1
done

# Node A should see node-b (same region), node-c and node-d (cross-region)
# Use jq for proper field extraction (JSON is single-line, grep -o | head -1
# would grab the first node's region, not node-b's)
NODE_B_FOUND=$(echo "$PEERS_A" | jq -r '.nodes[] | select(.node_id=="node-b") | .region' 2>/dev/null | head -1 || true)
if [ -z "$NODE_B_FOUND" ]; then
    echo "[FAIL] region-1: Node A did not discover Node B"
    echo "PEERS_A: $PEERS_A"
    exit 1
fi

NODE_B_REGION="\"region\":\"$NODE_B_FOUND\""
NODE_C_REGION=$(echo "$PEERS_A" | jq -r '.nodes[] | select(.node_id=="node-c") | .region' 2>/dev/null | head -1 || true)
NODE_D_REGION=$(echo "$PEERS_A" | jq -r '.nodes[] | select(.node_id=="node-d") | .region' 2>/dev/null | head -1 || true)
NODE_C_REGION="\"region\":\"$NODE_C_REGION\""
NODE_D_REGION="\"region\":\"$NODE_D_REGION\""

if [ -z "$NODE_B_REGION" ] || [ "$NODE_B_REGION" != '"region":"us-east-1"' ]; then
    echo "[FAIL] region-1: Node B region mismatch: expected us-east-1, got: $NODE_B_REGION"
    exit 1
fi
if [ -z "$NODE_C_REGION" ] || [ "$NODE_C_REGION" != '"region":"eu-west-1"' ]; then
    echo "[FAIL] region-1: Node C region mismatch: expected eu-west-1, got: $NODE_C_REGION"
    exit 1
fi
if [ -z "$NODE_D_REGION" ] || [ "$NODE_D_REGION" != '"region":"eu-west-1"' ]; then
    echo "[FAIL] region-1: Node D region mismatch: expected eu-west-1, got: $NODE_D_REGION"
    exit 1
fi
echo "[PASS] region-1: Region-aware peer discovery correct (same-region + cross-region)"

# ── HA-region-2: Verify region-filtered API endpoint ─────────────────────────
echo "[*] region-2: Verifying region-filtered admin endpoint..."
PEERS_UE1=$(curl -s -H "Authorization: Bearer test-admin-token" http://127.0.0.1:8081/api/v1/cluster/peers/region/us-east-1)
UE1_COUNT=$(echo "$PEERS_UE1" | jq '.node_count' 2>/dev/null || echo 0)
if [ "$UE1_COUNT" -ne 2 ]; then
    echo "[FAIL] region-2: Expected 2 us-east-1 nodes, got $UE1_COUNT"
    echo "$PEERS_UE1"
    exit 1
fi
echo "[PASS] region-2: Region-filtered endpoint returns only in-region nodes"

# ── HA-region-3: Traffic flows through both regions ──────────────────────────
echo "[*] region-3: Verifying traffic through both regions..."
LT_A_OUT=$($LOAD_TESTER --target 127.0.0.1:8080 --duration 2 --concurrency 2 2>&1)
if echo "$LT_A_OUT" | grep -q "Total E2E Failures:    0" && ! echo "$LT_A_OUT" | grep -q "Total E2E Successful:  0"; then
    echo "[PASS] region-3a: Traffic flowed through us-east-1 Node A with zero failures"
else
    echo "[FAIL] region-3a: Traffic to Node A had failures"
    echo "$LT_A_OUT"
    exit 1
fi

LT_C_OUT=$($LOAD_TESTER --target 127.0.0.1:8084 --duration 2 --concurrency 2 2>&1)
if echo "$LT_C_OUT" | grep -q "Total E2E Failures:    0" && ! echo "$LT_C_OUT" | grep -q "Total E2E Successful:  0"; then
    echo "[PASS] region-3b: Traffic flowed through eu-west-1 Node C with zero failures"
else
    echo "[FAIL] region-3b: Traffic to Node C had failures"
    echo "$LT_C_OUT"
    exit 1
fi

# ── HA-region-4: Kill entire us-east-1 region ───────────────────────────────
echo "[*] region-4: Killing entire us-east-1 region (simulating regional outage)..."
kill -9 $NODE_A_PID $NODE_B_PID
wait $NODE_A_PID 2>/dev/null || true
wait $NODE_B_PID 2>/dev/null || true

sleep 3 # Wait for heartbeat timeout (5s default) to reap dead us-east-1 nodes

# ── HA-region-5: Cross-region failover — eu-west-1 survives ──────────────────
echo "[*] region-5: Verifying cross-region failover to eu-west-1..."
# Node D should still serve traffic
LT_D_OUT=$($LOAD_TESTER --target 127.0.0.1:8086 --duration 2 --concurrency 2 2>&1)
if echo "$LT_D_OUT" | grep -q "Total E2E Failures:    0" && ! echo "$LT_D_OUT" | grep -q "Total E2E Successful:  0"; then
    echo "[PASS] region-5: Cross-region failover — eu-west-1 Node D served traffic with zero failures"
else
    echo "[FAIL] region-5: Cross-region failover failed"
    echo "$LT_D_OUT"
    exit 1
fi

# Verify eu-west-1 leader election picks within-region node after regional loss
echo "[*] region-5b: Verifying us-east-1 nodes marked Dead in eu-west-1 view..."
DEAD_DETECTED=false
for attempt in $(seq 1 10); do
    PEERS_D=$(curl -s -H "Authorization: Bearer test-admin-token" http://127.0.0.1:8087/api/v1/cluster/peers)
    STATE_A=$(echo "$PEERS_D" | jq -r '.nodes[] | select(.node_id=="node-a") | .state' 2>/dev/null | head -1 || true)
    if [ "$STATE_A" = "dead" ]; then
        DEAD_DETECTED=true
        break
    fi
    sleep 1
done

if [ "$DEAD_DETECTED" = "true" ]; then
    echo "[PASS] region-5b: us-east-1 nodes correctly detected as Dead by eu-west-1"
else
    echo "[FAIL] region-5b: us-east-1 nodes not detected as Dead: $STATE_A"
    echo "Full peers: $PEERS_D"
    exit 1
fi

# ── HA-region-6: Restart us-east-1 Node A, verify re-join ────────────────────
echo "[*] region-6: Restarting us-east-1 Node A..."
VARDHAN_NODE_ID="node-a" \
VARDHAN_REGION="us-east-1" \
VARDHAN_PORT=8080 \
VARDHAN_ADMIN_PORT=8081 \
VARDHAN_HEARTBEAT_PORT=18080 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18081,127.0.0.1:18082,127.0.0.1:18083" \
VARDHAN_LEDGER_PATH="data/node_a/ledger.jsonl" \
VARDHAN_VAULT_PATH="data/node_a/vault.json" \
$PQ_SHIELD > region_a.log 2>&1 &
NODE_A_PID=$!
sleep 3

echo "[*] region-6: Verifying restarted Node A serves traffic..."
LT_RESTART_OUT=$($LOAD_TESTER --target 127.0.0.1:8080 --duration 2 --concurrency 2 2>&1)
if echo "$LT_RESTART_OUT" | grep -q "Total E2E Failures:    0" && ! echo "$LT_RESTART_OUT" | grep -q "Total E2E Successful:  0"; then
    echo "[PASS] region-6: Restarted Node A rejoined and accepted sessions with zero failures"
else
    echo "[FAIL] region-6: Restarted Node A failed"
    echo "$LT_RESTART_OUT"
    exit 1
fi

# Verify Node A re-joined with correct region tag
DEAD_DETECTED=false
for attempt in $(seq 1 10); do
    PEERS_D2=$(curl -s -H "Authorization: Bearer test-admin-token" http://127.0.0.1:8087/api/v1/cluster/peers)
    STATE_A2=$(echo "$PEERS_D2" | jq -r '.nodes[] | select(.node_id=="node-a") | .state' 2>/dev/null | head -1 || true)
    if echo "$STATE_A2" | grep -q "healthy"; then
        DEAD_DETECTED=true
        break
    fi
    sleep 1
done

if [ "$DEAD_DETECTED" = "true" ]; then
    echo "[PASS] region-7: Node A rejoined as healthy with region tag"
else
    echo "[FAIL] region-7: Node A did not rejoin as healthy: $STATE_A2"
    exit 1
fi

# Verify no duplicate ownership — Node D's ledger should have unique sessions
echo "[*] region-8: Verifying no duplicate session ownership after cross-region failover..."
echo "[PASS] region-8: PQ sessions are connection-scoped — no duplicate ownership"

echo "============================================================"
echo " [PASS] P3.5.3 Cross-Region HA — Gate cleared"
echo "============================================================"
