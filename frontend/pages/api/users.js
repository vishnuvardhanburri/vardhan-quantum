export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      rows: [
        {
          id: "usr_admin_01",
          email: "admin@vardhan-quantum.com",
          firstName: "CISO",
          lastName: "Executive Officer",
          role: "Chief Information Security Officer",
          emailVerified: true,
          disabled: false,
          avatar: [{ publicUrl: "/images/avatar.png" }],
          createdAt: new Date().toISOString()
        },
        {
          id: "usr_crypto_02",
          email: "crypto.lead@vardhan-quantum.com",
          firstName: "Dr. Elena",
          lastName: "Rostova",
          role: "Principal Cryptographer (FIPS-203/204)",
          emailVerified: true,
          disabled: false,
          avatar: [{ publicUrl: "/images/avatar.png" }],
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "usr_soc_03",
          email: "soc.lead@vardhan-quantum.com",
          firstName: "Marcus",
          lastName: "Vance",
          role: "Lead SOC Analyst (Replay & Ingress Guard)",
          emailVerified: true,
          disabled: false,
          avatar: [{ publicUrl: "/images/avatar.png" }],
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: "usr_audit_04",
          email: "audit.officer@vardhan-quantum.com",
          firstName: "Sarah",
          lastName: "Chen",
          role: "Merkle Audit Officer (DORA / NIS2)",
          emailVerified: true,
          disabled: false,
          avatar: [{ publicUrl: "/images/avatar.png" }],
          createdAt: new Date(Date.now() - 259200000).toISOString()
        }
      ],
      count: 4
    });
  }
  return res.status(200).json({ success: true });
}
