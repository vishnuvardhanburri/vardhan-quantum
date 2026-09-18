export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      rows: [
        {
          id: "SEC-ALRT-1042",
          subsystem: "pq_shield::replay_guard",
          severity: "CRITICAL (BLOCKED)",
          text: "Sliding-window replay filter intercepted duplicate sequence #1042 from untrusted remote ingress IP 198.51.100.44. Dropped with zero plaintext disclosure.",
          status: "MITIGATED",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          feedback_date: new Date(Date.now() - 7200000).toISOString(),
          firstname: "pq_shield::replay_guard",
          review: "Sliding-window replay filter intercepted duplicate sequence #1042. Dropped without plaintext disclosure.",
          rating: "CRITICAL",
        },
        {
          id: "SEC-ALRT-2089",
          subsystem: "proxy_engine::entropy_probe",
          severity: "INFORMATIONAL",
          text: "Shannon entropy threshold probe evaluated wire frame #2089 (entropy: 7.998 bits/byte). Frame verified as high-entropy AES-256-GCM ciphertext.",
          status: "VERIFIED_VALID",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          feedback_date: new Date(Date.now() - 3600000).toISOString(),
          firstname: "proxy_engine::entropy_probe",
          review: "Shannon entropy probe evaluated wire frame #2089 (7.998 bits/byte). High-entropy ciphertext verified.",
          rating: "INFO",
        },
        {
          id: "SEC-ALRT-3104",
          subsystem: "ha_cluster::drain_manager",
          severity: "OPERATIONAL",
          text: "Node drain state machine transition executed: Node A (Leader) acknowledged drain request, transferred leadership to Node B, and severed client ingress safely.",
          status: "COMMITTED",
          created_at: new Date(Date.now() - 1200000).toISOString(),
          feedback_date: new Date(Date.now() - 1200000).toISOString(),
          firstname: "ha_cluster::drain_manager",
          review: "Node drain state machine transition: Node A transferred leadership to Node B and severed ingress safely.",
          rating: "OPS",
        }
      ],
      count: 3
    });
  }
  return res.status(200).json({ success: true });
}

