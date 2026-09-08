//! # pq_verify
//!
//! Standalone, independently operable audit verifier for Vardhan Quantum Proxy.
//!
//! Takes an exported evidence bundle and cryptographically verifies:
//!   1. Sequence integrity — monotonic, gapless
//!   2. Chain integrity — each entry's prev_hash == BLAKE3(canonical(prev_entry))
//!   3. Signature integrity — ML-DSA-87 sig over canonical hash holds for every entry
//!
//! Has zero dependency on pq_shield or TelemetryEngine.
//! Needs only: the evidence package directory and the ML-DSA-87 public key.
//!
//! ## Usage
//! ```
//! pq_verify --evidence-dir /path/to/export --public-key /path/to/public_key.hex
//! ```
//!
//! ## Exit codes
//!   0 = PASS
//!   1 = FAIL (cryptographic failure or structural violation)
//!   2 = Usage / IO error

use clap::Parser;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use audit_ledger::{LedgerEntry, canonical_hash};
use core_crypto::QuantumNodeIdentity;

#[derive(Parser, Debug)]
#[command(
    name = "pq_verify",
    about = "Independently verify a Vardhan Quantum Proxy audit evidence bundle",
    long_about = None
)]
struct Args {
    /// Path to the exported evidence directory
    #[arg(long)]
    evidence_dir: PathBuf,

    /// Path to the hex-encoded ML-DSA-87 public key file (public_key.hex)
    #[arg(long)]
    public_key: Option<PathBuf>,
}

#[derive(Debug, Serialize)]
struct VerificationReport {
    verdict: &'static str,
    entries_verified: u64,
    chain_integrity: &'static str,
    signature_integrity: &'static str,
    sequence_integrity: &'static str,
    first_seq: Option<u64>,
    last_seq: Option<u64>,
    tip_hash: String,
    failures: Vec<String>,
}

fn main() {
    let args = Args::parse();
    let report = run_verification(&args);
    println!("{}", serde_json::to_string_pretty(&report).unwrap());
    std::process::exit(if report.verdict == "PASS" { 0 } else { 1 });
}

