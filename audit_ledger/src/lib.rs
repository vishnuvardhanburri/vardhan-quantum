//! # audit_ledger
//!
//! Durable, append-only, independently verifiable audit ledger.
//!
//! ## Entry schema (v1)
//!
//! Each entry is a JSON Lines record with fields:
//! - `schema_version`: always 1
//! - `seq`: monotonically increasing u64, starts at 0
//! - `timestamp_ms`: Unix epoch ms
//! - `prev_hash`: hex(BLAKE3(canonical bytes of entry[seq-1])); [0u8;32] for genesis
//! - `event`: the QuantumEvent JSON object
//! - `signature`: hex(ML-DSA-87 sig over canonical bytes)
//! - `signer_pub_fingerprint`: hex(BLAKE3(ML-DSA-87 pub key bytes))
//!
//! ## Canonical bytes (for signing and chain hashing)
//!
//! ```text
//! BLAKE3(
//!   seq as u64 little-endian       [8 bytes]
//!   || timestamp_ms as u64 le      [8 bytes]
//!   || event_json as UTF-8         [variable]
//!   || prev_hash_bytes             [32 bytes]
//! )
//! ```
//! This specification is also emitted in `schema.json` so any language can reproduce it.

pub mod schema;

use std::fs::{File, OpenOptions};
use std::io::{BufWriter, Write};
use std::path::Path;
use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use core_crypto::QuantumNodeIdentity;

/// A single entry in the durable audit ledger.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerEntry {
    pub schema_version: u32,
    pub seq: u64,
    pub timestamp_ms: u128,
    /// hex(BLAKE3(canonical bytes of previous entry)); all-zeros hex for genesis (seq=0)
    pub prev_hash: String,
    /// The auditable event payload
    pub event: serde_json::Value,
    /// hex(ML-DSA-87 signature over canonical_hash bytes)
    pub signature: String,
    /// hex(BLAKE3(ML-DSA-87 public key bytes)) — identifies the signing key
    pub signer_pub_fingerprint: String,
}

impl LedgerEntry {
    /// Compute the canonical 32-byte hash of this entry.
    /// This is the value that becomes `prev_hash` of the next entry.
    pub fn canonical_hash(&self) -> [u8; 32] {
        let event_json = serde_json::to_string(&self.event)
            .expect("event must be serializable");
        let prev_hash_bytes = hex::decode(&self.prev_hash)
            .expect("prev_hash must be valid hex");

        canonical_hash(self.seq, self.timestamp_ms, &event_json, &prev_hash_bytes)
    }
}

/// Compute the canonical BLAKE3 hash used for signing and chain linking.
///
/// Input: `seq_le64 || timestamp_ms_le64 || event_json_utf8 || prev_hash_bytes32`
pub fn canonical_hash(
    seq: u64,
    timestamp_ms: u128,
    event_json: &str,
    prev_hash_bytes: &[u8],
) -> [u8; 32] {
    let mut hasher = blake3::Hasher::new();
    hasher.update(&seq.to_le_bytes());
    hasher.update(&(timestamp_ms as u64).to_le_bytes()); // lower 64 bits, matches verifier
    hasher.update(event_json.as_bytes());
    hasher.update(prev_hash_bytes);
    *hasher.finalize().as_bytes()
}

/// Append-only, crash-safe ledger writer.
///
/// Each call to `append` writes one JSON Line to the ledger file and fsyncs.
pub struct LedgerWriter {
    inner: Mutex<LedgerWriterInner>,
}

struct LedgerWriterInner {
    writer: BufWriter<File>,
    next_seq: u64,
    prev_hash: [u8; 32],
    signer_pub_fingerprint: String,
}

impl LedgerWriter {
    /// Open (or create) a ledger file at `path`.
    ///
    /// If the file already exists, scans to find the last entry's seq and hash
    /// so the chain continues correctly across restarts.
    pub fn open(path: &Path, identity: &QuantumNodeIdentity) -> Result<Self, Box<dyn std::error::Error>> {
        let pub_key_bytes = identity.dsa_public_key_bytes();
        let signer_pub_fingerprint = hex::encode(QuantumNodeIdentity::hash_ledger_block(&pub_key_bytes));

        let (next_seq, prev_hash) = if path.exists() {
            scan_existing_ledger(path)?
        } else {
            (0, [0u8; 32])
        };

        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)?;

