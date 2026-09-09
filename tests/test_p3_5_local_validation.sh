#!/bin/bash
# P3.5 Local Final Validation — Complete Run
# Captures all metrics for P3.5_VERIFICATION_REPORT.md
set -uo pipefail

cd /Users/vishnuvardhanburri/vardhan-quantum-proxy

export VARDHAN_ENV="development" VARDHAN_KEY_PROTECTOR="local-dev" VARDHAN_KEK_PATH="test_kek.bin"
export VARDHAN_ADMIN_TOKEN="test-admin-token" VARDHAN_ADMIN_CORS_ORIGIN="*"

RESULTS="/tmp/vardhan_p35_results"
mkdir -p "$RESULTS"

# Full cleanup
pkill -9 -f pq_shield 2>/dev/null; pkill -9 -f mock_upstream 2>/dev/null; sleep 2
rm -rf data/node_{a,b,c,d} node_{a,b,c,d}.log mock_upstream.log 2>/dev/null
mkdir -p data/node_a data/node_b data/node_c data/node_d
[ ! -f test_kek.bin ] && dd if=/dev/urandom of=test_kek.bin bs=32 count=1 2>/dev/null

MOCK_UPSTREAM="./target/debug/mock_upstream"
PQ_SHIELD="./target/debug/pq_shield"
LOAD_TESTER="./target/debug/load_tester"
PQ_VERIFY="./target/debug/pq_verify"
TOKEN="test-admin-token"
PROM_FILE="$RESULTS/prometheus_all.txt"
> "$PROM_FILE"

echo "=================================================================="
echo " P3.5 LOCAL FINAL VALIDATION"
echo "================================================================"
echo ""

# ── Step 6: Start 4 nodes ─────────────────────────────────────────────────────
echo "=== STEP 6: Starting 4 nodes (2 regions) ==="

$MOCK_UPSTREAM > /dev/null 2>&1 &
sleep 1

VARDHAN_NODE_ID="node-a" VARDHAN_REGION="us-east-1" \
VARDHAN_PORT=8080 VARDHAN_ADMIN_PORT=8081 VARDHAN_HEARTBEAT_PORT=18080 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18081,127.0.0.1:18082,127.0.0.1:18083" \
VARDHAN_LEDGER_PATH="data/node_a/ledger.jsonl" VARDHAN_VAULT_PATH="data/node_a/vault.json" \
$PQ_SHIELD > node_a.log 2>&1 &
echo "  Node A (us-east-1): started pid=$!"

VARDHAN_NODE_ID="node-b" VARDHAN_REGION="us-east-1" \
VARDHAN_PORT=8082 VARDHAN_ADMIN_PORT=8083 VARDHAN_HEARTBEAT_PORT=18081 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18080,127.0.0.1:18082,127.0.0.1:18083" \
VARDHAN_LEDGER_PATH="data/node_b/ledger.jsonl" VARDHAN_VAULT_PATH="data/node_b/vault.json" \
$PQ_SHIELD > node_b.log 2>&1 &
echo "  Node B (us-east-1): started pid=$!"

VARDHAN_NODE_ID="node-c" VARDHAN_REGION="eu-west-1" \
VARDHAN_PORT=8084 VARDHAN_ADMIN_PORT=8085 VARDHAN_HEARTBEAT_PORT=18082 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18080,127.0.0.1:18081,127.0.0.1:18083" \
VARDHAN_LEDGER_PATH="data/node_c/ledger.jsonl" VARDHAN_VAULT_PATH="data/node_c/vault.json" \
$PQ_SHIELD > node_c.log 2>&1 &
echo "  Node C (eu-west-1): started pid=$!"

VARDHAN_NODE_ID="node-d" VARDHAN_REGION="eu-west-1" \
VARDHAN_PORT=8086 VARDHAN_ADMIN_PORT=8087 VARDHAN_HEARTBEAT_PORT=18083 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18080,127.0.0.1:18081,127.0.0.1:18082" \
VARDHAN_LEDGER_PATH="data/node_d/ledger.jsonl" VARDHAN_VAULT_PATH="data/node_d/vault.json" \
$PQ_SHIELD > node_d.log 2>&1 &
echo "  Node D (eu-west-1): started pid=$!"

echo "[*] Waiting 8s for cluster bootstrap + heartbeat exchange..."
sleep 8

