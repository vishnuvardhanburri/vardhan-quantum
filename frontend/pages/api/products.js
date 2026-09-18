export default function handler(req, res) {
  res.status(200).json({
    rows: [
      {
        id: "vq-node-01-lhr",
        title: "Vardhan Ingress Node Alpha (London Core)",
        price: "10 Gbps / 0.38ms",
        status: "LEADER_HEALTHY",
        rating: 5,
        description: "FIPS 203 bare-metal appliance with AVX-512 SIMD NTT accelerator and sliding-window replay guard.",
        hero_image: [{ publicUrl: "/images/avatar.png" }],
        image: [{ publicUrl: "/images/avatar.png" }],
        categories: [{ id: "cat-1", title: "FIPS 203 ML-KEM-1024" }]
      },
      {
        id: "vq-node-02-fra",
        title: "Vardhan Ingress Node Beta (Frankfurt Sovereign)",
        price: "10 Gbps / 0.44ms",
        status: "FOLLOWER_SYNCED",
        rating: 5,
        description: "EU Sovereign cloud gateway with eBPF kernel-bypass and real-time Merkle ledger sync.",
        hero_image: [{ publicUrl: "/images/avatar.png" }],
        image: [{ publicUrl: "/images/avatar.png" }],
        categories: [{ id: "cat-2", title: "FIPS 204 ML-DSA-87" }]
      },
      {
        id: "vq-node-03-iad",
        title: "Vardhan Ingress Node Gamma (US-East High-Sec)",
        price: "10 Gbps / 0.51ms",
        status: "FOLLOWER_SYNCED",
        rating: 5,
        description: "Dedicated FedRAMP-grade high-entropy wire transport and Argon2id multi-factor verification.",
        hero_image: [{ publicUrl: "/images/avatar.png" }],
        image: [{ publicUrl: "/images/avatar.png" }],
        categories: [{ id: "cat-3", title: "AES-256-GCM + BLAKE3" }]
      }
    ],
    count: 3
  });
}
