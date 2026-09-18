export default function handler(req, res) {
  res.status(200).json({
    rows: [
      {
        id: "blog-01",
        title: "FIPS 203 and 204: The Global Banking Transition to Lattice Cryptography",
        author_name: "Vardhan Security Research Labs",
        epigraph: "Analyzing the transition timelines from classical RSA/ECC to Kyber and Dilithium for tier-1 financial networks.",
        hero_image: [{ publicUrl: "/images/avatar.png" }],
        date: "September 16, 2026",
      },
      {
        id: "blog-02",
        title: "Harvest Now, Decrypt Later (HNDL) Threat Modeling in Practice",
        author_name: "CISO Architecture Team",
        epigraph: "Why nation-state adversaries are intercepting and storing encrypted TLS transit today, and how zero-touch ingress mitigates it.",
        hero_image: [{ publicUrl: "/images/avatar.png" }],
        date: "September 14, 2026",
      },
      {
        id: "blog-03",
        title: "Microsecond PQC: Benchmarking ML-KEM-1024 with AVX-512",
        author_name: "Quantum Engine Performance Core",
        epigraph: "Achieving 260,000+ handshakes per second per core through bare-metal vectorization.",
        hero_image: [{ publicUrl: "/images/avatar.png" }],
        date: "September 10, 2026",
      }
    ],
    count: 3
  });
}
