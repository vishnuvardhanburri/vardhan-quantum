const isBrowser = typeof window !== 'undefined';
const hostApi = isBrowser ? "" : (process.env.VARDHAN_BACKEND_URL || "http://127.0.0.1:3000");
const portApi = "";
const baseURLApi = `${hostApi}/api`;

export default {
  hostApi,
  portApi,
  baseURLApi,
  proxyIngressUrl: "http://127.0.0.1:8080",
  adminApiUrl: "http://127.0.0.1:8081",
  remote: `${hostApi}/api`,
  isBackend: true,
  app: {
    name: "Vardhan Quantum",
    tagline: "Post-Quantum Cryptographic Commerce & Zero-Touch Ingress Gateway",
    pqcSuite: {
      kem: "ML-KEM-1024 (FIPS 203)",
      dsa: "ML-DSA-87 (FIPS 204)",
      aead: "AES-256-GCM Wire Frame",
    },
    colors: {
      dark: "#000000",
      light: "#FFFFFF",
      teal: "#2563EB",
      indigo: "#FFFFFF",
      sea: "#2563EB",
      sky: "#0D0D0D",
      wave: "#141414",
      rain: "#A1A1AA",
      middle: "#0A0A0A",
      black: "#000000",
      salat: "#2563EB",
      yellow: "#2563EB",
    },
  },
};
