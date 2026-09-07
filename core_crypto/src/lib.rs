//! # core_crypto
//!
//! Post-quantum cryptographic identity for a proxy node.
//! Wraps FIPS 203 (ML-KEM-1024) and FIPS 204 (ML-DSA-87).

pub mod avx512;

use ml_kem::kem::{Decapsulate, Encapsulate};
use ml_kem::{Ciphertext, EncodedSizeUser, KemCore, MlKem1024, SharedKey};
use fips204::ml_dsa_87;
use fips204::traits::{SerDes, Signer, Verifier};
use rand::rngs::OsRng;

/// ML-KEM-1024 encapsulation key byte length (1568 bytes).
pub const ENCAP_KEY_LEN: usize = 1568;

/// ML-KEM-1024 ciphertext byte length (1568 bytes).
pub const CIPHERTEXT_LEN: usize = 1568;

/// ML-KEM-1024 shared key byte length (32 bytes).
pub const SHARED_KEY_LEN: usize = 32;

/// ML-DSA-87 public key byte length (2592 bytes).
pub const DSA_PUB_KEY_LEN: usize = ml_dsa_87::PK_LEN; // 2592

/// ML-DSA-87 signature byte length (4627 bytes).
pub const DSA_SIG_LEN: usize = ml_dsa_87::SIG_LEN; // 4627

/// Quantum-safe proxy node cryptographic identity.
///
/// Holds:
/// - An ML-KEM-1024 key pair (FIPS 203) for key encapsulation.
/// - An ML-DSA-87 key pair (FIPS 204) for node authentication.
#[derive(Clone)]
pub struct QuantumNodeIdentity {
    kem_encap_key: <MlKem1024 as KemCore>::EncapsulationKey,
    pub dsa_public_key: ml_dsa_87::PublicKey,
    
    // Hardened secret keys: stored as zeroized byte arrays
    kem_decap_key_bytes: zeroize::Zeroizing<Vec<u8>>,
    dsa_private_key_bytes: zeroize::Zeroizing<[u8; ml_dsa_87::SK_LEN]>,
}

impl QuantumNodeIdentity {
    // ──────────────────────────────────────────────────────────────────
    // Identity generation
    // ──────────────────────────────────────────────────────────────────

    /// Generate fresh ML-KEM-1024 and ML-DSA-87 key pairs.
    pub fn generate_node_identity() -> Result<Self, Box<dyn std::error::Error>> {
        let (decap_key, encap_key) = MlKem1024::generate(&mut OsRng);

        let (dsa_pk, dsa_sk) = ml_dsa_87::try_keygen()
            .map_err(|e| format!("Failed to generate ML-DSA-87 keypair: {e}"))?;

        // Extract bytes for hardened storage
        let decap_bytes = zeroize::Zeroizing::new(decap_key.as_bytes().to_vec());
        let dsa_sk_bytes = zeroize::Zeroizing::new(dsa_sk.into_bytes());

        Ok(QuantumNodeIdentity {
            kem_encap_key: encap_key,
            dsa_public_key: dsa_pk,
            kem_decap_key_bytes: decap_bytes,
            dsa_private_key_bytes: dsa_sk_bytes,
        })
    }

    // ──────────────────────────────────────────────────────────────────
    // Byte-level serialization / deserialization
    // ──────────────────────────────────────────────────────────────────

    /// Serialize the ML-KEM-1024 encapsulation key to bytes (1568 bytes).
    pub fn encap_key_bytes(&self) -> Vec<u8> {
        self.kem_encap_key.as_bytes().to_vec()
    }

    /// Serialize the ML-DSA-87 public key to bytes (2592 bytes).
    pub fn dsa_public_key_bytes(&self) -> Vec<u8> {
        // `into_bytes` consumes `self`, so we clone via SerDes round-trip.
        let pk_bytes: [u8; ml_dsa_87::PK_LEN] = self.dsa_public_key.clone().into_bytes();
        pk_bytes.to_vec()
    }

    // ──────────────────────────────────────────────────────────────────
    // ML-KEM-1024 — typed API (struct-level, using crate types)
    // ──────────────────────────────────────────────────────────────────

