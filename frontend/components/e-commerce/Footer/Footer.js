import React from "react";
import s from "./Footer.module.scss";
import { Container, Row, Col, Input, Button } from "reactstrap";
import Link from 'next/link'

import logo from "public/images/e-commerce/logo-white.svg";
import Google from "public/images/e-commerce/Google";
import Twitter from "public/images/e-commerce/Twitter";
import Linkedin from "public/images/e-commerce/Linkedin";
import Facebook from "public/images/e-commerce/Facebook";

const Footer = () => {
  return (
    <footer className={s.footer}>
      <Container>
        <Row className={"justify-content-between align-items-center"}>
          <Col xl={6} md={6}>
            <h5 className={"text-white fw-bold mb-2"}>Vardhan Quantum Ingress Infrastructure</h5>
            <p className={"text-muted mb-0"} style={{ fontSize: "14px", lineHeight: "1.6" }}>
              Enterprise post-quantum security infrastructure powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA. For systems where compromise is unacceptable.
            </p>
          </Col>
          <Col xl={5} md={6} className={"mt-3 mt-md-0 d-flex justify-content-md-end"}>
            <div className="p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Cryptographic Ingress Standard
              </div>
              <div style={{ fontSize: "13px", color: "#2563EB", fontFamily: "monospace", fontWeight: "700" }}>
                FIPS 203 (ML-KEM-1024) · FIPS 204 (ML-DSA-87)
              </div>
            </div>
          </Col>
        </Row>
        <>
          <hr className={s.footer__hr} />
          <Row className={"my-5 justify-content-between"}>
            <Col xl={4} md={12} className={"mb-4 mb-xl-0 d-flex flex-column justify-content-between"}>
              <div>
                <Link href="/">
                  <span style={{ fontSize: "20px", fontWeight: "800", color: "#111111", letterSpacing: "-0.02em", cursor: "pointer" }}>
                    Vardhan<span style={{ color: "#2563EB" }}>.Quantum</span>
                  </span>
                </Link>
                <p className={"text-muted mt-3 mb-0"} style={{ fontSize: "13px", lineHeight: "1.6" }}>
                  Autonomous quantum-resistant wire transport, high-availability Raft consensus, and append-only Merkle evidence ledgers.
                </p>
              </div>
              <div className="mt-4" style={{ fontSize: "12px", color: "#666666", fontFamily: "monospace" }}>
                Node State: DETERMINISTIC · Zero-Trust Gateway
              </div>
            </Col>
            <Col xl={8} md={12}>
              <Row className={s.linksRow}>
                <Col md={4} sm={6} xs={12} className="mb-4 mb-md-0">
                  <h5 className={"text-white fw-bold text-uppercase mb-3"} style={{ fontSize: "13px", letterSpacing: "0.06em" }}>
                    Platform
                  </h5>
                  <Link href="/platform"><h6 className={`mb-2 ${s.navigationLink}`}>PQ Shield Gateway</h6></Link>
                  <Link href="/security"><h6 className={`mb-2 ${s.navigationLink}`}>Layered Defense Model</h6></Link>
                  <Link href="/post-quantum"><h6 className={`mb-2 ${s.navigationLink}`}>FIPS 203/204 Suite</h6></Link>
                  <Link href="/architecture"><h6 className={`mb-2 ${s.navigationLink}`}>Wire Protocol Specs</h6></Link>
                  <Link href="/topology"><h6 className={`mb-2 ${s.navigationLink}`}>Global Topology</h6></Link>
                </Col>
                <Col md={4} sm={6} xs={12} className="mb-4 mb-md-0">
                  <h5 className={"text-white fw-bold text-uppercase mb-3"} style={{ fontSize: "13px", letterSpacing: "0.06em" }}>
                    Research & Docs
                  </h5>
                  <Link href="/research"><h6 className={`mb-2 ${s.navigationLink}`}>Quantum Research Papers</h6></Link>
                  <Link href="/faq"><h6 className={`mb-2 ${s.navigationLink}`}>Technical Architecture FAQ</h6></Link>
                  <Link href="/architecture"><h6 className={`mb-2 ${s.navigationLink}`}>Control & Data Plane Flow</h6></Link>
                  <Link href="/security"><h6 className={`mb-2 ${s.navigationLink}`}>Merkle Evidence Ledger</h6></Link>
                </Col>
                <Col md={4} sm={6} xs={12}>
                  <h5 className={"text-white fw-bold text-uppercase mb-3"} style={{ fontSize: "13px", letterSpacing: "0.06em" }}>
                    Enterprise
                  </h5>
                  <Link href="/pricing"><h6 className={`mb-2 ${s.navigationLink}`}>Deployment Models</h6></Link>
                  <Link href="/contact"><h6 className={`mb-2 ${s.navigationLink}`}>CISO Ingress Inquiries</h6></Link>
                  <Link href="/login"><h6 className={`mb-2 ${s.navigationLink}`}>Control Plane Login</h6></Link>
                  <Link href="/contact"><h6 className={`mb-2 ${s.navigationLink}`}>Schedule Architecture Audit</h6></Link>
                </Col>
              </Row>
            </Col>
          </Row>
        </>
        <hr className={`${s.footer__hr} mb-0`} />
        <Row style={{ padding: "24px 0" }}>
          <Col sm={12} className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className={"text-muted mb-0"} style={{ fontSize: "13px" }}>
              © 2026 Vardhan Quantum Inc. All rights reserved. High-Assurance Cryptographic Infrastructure.
            </p>
            <div className="mt-2 mt-md-0" style={{ fontSize: "12px" }}>
              <span className="text-muted mr-3">NIST PQC Verified</span>
              <span className="text-muted mr-3">FIPS 203 / 204</span>
              <span className="text-muted">ISO/IEC 18033-4</span>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;

