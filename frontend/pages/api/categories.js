export default function handler(req, res) {
  res.status(200).json({
    rows: [
      { id: "suite-fips203", title: "FIPS 203 ML-KEM-1024 (Lattice Key Encapsulation)", count: 1 },
      { id: "suite-fips204", title: "FIPS 204 ML-DSA-87 (Lattice Digital Signatures)", count: 1 },
      { id: "suite-aead", title: "AES-256-GCM (Wire Frame AEAD Transport)", count: 1 },
      { id: "suite-blake3", title: "BLAKE3 Cryptographic Hash Chains (Merkle Engine)", count: 1 },
      { id: "suite-argon2id", title: "Argon2id (64MB Memory-Hard Credential Hashing)", count: 1 },
      { id: "suite-hkdf", title: "HKDF-SHA256 (Ephemeral Key Expansion)", count: 1 },
      { id: "suite-ebpf", title: "eBPF/XDP (Kernel-Bypass Ingress Guard)", count: 1 }
    ]
  });
}