    /// Encapsulate a shared key to `remote_encap_key`.
    ///
    /// Returns `(ciphertext, shared_key)`.
    pub fn encapsulate_shared_secret(
        remote_encap_key: &<MlKem1024 as KemCore>::EncapsulationKey,
    ) -> (Ciphertext<MlKem1024>, SharedKey<MlKem1024>) {
        remote_encap_key
            .encapsulate(&mut OsRng)
            .expect("Encapsulation failed")
    }

    /// Decapsulate a shared key from `ciphertext` using this node's decapsulation key.
    pub fn decapsulate_shared_secret(
        &self,
        ciphertext: &Ciphertext<MlKem1024>,
    ) -> SharedKey<MlKem1024> {
        let dk_arr: ml_kem::Encoded::<<MlKem1024 as KemCore>::DecapsulationKey> = 
            self.kem_decap_key_bytes.as_slice().try_into().expect("Invalid dk length");
        let decap_key = <MlKem1024 as KemCore>::DecapsulationKey::from_bytes(&dk_arr);
        decap_key
            .decapsulate(ciphertext)
            .expect("Decapsulation failed")
    }

    // ──────────────────────────────────────────────────────────────────
    // ML-KEM-1024 — byte-level API (for use over the wire)
    // ──────────────────────────────────────────────────────────────────

    /// Encapsulate a shared secret towards a remote node identified by its
    /// raw encapsulation-key bytes.
    ///
    /// Returns `(ciphertext_bytes, shared_key_bytes)`.
    pub fn encapsulate_shared_secret_from_bytes(
        remote_encap_key_bytes: &[u8],
    ) -> Result<(Vec<u8>, Vec<u8>), Box<dyn std::error::Error>> {
        if remote_encap_key_bytes.len() != ENCAP_KEY_LEN {
            return Err(format!(
                "Expected {ENCAP_KEY_LEN} bytes for encap key, got {}",
                remote_encap_key_bytes.len()
            )
            .into());
        }

        // `EncapsulationKey<P>` implements `EncodedSizeUser` with `from_bytes(&Encoded<Self>)`.
        // `Encoded<EncapsulationKey<P>>` = `Array<u8, EncapsulationKeySize<P>>`.
        // We convert the slice to a fixed-size array then into the hybrid_array::Array type.
        let ek_fixed: [u8; ENCAP_KEY_LEN] = remote_encap_key_bytes
            .try_into()
            .map_err(|_| "Bad encap key slice length")?;
        let ek_arr = ml_kem::Encoded::<<MlKem1024 as KemCore>::EncapsulationKey>::from(ek_fixed);
        let ek = <MlKem1024 as KemCore>::EncapsulationKey::from_bytes(&ek_arr);
        let (ct, ss) = ek.encapsulate(&mut OsRng).expect("Encapsulation failed");
        Ok((ct.to_vec(), ss.to_vec()))
    }

    /// Decapsulate a shared secret from raw ciphertext bytes.
    pub fn decapsulate_from_bytes(
        &self,
        ciphertext_bytes: &[u8],
    ) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        if ciphertext_bytes.len() != CIPHERTEXT_LEN {
            return Err(format!(
                "Expected {CIPHERTEXT_LEN} bytes for ciphertext, got {}",
                ciphertext_bytes.len()
            )
            .into());
        }

        // `Ciphertext<MlKem1024>` = `Array<u8, CiphertextSize<MlKem1024Params>>`.
        // Build it directly from the fixed-size byte array.
        let ct_fixed: [u8; CIPHERTEXT_LEN] = ciphertext_bytes
            .try_into()
            .map_err(|_| "Bad ciphertext slice length")?;
        let ct: Ciphertext<MlKem1024> = ct_fixed.into();
        
