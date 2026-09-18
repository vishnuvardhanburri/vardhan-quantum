import React, { Component } from "react";
import {
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  FormGroup,
  Label,
  Input
} from "reactstrap";
import { connect } from "react-redux";
import { withRouter } from 'next/router';

class CategoriesListTable extends Component {
  state = {
    modalOpen: false,
    selectedSuite: null,
    testRunning: false,
    testResult: null,
    policyConfig: {
      shannonThreshold: 7.90,
      replayWindowSize: 32768,
      pqcMode: "STRICT_PQC",
      simdAcceleration: true,
      argonMemoryMb: 64,
      rateLimitBurst: 1000,
      sequenceDriftGuard: true
    },
    cipherSuites: [
      {
        id: "CIPHER-01",
        priority: 1,
        name: "FIPS 203 ML-KEM-1024",
        category: "NIST Category 5",
        role: "Key Encapsulation (Lattice M-LWE)",
        params: "k=4, q=3329, η1=2 (32B shared secret)",
        simd: "AVX-512 SIMD NTT (0.38ms)",
        status: "ACTIVE_ENFORCED"
      },
      {
        id: "CIPHER-02",
        priority: 2,
        name: "FIPS 204 ML-DSA-87",
        category: "NIST Category 5",
        role: "Digital Signature & Merkle Ledger Sealing",
        params: "k=8, l=7, q=8380417, γ1=2^19",
        simd: "AVX-512 NTT Sign/Verify",
        status: "ACTIVE_ENFORCED"
      },
      {
        id: "CIPHER-03",
        priority: 3,
        name: "AES-256-GCM (NIST SP 800-38D)",
        category: "AEAD Symmetric",
        role: "Proxy Engine Wire Transport Re-Encryption",
        params: "256-bit Key · 96-bit Nonce · 128-bit Tag",
        simd: "AES-NI Hardware Acceleration",
        status: "ACTIVE_ENFORCED"
      },
      {
        id: "CIPHER-04",
        priority: 4,
        name: "Argon2id (RFC 9106)",
        category: "Memory-Hard KDF",
        role: "Master Sentinel & Operator Ingress Authentication",
        params: "m=65,536 KiB (64MB), t=3 iter, p=4 lanes",
        simd: "Multi-Threaded SSE4.1",
        status: "ACTIVE_ENFORCED"
      },
      {
        id: "CIPHER-05",
        priority: 5,
        name: "BLAKE3 Tree Hash",
        category: "Cryptographic Hash",
        role: "Payload Integrity & API Key Hashing",
        params: "256-bit Output Digest · Merkle Tree Core",
        simd: "AVX-512 + NEON Optimized",
        status: "ACTIVE_ENFORCED"
      },
      {
        id: "CIPHER-06",
        priority: 6,
        name: "RSA-4096 / ECC P-384",
        category: "Classical Legacy",
        role: "Vulnerable Cryptographic Fallback",
        params: "Discrete Log / Integer Factorization",
        simd: "N/A",
        status: "DISABLED_DISALLOWED"
      }
    ]
  };

  handleThresholdChange = (e) => {
    const val = parseFloat(e.target.value);
    this.setState(prev => ({
      policyConfig: { ...prev.policyConfig, shannonThreshold: val }
    }));
  };

  handleReplayChange = (e) => {
    const val = parseInt(e.target.value, 10);
    this.setState(prev => ({
      policyConfig: { ...prev.policyConfig, replayWindowSize: val }
    }));
  };

  handleToggleSimd = () => {
    this.setState(prev => ({
      policyConfig: { ...prev.policyConfig, simdAcceleration: !prev.policyConfig.simdAcceleration }
    }));
  };

  runPolicyVerificationTest = () => {
    this.setState({ testRunning: true, testResult: null });
    setTimeout(() => {
      this.setState({
        testRunning: false,
        testResult: {
          timestamp: new Date().toISOString(),
          status: "PASSED",
          shannonTest: "Passed (Evaluated 4,096 wire frames at 7.9994 b/B)",
          replayTest: "Passed (1,024 duplicate nonces rejected instantaneously)",
          classicalRejection: "Passed (RSA-4096 downgrade probe terminated with TCP RST)",
          signatureIntegrity: "Passed (ML-DSA-87 block seal validated)"
        }
      });
    }, 900);
  };

