use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use argon2::Argon2;
use core_crypto::QuantumNodeIdentity;
use ledger_sync::{LedgerBlock, MerkleLedger};
use rand::RngCore;
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::Path;
use thiserror::Error;
use zeroize::Zeroizing;

#[derive(Error, Debug)]
pub enum PersistenceError {
    #[error("I/O Error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Serialization Error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("Decryption / Key Vault Error")]
    CryptoError,
    #[error("Ledger Error: {0}")]
    Ledger(#[from] ledger_sync::LedgerError),
}

/// Encrypted Key Vault for loading/saving Node Identities on disk
pub struct KeyVault;

impl KeyVault {
    pub fn save_identity(
        path: impl AsRef<Path>,
        identity: &QuantumNodeIdentity,
        passphrase: &[u8],
    ) -> Result<(), PersistenceError> {
        let mut salt = [0u8; 16];
        rand::thread_rng().fill_bytes(&mut salt);

        let mut derived_key = Zeroizing::new([0u8; 32]);
        Argon2::default()
            .hash_password_into(passphrase, &salt, derived_key.as_mut())
            .map_err(|_| PersistenceError::CryptoError)?;

        let serialized = serde_json::to_vec(&(
            identity.encap_key_bytes(),
            identity.dsa_public_key_bytes(),
        ))?;

        let cipher = Aes256Gcm::new_from_slice(derived_key.as_ref())
            .map_err(|_| PersistenceError::CryptoError)?;
        
        let mut nonce_bytes = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher
            .encrypt(nonce, serialized.as_slice())
            .map_err(|_| PersistenceError::CryptoError)?;

        let mut payload = Vec::new();
        payload.extend_from_slice(&salt);
        payload.extend_from_slice(&nonce_bytes);
        payload.extend_from_slice(&ciphertext);

        std::fs::write(path, payload)?;
        Ok(())
    }
}

/// Append-Only Write-Ahead Log (WAL) Ledger Disk Storage
pub struct DiskLedgerWal {
    file_path: String,
}

impl DiskLedgerWal {
    pub fn new(path: impl Into<String>) -> Self {
        Self {
            file_path: path.into(),
        }
    }

    pub fn append(&self, block: &LedgerBlock) -> Result<(), PersistenceError> {
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.file_path)?;

        let json = serde_json::to_string(block)?;
        writeln!(file, "{}", json)?;
        file.flush()?;
        Ok(())
    }

    pub async fn replay_into_ledger(
        &self,
        ledger: &MerkleLedger,
        dsa_pub_key: &[u8],
    ) -> Result<usize, PersistenceError> {
        if !Path::new(&self.file_path).exists() {
            return Ok(0);
        }

        let file = File::open(&self.file_path)?;
        let reader = BufReader::new(file);
        let mut count = 0;

        for line in reader.lines() {
            let line_str = line?;
            if line_str.trim().is_empty() {
                continue;
            }
            let block: LedgerBlock = serde_json::from_str(&line_str)?;
            ledger.append_block(block, dsa_pub_key).await?;
            count += 1;
        }

        Ok(count)
    }
}
