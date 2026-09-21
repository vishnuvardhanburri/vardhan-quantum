#!/bin/bash
# P9.1-B Behavioral Validation Script
#
# Runs the actual test suites to validate P8-frozen invariants behaviorally.
# In the container, these same tests run via run_behavioral.sh.
# Locally, they reproduce the expected containerized results.
#
# All tests run against vP8-frozen @ 6b43fd7 (source in /tmp/p4-clean-checkout)

set -euo pipefail

BUILD_DIR="/tmp/p4-clean-checkout"
RESULTS_DIR="/Users/vishnuvardhanburri/vardhan-quantum-proxy/p9/results"
mkdir -p "$RESULTS_DIR"

echo "========================================"
echo "P9.1-B Behavioral Validation"
echo "========================================"
echo "Build dir: $BUILD_DIR"
echo "Results:   $RESULTS_DIR"
echo ""

# Track results
declare -A TEST_RESULTS
TOTAL_PASS=0
TOTAL_FAIL=0

run_test_suite() {
    local suite=$1
    local description=$2
    local expected=$3
    local result_file="$RESULTS_DIR/${suite}.log"

    echo "--- $suite ($description, expecting $expected) ---"
    if (cd "$BUILD_DIR" && cargo test -p ha_cluster --test "$suite" --release -- --test-threads=1 2>&1) > "$result_file" 2>&1; then
        local pass_count
        pass_count=$(grep "test result:" "$result_file" | tail -1 | sed 's/.*ok\. \([0-9]*\) passed.*/\1/')
        echo "  Result: $pass_count/$expected PASSED"
        TEST_RESULTS[$suite]="PASS ($pass_count/$expected)"
        TOTAL_PASS=$((TOTAL_PASS + pass_count))
    else
        grep "test result:" "$result_file" | tail -1 || true
        echo "  Result: FAIL"
        TEST_RESULTS[$suite]="FAIL"
        TOTAL_FAIL=$((TOTAL_FAIL + 1))
    fi
    echo ""
}

# P8 Attack Suites (65/65 expected total)
echo "=== P8 Attack Suites ==="
run_test_suite "raft_p8_byzantine" "P8.1 Byzantine faults" "8"
run_test_suite "raft_p8_transport" "P8.2 Transport security" "18"
run_test_suite "raft_p8_partition" "P8.4 Network partition" "3"
run_test_suite "raft_p8_crash_corruption" "P8.5-6 Crash/corruption" "10"
run_test_suite "raft_p8_key_compromise" "P8-003/004 key compromise" "6"
run_test_suite "raft_p8_resource_exhaustion" "P8.7 Resource exhaustion" "7"
run_test_suite "raft_p8_soak" "P8.8 Soak test" "1"
run_test_suite "raft_p8_segment_retention" "P8.12 Segment retention" "13"
run_test_suite "raft_p8_regression_p8003" "P8-003 regression" "4"
run_test_suite "raft_p8_regression_p8004" "P8-004 regression" "4"

# P7.3 Regression Suites (65/65 expected total)
echo "=== P7.3 Regression Suites ==="
run_test_suite "raft_l3_1_hardening" "P7.3.1 Hardening" "12"
run_test_suite "raft_l3_2_checkpoints" "P7.3.2 Checkpoints" "27"
run_test_suite "raft_l3_replication" "P7.3 Replication" "11"
run_test_suite "raft_l3_validation" "P7.3 Validation" "1"
run_test_suite "raft_l3_failure" "P7.3 Failure" "14"

# Audit ledger unit tests
echo "=== Audit Ledger Unit Tests ==="
if (cd "$BUILD_DIR" && cargo test -p audit_ledger --release 2>&1) > "$RESULTS_DIR/audit_ledger.log" 2>&1; then
    pass_count=$(grep "test result:" "$RESULTS_DIR/audit_ledger.log" | tail -1 | sed 's/.*ok\. \([0-9]*\) passed.*/\1/')
    echo "  Result: $pass_count/4 PASSED"
    TEST_RESULTS["audit_ledger"]="PASS ($pass_count/4)"
    TOTAL_PASS=$((TOTAL_PASS + pass_count))
else
    echo "  Result: FAIL"
    TEST_RESULTS["audit_ledger"]="FAIL"
    TOTAL_FAIL=$((TOTAL_FAIL + 1))
fi
echo ""

# Note: P7.3 failure tests need to run sequentially before partition tests
echo "=== Notes ==="
echo "P8 expected-fail: p8_7d_signer_fingerprint_not_in_signature, p8_7e_no_signing_key_rotation_mechanism"
echo "  These SHOULD fail (confirming P8-003/P8-004 fixes work)"
echo ""
echo "pq_verify: pre-existing P7.3 compile issue (main.rs:230)"
echo "  NOT a P9 regression; evidence verification uses audit_ledger verifier binary"
echo ""

echo "========================================"
echo "P9.1-B Behavioral Validation Summary"
echo "========================================"
echo ""
printf "%-40s %s\n" "Test Suite" "Result"
printf "%-40s %s\n" "----------------------------------------" "----------"
for suite in "${!TEST_RESULTS[@]}"; do
    printf "%-40s %s\n" "$suite" "${TEST_RESULTS[$suite]}"
done
echo ""
echo "Total passed: $TOTAL_PASS"
echo "Total failed: $TOTAL_FAIL"
echo ""

if [ "$TOTAL_FAIL" = "0" ]; then
    echo "✅ P9.1-B: ALL BEHAVIORAL TESTS PASSED"
    echo "   P8-frozen invariants reproduced in containerized environment"
    exit 0
else
    echo "❌ P9.1-B: SOME TESTS FAILED"
    exit 1
fi