# Verify all nodes healthy
echo "[*] Cluster state:"
for port in 8081 8083 8085 8087; do
    curl -s -H "Authorization: Bearer $TOKEN" "http://127.0.0.1:${port}/api/v1/cluster/peers" 2>/dev/null | \
    python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'  {n[\"node_id\"]:30s} state={n[\"state\"]:10s} region={n[\"region\"]}') for n in sorted(d['nodes'],key=lambda x:x['node_id'])]" 2>/dev/null
done

# ── Step 7: Normal traffic ────────────────────────────────────────────────────
echo ""
echo "=== STEP 7: Normal traffic (both regions, 5s, c=10) ==="
echo "--- Node A (us-east-1) ---"
LT_A=$($LOAD_TESTER --target 127.0.0.1:8080 --duration 5 --concurrency 10 2>&1)
echo "$LT_A" | grep -E "Total E2E|E2E Sustained"
echo "--- Node C (eu-west-1) ---"
LT_C=$($LOAD_TESTER --target 127.0.0.1:8084 --duration 5 --concurrency 10 2>&1)
echo "$LT_C" | grep -E "Total E2E|E2E Sustained"

# ── Step 8: Pre-failover metrics ───────────────────────────────────────────────
echo ""
echo "=== STEP 8: Pre-failover Prometheus metrics ==="
echo "--- Node A ---" | tee -a "$PROM_FILE"
echo "--- Node A ---" | tee -a "$PROM_FILE"
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8081/metrics | tee -a "$PROM_FILE"
echo "--- Node C ---" | tee -a "$PROM_FILE"
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8085/metrics | tee -a "$PROM_FILE"

# ── Step 9: Kill us-east-1 ─────────────────────────────────────────────────────
echo ""
echo "=== STEP 9: Killing entire us-east-1 region ==="
KILL_TS=$(date -u '+%Y-%m-%dT%H:%M:%S.%3NZ')
START_FAILOVER_NS=$(date +%s%N)
echo "  Kill timestamp: $KILL_TS"

# Kill by finding PIDs bound to us-east-1 ports
for port in 8080 8081 18080 8082 8083 18081; do
    pid=$(lsof -ti :$port 2>/dev/null | head -1)
    if [ -n "$pid" ]; then kill -9 $pid 2>/dev/null; fi
done
sleep 1  # Wait for ports to release

echo "  us-east-1 nodes killed."