        let dk_arr: ml_kem::Encoded::<<MlKem1024 as KemCore>::DecapsulationKey> = 
            self.kem_decap_key_bytes.as_slice().try_into().expect("Invalid dk length");
        let decap_key = <MlKem1024 as KemCore>::DecapsulationKey::from_bytes(&dk_arr);
        let ss = decap_key
            .decapsulate(&ct)
            .expect("Decapsulation failed");
        Ok(ss.to_vec())
    }


    // ──────────────────────────────────────────────────────────────────
    // ML-DSA-87 — signing and verification
    // ──────────────────────────────────────────────────────────────────

    /// Sign `payload` using this node's ML-DSA-87 private key.
    ///
    /// Returns the raw signature bytes (4627 bytes for ML-DSA-87).
    pub fn sign_payload(&self, payload: &[u8]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        let dsa_private_key = ml_dsa_87::PrivateKey::try_from_bytes(*self.dsa_private_key_bytes)
            .map_err(|e| format!("Failed to restore ML-DSA-87 key: {e}"))?;
        let signature = dsa_private_key
            .try_sign(payload, &[])
            .map_err(|e| format!("Failed to sign payload with ML-DSA-87: {e}"))?;
        Ok(signature.to_vec())
    }

    /// Verify a signature produced by a remote node.
    ///
    /// - `peer_dsa_pub_bytes`: the 2592-byte ML-DSA-87 public key of the signer.
    /// - `payload`: the signed message.
    /// - `signature`: the raw signature bytes (must be exactly 4627 bytes).
    ///
    /// Returns `true` if the signature is valid.
    pub fn verify_signature(
        peer_dsa_pub_bytes: &[u8],
        payload: &[u8],
        signature: &[u8],
    ) -> bool {
        // Reconstruct the public key
        let pk_arr: [u8; ml_dsa_87::PK_LEN] = match peer_dsa_pub_bytes.try_into() {
            Ok(arr) => arr,
            Err(_) => return false,
        };
        let pk = match ml_dsa_87::PublicKey::try_from_bytes(pk_arr) {
            Ok(k) => k,
            Err(_) => return false,
        };

        // Reconstruct the fixed-size signature array
        let sig_arr: [u8; ml_dsa_87::SIG_LEN] = match signature.try_into() {
            Ok(arr) => arr,
            Err(_) => return false,
        };

        pk.verify(payload, &sig_arr, &[])
    }

    // ──────────────────────────────────────────────────────────────────
    // BLAKE3
    // ──────────────────────────────────────────────────────────────────

    /// Compute a BLAKE3 hash over `data`.
    pub fn hash_ledger_block(data: &[u8]) -> [u8; 32] {
        let mut hasher = blake3::Hasher::new();
        hasher.update(data);
        *hasher.finalize().as_bytes()
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_quantum_identity_handshake() {
        let node_a = QuantumNodeIdentity::generate_node_identity().unwrap();
        let node_b = QuantumNodeIdentity::generate_node_identity().unwrap();

        // FIPS 203 ML-KEM-1024 typed key exchange
        let (ciphertext, secret_a) =
            QuantumNodeIdentity::encapsulate_shared_secret(&node_b.kem_encap_key);
        let secret_b = node_b.decapsulate_shared_secret(&ciphertext);
        assert_eq!(
            secret_a.as_slice(),
            secret_b.as_slice(),
            "ML-KEM-1024 shared secrets must match"
        );

        // FIPS 203 byte-level round-trip
        let ek_bytes = node_b.encap_key_bytes();
        let (ct_bytes, ss_a_bytes) =
            QuantumNodeIdentity::encapsulate_shared_secret_from_bytes(&ek_bytes).unwrap();
        let ss_b_bytes = node_b.decapsulate_from_bytes(&ct_bytes).unwrap();
        assert_eq!(ss_a_bytes, ss_b_bytes, "Byte-level KEM must agree");

        // FIPS 204 ML-DSA-87 signature
        let payload = b"VARDHAN_QUANTUM_PROXY_MANIFEST_001";
        let signature = node_a.sign_payload(payload).unwrap();
        let dsa_pub = node_a.dsa_public_key_bytes();
        assert!(
            QuantumNodeIdentity::verify_signature(&dsa_pub, payload, &signature),
            "ML-DSA-87 signature must be valid"
        );

        // Wrong key must fail
        let dsa_pub_b = node_b.dsa_public_key_bytes();
        assert!(
            !QuantumNodeIdentity::verify_signature(&dsa_pub_b, payload, &signature),
            "Signature verified by wrong key must fail"
        );

        // BLAKE3
        let block_hash = QuantumNodeIdentity::hash_ledger_block(payload);
        assert_ne!(block_hash, [0u8; 32]);
    }
}

#[cfg(test)]
mod clone_test {
    use super::*;
    #[test]
    fn test_clone() {
        let id = QuantumNodeIdentity::generate_node_identity().unwrap();
        let _id2 = id.clone();
    }
}
