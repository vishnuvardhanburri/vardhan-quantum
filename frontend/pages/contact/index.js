import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import Head from "next/head";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    deploymentType: "Dedicated Sovereign",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#111111", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Head>
        <title>Enterprise Security Ingress | Vardhan Quantum</title>
        <meta name="description" content="Request enterprise architecture briefing or post-quantum ingress assessment." />
      </Head>

      <section style={{ padding: "100px 0 60px", borderBottom: "1px solid #EEEEEE", background: "radial-gradient(ellipse at top, rgba(37, 99, 235, 0.12) 0%, rgba(0, 0, 0, 0) 70%)" }}>
        <Container>
          <div className="text-center">
            <div style={{ fontSize: "12px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
              CONFIDENTIAL ENGAGEMENT
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: "800", marginTop: "12px", letterSpacing: "-0.02em", color: "#111111" }}>
              Enterprise Security Ingress & CISO Briefings
            </h1>
            <p style={{ color: "#666666", maxWidth: "700px", margin: "16px auto 0", fontSize: "16px", lineHeight: "1.6" }}>
              Direct technical evaluation channel for Chief Information Security Officers, Principal Cryptographers, and Sovereign Infrastructure Engineers.
            </p>
          </div>
        </Container>
      </section>

      <section style={{ padding: "80px 0" }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <div style={{
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                borderRadius: "16px",
                padding: "40px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
              }}>
                {submitted ? (
                  <div className="text-center py-5">
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "rgba(37, 99, 235, 0.12)",
                      border: "2px solid #2563EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      color: "#2563EB",
                      fontSize: "28px",
                      fontWeight: "700",
                      boxShadow: "0 0 20px rgba(37, 99, 235, 0.12)"
                    }}>
                      ✓
                    </div>
                    <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#111111" }}>Briefing Request Transmitted</h3>
                    <p style={{ color: "#666666", maxWidth: "500px", margin: "12px auto 24px", fontSize: "14px", lineHeight: "1.7" }}>
                      Your inquiry has been encrypted and routed to our Senior Cryptographic Architecture team. A cryptographic engineer will respond within 4 business hours via secure communication.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn btn-outline-light btn-sm px-4 py-2 font-weight-bold"
                      style={{ borderRadius: "6px", fontSize: "12px" }}
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label className="font-weight-bold" style={{ fontSize: "13px", color: "#111111" }}>Principal Contact Name</Label>
                          <Input
                            type="text"
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Dr. Jane Doe"
                            style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#111111", borderRadius: "8px", height: "46px" }}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label className="font-weight-bold" style={{ fontSize: "13px", color: "#111111" }}>Enterprise / Government Organization</Label>
                          <Input
                            type="text"
                            required
                            value={form.organization}
                            onChange={e => setForm({ ...form, organization: e.target.value })}
                            placeholder="National Critical Infrastructure Agency"
                            style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#111111", borderRadius: "8px", height: "46px" }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label className="font-weight-bold" style={{ fontSize: "13px", color: "#111111" }}>Official Enterprise Email</Label>
                          <Input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="ciso@organization.gov"
                            style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#111111", borderRadius: "8px", height: "46px" }}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label className="font-weight-bold" style={{ fontSize: "13px", color: "#111111" }}>Target Deployment Architecture</Label>
                          <Input
                            type="select"
                            value={form.deploymentType}
                            onChange={e => setForm({ ...form, deploymentType: e.target.value })}
                            style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#111111", borderRadius: "8px", height: "46px" }}
                          >
                            <option value="Dedicated Sovereign">Dedicated Sovereign (Air-gapped / Bare-metal)</option>
                            <option value="Multi-Region Quorum">Multi-Region Quorum (£15M–£25M+ Annual Tier)</option>
                            <option value="Private Cloud Enclave">Private Cloud Enclave (AWS / GCP / Azure VPC)</option>
                            <option value="Cryptographic Audit">Cryptographic Protocol & Codebase Audit</option>
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup>
                      <Label className="font-weight-bold" style={{ fontSize: "13px", color: "#111111" }}>Technical Requirements & Threat Model</Label>
                      <Input
                        type="textarea"
                        rows={4}
                        required
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        placeholder="Detail your throughput requirements, KMS/HSM architecture, quantum harvest threat horizon, and required compliance frameworks..."
                        style={{ background: "#050505", border: "1px solid #E0E0E0", color: "#111111", borderRadius: "8px" }}
                      />
                    </FormGroup>

                    <div className="text-right mt-4">
                      <Button
                        type="submit"
                        className="px-5 py-3 font-weight-bold text-uppercase"
                        style={{
                          background: "#2563EB",
                          border: "none",
                          borderRadius: "8px",
                          color: "#000000",
                          fontSize: "13px",
                          letterSpacing: "0.06em",
                          boxShadow: "0 0 15px rgba(37, 99, 235, 0.12)"
                        }}
                      >
                        Transmit Ingress Inquiry
                      </Button>
                    </div>
                  </Form>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}
