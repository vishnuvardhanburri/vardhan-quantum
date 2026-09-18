export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      rows: [
        {
          id: "rec_001_genesis",
          order_id: "#0001",
          order_date: new Date(Date.now() - 3600000).toISOString(),
          product: "GenesisBlockCreated (FIPS-204 Sealed)",
          user: "root_authority",
          amount: "ML-DSA-87",
          customer_name: "system_init",
          status: "MERKLE_SEALED",
          total_amount: "FIPS 204 ML-DSA-87",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          event_type: "GenesisBlockCreated",
          actor: "root_authority",
          block_hash: "0a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789",
          signature: "dsa87_sig_7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a"
        },
        {
          id: "rec_002_raft_term",
          order_id: "#0002",
          order_date: new Date(Date.now() - 1800000).toISOString(),
          product: "RaftLeaderElected (Term #4 Quorum)",
          user: "ha_cluster::node_1",
          amount: "Consensus Committed",
          customer_name: "node_alpha_london",
          status: "CONSENSUS_COMMITTED",
          total_amount: "Raft Quorum",
          created_at: new Date(Date.now() - 1800000).toISOString(),
          event_type: "RaftLeaderElected",
          actor: "ha_cluster::node_1",
          block_hash: "1f2e3d4c5b6a7890abcdef0123456789abcdef0123456789abcdef0123456789",
          signature: "dsa87_sig_8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b"
        },
        {
          id: "rec_003_auth_ingress",
          order_id: "#0003",
          order_date: new Date(Date.now() - 600000).toISOString(),
          product: "AdminSessionIssued (Argon2id 64MB)",
          user: "admin@vardhan-quantum.com",
          amount: "Verified Valid",
          customer_name: "admin@vardhan-quantum.com",
          status: "VERIFIED_VALID",
          total_amount: "Argon2id (64MB)",
          created_at: new Date(Date.now() - 600000).toISOString(),
          event_type: "AdminSessionIssued",
          actor: "auth_service::session",
          block_hash: "2b3c4d5e6f7a8901abcdef0123456789abcdef0123456789abcdef0123456789",
          signature: "dsa87_sig_9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c"
        }
      ],
      count: 3
    });
  }
  return res.status(200).json({ success: true });
}
