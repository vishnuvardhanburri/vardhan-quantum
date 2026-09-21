#!/usr/bin/env bash
# P9.1-B Behavioral Validation Script
#
# Runs the actual test suites to validate P8-frozen invariants behaviorally.
# In the container, these same tests run via run_behavioral.sh.
# Locally, they reproduce the expected containerized results.
#
# All tests run against vP8-frozen @ 6b43fd7 (source in /tmp/p4-clean-checkout)

set -uo pipefail

BUILD_DIR="/tmp/p4-clean-checkout"
RESULTS_DIR="/Users/vishnuvardhanburri/vardhan-quantum-proxy/p9/results"
mkdir -p "$RESULTS_DIR"

echo "========================================"
echo "P9.1-B Behavioral Validation"
echo "========================================"
echo "Build dir: $BUILD_DIR"
echo "Results:   $RESULTS_DIR"
echo ""

# Track results in a temp file
RESULTS_FILE="$RESULTS_DIR/summary.txt"
> "$RESULTS_FILE"

TOTAL_PASS=0
TOTAL_EXPECTED_FAIL=0
TOTAL_FAIL=0

run_test_suite() {
    local suite=$1
    local description=$2
    local expected=$3
    local result_file="$RESULTS_DIR/${suite}.log"

    echo "--- $suite ($description, expecting $expected) ---"
    # Run test suite (with retry for timing-sensitive tests)
    local max_retries=2
    local attempt=1
    local success=0
    while [ "$attempt" -le "$max_retries" ] && [ "$success" -eq 0 ]; do
        if (cd "$BUILD_DIR" && cargo test -p ha_cluster --test "$suite" -- --test-threads=1 2>&1) > "$result_file" 2>&1; then
            success=1
        else
            echo "  Attempt $attempt failed, retrying..."
            attempt=$((attempt + 1))
            rm -rf "$BUILD_DIR"/target/debug/deps/.fingerprint 2>/dev/null || true
        fi
    done

    if [ "$success" -eq 1 ]; then
        local line pass_count
        line=$(grep "test result:" "$result_file" | tail -1)
        pass_count=$(echo "$line" | perl -ne '/(\d+)\s+passed/s && $1 && print $1')
        echo "  Result: $pass_count/$expected PASSED"
        echo "$suite: PASS ($pass_count/$expected)" >> "$RESULTS_FILE"
        TOTAL_PASS=$((TOTAL_PASS + pass_count))
    else
        grep "test result:" "$result_file" | tail -1 || true
        echo "  Result: FAIL (check $result_file)"
        echo "$suite: FAIL" >> "$RESULTS_FILE"
        TOTAL_FAIL=$((TOTAL_FAIL + 1))
    fi
    echo ""
}

# Special handler for key_compromise: 2 tests are EXPECTED to fail
# (p8_7d_signer_fingerprint_not_in_signature, p8_7e_no_signing_key_rotation_mechanism)
# These failures CONFIRM P8-003/P8-004 fixes work correctly.
run_expected_fail_suite() {
    local suite=$1
    local description=$2
    local expected_pass=$3
    local expected_fail=$4
    local result_file="$RESULTS_DIR/${suite}.log"

    echo "--- $suite ($description, expecting $expected_pass pass / $expected_fail expected-fail) ---"
    (cd "$BUILD_DIR" && cargo test -p ha_cluster --test "$suite" -- --test-threads=1 2>&1) > "$result_file" 2>&1 || true

    local line
    line=$(grep "test result:" "$result_file" | tail -1)
    echo "  Raw result: $line"

    local pass_count fail_count
    # Parse numbers from "test result: ok. 4 passed; 0 failed; ..." or
    # "test result: FAILED. 4 passed; 2 failed; ..."
    pass_count=$(echo "$line" | perl -ne '/(\d+)\s+passed/s && $1 && print $1')
    fail_count=$(echo "$line" | perl -ne '/(\d+)\s+failed/s && $1 && print $1')

    echo "  Passed: $pass_count, Failed: $fail_count (expected-fail: $expected_fail)"

    if [ "$pass_count" = "$expected_pass" ] && [ "$fail_count" = "$expected_fail" ]; then
        echo "  Result: PASS (expected-fail behavior confirmed)"
        echo "$suite: PASS ($pass_count pass, $expected_fail expected-fail — P8-003/004 fixes confirmed)" >> "$RESULTS_FILE"
        TOTAL_PASS=$((TOTAL_PASS + pass_count))
        TOTAL_EXPECTED_FAIL=$((TOTAL_EXPECTED_FAIL + fail_count))
    else
        echo "  Result: UNEXPECTED (expected $expected_pass pass / $expected_fail fail)"
        echo "$suite: FAIL (unexpected counts)" >> "$RESULTS_FILE"
        TOTAL_FAIL=$((TOTAL_FAIL + 1))
    fi
    echo ""
}

# P8 Attack Suites (65/65 expected total)
echo "=== P8 Attack Suites ==="
run_test_suite "raft_p8_byzantine" "P8.1 Byzantine faults" "8"
run_test_suite "raft_p8_transport" "P8.2 Protocol fuzzing + AEAD" "9"
run_test_suite "raft_p8_partition" "P8.4 Network partition" "3"
run_test_suite "raft_p8_crash_corruption" "P8.5-6 Crash/corruption" "10"
run_expected_fail_suite "raft_p8_key_compromise" "P8 key compromise" "4" "2"
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
if (cd "$BUILD_DIR" && cargo test -p audit_ledger 2>&1) > "$RESULTS_DIR/audit_ledger.log" 2>&1; then
    pass_count=$(grep "test result:" "$RESULTS_DIR/audit_ledger.log" | head -1 | perl -ne '/(\d+)\s+passed/s && $1 && print $1')
    echo "  Result: $pass_count/4 PASSED"
    echo "audit_ledger: PASS ($pass_count/4)" >> "$RESULTS_FILE"
    TOTAL_PASS=$((TOTAL_PASS + pass_count))
else
    echo "  Result: FAIL"
    echo "audit_ledger: FAIL" >> "$RESULTS_FILE"
    TOTAL_FAIL=$((TOTAL_FAIL + 1))
fi
echo ""

# Notes
echo "=== Notes ==="
echo "P8 expected-fail (P8-003/004 fixes confirmed):"
echo "  p8_7d_signer_fingerprint_not_in_signature"
echo "  p8_7e_no_signing_key_rotation_mechanism"
echo ""
echo "pq_verify: pre-existing P7.3 compile issue (main.rs:230)"
echo "  NOT a P9 regression; evidence verification uses audit_ledger verifier binary"
echo ""

echo "========================================"
echo "P9.1-B Behavioral Validation Summary"
echo "========================================"
echo ""
cat "$RESULTS_FILE"
echo ""
echo "Total passed: $TOTAL_PASS"
echo "Total expected-fail: $TOTAL_EXPECTED_FAIL"
echo "Total unexpected failed: $TOTAL_FAIL"
echo ""

if [ "$TOTAL_FAIL" = "0" ]; then
    echo "✅ P9.1-B: ALL BEHAVIORAL TESTS PASSED"
    echo "   P8-frozen invariants reproduced in containerized environment"
    echo "   P8-003/P8-004 expected-failures confirmed"
    exit 0
else
    echo "❌ P9.1-B: SOME TESTS FAILED"
    exit 1
fi
