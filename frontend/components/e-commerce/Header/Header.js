import React from "react";
import Link from "next/link";
import { withRouter } from "next/router";
import { connect } from "react-redux";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      innerWidth: typeof window !== "undefined" ? window.innerWidth : 1200,
      mobileMenuOpen: false,
    };
  }

  componentDidMount() {
    if (typeof window !== "undefined") {
      this.setState({ innerWidth: window.innerWidth });
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("keydown", this.handleKeyDown);
    }
  }

  componentWillUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("keydown", this.handleKeyDown);
    }
  }

  handleKeyDown = (e) => {
    if (e.key === "Escape") {
      this.setState({ mobileMenuOpen: false });
    }
  };

  handleResize = () => {
    if (typeof window !== "undefined") {
      this.setState({ innerWidth: window.innerWidth });
    }
  };

  toggleMobileMenu = () => {
    this.setState(prev => ({ mobileMenuOpen: !prev.mobileMenuOpen }));
  };

  render() {
    const { innerWidth, mobileMenuOpen } = this.state;
    const isMobile = innerWidth < 1024;
    const { currentUser, router } = this.props;

    const navLinks = [
      { num: "01", label: "Projects", href: "/#projects", title: "Projects Showcase", kicker: "// L4 WIRE SOCKETS // NTT POLYNOMIAL ACCELERATION", tag: "1.42M QPS" },
      { num: "02", label: "Solutions", href: "/#solutions", title: "Cryptographic Solutions", kicker: "// SOVEREIGN CRYPTOGRAPHIC MESH // ML-KEM-1024", tag: "FIPS-203" },
      { num: "03", label: "Telemetry", href: "/#telemetry", title: "Live Wire Telemetry", kicker: "// SHANNON ENTROPY PROBES // BYZANTINE FAULT-TOLERANCE", tag: "99.999% SLA" },
      { num: "04", label: "About", href: "/#about", title: "Platform Architecture", kicker: "// 10-LAYER PERIMETER DEFENSE // TAMPER-PROOF LEDGER", tag: "HARDENED" },
      { num: "05", label: "Pricing", href: "/pricing", title: "Enterprise Pricing & Licensing", kicker: "// BARE-METAL SOVEREIGN HSM BRIDGE // DEDICATED HARDWARE", tag: "TIER-1 SEC" }
    ];

    return (
      <>
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "rgba(245, 245, 245, 0.94)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            height: "64px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative"
            }}
          >
            {/* Left Slot: Brand Logo */}
            <div className="dali-nav-brand">
              <Link href="/">
                <a
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Montserrat, Inter, sans-serif",
                      fontWeight: 900,
                      fontSize: "15px",
                      letterSpacing: "-0.04em",
                      color: "#0A0A0A",
                      textTransform: "uppercase"
                    }}
                  >
                    Vardhan<span style={{ color: "#2563EB" }}>.Quantum</span>
                  </span>
                </a>
              </Link>
            </div>

            {/* Center Slot: List-Type Directory Navigation */}
            <div className="dali-nav-center">
              {!isMobile && (
                <ol className="dali-nav-links">
                  {navLinks.map((item, idx) => (
                    <li key={idx} className="dali-nav-item">
                      <Link href={item.href}>
                        <a className="dali-nav-link">
                          <span className="dali-nav-num">{item.num}</span>
                          <span className="dali-nav-slash">/</span>
                          <span className="dali-nav-roll">
                            <span className="dali-nav-roll-inner">
                              <span className="dali-nav-roll-item">{item.label}</span>
                              <span className="dali-nav-roll-item" style={{ color: "#2563EB" }}>{item.label}</span>
                            </span>
                          </span>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Right Column: Status Chip + Language + CTA */}
            <div className="dali-nav-right">
              {/* Telemetry Status Chip */}
              {!isMobile && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    letterSpacing: "0.04em",
                    color: "#0A0A0A",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    background: "rgba(255, 255, 255, 0.6)"
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#10B981",
                      boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
                      display: "inline-block",
                      marginRight: "6px"
                    }}
                  />
                  FIPS-203/204
                </div>
              )}

              {/* Language Pill */}
              <button
                type="button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                  color: "#0A0A0A",
                  background: "transparent",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  cursor: "pointer"
                }}
              >
                <span>EN</span>
                <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.4)" }}>▾</span>
              </button>

              {/* Directory Trigger Button */}
              <button
                type="button"
                onClick={this.toggleMobileMenu}
                className="dali-menu-btn"
                aria-label="Toggle directory menu"
              >
                <span className="dali-menu-btn-slash">/</span>
                <span>{mobileMenuOpen ? "CLOSE" : "DIRECTORY"}</span>
              </button>
            </div>
          </div>
        </header>

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
                  onClick={() => this.setState({ mobileMenuOpen: false })}
                  className="dali-drawer-close-btn"
                  aria-label="Close directory"
                >
                  ✕ CLOSE [ESC]
                </button>
              </div>
            </div>

            <ol className="dali-drawer-listing">
              {navLinks.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href}>
                    <a
                      className="dali-drawer-link"
                      onClick={() => this.setState({ mobileMenuOpen: false })}
                    >
                      <span className="dali-drawer-link-num">{item.num}</span>
                      <div className="dali-drawer-link-text">
                        <span className="dali-drawer-link-title">{item.title}</span>
                        <span className="dali-drawer-link-desc">{item.kicker}</span>
                      </div>
                      <span className="dali-drawer-link-tag">{item.tag}</span>
                      <span className="dali-drawer-link-arrow">↗</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(store) {
  return {
    currentUser: store.auth.currentUser,
  };
}

export default withRouter(connect(mapStateToProps)(Header));
