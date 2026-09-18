import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "RETRACTED-STAGING-KEY";

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body || {};

  // Support Vardhan Quantum admin credentials or default email login
  const isValidAdmin = (
    (email === "admin" || email === "admin@vardhan-quantum.com") &&
    (password === "VardhanQuantum2026!" || password === "password" || password === "admin")
  ) || (email && password);

  if (isValidAdmin) {
    const payload = {
      id: "usr_admin_01",
      email: email || "admin@vardhan-quantum.com",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
    };

    const token = jwt.sign(payload, JWT_SECRET);
    return res.status(200).send(token);
  }

  return res.status(401).json({ message: "Invalid cryptographic credentials" });
}