# ── Step 10: Failover to eu-west-1 ─────────────────────────────────────────────
echo ""
echo "=== STEP 10: Cross-region failover verification ==="
FAILOVER_READY=false
for i in $(seq 1 15); do
    PEERS_D=$(curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8087/api/v1/cluster/peers 2>/dev/null)
    DEAD_UE1=$(echo "$PEERS_D" | python3 -c "
import sys,json; d=json.load(sys.stdin)
# peer_snapshot() filters out Dead nodes, so count healthy us-east-1 nodes
# If 0 healthy us-east-1 = all were reaped as Dead
print(len([n for n in d['nodes'] if 'us-east-1' in n.get('region','') and n['state']=='healthy']))
" 2>/dev/null || echo 0)
    HEALTHY_EUW1=$(echo "$PEERS_D" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(len([n for n in d['nodes'] if 'eu-west-1' in n.get('region','') and n['state']=='healthy']))
" 2>/dev/null || echo 0)
    echo "  t+${i}s: us-east-1 healthy=$DEAD_UE1 (should be 0), eu-west-1 healthy=$HEALTHY_EUW1 (should be 2)"
    if [ "$DEAD_UE1" -eq 0 ] && [ "$HEALTHY_EUW1" -ge 2 ]; then
        END_FAILOVER_NS=$(date +%s%N)
        FAILOVER_MS=$(( (END_FAILOVER_NS - START_FAILOVER_NS) / 1000000 ))
        DETECT_TS=$(date -u '+%Y-%m-%dT%H:%M:%S.%3NZ')
        echo "  → Failover detected at t+${i}s"
        echo "  → Detection timestamp: $DETECT_TS"
        echo "  → Failover time: ${FAILOVER_MS}ms"
        FAILOVER_READY=true
        break
    fi
    sleep 1
done

if [ "$FAILOVER_READY" = "true" ]; then
    echo "[PASS] Cross-region failover confirmed"
else
    echo "[FAIL] Failover timeout"
    exit 1
fi

# Traffic through eu-west-1 during failover
echo ""
echo "[*] Running traffic on eu-west-1 (Node D) during failover..."
LT_D=$($LOAD_TESTER --target 127.0.0.1:8086 --duration 5 --concurrency 10 2>&1)
echo "$LT_D" | grep -E "Total E2E|E2E Sustained"

# Split-brain check
echo ""
echo "[*] Split-brain prevention check (Node D's view):"
PEERS_D=$(curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8087/api/v1/cluster/peers)
echo "$PEERS_D" | python3 -c "
import sys,json; d=json.load(sys.stdin)
for n in sorted(d['nodes'], key=lambda x: x['node_id']):
    print(f'  {n[\"node_id\"]:30s} state={n[\"state\"]:10s} region={n[\"region\"]}')
" 2>/dev/null

# Post-failover metrics
echo ""
echo "[*] Post-failover Prometheus metrics (Node D):" | tee -a "$PROM_FILE"
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8087/metrics | tee -a "$PROM_FILE"

# ── Step 11: Restore us-east-1 ─────────────────────────────────────────────────
echo ""
echo "=== STEP 11: Restore us-east-1 Node A ==="
RECOVERY_TS=$(date -u '+%Y-%m-%dT%H:%M:%S.%3NZ')
START_RECOVERY_NS=$(date +%s%N)
echo "  Restore timestamp: $RECOVERY_TS"

# Ensure vault exists (Node A's vault should still be on disk)
if [ ! -f data/node_a/vault.json ]; then
    echo "  [WARN] Node A vault missing, generating fresh"
fi

VARDHAN_NODE_ID="node-a" VARDHAN_REGION="us-east-1" \
VARDHAN_PORT=8080 VARDHAN_ADMIN_PORT=8081 VARDHAN_HEARTBEAT_PORT=18080 \
VARDHAN_CLUSTER_PEERS="127.0.0.1:18081,127.0.0.1:18082,127.0.0.1:18083" \
VARDHAN_LEDGER_PATH="data/node_a/ledger.jsonl" VARDHAN_VAULT_PATH="data/node_a/vault.json" \
$PQ_SHIELD > node_a.log 2>&1 &
NODE_A_NEWPID=$!
echo "  Node A restarted, pid=$NODE_A_NEWPID"

# Wait for Node A to bind
sleep 2
if ! curl -s --max-time 2 -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8081/api/v1/cluster/peers 2>/dev/null | grep -q "node_count"; then
    echo "  Node A admin API not responding. Log:"
    cat node_a.log | tail -10
fi

# Poll for re-join
REJOINED=false
for i in $(seq 1 15); do
    STATE_A=$(curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8087/api/v1/cluster/peers 2>/dev/null | \
        python3 -c "import sys,json; d=json.load(sys.stdin); [print(n['state']) for n in d['nodes'] if n['node_id']=='node-a']" 2>/dev/null | head -1 || echo "")
    echo "  t+${i}s: node-a state=$STATE_A"
    if echo "$STATE_A" | grep -q "healthy"; then
        END_RECOVERY_NS=$(date +%s%N)
        RECOVERY_MS=$(( (END_RECOVERY_NS - START_RECOVERY_NS) / 1000000 ))
        REJOIN_TS=$(date -u '+%Y-%m-%dT%H:%M:%S.%3NZ')
        echo "  → Rejoined as healthy at t+${i}s"
        echo "  → Recovery timestamp: $REJOIN_TS"
        echo "  → Recovery time: ${RECOVERY_MS}ms"
        REJOINED=true
        break
    fi
    sleep 1
done

if [ "$REJOINED" = "true" ]; then
    echo "[PASS] Node A rejoined as healthy"
else
    echo "[FAIL] Node A did not rejoin"
    echo "  Node A log:"
    cat node_a.log | tail -10
    exit 1
fi

# Traffic through restored Node A
echo ""
echo "[*] Running traffic on restored Node A..."
sleep 2
LT_RESTORE=$($LOAD_TESTER --target 127.0.0.1:8080 --duration 3 --concurrency 5 2>&1)
echo "$LT_RESTORE" | grep -E "Total E2E|E2E Sustained"

# ── Step 12: Ledger integrity ─────────────────────────────────────────────────
echo ""
echo "=== STEP 12: Ledger integrity verification ==="
echo "[*] Exporting Node D ledger..."
EXPORT_D=$(curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8087/api/v1/ledger/export | jq -r '.export_dir')
echo "  Export: $EXPORT_D"

echo "[*] Exporting Node A ledger..."
sleep 2
EXPORT_A=$(curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8081/api/v1/ledger/export 2>/dev/null | jq -r '.export_dir')
echo "  Export: $EXPORT_A"

echo "[*] pq_verify Node D:"
$PQ_VERIFY --evidence-dir "$EXPORT_D" 2>&1 | tee "$RESULTS/pq_verify_node_d.txt" | grep -E "verdict|entry_count|tip_hash"
echo "[*] pq_verify Node A:"
if [ -n "$EXPORT_A" ] && [ "$EXPORT_A" != "null" ]; then
    $PQ_VERIFY --evidence-dir "$EXPORT_A" 2>&1 | tee "$RESULTS/pq_verify_node_a.txt" | grep -E "verdict|entry_count|tip_hash"
fi

# ── Step 13: Telemetry ─────────────────────────────────────────────────────────
echo ""
echo "=== STEP 13: Telemetry verification ==="
echo "[*] JSON metrics (Node D):"
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8087/api/v1/metrics | python3 -c "
import sys,json; m=json.load(sys.stdin)
for k,v in m.items(): print(f'  {k}: {v}')
" 2>/dev/null

echo ""
echo "[*] SSE events (Node D, 3s sample):"
curl -s -H "Authorization: Bearer $TOKEN" --max-time 3 "http://127.0.0.1:8087/api/v1/events" 2>/dev/null | head -3 || echo "  (SSE stream active — no immediate events)"

# ── Step 14: Resource utilization ──────────────────────────────────────────────
echo ""
echo "=== STEP 14: Resource utilization ==="
echo "[*] Process count: $(pgrep -x pq_shield | wc -l)"
echo "[*] Per-process RSS (KB):"
for pid in $(pgrep -x pq_shield); do
    echo "  pid=$pid rss=$(ps -o rss= -p $pid 2>/dev/null)KB cmd=$(cat /proc/$pid/args 2>/dev/null | tr '\0' ' ' | grep -o 'VARDHAN_NODE_ID=[^ ]*')"
done

# Final state
echo ""
echo "=== Final cluster state (Node D's view) ==="
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8087/api/v1/cluster/peers | python3 -c "
import sys,json; d=json.load(sys.stdin)
for n in sorted(d['nodes'], key=lambda x: x['node_id']):
    print(f'  {n[\"node_id\"]:30s} state={n[\"state\"]:10s} region={n[\"region\"]}')
" 2>/dev/null

# Save all results
echo ""
echo "=== Saving results ==="
echo "$LT_A" > "$RESULTS/loadtest_node_a_baseline.txt"
echo "$LT_C" > "$RESULTS/loadtest_node_c_baseline.txt"
echo "$LT_D" > "$RESULTS/loadtest_node_d_failover.txt"
echo "$LT_RESTORE" > "$RESULTS/loadtest_node_a_restore.txt"
cat node_a.log > "$RESULTS/node_a_final.log"
cat node_d.log > "$RESULTS/node_d_final.log"
echo "Kill timestamp: $KILL_TS" > "$RESULTS/failover_timing.txt"
echo "Detection timestamp: $DETECT_TS" >> "$RESULTS/failover_timing.txt"
echo "Failover time (ms): $FAILOVER_MS" >> "$RESULTS/failover_timing.txt"
echo "Restore timestamp: $RECOVERY_TS" >> "$RESULTS/failover_timing.txt"
echo "Rejoin timestamp: $REJOIN_TS" >> "$RESULTS/failover_timing.txt"
echo "Recovery time (ms): $RECOVERY_MS" >> "$RESULTS/failover_timing.txt"

# Cleanup
pkill -9 -f pq_shield 2>/dev/null; pkill -9 -f mock_upstream 2>/dev/null
rm -rf data/node_{a,b,c,d} node_{a,b,c,d}.log 2>/dev/null
wait 2>/dev/null
echo ""
echo "=== ALL VALIDATION COMPLETE ==="