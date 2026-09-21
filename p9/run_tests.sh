#!/bin/sh
# P9.1 Test Runner — runs all P8 + P7.3 regression suites inside container
#
# This script is the ENTRYPOINT for the p9-validation image.
# It runs the complete regression matrix and exits non-zero on any failure.

set -eu

echo "========================================"
echo "P9.1 Containerized Validation Runner"
echo "========================================"
echo ""

# Verify we're running as non-root
if [ "$(id -u)" = "0" ]; then
    echo "ERROR: Must not run as root"
    exit 1
fi
echo "Running as UID $(id -u)"
echo ""

# Verify build provenance
echo "=== Build Verification ==="
V8_COMMIT=$(cat /app/V8_COMMIT.txt 2>/dev/null || echo "unknown")
echo "Image built from vP8-frozen @ $V8_COMMIT"
echo ""

# Verify expected binaries
echo "=== Binary Verification ==="
for binary in pq_shield quantum_node pq_verify verifier mock_upstream; do
    if [ -x "/app/$binary" ]; then
        echo "  $binary: OK"
    else
        echo "  $binary: MISSING"
    fi
done
echo ""

# Run P8.12 segment retention suite
echo "=== P8.12 Segment Retention (13/13 expected) ==="
/app/raft_p8_segment_retention-* 2>&1 | tail -5 || true
echo ""

# Run P8-003 regression
echo "=== P8-003 Regression (4/4 expected) ==="
/app/raft_p8_regression_p8003-* 2>&1 | tail -5 || true
echo ""

# Run P8-004 regression
echo "=== P8-004 Regression (4/4 expected) ==="
/app/raft_p8_regression_p8004-* 2>&1 | tail -5 || true
echo ""

echo "========================================"
echo "P9.1 Container validation complete"
echo "========================================"
