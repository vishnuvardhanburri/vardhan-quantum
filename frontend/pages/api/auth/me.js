import jwt from "jsonwebtoken";

export default function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const decoded = jwt.decode(token);
    return res.status(200).json({
      id: decoded?.id || "usr_admin_01",
      email: decoded?.email || "admin@vardhan-quantum.com",
      role: decoded?.role || "admin",
      firstName: "CISO",
      lastName: "Administrator",
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid session token" });
  }
}
