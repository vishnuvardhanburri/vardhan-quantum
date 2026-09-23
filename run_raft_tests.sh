#!/bin/bash
PASS=0
FAIL=0
for i in {1..10}; do
  cargo test -p ha_cluster --test raft_durability_invariant > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
  fi
done
echo "Durability Invariant Tests: PASS=$PASS, FAIL=$FAIL"