        Ok(Self {
            inner: Mutex::new(LedgerWriterInner {
                writer: BufWriter::new(file),
                next_seq,
                prev_hash,
                signer_pub_fingerprint,
            }),
        })
    }

    /// Append a `QuantumEvent` JSON value to the ledger.
    ///
    /// Signs the canonical hash with the gateway ML-DSA-87 private key,
    /// writes one JSON Line, and calls fsync before returning.
    ///
    /// Returns the completed `LedgerEntry` so callers can use it immediately.
    pub fn append(
        &self,
        event: serde_json::Value,
        identity: &QuantumNodeIdentity,
    ) -> Result<LedgerEntry, Box<dyn std::error::Error>> {
        let mut inner = self.inner.lock().unwrap();

        let seq = inner.next_seq;
        let timestamp_ms = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_millis();
        let prev_hash_hex = hex::encode(inner.prev_hash);
        let event_json = serde_json::to_string(&event)?;
        let prev_hash_bytes = hex::decode(&prev_hash_hex)?;

        // Compute canonical hash over {seq, timestamp_ms, event_json, prev_hash}
        let canonical = canonical_hash(seq, timestamp_ms, &event_json, &prev_hash_bytes);

        // Sign the canonical hash with ML-DSA-87
        let signature_bytes = identity.sign_payload(&canonical)?;
        let signature_hex = hex::encode(&signature_bytes);

        let entry = LedgerEntry {
            schema_version: 1,
            seq,
            timestamp_ms,
            prev_hash: prev_hash_hex,
            event,
            signature: signature_hex,
            signer_pub_fingerprint: inner.signer_pub_fingerprint.clone(),
        };

        // Serialize and write one JSON line
        let line = serde_json::to_string(&entry)?;
        inner.writer.write_all(line.as_bytes())?;
        inner.writer.write_all(b"\n")?;
        inner.writer.flush()?;
        // fsync — crash-safe persistence guarantee
        inner.writer.get_ref().sync_data()?;

        // Advance chain state
        inner.prev_hash = entry.canonical_hash();
        inner.next_seq += 1;

        Ok(entry)
    }

    /// Returns the current chain tip: (next_seq, BLAKE3 of last entry).
    pub fn chain_tip(&self) -> (u64, [u8; 32]) {
        let inner = self.inner.lock().unwrap();
        (inner.next_seq, inner.prev_hash)
    }
}

use std::io::{BufRead, BufReader};