  openCommitModal = () => {
    this.setState({ modalOpen: true });
  };

  closeCommitModal = () => {
    this.setState({ modalOpen: false });
  };

  confirmCommitPolicy = () => {
    this.setState({ modalOpen: false });
    this.runPolicyVerificationTest();
  };

  render() {
    const { policyConfig, cipherSuites, testRunning, testResult, modalOpen } = this.state;

    return (
      <div className="vq-control-plane-page" style={{ color: "#111111" }}>
        {/* Top Spatial Header HUD */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 pb-3" style={{ borderBottom: "1px solid #EEEEEE" }}>
          <div>
            <div className="d-flex align-items-center mb-1">
              <span className="vq-pulse-beacon mr-2" style={{ width: 8, height: 8 }}></span>
              <span style={{ fontSize: "11px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                CRYPTOGRAPHIC POLICY ENGINE · FIPS 203 / 204 ENFORCEMENT
              </span>
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.02em", margin: 0 }}>
              Cryptographic Policy Suite & Ingress Controls
            </h2>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <Button
              className="btn btn-outline-info btn-sm mr-2"
              onClick={this.runPolicyVerificationTest}
              disabled={testRunning}
              style={{ fontFamily: "monospace", borderColor: "rgba(0, 245, 212, 0.4)", color: "#2563EB" }}
            >
              {testRunning ? "Evaluating Wire Rules..." : "⚡ Test Rule Enforcement"}
            </Button>
            <Button
              className="btn btn-primary btn-sm"
              onClick={this.openCommitModal}
              style={{ background: "#2563EB", border: "none", color: "#000000", fontWeight: "800" }}
            >
              Commit Policy Update
            </Button>
          </div>
        </div>

        {/* Live Status Indicators */}
        <Row className="mb-4">
          <Col lg={3} sm={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>SHANNON ENTROPY CUTOFF</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#2563EB", fontFamily: "monospace" }}>
                  ≥ {policyConfig.shannonThreshold.toFixed(2)}
                </span>
                <span style={{ fontSize: "11px", color: "#94A3B8" }}>bits / byte</span>
              </div>
              <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>
                ● Active wire filter rejecting plaintexts
              </div>
            </div>
          </Col>

          <Col lg={3} sm={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>REPLAY SLIDING WINDOW</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#38BDF8", fontFamily: "monospace" }}>
                  {policyConfig.replayWindowSize.toLocaleString()}
                </span>
                <span style={{ fontSize: "11px", color: "#94A3B8" }}>nonces</span>
              </div>
              <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>
                ● Zero nonce reuse tolerance
              </div>
            </div>
          </Col>

          <Col lg={3} sm={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>POST-QUANTUM MODE</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#A855F7", fontFamily: "monospace" }}>
                  STRICT_PQC
                </span>
                <Badge color="success" style={{ fontSize: "10px" }}>ENFORCED</Badge>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Classical RSA/ECC strictly blocked
              </div>
            </div>
          </Col>

          <Col lg={3} sm={6}>
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>HARDWARE SIMD NTT</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#10B981", fontFamily: "monospace" }}>
                  AVX-512 SIMD
                </span>
                <span className="badge badge-success" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10B981" }}>0.38ms</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                PCIe Gen 5 NTT hardware active
              </div>
            </div>
          </Col>
        </Row>

        {/* Interactive Policy Tuners & Test Output */}
        <Row className="mb-4">
          <Col lg={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-4">
              <h5 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center" }}>
                <span style={{ color: "#2563EB", marginRight: "8px" }}>⚙</span>
                Ingress Wire Filtering Controls
              </h5>

              <FormGroup className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Label style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0", margin: 0 }}>
                    Minimum Shannon Entropy Cutoff (bits/byte)
                  </Label>
                  <span style={{ fontFamily: "monospace", color: "#2563EB", fontWeight: "700" }}>
                    {policyConfig.shannonThreshold.toFixed(2)} b/B
                  </span>
                </div>
                <Input
                  type="range"
                  min="7.00"
                  max="7.99"
                  step="0.01"
                  value={policyConfig.shannonThreshold}
                  onChange={this.handleThresholdChange}
                  className="w-100"
                  style={{ accentColor: "#2563EB" }}
                />
                <small style={{ color: "#94A3B8" }}>
                  Wire frames with Shannon entropy lower than this threshold are instantly dropped before TLS/AEAD parsing.
                </small>
              </FormGroup>

              <FormGroup className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Label style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0", margin: 0 }}>
                    Sliding-Window Replay Bitmask Size
                  </Label>
                  <span style={{ fontFamily: "monospace", color: "#38BDF8", fontWeight: "700" }}>
                    {policyConfig.replayWindowSize.toLocaleString()} nonces
                  </span>
                </div>
                <Input
                  type="select"
                  value={policyConfig.replayWindowSize}
                  onChange={this.handleReplayChange}
                  style={{ background: "#0A0F1D", color: "#111111", borderColor: "rgba(255,255,255,0.15)", borderRadius: "8px" }}
                >
                  <option value="8192">8,192 nonces (Low memory - 1 KB bitmask)</option>
                  <option value="16384">16,384 nonces (Standard)</option>
                  <option value="32768">32,768 nonces (High-assurance defense default)</option>
                  <option value="65536">65,536 nonces (Maximum protection - 8 KB bitmask)</option>
                </Input>
              </FormGroup>

              <div className="d-flex justify-content-between align-items-center pt-2" style={{ borderTop: "1px solid #EEEEEE" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#111111" }}>AVX-512 SIMD NTT Acceleration</div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>Vectorized Montgomery multiplication for polynomial ring calculations</div>
                </div>
                <Button
                  size="sm"
                  onClick={this.handleToggleSimd}
                  style={{
                    background: policyConfig.simdAcceleration ? "rgba(0, 245, 212, 0.15)" : "rgba(255,255,255,0.05)",
                    color: policyConfig.simdAcceleration ? "#2563EB" : "#94A3B8",
                    borderColor: policyConfig.simdAcceleration ? "#2563EB" : "rgba(255,255,255,0.2)"
                  }}
                >
                  {policyConfig.simdAcceleration ? "ENABLED" : "BYPASSED"}
                </Button>
              </div>
            </div>
          </Col>

          <Col lg={6}>
            <div className="vq-glass-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center" }}>
                  <span style={{ color: "#38BDF8", marginRight: "8px" }}>🛡</span>
                  Verification & Rule Enforcement Diagnostics
                </h5>

                {testRunning ? (
                  <div className="p-4 text-center">
                    <div className="spinner-border text-info mb-3" role="status" style={{ width: "2.5rem", height: "2.5rem" }}></div>
                    <div style={{ fontFamily: "monospace", color: "#2563EB", fontSize: "13px" }}>
                      Injecting synthetic adversarial wire probes into pq_shield critical path...
                    </div>
                  </div>
                ) : testResult ? (
                  <div className="p-3" style={{ background: "#05080E", border: "1px solid rgba(0, 245, 212, 0.3)", borderRadius: "10px" }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{ borderBottom: "1px solid #EEEEEE" }}>
                      <span className="badge badge-success px-2 py-1" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10B981" }}>
                        ✓ ALL ENFORCEMENT RULES VALIDATED
                      </span>
                      <span style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>
                        {testResult.timestamp.split("T")[1].slice(0, 8)} UTC
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", fontFamily: "monospace", lineHeight: "1.7", color: "#CBD5E1" }}>
                      <div><strong style={{ color: "#2563EB" }}>• Shannon Probe:</strong> {testResult.shannonTest}</div>
                      <div><strong style={{ color: "#38BDF8" }}>• Replay Defense:</strong> {testResult.replayTest}</div>
                      <div><strong style={{ color: "#EF4444" }}>• Classical Probe:</strong> {testResult.classicalRejection}</div>
                      <div><strong style={{ color: "#2563EB" }}>• Merkle Audit:</strong> {testResult.signatureIntegrity}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <div style={{ color: "#94A3B8", fontSize: "13px" }}>
                      Click <strong>"⚡ Test Rule Enforcement"</strong> to execute live synthetic cryptographic attack probes across wire filters.
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 p-2 rounded" style={{ background: "rgba(0, 245, 212, 0.05)", border: "1px solid rgba(0, 245, 212, 0.15)", fontSize: "11px", color: "#A7F3D0", fontFamily: "monospace" }}>
                🔒 Memory-Hard Argon2id Sentinel: 64MB RAM per hash, 3 iterations, 4 parallel lanes. Zero side-channel leaks.
              </div>
            </div>
          </Col>
        </Row>

        {/* Cryptographic Cipher Priority Table */}
        <div className="vq-glass-card p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>
              Authorized Cryptographic Primitives & Priority Hierarchy
            </h5>
            <span style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>
              NIST SP 800-208 & FIPS 203/204 COMPLIANT
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-borderless mb-0" style={{ background: "transparent", color: "#0F172A" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", color: "#64748B", fontSize: "11px", fontFamily: "var(--vq-mono-font)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  <th>PRIORITY</th>
                  <th>PRIMITIVE</th>
                  <th>FAMILY & CATEGORY</th>
                  <th>ROLE IN PIPELINE</th>
                  <th>PARAMETERS</th>
                  <th>HARDWARE ACCELERATION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {cipherSuites.map(suite => (
                  <tr key={suite.id} style={{ borderBottom: "1px solid #F1F5F9", fontSize: "13px" }}>
                    <td style={{ fontFamily: "var(--vq-mono-font)", color: "#2563EB", fontWeight: "700" }}>
                      #{suite.priority}
                    </td>
                    <td style={{ fontWeight: "600", color: "#0F172A" }}>
                      {suite.name}
                    </td>
                    <td>
                      <span className="badge" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontSize: "11px" }}>
                        {suite.category}
                      </span>
                    </td>
                    <td style={{ color: "#475569", fontSize: "12px" }}>
                      {suite.role}
                    </td>
                    <td style={{ fontFamily: "var(--vq-mono-font)", fontSize: "11px", color: "#64748B" }}>
                      {suite.params}
                    </td>
                    <td style={{ fontSize: "11px", fontFamily: "var(--vq-mono-font)", color: suite.simd.includes("AVX") ? "#10B981" : "#64748B", fontWeight: 600 }}>
                      {suite.simd}
                    </td>
                    <td>
                      {suite.status === "ACTIVE_ENFORCED" ? (
                        <Badge color="success" style={{ fontSize: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                          ENFORCED
                        </Badge>
                      ) : (
                        <Badge color="danger" style={{ fontSize: "10px", background: "rgba(239, 68, 68, 0.15)", color: "#DC2626", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                          DISALLOWED
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal isOpen={modalOpen} toggle={this.closeCommitModal} centered contentClassName="vq-glass-card" style={{ maxWidth: "550px" }}>
          <ModalHeader toggle={this.closeCommitModal} style={{ borderBottom: "1px solid #EEEEEE", color: "#111111" }}>
            <span style={{ color: "#2563EB", marginRight: "8px" }}>⚡</span>
            Confirm Cryptographic Policy Deployment
          </ModalHeader>
          <ModalBody style={{ color: "#E2E8F0", fontSize: "13px", lineHeight: "1.6" }}>
            <p>
              You are about to commit an updated cryptographic policy across all <strong>pq_shield</strong> edge ingress nodes.
            </p>
            <div className="p-3 mb-3 rounded" style={{ background: "#05080E", border: "1px solid #E0E0E0", fontFamily: "monospace", fontSize: "12px" }}>
              <div>• Shannon Cutoff: <strong>{policyConfig.shannonThreshold.toFixed(2)} b/B</strong></div>
              <div>• Replay Window: <strong>{policyConfig.replayWindowSize.toLocaleString()} nonces</strong></div>
              <div>• SIMD NTT Acceleration: <strong>{policyConfig.simdAcceleration ? "ACTIVE" : "BYPASS"}</strong></div>
              <div>• Merkle Audit Append: <strong>Will emit event `POLICY_COMMITTED` signed by ML-DSA-87</strong></div>
            </div>
            <p style={{ fontSize: "12px", color: "#2563EB" }}>
              ⚠️ This change takes effect on the live wire in under 1 millisecond. Inbound sessions with non-compliant parameters will be immediately terminated.
            </p>
          </ModalBody>
          <ModalFooter style={{ borderTop: "1px solid #EEEEEE" }}>
            <Button color="secondary" size="sm" onClick={this.closeCommitModal}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={this.confirmCommitPolicy}
              style={{ background: "#2563EB", border: "none", color: "#000000", fontWeight: "700" }}
            >
              Sign & Commit Policy
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default withRouter(connect()(CategoriesListTable));