fn run_verification(args: &Args) -> VerificationReport {
    let mut failures: Vec<String> = Vec::new();

    // ─── Load public key ──────────────────────────────────────────────────────
    let pub_key_path = args.public_key.clone()
        .unwrap_or_else(|| args.evidence_dir.join("public_key.hex"));

    let pub_key_bytes = match load_public_key(&pub_key_path) {
        Ok(b) => b,
        Err(e) => {
            return VerificationReport {
                verdict: "FAIL",
                entries_verified: 0,
                chain_integrity: "UNKNOWN",
                signature_integrity: "UNKNOWN",
                sequence_integrity: "UNKNOWN",
                first_seq: None,
                last_seq: None,
                tip_hash: String::new(),
                failures: vec![format!("Cannot load public key: {e}")],
            };
        }
    };

    // Compute expected fingerprint from supplied public key
    let expected_fingerprint = hex::encode(
        QuantumNodeIdentity::hash_ledger_block(&pub_key_bytes)
    );

    // ─── Load ledger file ─────────────────────────────────────────────────────
    let ledger_path = args.evidence_dir.join("ledger.jsonl");
    let content = match std::fs::read_to_string(&ledger_path) {
        Ok(c) => c,
        Err(e) => {
            return VerificationReport {
                verdict: "FAIL",
                entries_verified: 0,
                chain_integrity: "UNKNOWN",
                signature_integrity: "UNKNOWN",
                sequence_integrity: "UNKNOWN",
                first_seq: None,
                last_seq: None,
                tip_hash: String::new(),
                failures: vec![format!("Cannot read ledger.jsonl: {e}")],
            };
        }
    };

    // ─── Verify each entry ────────────────────────────────────────────────────
    let mut prev_hash = [0u8; 32];
    let mut last_seq: Option<u64> = None;
    let mut entries_verified: u64 = 0;
    let mut chain_ok = true;
    let mut sig_ok = true;
    let mut seq_ok = true;
    let mut tip_hash = String::from("0".repeat(64));

    for (line_no, line) in content.lines().enumerate() {
        if line.trim().is_empty() { continue; }

        // 1. Parse
        let entry: LedgerEntry = match serde_json::from_str(line) {
            Ok(e) => e,
            Err(e) => {
                failures.push(format!("Line {line_no}: JSON parse error: {e}"));
                chain_ok = false;
                seq_ok = false;
                continue;
            }
        };

        // 2. Sequence check
        match last_seq {
            None if entry.seq != 0 => {
                failures.push(format!("Line {line_no}: expected seq=0 as first entry, got seq={}", entry.seq));
                seq_ok = false;
            }
            Some(s) if entry.seq != s + 1 => {
                failures.push(format!("Line {line_no}: sequence gap — expected seq={}, got seq={}", s + 1, entry.seq));
                seq_ok = false;
            }
            _ => {}
        }

        // 3. Public key fingerprint check (verify against every entry for consistency)
        if entry.signer_pub_fingerprint != expected_fingerprint {
            failures.push(format!(
                "seq={}: signer fingerprint mismatch — entry has {}, expected {}",
                entry.seq, entry.signer_pub_fingerprint, expected_fingerprint
            ));
            sig_ok = false;
        }

        // 4. Chain integrity: entry.prev_hash must equal BLAKE3(canonical(prev_entry))
        let expected_prev_hex = hex::encode(prev_hash);
        if entry.prev_hash != expected_prev_hex {
            failures.push(format!(
                "seq={}: chain break — expected prev_hash={}, got={}",
                entry.seq, expected_prev_hex, entry.prev_hash
            ));
            chain_ok = false;
        }

        // 5. Recompute canonical hash and verify signature
        let event_json = serde_json::to_string(&entry.event)
            .expect("event must be serializable");
        let prev_hash_bytes = match hex::decode(&entry.prev_hash) {
            Ok(b) => b,
            Err(e) => {
                failures.push(format!("seq={}: invalid prev_hash hex: {e}", entry.seq));
                chain_ok = false;
                continue;
            }
        };
        let canonical = canonical_hash(entry.seq, entry.timestamp_ms, &event_json, &prev_hash_bytes);

        let sig_bytes = match hex::decode(&entry.signature) {
            Ok(b) => b,
            Err(e) => {
                failures.push(format!("seq={}: invalid signature hex: {e}", entry.seq));
                sig_ok = false;
                continue;
            }
        };

        if !QuantumNodeIdentity::verify_signature(&pub_key_bytes, &canonical, &sig_bytes) {
            failures.push(format!("seq={}: ML-DSA-87 signature INVALID", entry.seq));
            sig_ok = false;
        }

        // Advance chain state
        prev_hash = entry.canonical_hash();
        tip_hash = hex::encode(prev_hash);
        last_seq = Some(entry.seq);
        entries_verified += 1;
    }

    let verdict = if failures.is_empty() && entries_verified > 0 {
        "PASS"
    } else if entries_verified == 0 && failures.is_empty() {
        // Empty ledger — not a cryptographic failure, but not evidence of anything
        failures.push("Ledger contains no entries".to_string());
        "FAIL"
    } else {
        "FAIL"
    };

    VerificationReport {
        verdict,
        entries_verified,
        chain_integrity: if chain_ok { "PASS" } else { "FAIL" },
        signature_integrity: if sig_ok { "PASS" } else { "FAIL" },
        sequence_integrity: if seq_ok { "PASS" } else { "FAIL" },
        first_seq: if entries_verified > 0 { Some(0) } else { None },
        last_seq,
        tip_hash,
        failures,
    }
}

fn load_public_key(path: &std::path::Path) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let hex_str = std::fs::read_to_string(path)?;
    let bytes = hex::decode(hex_str.trim())?;
    if bytes.len() != core_crypto::DSA_PUB_KEY_LEN {
        return Err(format!(
            "Public key must be {} bytes, got {}",
            core_crypto::DSA_PUB_KEY_LEN, bytes.len()
        ).into());
    }
    Ok(bytes)
}