/// Scan an existing ledger file to resume the chain.
///
/// Reads all entries to validate the chain, then returns (next_seq, last_entry_hash).
/// If a torn write (incomplete JSON) is detected at the very end of the file, it safely truncates the file.
/// Returns an error if the chain is broken (refuses to append to a corrupt ledger).
fn scan_existing_ledger(path: &Path) -> Result<(u64, [u8; 32]), Box<dyn std::error::Error>> {
    let file = std::fs::OpenOptions::new().read(true).write(true).open(path)?;
    let mut reader = BufReader::new(&file);
    
    let mut prev_hash = [0u8; 32];
    let mut last_seq: Option<u64> = None;
    let mut valid_bytes = 0u64;
    let mut line = String::new();
    let mut line_no = 0;

    loop {
        line.clear();
        let bytes_read = match reader.read_line(&mut line) {
            Ok(0) => break, // EOF
            Ok(n) => n,
            Err(e) => return Err(format!("IO error reading ledger: {e}").into()),
        };
        line_no += 1;

        if line.trim().is_empty() {
            valid_bytes += bytes_read as u64;
            continue;
        }

        let entry: LedgerEntry = match serde_json::from_str(&line) {
            Ok(e) => e,
            Err(e) => {
                // If we fail to parse, assume it's a torn write at the end of the file due to a crash.
                // We truncate the file to the last known valid byte boundary.
                eprintln!("WARN: Torn write detected at line {line_no} ({e}). Truncating ledger to {valid_bytes} bytes.");
                file.set_len(valid_bytes)?;
                break; 
            }
        };

        // Verify chain linkage
        let expected_prev = hex::encode(prev_hash);
        if entry.prev_hash != expected_prev {
            return Err(format!(
                "Ledger chain broken at seq={}: expected prev_hash={expected_prev}, got={}",
                entry.seq, entry.prev_hash
            ).into());
        }

        // Verify monotonic sequence
        match last_seq {
            None if entry.seq != 0 => {
                return Err(format!("Ledger does not start at seq=0, got seq={}", entry.seq).into());
            }
            Some(s) if entry.seq <= s => {
                return Err(format!("Duplicated or reordered sequence: expected seq={}, got seq={}", s + 1, entry.seq).into());
            }
            Some(s) if entry.seq != s + 1 => {
                return Err(format!("Sequence gap (missing entry): expected seq={}, got seq={}", s + 1, entry.seq).into());
            }
            _ => {}
        }

        prev_hash = entry.canonical_hash();
        last_seq = Some(entry.seq);
        valid_bytes += bytes_read as u64;
    }

    match last_seq {
        None => Ok((0, [0u8; 32])),         // Empty file — start fresh
        Some(s) => Ok((s + 1, prev_hash)),   // Resume after last entry
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use core_crypto::QuantumNodeIdentity;
    use std::path::PathBuf;

    fn tmp_ledger_path() -> PathBuf {
        let mut p = std::env::temp_dir();
        p.push(format!("test_ledger_{}.jsonl", fastrand::u64(..)));
        p
    }

    #[test]
    fn test_write_and_chain_integrity() {
        let identity = QuantumNodeIdentity::generate_node_identity().unwrap();
        let path = tmp_ledger_path();
        let writer = LedgerWriter::open(&path, &identity).unwrap();

        for i in 0..10u64 {
            let event = serde_json::json!({"type": "Test", "i": i});
            let entry = writer.append(event, &identity).unwrap();
            assert_eq!(entry.seq, i);
        }

        let (next_seq, _) = writer.chain_tip();
        assert_eq!(next_seq, 10);

        // Reopen — should resume from seq=10 with chain intact
        let writer2 = LedgerWriter::open(&path, &identity).unwrap();
        let (resumed_seq, _) = writer2.chain_tip();
        assert_eq!(resumed_seq, 10);

        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn test_torn_write_recovery() {
        let identity = QuantumNodeIdentity::generate_node_identity().unwrap();
        let path = tmp_ledger_path();
        {
            let writer = LedgerWriter::open(&path, &identity).unwrap();
            writer.append(serde_json::json!({"i": 0}), &identity).unwrap();
            writer.append(serde_json::json!({"i": 1}), &identity).unwrap();
        }
        
        // Simulate a torn write by appending partial JSON
        use std::io::Write;
        let mut file = std::fs::OpenOptions::new().append(true).open(&path).unwrap();
        file.write_all(b"{\"schema_version\": 1, \"seq\": 2").unwrap();
        file.flush().unwrap();

        // Scan should detect the torn write, truncate it, and resume at seq=2
        let (next_seq, _) = scan_existing_ledger(&path).expect("Torn write recovery failed");
        assert_eq!(next_seq, 2);

        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn test_tampered_ledger_refused() {
        let identity = QuantumNodeIdentity::generate_node_identity().unwrap();
        let path = tmp_ledger_path();
        {
            let writer = LedgerWriter::open(&path, &identity).unwrap();
            for i in 0..5u64 {
                writer.append(serde_json::json!({"i": i}), &identity).unwrap();
            }
        }

        // Corrupt the first byte of line 2 (seq=1)
        let content = std::fs::read_to_string(&path).unwrap();
        let mut lines: Vec<&str> = content.lines().collect();
        let mut bad = lines[1].to_string();
        // Flip a char in the prev_hash field
        let tampered = bad.replacen("\"seq\":1", "\"seq\":999", 1);
        lines[1] = Box::leak(tampered.into_boxed_str());
        std::fs::write(&path, lines.join("\n")).unwrap();

        let result = scan_existing_ledger(&path);
        assert!(result.is_err(), "Tampered ledger must be rejected on open");

        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn test_missing_and_duplicate_seq_refused() {
        let identity = QuantumNodeIdentity::generate_node_identity().unwrap();
        let path = tmp_ledger_path();
        {
            let writer = LedgerWriter::open(&path, &identity).unwrap();
            writer.append(serde_json::json!({"i": 0}), &identity).unwrap();
            writer.append(serde_json::json!({"i": 1}), &identity).unwrap();
            writer.append(serde_json::json!({"i": 2}), &identity).unwrap();
        }

        // Delete seq=1 to test missing entry gap
        let content = std::fs::read_to_string(&path).unwrap();
        let lines: Vec<&str> = content.lines().collect();
        std::fs::write(&path, format!("{}\n{}\n", lines[0], lines[2])).unwrap();
        let result_missing = scan_existing_ledger(&path);
        assert!(result_missing.unwrap_err().to_string().contains("chain broken"));

        // Duplicate seq=1 to test duplicated seq
        std::fs::write(&path, format!("{}\n{}\n{}\n", lines[0], lines[1], lines[1])).unwrap();
        let result_duplicate = scan_existing_ledger(&path);
        assert!(result_duplicate.unwrap_err().to_string().contains("chain broken"));
        
        // Reordered seq=1 and seq=2
        std::fs::write(&path, format!("{}\n{}\n{}\n", lines[0], lines[2], lines[1])).unwrap();
        let result_reordered = scan_existing_ledger(&path);
        assert!(result_reordered.unwrap_err().to_string().contains("chain broken"));

        let _ = std::fs::remove_file(&path);
    }
}
