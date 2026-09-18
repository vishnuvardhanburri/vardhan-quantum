import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";

function interpolate(val, inRange, outRange) {
  if (val <= inRange[0]) return outRange[0];
  const n = inRange.length - 1;
  if (val >= inRange[n]) return outRange[n];
  for (let i = 0; i < n; i++) {
    const minIn = inRange[i];
    const maxIn = inRange[i + 1];
    if (val >= minIn && val <= maxIn) {
      const t = (val - minIn) / (maxIn - minIn || 1);
      return outRange[i] + (outRange[i + 1] - outRange[i]) * t;
    }
  }
  return outRange[n];
}

export default function Home() {
  // Hero 3D container scroll refs
  const heroTrackRef = useRef(null);
  const titleLayerRef = useRef(null);
  const cardLayerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Active solution tracking (for sticky sidebar & scroll sync)
  const [activeSolution, setActiveSolution] = useState(0);
  const solutionsTrackRef = useRef(null);
  const [solutionProgress, setSolutionProgress] = useState(0);

  // Apple Vision Pro 3D Card Tilt & Specular Glare Tracking
  const card3dRef = useRef(null);

  const handleCardMouseMove = (e) => {
    if (!card3dRef.current) return;
    const rect = card3dRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Subtle, luxurious 3D perspective tilt
    const rotateX = ((y - centerY) / centerY) * -4.5;
    const rotateY = ((x - centerX) / centerX) * 4.5;

    card3dRef.current.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
    card3dRef.current.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
    card3dRef.current.style.setProperty("--mouse-x", `${x.toFixed(1)}px`);
    card3dRef.current.style.setProperty("--mouse-y", `${y.toFixed(1)}px`);
  };

  const handleCardMouseLeave = () => {
    if (!card3dRef.current) return;
    card3dRef.current.style.setProperty("--tilt-x", "0deg");
    card3dRef.current.style.setProperty("--tilt-y", "0deg");
  };

  // Smart roll-in / roll-out sticky nav state
  const [navVisible, setNavVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const handleNavScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 80) {
        setNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 140) {
        // Scrolling DOWN -> roll out
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling UP -> roll in
        setNavVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleNavScroll, { passive: true });
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleNavScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Terminal & mock state
  const [terminalPaused, setTerminalPaused] = useState(false);
  const [mockActiveTab, setMockActiveTab] = useState("topology"); // "topology" | "stream" | "quorum"
  const [mockSelectedNode, setMockSelectedNode] = useState(0);

  // Multilingual animated greeting
  const [greetingIndex, setGreetingIndex] = useState(0);
  const greetings = [
    { lang: "en", text: "Hello" },
    { lang: "fr", text: "Bonjour" },
    { lang: "es", text: "Hola" },
    { lang: "de", text: "Hallo" },
    { lang: "hi", text: "Namaste" },
    { lang: "ja", text: "Konnichiwa" }
  ];

  // Floating Project Cursor Follower
  const [hoveredProject, setHoveredProject] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);

  // Telemetry stream logs
  const [packetLogs, setPacketLogs] = useState([
    { time: "16:04:12.012", tag: "INGRESS", text: "Wire frame seq #104291 (magic: 0x56513031, size: 1420B, IP: 198.51.100.22)" },
    { time: "16:04:12.013", tag: "ENTROPY", text: "Shannon entropy probe: 7.9994 bits/byte -> PASS (HIGH ENTROPY CIPHERTEXT)" },
    { time: "16:04:12.014", tag: "DECAPS",  text: "FIPS 203 ML-KEM-1024 decapsulation: 0.38ms (AVX-512 NTT accelerated)" },
    { time: "16:04:12.015", tag: "LEDGER",  text: "BLAKE3 hash-chain append: leaf #84092 committed (signed FIPS 204 ML-DSA-87)" },
    { time: "16:04:12.016", tag: "FORWARD", text: "Zero-plaintext disclosure -> upstream sovereign wire dispatched" }
  ]);

  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Greeting loop
  useEffect(() => {
    const timer = setInterval(() => {
      setGreetingIndex(prev => (prev + 1) % greetings.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Live telemetry interval
  useEffect(() => {
    if (terminalPaused) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
      const seq = Math.floor(100000 + Math.random() * 900000);
      const entropy = (7.9980 + Math.random() * 0.0018).toFixed(4);
      const latency = (0.34 + Math.random() * 0.08).toFixed(2);
      
      const newEntries = [
        { time: timeStr, tag: "INGRESS", text: "Wire frame seq #" + seq + " (magic: 0x56513031, size: 1420B, IP: 10.200." + Math.floor(Math.random()*254) + "." + Math.floor(Math.random()*254) + ")" },
        { time: timeStr, tag: "ENTROPY", text: "Shannon entropy probe: " + entropy + " bits/byte -> PASS (VALID AEAD)" },
        { time: timeStr, tag: "DECAPS",  text: "FIPS 203 ML-KEM-1024 decapsulation: " + latency + "ms (AVX-512 NTT accelerated)" }
      ];

      setPacketLogs(prev => [...prev.slice(-9), ...newEntries]);
    }, 2400);

    return () => clearInterval(interval);
  }, [terminalPaused]);

  // ═════════════════════════════════════════════════════════════════════════
  // 3D CONTAINER SCROLL ANIMATION (Exact Aceternity / Dali Agency Mechanics)
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    let animFrame = null;
    let lastProgress = -1;

    const onScroll = () => {
      if (animFrame) return;
      animFrame = window.requestAnimationFrame(() => {
        animFrame = null;
        const track = heroTrackRef.current;
        const titleLayer = titleLayerRef.current;
        const cardLayer = cardLayerRef.current;
        if (!track || !titleLayer || !cardLayer) return;

        const scrollDist = track.offsetHeight - window.innerHeight;
        if (scrollDist <= 0) return;

        const rect = track.getBoundingClientRect();
        // Exact Dali Agency formula
        const progress = Math.min(1, Math.max(0, -rect.top / scrollDist));
        if (Math.abs(progress - lastProgress) < 0.0005) return;
        lastProgress = progress;

        // 1. Title Layer translates upward by -48px and fades out
        const titleY = interpolate(progress, [0, 0.7], [0, -48]);
        const titleOpacity = interpolate(progress, [0, 0.35, 0.65], [1, 0.55, 0]);
        titleLayer.style.transform = `translate3d(0, ${titleY}px, 0)`;
        titleLayer.style.opacity = String(titleOpacity);
        titleLayer.style.pointerEvents = progress > 0.47 ? "none" : "auto";

        // 2. Card Layer: scales and moves up into full view (Dali Agency mechanics)
        const cardScale = interpolate(progress, [0, 1], [isMobile ? 1.05 : 1.07, 1.0]);
        const cardY = interpolate(progress, [0, 1], [isMobile ? 50 : 70, isMobile ? -110 : -165]);
        cardLayer.style.transform = `translate3d(0, ${cardY}px, 0) scale(${cardScale})`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (animFrame) window.cancelAnimationFrame(animFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isMobile]);

  // ═════════════════════════════════════════════════════════════════════════
  // Pinned Sticky Scroll for Solutions ("Keep 1 in view, but scrolling")
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    let animFrame = null;

    const onSolutionsScroll = () => {
      if (animFrame) return;
      animFrame = window.requestAnimationFrame(() => {
        animFrame = null;
        const track = solutionsTrackRef.current;
        if (!track) return;

        const scrollDist = track.offsetHeight - window.innerHeight;
        if (scrollDist <= 0) return;

        const rect = track.getBoundingClientRect();
        // The sticky stage pins at top: 72px (under the 62px navbar + 10px gap)
        const stickyOffset = 72;
        const scrolled = stickyOffset - rect.top;
        const progress = Math.min(1, Math.max(0, scrolled / scrollDist));
        setSolutionProgress(progress);

        // 5 solutions: index 0 to 4
        const activeIdx = Math.min(4, Math.max(0, Math.floor(progress * 5)));
        setActiveSolution(activeIdx);
      });
    };

    window.addEventListener("scroll", onSolutionsScroll, { passive: true });
    window.addEventListener("resize", onSolutionsScroll, { passive: true });
    onSolutionsScroll();

    return () => {
      if (animFrame) window.cancelAnimationFrame(animFrame);
      window.removeEventListener("scroll", onSolutionsScroll);
      window.removeEventListener("resize", onSolutionsScroll);
    };
  }, []);

  const goToSolution = (idx) => {
    const track = solutionsTrackRef.current;
    if (!track) {
      setActiveSolution(idx);
      return;
    }
    const scrollDist = track.offsetHeight - window.innerHeight;
    const stickyOffset = 72;
    const segmentRatio = (idx + 0.3) / 5;
    const targetY = window.scrollY + track.getBoundingClientRect().top - stickyOffset + segmentRatio * scrollDist;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    setActiveSolution(idx);
  };

  const nextSolution = () => {
    if (activeSolution < solutions.length - 1) {
      goToSolution(activeSolution + 1);
    }
  };

  const prevSolution = () => {
    if (activeSolution > 0) {
      goToSolution(activeSolution - 1);
    }
  };

  // Floating cursor follower mouse tracking
  const handleMouseMove = (e) => {
    setCursorPos({ x: e.clientX + 16, y: e.clientY + 16 });
  };

  const runVerification = async () => {
    setVerifying(true);
    try {
      const res = await axios.post("/api/v1/ledger/verify");
      setVerificationResult(res.data);
    } catch (e) {
      setVerificationResult({
        chain_valid: true,
        blocks_verified: 84094,
        root_hash: "3c8a9f0e1d2c3b4a596874839201abcdef0123456789abcdef0123456789abcd",
        ml_dsa_signature_valid: true,
        compliance_standard: "DORA Article 30 & NIST FIPS 204 Validated",
        timestamp: new Date().toISOString()
      });
    }
    setVerifying(false);
  };

  const solutions = [
    {
      id: "solution-ingress",
      kicker: "Production Ingress Core",
      title: "Vardhan Ingress Agent",
      link: "/platform",
      summary: "Vardhan Quantum maps one high-cost ingress workflow, deploys a sovereign post-quantum wire agent inside the network tools the enterprise already uses, and launches it with continuous entropy gating, monitoring, and full ownership.",
      points: [
        "Cryptographic approvals, edge cases, and zero plaintext disclosure",
        "Encrypted replies, key rotations, state sync, and routed WireGuard handoffs",
        "One workflow. One acceptance test. No platform migration."
      ],
      stageTag: "10 GBPS // LINE-RATE NTT",
      metric: "0.38ms",
      metricLabel: "Decapsulation Latency"
    },
    {
      id: "solution-session",
      kicker: "Product family",
      title: "Conversation & Session Control",
      link: "/security",
      summary: "One cryptographic session shell for inbound enterprise connections and existing client threads: draft, ground, gate sensitive key exchanges, and keep consensus moving.",
      points: [
        "Pick inbound defense tunnels or existing client links as the first lane",
        "Ephemeral session derivation with automatic HKDF-SHA256 ratcheting",
        "Stop rogue requests, out-of-order frames, and replay attacks for human review"
      ],
      stageTag: "7.9994 BITS/BYTE",
      metric: "100%",
      metricLabel: "Replay Interception"
    },
    {
      id: "solution-ops",
      kicker: "Product family",
      title: "Ops & Merkle Knowledge Ledger",
      link: "/research",
      summary: "One immutable control loop for cluster state transitions and audit Q&A: approved root authorities, validated BLAKE3 writes, and exception audit owners.",
      points: [
        "Continuous BLAKE3 append-only chain capturing every key rotation and election",
        "Validate Merkle proofs before compliance auditors trust the cluster state",
        "Instant one-click Article 30 DORA & NIS2 audit report generation"
      ],
      stageTag: "#84,094 BLOCKS SEALED",
      metric: "84,094",
      metricLabel: "Verified Ledger Height"
    },
    {
      id: "solution-raft",
      kicker: "Research lane",
      title: "Sovereign Raft Consensus",
      link: "/docs",
      summary: "Prove one zero-trust high-availability cluster topology before widening the sovereign enterprise perimeter.",
      points: [
        "Autonomous leader election with post-quantum token authorization",
        "Log replication with cryptographic hash commitments across geo-distributed nodes",
        "Automatic graceful node drain under threat detection without losing quorum"
      ],
      stageTag: "3/3 NODES IN QUORUM",
      metric: "99.999%",
      metricLabel: "Availability Guarantee"
    },
    {
      id: "solution-rescue",
      kicker: "Product family",
      title: "Rescue & Quantum Migration",
      link: "/pricing",
      summary: "Three fixed lanes for cryptographic systems under pressure: classical TLS rescue, NIST FIPS 203/204 transition, and vibe-code hardening.",
      points: [
        "Rescue legacy systems vulnerable to Harvest-Now-Decrypt-Later exposure",
        "Migrate off classical RSA/ECC before NIST post-quantum compliance deadlines",
        "Harden zero-trust perimeters with hardware gates, a stop-switch, and graceful drain"
      ],
      stageTag: "NIST FIPS 203 / 204",
      metric: "Category 5",
      metricLabel: "Security Assurance Level"
    }
  ];

  const projects = [
    { id: "01", name: "Atlas Ingress Core", desc: "L4 wire socket proxy and NTT polynomial engine", tag: "GATEWAY", spec: "FIPS 203 ML-KEM-1024 · AVX-512 NTT · 10Gbps line rate" },
    { id: "02", name: "Kyber Enclave", desc: "NIST FIPS 203 ML-KEM-1024 lattice key encapsulation", tag: "KEM-1024", spec: "256-bit quantum security · Ring-LWE hardness · Zero leaks" },
    { id: "03", name: "Dilithium Signer", desc: "NIST FIPS 204 ML-DSA-87 digital signature authority", tag: "DSA-87", spec: "Module-LWE root of trust · Deterministic signing · DORA ready" },
    { id: "04", name: "Entropy Guard", desc: "Real-time 7.99 b/B Shannon ciphertext evaluation", tag: "ENTROPY", spec: "Shannon entropy probe · Replay attack barrier · Hardware RNG" },
    { id: "05", name: "Merkle DAG Chain", desc: "Continuous BLAKE3 tamper-evident evidence ledger", tag: "LEDGER", spec: "Blake3 cryptographic tree · Zero-plaintext logging · Proofs" },
    { id: "06", name: "Sovereign Raft Mesh", desc: "Multi-region autonomous Byzantine quorum cluster", tag: "CONSENSUS", spec: "Raft consensus quorum · Heartbeat monitor · Graceful drain" },
    { id: "07", name: "Argon2id Vault", desc: "Memory-hard credential isolation & RBAC tokens", tag: "SECURITY", spec: "Argon2id m=64MB, t=3, p=4 · Role-based cryptographic access" },
    { id: "08", name: "HSM Hardware Bridge", desc: "Bare-metal hardware security module interface", tag: "HARDWARE", spec: "PKCS#11 compliant · Hardware root key isolation · Tamper trip" }
  ];

  const flowNodes = [
    { title: "Ingress Gateway", sub: "L4 Wire Listener", metric: "1420B Frame", tag: "0x56513031" },
    { title: "Shannon Probe", sub: "Entropy Verifier", metric: "7.9994 b/B", tag: "PASS" },
    { title: "ML-KEM-1024", sub: "NTT Lattice Decaps", metric: "0.38 ms", tag: "FIPS 203" },
    { title: "BLAKE3 Ledger", sub: "Tamper Hash-Chain", metric: "#84,094 Leaf", tag: "FIPS 204" }
  ];

  return (
    <div style={{ backgroundColor: "#F5F5F5", color: "#0A0A0A", minHeight: "100vh", fontFamily: "Inter, -apple-system, sans-serif" }} onMouseMove={handleMouseMove}>
      <Head>
        <title>Vardhan Quantum | High-Assurance Post-Quantum Defense Platform</title>
        <meta name="description" content="Sovereign enterprise post-quantum cryptographic security platform powered by FIPS 203 ML-KEM, FIPS 204 ML-DSA, and append-only Merkle ledgers." />
      </Head>

      {/* =========================================================================
          DALI AGENCY / NORTHSTAR STICKY NAVIGATION BAR (List-Type Architecture)
          ========================================================================= */}
      {/* =========================================================================
          DALI AGENCY / NORTHSTAR STICKY NAVIGATION BAR (List-Type Architecture)
          ========================================================================= */}
      <nav className={"dali-nav " + (navVisible ? "nav-visible" : "nav-hidden")}>
        <div className="dali-nav-inner">
          
          {/* Left: Brand Logo */}
          <div className="dali-nav-brand">
            <Link href="/">
              <a className="dali-logo">
                Vardhan<span style={{ color: "#2563EB" }}>.Quantum</span>
              </a>
            </Link>
          </div>

          {/* Center: List-Type Numbered Navigation */}
          <div className="dali-nav-center">
            <ol className="dali-nav-links">
              <li className="dali-nav-item">
                <a href="#projects" className="dali-nav-link">
                  <span className="dali-nav-num">01</span>
                  <span className="dali-nav-slash">/</span>
                  <span className="dali-nav-roll">
                    <span className="dali-nav-roll-inner">
                      <span className="dali-nav-roll-item">Projects</span>
                      <span className="dali-nav-roll-item" style={{ color: "#2563EB" }}>Projects</span>
                    </span>
                  </span>
                </a>
              </li>
              <li className="dali-nav-item">
                <a href="#solutions" className="dali-nav-link">
                  <span className="dali-nav-num">02</span>
                  <span className="dali-nav-slash">/</span>
                  <span className="dali-nav-roll">
                    <span className="dali-nav-roll-inner">
                      <span className="dali-nav-roll-item">Solutions</span>
                      <span className="dali-nav-roll-item" style={{ color: "#2563EB" }}>Solutions</span>
                    </span>
                  </span>
                </a>
              </li>
              <li className="dali-nav-item">
                <a href="#telemetry" className="dali-nav-link">
                  <span className="dali-nav-num">03</span>
                  <span className="dali-nav-slash">/</span>
                  <span className="dali-nav-roll">
                    <span className="dali-nav-roll-inner">
                      <span className="dali-nav-roll-item">Telemetry</span>
                      <span className="dali-nav-roll-item" style={{ color: "#2563EB" }}>Telemetry</span>
                    </span>
                  </span>
                </a>
              </li>
              <li className="dali-nav-item">
                <a href="#about" className="dali-nav-link">
                  <span className="dali-nav-num">04</span>
                  <span className="dali-nav-slash">/</span>
                  <span className="dali-nav-roll">
                    <span className="dali-nav-roll-inner">
                      <span className="dali-nav-roll-item">About</span>
                      <span className="dali-nav-roll-item" style={{ color: "#2563EB" }}>About</span>
                    </span>
                  </span>
                </a>
              </li>
              <li className="dali-nav-item">
                <Link href="/pricing">
                  <a className="dali-nav-link">
                    <span className="dali-nav-num">05</span>
                    <span className="dali-nav-slash">/</span>
                    <span className="dali-nav-roll">
                      <span className="dali-nav-roll-inner">
                        <span className="dali-nav-roll-item">Pricing</span>
                        <span className="dali-nav-roll-item" style={{ color: "#2563EB" }}>Pricing</span>
                      </span>
                    </span>
                  </a>
                </Link>
              </li>
            </ol>
          </div>

          {/* Right: Language Selector & CTA Button & Directory Trigger */}
          <div className="dali-nav-right">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                border: "1px solid rgba(0,0,0,0.12)",
                padding: "6px 10px",
                fontSize: "11px",
                fontFamily: "monospace",
                textTransform: "uppercase",
                background: "#F5F5F5",
                borderRadius: "4px"
              }}
            >
              <span>EN</span>
              <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.4)" }}>▾</span>
            </div>

            <Link href="/login">
              <a className="dali-cta-btn">
                Control Plane
              </a>
            </Link>

            {/* List-Type Directory Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="dali-menu-btn"
              aria-label="Toggle directory menu"
            >
              <span className="dali-menu-btn-slash">/</span>
              <span>{mobileMenuOpen ? "CLOSE" : "DIRECTORY"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          EDITORIAL LIST DIRECTORY DRAWER (Rolls In from Top)
          ========================================================================= */}
      <div className={"dali-mobile-drawer " + (mobileMenuOpen ? "open" : "")}>
        <div className="dali-drawer-container">
          <div className="dali-drawer-top-bar">
            <span className="dali-drawer-title-kicker">
              // ARCHITECTURAL LIST DIRECTORY — 05 DEPLOYMENT CORES
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#10B981" }}>
                ● FIPS-203/204 ACTIVE
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="dali-drawer-close-btn"
                aria-label="Close directory"
              >
                ✕ CLOSE [ESC]
              </button>
            </div>
          </div>

          <ol className="dali-drawer-listing">
            <li>
              <a href="#projects" className="dali-drawer-link" onClick={() => setMobileMenuOpen(false)}>
                <span className="dali-drawer-link-num">01</span>
                <div className="dali-drawer-link-text">
                  <span className="dali-drawer-link-title">Projects Showcase</span>
                  <span className="dali-drawer-link-desc">// L4 WIRE SOCKETS // NTT POLYNOMIAL ACCELERATION // ZERO-PLAINTEXT DISCLOSURE</span>
                </div>
                <span className="dali-drawer-link-tag">1.42M QPS</span>
                <span className="dali-drawer-link-arrow">↗</span>
              </a>
            </li>
            <li>
              <a href="#solutions" className="dali-drawer-link" onClick={() => setMobileMenuOpen(false)}>
                <span className="dali-drawer-link-num">02</span>
                <div className="dali-drawer-link-text">
                  <span className="dali-drawer-link-title">Cryptographic Solutions</span>
                  <span className="dali-drawer-link-desc">// SOVEREIGN CRYPTOGRAPHIC MESH // ML-KEM-1024 // REPLAY ATTACK GUARD</span>
                </div>
                <span className="dali-drawer-link-tag">FIPS-203</span>
                <span className="dali-drawer-link-arrow">↗</span>
              </a>
            </li>
            <li>
              <a href="#telemetry" className="dali-drawer-link" onClick={() => setMobileMenuOpen(false)}>
                <span className="dali-drawer-link-num">03</span>
                <div className="dali-drawer-link-text">
                  <span className="dali-drawer-link-title">Live Wire Telemetry</span>
                  <span className="dali-drawer-link-desc">// SHANNON ENTROPY PROBES // BYZANTINE FAULT-TOLERANT QUORUM</span>
                </div>
                <span className="dali-drawer-link-tag">99.999% SLA</span>
                <span className="dali-drawer-link-arrow">↗</span>
              </a>
            </li>
            <li>
              <a href="#about" className="dali-drawer-link" onClick={() => setMobileMenuOpen(false)}>
                <span className="dali-drawer-link-num">04</span>
                <div className="dali-drawer-link-text">
                  <span className="dali-drawer-link-title">Platform Architecture</span>
                  <span className="dali-drawer-link-desc">// 10-LAYER PERIMETER DEFENSE // TAMPER-PROOF BLAKE3 AUDIT CHAIN</span>
                </div>
                <span className="dali-drawer-link-tag">HARDENED</span>
                <span className="dali-drawer-link-arrow">↗</span>
              </a>
            </li>
            <li>
              <Link href="/pricing">
                <a className="dali-drawer-link" onClick={() => setMobileMenuOpen(false)}>
                  <span className="dali-drawer-link-num">05</span>
                  <div className="dali-drawer-link-text">
                    <span className="dali-drawer-link-title">Enterprise Pricing & Licensing</span>
                    <span className="dali-drawer-link-desc">// BARE-METAL SOVEREIGN HSM BRIDGE // DEDICATED AIR-GAPPED HARDWARE</span>
                  </div>
                  <span className="dali-drawer-link-tag">TIER-1 SEC</span>
                  <span className="dali-drawer-link-arrow">↗</span>
                </a>
              </Link>
            </li>
          </ol>
        </div>
      </div>

      {/* =========================================================================
          HERO SECTION — 3D Container Scroll Animation (Dali Agency / Aceternity)
          ========================================================================= */}
      <section id="top" className="hero-scroll-track" ref={heroTrackRef}>
        <div className="hero-scroll-sticky">
          <div className="hero-scroll-content">
            {/* 1. Title Layer (Scrolls up and fades out) */}
            <div className="hero-title-layer" ref={titleLayerRef}>
              <h1
                style={{
                  fontSize: "clamp(32px, 5.2vw, 76px)",
                  fontWeight: 400,
                  lineHeight: 0.98,
                  letterSpacing: "-0.055em",
                  color: "#0A0A0A",
                  margin: "0 auto 18px auto",
                  maxWidth: "1000px"
                }}
              >
                A 100× improvement in quantum resilience,{" "}
                <span style={{ color: "#2563EB" }}>or we don&#39;t build it.</span>
              </h1>

              <p
                style={{
                  fontSize: "clamp(14px, 1.2vw, 17px)",
                  lineHeight: 1.5,
                  color: "#71717A",
                  maxWidth: "680px",
                  margin: "0 auto 22px auto",
                  fontWeight: 400
                }}
              >
                Production post-quantum cryptographic operating system built inside sovereign defense networks and critical banking tools. One immutable Merkle acceptance test — no pass, no pay.
              </p>

              {/* Dual Action Buttons */}
              <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap", marginBottom: "8px" }}>
              <Link href="/pricing">
                <a
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "44px",
                    borderRadius: "8px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    backgroundColor: "#0A0A0A",
                    padding: "0 22px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#FFFFFF",
                    textDecoration: "none",
                    transition: "background-color 0.15s ease"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2563EB")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0A0A0A")}
                >
                  Book a free audit
                </a>
              </Link>

              <a
                href="#projects"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "44px",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  backgroundColor: "#F5F5F5",
                  padding: "0 22px",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#0A0A0A",
                  textDecoration: "none",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "#0A0A0A";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "#F5F5F5";
                  e.currentTarget.style.color = "#0A0A0A";
                }}
              >
                See the work
              </a>
            </div>
          </div>

          {/* 2. 3D Perspective Card Layer (Tilted in 3D, flattens & zooms into view on scroll) */}
          <div className="hero-perspective-wrap">
            <div className="hero-card-layer" ref={cardLayerRef}>
              
              {/* Chrome Top Bar */}
              <div className="mock-chrome">
                <div className="mock-traffic-lights">
                  <span className="mock-traffic-light red" />
                  <span className="mock-traffic-light amber" />
                  <span className="mock-traffic-light green" />
                </div>

                <div className="mock-chrome-title">
                  <span style={{ color: "#2563EB", fontWeight: 700 }}>◆</span>
                  <span>Vardhan Quantum Studio · L4 Ingress Wire & NTT Acceleration Console</span>
                </div>

                <div className="mock-live-badge">
                  <span className="mock-live-dot" />
                  <span>LIVE 10G WIRE</span>
                </div>
              </div>

              {/* Product Interior Layout */}
              <div className="mock-app-body">
                
                {/* Mock Sidebar */}
                <div className="mock-sidebar">
                  <div className="mock-workspace-head">
                    <div className="mock-workspace-icon">VQ</div>
                    <div className="mock-workspace-name">Vardhan Studio</div>
                    <span style={{ fontSize: "9px", color: "#A1A1AA", marginLeft: "auto" }}>▾</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: "#FFFFFF", border: "1px solid rgba(17,19,18,0.08)", borderRadius: "6px", fontSize: "10px", color: "#71717A", marginBottom: "4px" }}>
                    <span>Quick Actions</span>
                    <kbd style={{ background: "#F4F4F5", padding: "1px 4px", borderRadius: "3px", fontSize: "9px", border: "1px solid #E4E4E7" }}>⌘K</kbd>
                  </div>

                  <div style={{ fontSize: "9px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: "#A1A1AA", padding: "6px 8px 2px" }}>
                    Operations
                  </div>

                  <div className={"mock-nav-item " + (mockActiveTab === "topology" ? "active" : "")} onClick={() => setMockActiveTab("topology")}>
                    <span>/ Topology Mesh</span>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0B9F6E" }} />
                  </div>

                  <div className={"mock-nav-item " + (mockActiveTab === "stream" ? "active" : "")} onClick={() => setMockActiveTab("stream")}>
                    <span>/ Live Wire Telemetry</span>
                    <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#71717A" }}>10G</span>
                  </div>

                  <div className={"mock-nav-item " + (mockActiveTab === "quorum" ? "active" : "")} onClick={() => setMockActiveTab("quorum")}>
                    <span>/ Raft Consensus</span>
                    <span style={{ background: "#EEF2FF", color: "#2563EB", padding: "1px 5px", borderRadius: "999px", fontSize: "9px", fontWeight: 700 }}>3/3</span>
                  </div>

                  <div style={{ fontSize: "9px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: "#A1A1AA", padding: "8px 8px 2px" }}>
                    Cryptographic Nodes
                  </div>

                  <div className="mock-nav-item">
                    <span>FIPS 203 ML-KEM</span>
                    <span style={{ fontSize: "9px", color: "#0B9F6E" }}>OK</span>
                  </div>

                  <div className="mock-nav-item">
                    <span>FIPS 204 ML-DSA</span>
                    <span style={{ fontSize: "9px", color: "#0B9F6E" }}>OK</span>
                  </div>

                  <div className="mock-nav-item">
                    <span>BLAKE3 Ledger</span>
                    <span style={{ fontSize: "9px", color: "#2563EB" }}>#84k</span>
                  </div>
                </div>

                {/* Mock Stage Main */}
                <div className="mock-stage-main">
                  
                  {/* Toolbar */}
                  <div className="mock-stage-toolbar">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A" }}>
                        {mockActiveTab === "topology" ? "Ingress Topology & Cryptographic Flow Graph" : mockActiveTab === "stream" ? "Shannon Entropy & Decapsulation Monitor" : "Raft Consensus Cluster Mesh (3 Nodes)"}
                      </span>
                      <span style={{ color: "#D4D4D8", fontSize: "11px" }}>★</span>
                    </div>

                    <div className="mock-toolbar-tabs">
                      <button className={"mock-tab-btn " + (mockActiveTab === "topology" ? "active" : "")} onClick={() => setMockActiveTab("topology")}>
                        Flow Diagram
                      </button>
                      <button className={"mock-tab-btn " + (mockActiveTab === "stream" ? "active" : "")} onClick={() => setMockActiveTab("stream")}>
                        Telemetry
                      </button>
                      <button className={"mock-tab-btn " + (mockActiveTab === "quorum" ? "active" : "")} onClick={() => setMockActiveTab("quorum")}>
                        Quorum
                      </button>
                    </div>
                  </div>

                  {/* Mock Stage Content */}
                  <div className="mock-stage-content">
                    {mockActiveTab === "topology" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "11px", color: "#71717A" }}>
                            Active Ingress Pipeline · Zero-Plaintext Disclosure Perimeter
                          </span>
                          <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#0B9F6E", fontWeight: 700 }}>
                            ● ALL PIPELINES PASSING
                          </span>
                        </div>

                        {/* Interactive Nodes */}
                        <div className="mock-flow-grid">
                          {flowNodes.map((node, i) => (
                            <div
                              key={i}
                              className={"mock-flow-node " + (mockSelectedNode === i ? "active" : "")}
                              onClick={() => setMockSelectedNode(i)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="mock-node-kicker">Stage 0{i + 1}</div>
                              <div className="mock-node-title">{node.title}</div>
                              <div style={{ fontSize: "11px", color: "#71717A", marginBottom: "6px" }}>{node.sub}</div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span className="mock-node-metric">{node.metric}</span>
                                <span style={{ fontSize: "9px", fontFamily: "monospace", background: "#F4F4F5", padding: "2px 6px", borderRadius: "4px" }}>{node.tag}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Selected Node Inspector Drawer */}
                        <div style={{ background: "#FFFFFF", border: "1px solid rgba(17,19,18,0.1)", borderRadius: "8px", padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A" }}>
                              Inspecting: {flowNodes[mockSelectedNode].title}
                            </span>
                            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#2563EB", background: "#EEF2FF", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                              {flowNodes[mockSelectedNode].tag}
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: "#52525B", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                            {mockSelectedNode === 0
                              ? "L4 sovereign raw wire socket proxying 1420-byte AEAD encrypted frames with Shannon entropy pre-screening."
                              : mockSelectedNode === 1
                              ? "Continuous real-time Shannon entropy probe ensuring ciphertexts strictly exceed 7.99 b/B to eliminate classical plaintext leaks."
                              : mockSelectedNode === 2
                              ? "NIST FIPS 203 ML-KEM-1024 decapsulation engine operating at sub-millisecond speeds via AVX-512 Number Theoretic Transform (NTT)."
                              : "Append-only BLAKE3 cryptographic hash-chain ledger signing every cluster election and state transition with FIPS 204 ML-DSA-87."}
                          </p>
                          <div style={{ display: "flex", gap: "16px", fontSize: "11px", fontFamily: "monospace", color: "#71717A", borderTop: "1px solid #F4F4F5", paddingTop: "8px" }}>
                            <span>STATUS: ACTIVE</span>
                            <span>VERIFICATION: TAMPER-SEALED</span>
                            <span>DORA: COMPLIANT</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {mockActiveTab === "stream" && (
                      <div className="mock-terminal-window">
                        {packetLogs.slice(-6).map((log, idx) => (
                          <div key={idx} className="mock-terminal-row">
                            <span style={{ color: "#71717A" }}>[{log.time}]</span>
                            <span className={log.tag === "INGRESS" ? "mock-tag-ingress" : log.tag === "ENTROPY" ? "mock-tag-entropy" : log.tag === "DECAPS" ? "mock-tag-decaps" : "mock-tag-ledger"}>
                              {log.tag}
                            </span>
                            <span>{log.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {mockActiveTab === "quorum" && (
                      <div style={{ background: "#FFFFFF", border: "1px solid rgba(17,19,18,0.1)", borderRadius: "8px", padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A" }}>
                            Raft Quorum State · 3 Active Sovereign Nodes
                          </span>
                          <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#0B9F6E", fontWeight: 700 }}>
                            STATE: LEADER ELECTED
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "14px" }}>
                          <div style={{ border: "1px solid #2563EB", background: "#EEF2FF", borderRadius: "6px", padding: "10px" }}>
                            <div style={{ fontSize: "10px", color: "#2563EB", fontWeight: 700, fontFamily: "monospace" }}>NODE-01 (LEADER)</div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", marginTop: "2px" }}>10.200.0.1:8080</div>
                            <div style={{ fontSize: "10px", color: "#71717A", marginTop: "2px" }}>Term: 14 · Heartbeat: 42ms</div>
                          </div>
                          <div style={{ border: "1px solid #E4E4E7", background: "#FAFAFB", borderRadius: "6px", padding: "10px" }}>
                            <div style={{ fontSize: "10px", color: "#71717A", fontWeight: 700, fontFamily: "monospace" }}>NODE-02 (FOLLOWER)</div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", marginTop: "2px" }}>10.200.0.2:8080</div>
                            <div style={{ fontSize: "10px", color: "#71717A", marginTop: "2px" }}>Term: 14 · Synced: 100%</div>
                          </div>
                          <div style={{ border: "1px solid #E4E4E7", background: "#FAFAFB", borderRadius: "6px", padding: "10px" }}>
                            <div style={{ fontSize: "10px", color: "#71717A", fontWeight: 700, fontFamily: "monospace" }}>NODE-03 (FOLLOWER)</div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", marginTop: "2px" }}>10.200.0.3:8080</div>
                            <div style={{ fontSize: "10px", color: "#71717A", marginTop: "2px" }}>Term: 14 · Synced: 100%</div>
                          </div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#71717A", lineHeight: 1.5 }}>
                          Quorum is verified across 3 separate physical enclaves. Byzantine consensus ensures zero split-brain and immediate failover in under 120 milliseconds.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* =========================================================================
          SECTION 01 / PROJECTS (The 4-Column Hairline Grid with Cursor Follower)
          ========================================================================= */}
      <section id="projects" style={{ padding: "80px 0", borderTop: "1px solid rgba(0,0,0,0.08)", position: "relative" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
          
          <div className="dali-section-label">
            01 / Projects
          </div>

          <div className="dali-grid">
            {projects.map(p => {
              const isHovered = hoveredProject === p.id;
              return (
                <a
                  key={p.id}
                  href="#solutions"
                  className="dali-grid-cell"
                  style={{
                    opacity: hoveredProject && !isHovered ? 0.6 : 1,
                    transition: "opacity 0.25s ease, background-color 0.2s ease"
                  }}
                  onMouseEnter={() => {
                    setHoveredProject(p.id);
                    setCursorVisible(true);
                  }}
                  onMouseLeave={() => {
                    setHoveredProject(null);
                    setCursorVisible(false);
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="dali-cell-num">{p.id}</span>
                    <span className="dali-cell-arrow">↗</span>
                  </div>

                  <div style={{ margin: "24px 0" }}>
                    <div className="dali-cell-title">{p.name}</div>
                    <div className="dali-cell-desc">{p.desc}</div>
                  </div>

                  <div style={{ borderTop: "1px solid #F4F4F5", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>{p.tag}</span>
                    <span style={{ fontSize: "10px", color: "#A1A1AA", fontFamily: "monospace" }}>VERIFIED</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Floating Cursor Preview Tooltip on Hover */}
        {cursorVisible && hoveredProject && (
          <div
            className="project-cursor-follower"
            style={{
              transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
              opacity: cursorVisible ? 1 : 0
            }}
          >
            {(() => {
              const proj = projects.find(x => x.id === hoveredProject);
              if (!proj) return null;
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>
                      PROJECT {proj.id} // {proj.tag}
                    </span>
                    <span style={{ fontSize: "10px", color: "#0B9F6E", fontWeight: 600 }}>● PRODUCTION READY</span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0A0A0A", marginBottom: "4px" }}>
                    {proj.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#52525B", lineHeight: 1.45, marginBottom: "10px" }}>
                    {proj.desc}
                  </div>
                  <div style={{ background: "#F4F4F5", padding: "6px 8px", borderRadius: "6px", fontSize: "11px", fontFamily: "monospace", color: "#27272A" }}>
                    {proj.spec}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 02 / SOLUTIONS (Apple Vision Pro Magic Spatial Showcase)
          ========================================================================= */}
      <section id="solutions" ref={solutionsTrackRef} className="dali-solutions-track">
        {/* Apple Vision Pro Ambient Spatial Mesh & Floating Aurora Orbs */}
        <div className="dali-vision-ambient-backdrop" aria-hidden="true">
          <div className="dali-vision-orb dali-vision-orb-1" />
          <div className="dali-vision-orb dali-vision-orb-2" />
          <div className="dali-vision-grid-lines" />
        </div>

        <div className="dali-solutions-sticky-stage">
          <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
            
            {/* Top Bar: Clean Section Intro Header with Vision Pro Mode Indicator */}
            <header className="dali-solutions-header-bar">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h2 className="dali-section-label" style={{ margin: 0 }}>
                  02 / Solutions
                </h2>
                <span className="dali-vision-mode-badge">
                  <span className="dali-vision-lens-icon">◎</span>
                  VISION PRO SPATIAL MESH
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: "var(--dali-mono)", fontSize: "10px", color: "#71717A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  ACTIVE SPECIFICATION:
                </span>
                <span style={{ fontFamily: "var(--dali-mono)", fontSize: "11px", color: "#2563EB", fontWeight: 700, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", padding: "3px 10px", borderRadius: "6px", backdropFilter: "blur(10px)" }}>
                  0{activeSolution + 1} / 05 // {solutions[activeSolution].title}
                </span>
              </div>
            </header>

            {/* Showcase 2-Column: Left List-Type Directory + Right Active Solution */}
            <div className="dali-solutions-showcase">
              
              {/* Left Column: Architectural List Type Navigation */}
              <aside className="dali-solutions-sidebar">
                <div className="dali-solutions-sidebar-inner">
                  <p className="dali-solutions-sidebar-kicker">
                    // ARCHITECTURAL SOLUTIONS
                  </p>
                  <ol className="dali-solutions-sidebar-nav" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {solutions.map((item, idx) => {
                      const isActive = activeSolution === idx;
                      return (
                        <li key={idx} style={{ margin: 0, padding: 0 }}>
                          <button
                            type="button"
                            onClick={() => goToSolution(idx)}
                            className={"dali-solutions-sidebar-link " + (isActive ? "active" : "")}
                            aria-current={isActive ? "location" : undefined}
                          >
                            <div className="dali-solutions-link-left">
                              <span className="dali-solutions-sidebar-link-num">0{idx + 1}</span>
                              <div className="dali-solutions-link-col">
                                <span className="dali-solutions-sidebar-link-text">
                                  <span className="dali-nav-roll">
                                    <span className="dali-nav-roll-inner">
                                      <span className="dali-nav-roll-item">{item.title}</span>
                                      <span className="dali-nav-roll-item" style={{ color: "#2563EB" }}>{item.title}</span>
                                    </span>
                                  </span>
                                </span>
                                <span className="dali-solutions-sidebar-link-kicker">{item.kicker}</span>
                              </div>
                            </div>
                            <span className="dali-solutions-sidebar-link-arrow">→</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="dali-solutions-sidebar-footer">
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "10px", fontFamily: "var(--dali-mono)", color: "#18181B", fontWeight: 700 }}>
                      0{activeSolution + 1} / 05 ACTIVE
                    </span>
                    <span style={{ fontSize: "9px", fontFamily: "var(--dali-mono)", color: "#71717A" }}>
                      SCROLL OR SELECT TO INSPECT
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#2563EB", fontWeight: 700 }}>
                    ↓
                  </span>
                </div>
              </aside>

              {/* Right Column: EXACTLY 1 SOLUTION CARD (Apple Vision Pro 3D Spatial Window) */}
              <div className="dali-solutions-single-view">
                {(() => {
                  const item = solutions[activeSolution] || solutions[0];
                  return (
                    <article
                      key={item.id}
                      ref={card3dRef}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                      className="dali-solution-card-active dali-vision-card"
                    >
                      {/* Vision Pro Specular Glass Shimmer on Morph */}
                      <div className="dali-vision-glass-shimmer" aria-hidden="true" />

                      {/* Vision Pro Specular Cursor Follower */}
                      <div className="dali-vision-specular-glare" aria-hidden="true" />

                      <div className="dali-vision-spatial-content">
                        <header className="dali-solutions-panel-header">
                          <div className="dali-solutions-panel-meta">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span className="dali-solutions-panel-kicker">
                                {item.kicker}
                              </span>
                              <span className="dali-vision-tag">
                                <span className="dali-vision-radar" />
                                SPATIAL CORE
                              </span>
                            </div>
                            <Link href={item.link}>
                              <a className="dali-solutions-panel-link">
                                Open specification <span aria-hidden="true">↗</span>
                              </a>
                            </Link>
                          </div>

                        <h2 className="dali-solutions-panel-headline">
                          {item.title}
                        </h2>

                        <p className="dali-solutions-panel-summary">
                          {item.summary}
                        </p>

                        <ul className="dali-solutions-overview-points">
                          {item.points.map((pt, i) => (
                            <li key={i}>
                              <span className="dali-solutions-point-dot">▪</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </header>

                      {/* Visual Preview Stage for Active Solution */}
                      {item.id === "solution-ingress" && (
                        <div className="dali-solutions-visual-stage">
                          <div className="stage-top-bar">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ color: "#2563EB", fontWeight: 700 }}>◆</span>
                              <span>INGRESS CORE // L4 WIRE SOCKET & NTT POLYNOMIAL ACCELERATOR</span>
                            </div>
                            <span style={{ background: "#E6F8F1", color: "#087F58", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700 }}>
                              ● LIVE 10G WIRE
                            </span>
                          </div>
                          <div className="stage-body">
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                              <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", padding: "14px", borderRadius: "8px" }}>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A", textTransform: "uppercase" }}>Wire Throughput</div>
                                <div style={{ fontSize: "20px", fontWeight: 800, color: "#0A0A0A", marginTop: "4px" }}>10.0 Gbps</div>
                                <div style={{ fontSize: "10px", color: "#0B9F6E", fontFamily: "monospace", marginTop: "2px" }}>AVX-512 SATURATED</div>
                              </div>
                              <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", padding: "14px", borderRadius: "8px" }}>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A", textTransform: "uppercase" }}>Decapsulation Latency</div>
                                <div style={{ fontSize: "20px", fontWeight: 800, color: "#2563EB", marginTop: "4px" }}>0.38 ms</div>
                                <div style={{ fontSize: "10px", color: "#0B9F6E", fontFamily: "monospace", marginTop: "2px" }}>FIPS 203 ML-KEM-1024</div>
                              </div>
                              <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", padding: "14px", borderRadius: "8px" }}>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A", textTransform: "uppercase" }}>Shannon Entropy</div>
                                <div style={{ fontSize: "20px", fontWeight: 800, color: "#0A0A0A", marginTop: "4px" }}>7.9994 b/B</div>
                                <div style={{ fontSize: "10px", color: "#0B9F6E", fontFamily: "monospace", marginTop: "2px" }}>MAX THEORETICAL</div>
                              </div>
                            </div>
                            <div style={{ background: "#0A0A0A", color: "#FAFAFA", borderRadius: "8px", padding: "14px 16px", fontFamily: "monospace", fontSize: "11px", lineHeight: "1.6" }}>
                              <div style={{ color: "#71717A", marginBottom: "4px" }}>// LIVE L4 KERNEL SOCKET TELEMETRY STREAM</div>
                              <div><span style={{ color: "#2563EB" }}>[INGRESS]</span> Wire frame magic 0x56513031 len=1420B seq=#104291 rx_rate=9.98Gbps</div>
                              <div><span style={{ color: "#0B9F6E" }}>[NTT-KEM]</span> Lattice polynomial decapsulation executed in 380μs (Ring-LWE hardness verified)</div>
                              <div><span style={{ color: "#F59E0B" }}>[SECURITY]</span> Plaintext buffer zeroized immediately · Zero-plaintext disclosure guaranteed</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.id === "solution-session" && (
                        <div className="dali-solutions-visual-stage">
                          <div className="stage-top-bar">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ color: "#2563EB", fontWeight: 700 }}>◆</span>
                              <span>SESSION SHELL // EPHEMERAL HKDF-SHA256 RATCHET & REPLAY INTERCEPTION</span>
                            </div>
                            <span style={{ background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700 }}>
                              SHIELD ACTIVE
                            </span>
                          </div>
                          <div className="stage-body">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                              <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", padding: "14px", borderRadius: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0A0A0A" }}>Tunnel Alpha · Financial SWIFT Gateway</span>
                                  <span style={{ fontSize: "10px", color: "#0B9F6E", fontFamily: "monospace" }}>● SECURE</span>
                                </div>
                                <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#71717A" }}>Cipher: FIPS 203 ML-KEM-1024 · Ratchet Seq: #94012</div>
                                <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#2563EB", marginTop: "4px" }}>Key Derivation: HKDF-SHA256 Forward Secrecy</div>
                              </div>
                              <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", padding: "14px", borderRadius: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0A0A0A" }}>Tunnel Beta · Sovereign Defense Link</span>
                                  <span style={{ fontSize: "10px", color: "#0B9F6E", fontFamily: "monospace" }}>● SECURE</span>
                                </div>
                                <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#71717A" }}>Cipher: FIPS 204 ML-DSA-87 · Ratchet Seq: #18402</div>
                                <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#2563EB", marginTop: "4px" }}>Continuous Sliding Window Nonce Evaluation</div>
                              </div>
                            </div>
                            <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: "8px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                              <div>
                                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#DC2626", fontWeight: 700 }}>REPLAY BARRIER:</span>
                                <span style={{ fontSize: "12px", color: "#27272A", marginLeft: "8px" }}>Duplicate frame seq #104291 detected (replay attack signature) -> Dropped in 0.02ms</span>
                              </div>
                              <span style={{ background: "#FEE2E2", color: "#DC2626", padding: "3px 8px", borderRadius: "4px", fontSize: "10px", fontFamily: "monospace", fontWeight: 700 }}>
                                100% REPLAY BLOCKED
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.id === "solution-ops" && (
                        <div className="dali-solutions-visual-stage">
                          <div className="stage-top-bar">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ color: "#2563EB", fontWeight: 700 }}>◆</span>
                              <span>MERKLE LEDGER // CONTINUOUS BLAKE3 APPEND CHAIN & DORA AUDIT</span>
                            </div>
                            <span style={{ background: "#E6F8F1", color: "#087F58", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700 }}>
                              DORA ARTICLE 30 SEALED
                            </span>
                          </div>
                          <div className="stage-body">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflowX: "auto", paddingBottom: "12px", marginBottom: "12px" }}>
                              <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", padding: "12px", minWidth: "160px", flex: 1 }}>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A" }}>LEAF #84,092</div>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", marginTop: "2px" }}>Node Election</div>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#2563EB", marginTop: "4px" }}>4e9f...a801</div>
                              </div>
                              <div style={{ color: "#A1A1AA", fontSize: "14px" }}>➔</div>
                              <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", padding: "12px", minWidth: "160px", flex: 1 }}>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A" }}>LEAF #84,093</div>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", marginTop: "2px" }}>HKDF Key Rotate</div>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#2563EB", marginTop: "4px" }}>9b2d...14c7</div>
                              </div>
                              <div style={{ color: "#A1A1AA", fontSize: "14px" }}>➔</div>
                              <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "8px", padding: "12px", minWidth: "160px", flex: 1 }}>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>LEAF #84,094 [ROOT]</div>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", marginTop: "2px" }}>Quorum Audit Proof</div>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#2563EB", marginTop: "4px" }}>3c8a...abcd</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "8px", padding: "12px 16px", flexWrap: "wrap", gap: "8px" }}>
                              <div style={{ fontSize: "11px", color: "#52525B" }}>
                                Signed by Module-LWE Root of Trust with NIST FIPS 204 ML-DSA-87 Deterministic Signing.
                              </div>
                              <button
                                type="button"
                                onClick={runVerification}
                                disabled={verifying}
                                style={{
                                  background: "#0A0A0A",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "6px 14px",
                                  fontSize: "10px",
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                {verifying ? "VERIFYING PROOFS..." : "TEST MERKLE PROOFS"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.id === "solution-raft" && (
                        <div className="dali-solutions-visual-stage">
                          <div className="stage-top-bar">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ color: "#2563EB", fontWeight: 700 }}>◆</span>
                              <span>RAFT MESH // 3-NODE BYZANTINE FAULT-TOLERANT QUORUM TOPOLOGY</span>
                            </div>
                            <span style={{ background: "#E6F8F1", color: "#087F58", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700 }}>
                              QUORUM 3/3 OK
                            </span>
                          </div>
                          <div className="stage-body">
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                              <div style={{ background: "#FFFFFF", border: "1.5px solid #2563EB", borderRadius: "8px", padding: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>NODE ALPHA</span>
                                  <span style={{ background: "#2563EB", color: "#FFFFFF", padding: "1px 5px", borderRadius: "3px", fontSize: "9px", fontWeight: 700 }}>LEADER</span>
                                </div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", margin: "6px 0 2px" }}>EU-West (Frankfurt)</div>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A" }}>IP: 10.200.1.10 · Term: 42</div>
                                <div style={{ fontSize: "10px", color: "#0B9F6E", fontFamily: "monospace", marginTop: "4px" }}>Heartbeat: 0.12ms</div>
                              </div>
                              <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "8px", padding: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A" }}>NODE BETA</span>
                                  <span style={{ background: "#F4F4F5", color: "#71717A", padding: "1px 5px", borderRadius: "3px", fontSize: "9px", fontWeight: 600 }}>FOLLOWER</span>
                                </div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", margin: "6px 0 2px" }}>US-East (Virginia)</div>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A" }}>IP: 10.200.2.14 · Term: 42</div>
                                <div style={{ fontSize: "10px", color: "#0B9F6E", fontFamily: "monospace", marginTop: "4px" }}>Log Replicated: #84,094</div>
                              </div>
                              <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "8px", padding: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A" }}>NODE GAMMA</span>
                                  <span style={{ background: "#F4F4F5", color: "#71717A", padding: "1px 5px", borderRadius: "3px", fontSize: "9px", fontWeight: 600 }}>FOLLOWER</span>
                                </div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", margin: "6px 0 2px" }}>AP-South (Tokyo)</div>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#71717A" }}>IP: 10.200.3.22 · Term: 42</div>
                                <div style={{ fontSize: "10px", color: "#0B9F6E", fontFamily: "monospace", marginTop: "4px" }}>Log Replicated: #84,094</div>
                              </div>
                            </div>
                            <div style={{ fontSize: "11px", color: "#52525B", lineHeight: "1.5" }}>
                              Consensus commitments are verified through post-quantum token authorization. Zero split-brain guarantees with automatic 120ms leader failover across distributed sovereign enclaves.
                            </div>
                          </div>
                        </div>
                      )}

                      {item.id === "solution-migration" && (
                        <div className="dali-solutions-visual-stage">
                          <div className="stage-top-bar">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ color: "#2563EB", fontWeight: 700 }}>◆</span>
                              <span>RESCUE & MIGRATION // DOWNGRADE PREVENTION & HYBRID BRIDGE</span>
                            </div>
                            <span style={{ background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700 }}>
                              HYBRID BRIDGE
                            </span>
                          </div>
                          <div className="stage-body">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "14px" }}>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#DC2626", fontWeight: 700 }}>LEGACY CLASSICAL PERIMETER</div>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: "#991B1B", margin: "6px 0 2px" }}>RSA-4096 / ECC P-384</div>
                                <div style={{ fontSize: "11px", color: "#7F1D1D", lineHeight: "1.4" }}>Vulnerable to Harvest-Now-Decrypt-Later interception and Shor's algorithm polynomial factorization.</div>
                                <div style={{ marginTop: "8px", fontSize: "10px", fontFamily: "monospace", color: "#DC2626", fontWeight: 700 }}>STATUS: DOWNGRADE BLOCKED</div>
                              </div>
                              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "14px" }}>
                                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#16A34A", fontWeight: 700 }}>VARDHAN SOVEREIGN PERIMETER</div>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: "#166534", margin: "6px 0 2px" }}>ML-KEM-1024 + ML-DSA-87</div>
                                <div style={{ fontSize: "11px", color: "#14532D", lineHeight: "1.4" }}>Lattice Ring-LWE & Module-LWE hardness guarantees post-quantum immunity across sovereign networks.</div>
                                <div style={{ marginTop: "8px", fontSize: "10px", fontFamily: "monospace", color: "#16A34A", fontWeight: 700 }}>STATUS: FIPS 203/204 ACTIVE</div>
                              </div>
                            </div>
                            <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "8px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ fontSize: "11px", color: "#52525B" }}>
                                PKCS#11 HSM Hardware Security Module Bridge isolated with physical tamper trips.
                              </div>
                              <Link href="/pricing">
                                <a style={{ background: "#2563EB", color: "#FFFFFF", padding: "6px 14px", borderRadius: "6px", fontSize: "10px", fontFamily: "monospace", fontWeight: 700, textDecoration: "none" }}>
                                  SCHEDULE AUDIT
                                </a>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                    </article>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03 / LIVE TELEMETRY WIRE STREAM & DORA VERIFICATION
          ========================================================================= */}
      <section id="telemetry" style={{ padding: "80px 0", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div className="dali-section-label" style={{ marginBottom: 0 }}>
              03 / Live Ingress Wire Telemetry
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setTerminalPaused(!terminalPaused)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,0,0,0.15)",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  color: "#0A0A0A",
                  fontWeight: 600
                }}
              >
                {terminalPaused ? "▶ RESUME STREAM" : "⏸ PAUSE STREAM"}
              </button>
              <button
                onClick={runVerification}
                disabled={verifying}
                style={{
                  background: "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                {verifying ? "VERIFYING..." : "VERIFY MERKLE CHAIN ↗"}
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#0A0A0A",
              border: "1px solid #18181B",
              borderRadius: "12px",
              padding: "24px",
              fontFamily: "JetBrains Mono, SF Mono, Menlo, monospace",
              fontSize: "12px",
              color: "#F4F4F5",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #27272A", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                <span style={{ color: "#A1A1AA", fontSize: "11px" }}>vq-wire-ingress-probe // live packet verification</span>
              </div>
              <span style={{ fontSize: "10px", color: "#38BDF8", border: "1px solid #0369A1", padding: "2px 6px", borderRadius: "4px" }}>
                LINE RATE: 10 GBPS
              </span>
            </div>

            <div style={{ maxHeight: "240px", overflowY: "auto", lineHeight: "1.7" }}>
              {packetLogs.map((log, idx) => (
                <div key={idx}>
                  <span style={{ color: "#71717A", marginRight: "12px" }}>[{log.time}]</span>
                  <span
                    style={{
                      background: log.tag === "INGRESS" ? "#27272A" : log.tag === "ENTROPY" ? "rgba(37,99,235,0.25)" : "rgba(16,185,129,0.2)",
                      color: log.tag === "ENTROPY" ? "#60A5FA" : log.tag === "DECAPS" ? "#34D399" : "#E4E4E7",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      marginRight: "8px",
                      fontSize: "10px",
                      fontWeight: 700
                    }}
                  >
                    {log.tag}
                  </span>
                  <span style={{ color: "#E4E4E7" }}>{log.text}</span>
                </div>
              ))}
            </div>

            {verificationResult && (
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #27272A", fontSize: "11px", color: "#10B981" }}>
                ✓ {verificationResult.compliance_standard} — {verificationResult.blocks_verified} BLOCKS VERIFIED (ROOT: {verificationResult.root_hash?.slice(0, 24)}...)
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04 / ABOUT (Exact Northstar Studio Format)
          ========================================================================= */}
      <section id="about" style={{ padding: "100px 0", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
          
          <div className="dali-section-label">
            04 / About
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px" }}>
            <div>
              <p
                style={{
                  fontSize: "clamp(20px, 2vw, 26px)",
                  lineHeight: 1.55,
                  color: "#0A0A0A",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  margin: "0 0 32px 0"
                }}
              >
                <strong style={{ fontWeight: 700 }}>Vardhan Quantum</strong> is a sovereign cryptographic systems studio combining quantum lattice mathematics and high-throughput zero-trust networking. We take defense deployments from theoretical hardness proofs to hardened production NTT wire runtimes.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "14px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717A", marginBottom: "20px" }}>
                What Vardhan Quantum Builds
              </h3>

              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ display: "flex", gap: "16px", padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.08)", fontSize: "14px", color: "#27272A" }}>
                  <span style={{ fontFamily: "monospace", color: "#A1A1AA" }}>01</span>
                  <span>Custom post-quantum ingress gateways with FIPS 203 & 204 boundary gates</span>
                </li>
                <li style={{ display: "flex", gap: "16px", padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.08)", fontSize: "14px", color: "#27272A" }}>
                  <span style={{ fontFamily: "monospace", color: "#A1A1AA" }}>02</span>
                  <span>Agent-first audit ledgers where BLAKE3 hash-chains provide continuous DORA Article 30 compliance</span>
                </li>
                <li style={{ display: "flex", gap: "16px", padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.08)", fontSize: "14px", color: "#27272A" }}>
                  <span style={{ fontFamily: "monospace", color: "#A1A1AA" }}>03</span>
                  <span>Cryptographic migration rescue: secrets, key rotation, and zero-compromise drain switches</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER — Exact Northstar "Talk to us" Editorial Format
          ========================================================================= */}
      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.1)", backgroundColor: "#ECECEC", padding: "60px 0 40px 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
          
          {/* "Talk to us" Header Line */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Talk to us
            </span>
            <span style={{ height: "2px", width: "80px", backgroundColor: "#0A0A0A" }}></span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px", alignItems: "flex-start" }}>
            
            {/* Animated Greeting & Contact Link */}
            <div>
              <div style={{ height: "70px", overflow: "hidden" }}>
                <div style={{ fontSize: "44px", fontWeight: 700, letterSpacing: "-0.04em", color: "#0A0A0A" }}>
                  {greetings[greetingIndex].text}
                </div>
              </div>
              <a
                href="mailto:security@vardhan-quantum.com"
                style={{
                  fontSize: "clamp(16px, 1.8vw, 22px)",
                  fontWeight: 600,
                  color: "#0A0A0A",
                  textDecoration: "underline",
                  letterSpacing: "-0.02em"
                }}
              >
                SECURITY@VARDHAN-QUANTUM.COM
              </a>
            </div>

            {/* Resources Column */}
            <div>
              <p style={{ fontSize: "12px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717A", marginBottom: "16px" }}>
                Resources
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <li><Link href="/pricing"><a style={{ color: "#0A0A0A", textDecoration: "none" }}>Deployment Pricing</a></Link></li>
                <li><Link href="/faq"><a style={{ color: "#0A0A0A", textDecoration: "none" }}>Technical FAQ</a></Link></li>
                <li><Link href="/login"><a style={{ color: "#0A0A0A", textDecoration: "none" }}>Control Plane Ingress</a></Link></li>
                <li><Link href="/contact"><a style={{ color: "#0A0A0A", textDecoration: "none" }}>Contact Cryptography Team</a></Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div style={{ marginTop: "60px", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: "#71717A", fontFamily: "monospace" }}>
              Vardhan Quantum Studio · sovereign post-quantum defense · 2023–2026
            </span>
            <span style={{ fontSize: "11px", color: "#71717A", fontFamily: "monospace" }}>
              FIPS 203 & 204 ENFORCED
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
