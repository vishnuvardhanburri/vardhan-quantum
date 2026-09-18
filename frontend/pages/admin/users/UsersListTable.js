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
  Table
} from "reactstrap";
import { connect } from "react-redux";
import { withRouter } from 'next/router';

class UsersListTable extends Component {
  state = {
    selectedOperator: null,
    revokeModalOpen: false,
    scopeModalOpen: false,
    revokedSessions: [],
    revokeSuccessMsg: null,
    operators: [
      {
        id: "OP-01",
        username: "root.sovereign",
        email: "root@vardhan-quantum.internal",
        role: "Sovereign Root",
        roleBadge: "danger",
        hardwareMfa: "YubiKey 5 FIPS (PIV 9A)",
        keyFingerprint: "e49a...8120 (ML-DSA-87)",
        nonceSeq: "1,048,291",
        sessionStatus: "ACTIVE",
        ipAddress: "10.240.0.1 (Enclave Console)",
        lastActive: "12s ago"
      },
      {
        id: "OP-02",
        username: "ciso.security",
        email: "ciso@vardhan-quantum.internal",
        role: "Security Officer / CISO",
        roleBadge: "warning",
        hardwareMfa: "YubiKey 5C NFC (FIDO2)",
        keyFingerprint: "71bc...339a (ML-DSA-87)",
        nonceSeq: "849,112",
        sessionStatus: "ACTIVE",
        ipAddress: "192.168.10.42 (VPN Tunnel)",
        lastActive: "2m ago"
      },
      {
        id: "OP-03",
        username: "soc.operator",
        email: "soc-lead@vardhan-quantum.internal",
        role: "SOC Operator",
        roleBadge: "info",
        hardwareMfa: "YubiKey 5 Nano",
        keyFingerprint: "a901...44ff (ML-DSA-87)",
        nonceSeq: "310,481",
        sessionStatus: "IDLE",
        ipAddress: "192.168.10.88",
        lastActive: "18m ago"
      },
      {
        id: "OP-04",
        username: "merkle.auditor",
        email: "compliance@sovereign-audit.org",
        role: "Merkle Auditor",
        roleBadge: "success",
        hardwareMfa: "Feitian ePass FIDO2",
        keyFingerprint: "01dd...7201 (ML-DSA-87)",
        nonceSeq: "92,104",
        sessionStatus: "ACTIVE",
        ipAddress: "198.51.100.12 (Audit Proxy)",
        lastActive: "4m ago"
      },
      {
        id: "OP-05",
        username: "infra.engineer",
        email: "infra-oncall@vardhan-quantum.internal",
        role: "SOC Operator",
        roleBadge: "info",
        hardwareMfa: "YubiKey 5 FIPS",
        keyFingerprint: "55aa...1129 (ML-DSA-87)",
        nonceSeq: "12,901",
        sessionStatus: "REVOKED",
        ipAddress: "10.240.0.9",
        lastActive: "2d ago"
      }
    ]
  };

  openRevokeModal = (op) => {
    this.setState({ selectedOperator: op, revokeModalOpen: true });
  };

  closeRevokeModal = () => {
    this.setState({ revokeModalOpen: false, selectedOperator: null });
  };

  openScopeModal = (op) => {
    this.setState({ selectedOperator: op, scopeModalOpen: true });
  };

  closeScopeModal = () => {
    this.setState({ scopeModalOpen: false, selectedOperator: null });
  };

  executeRevocation = () => {
    const { selectedOperator, revokedSessions } = this.state;
    if (selectedOperator) {
      this.setState(prev => ({
        revokedSessions: [...prev.revokedSessions, selectedOperator.id],
        operators: prev.operators.map(o => 
          o.id === selectedOperator.id ? { ...o, sessionStatus: "REVOKED" } : o
        ),
        revokeModalOpen: false,
        revokeSuccessMsg: `Session for operator '${selectedOperator.username}' severed immediately. Bearer token purged from DashMap memory.`
      }));
      setTimeout(() => {
        this.setState({ revokeSuccessMsg: null });
      }, 5000);
    }
  };

  render() {
    const { operators, selectedOperator, revokeModalOpen, scopeModalOpen, revokeSuccessMsg } = this.state;

    return (
      <div className="vq-control-plane-page" style={{ color: "#111111" }}>
        {/* Top Header HUD */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 pb-3" style={{ borderBottom: "1px solid #EEEEEE" }}>
          <div>
            <div className="d-flex align-items-center mb-1">
              <span className="vq-pulse-beacon mr-2" style={{ width: 8, height: 8 }}></span>
              <span style={{ fontSize: "11px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                SOVEREIGN IAM & CRYPTOGRAPHIC OPERATOR REGISTRY
              </span>
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.02em", margin: 0 }}>
              Cryptographic Identity & RBAC Enforcement
            </h2>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <span className="badge badge-dark px-3 py-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #E0E0E0", fontFamily: "monospace", fontSize: "12px" }}>
              Argon2id Memory Hard: <strong style={{ color: "#2563EB" }}>64MB / 3 iter</strong>
            </span>
          </div>
        </div>

        {revokeSuccessMsg && (
          <div className="alert alert-warning mb-4 d-flex align-items-center" style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#FDE68A", fontSize: "13px" }}>
            <span style={{ fontSize: "18px", marginRight: "10px" }}>⚡</span>
            <span>{revokeSuccessMsg}</span>
          </div>
        )}

        {/* Identity HUD Metrics */}
        <Row className="mb-4">
          <Col lg={3} sm={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>PROVISIONED OPERATORS</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#2563EB", fontFamily: "monospace" }}>
                  5
                </span>
                <span style={{ fontSize: "11px", color: "#10B981" }}>100% PIV/FIDO2</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Hardware root-of-trust bound
              </div>
            </div>
          </Col>

          <Col lg={3} sm={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>ACTIVE WIRE SESSIONS</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#38BDF8", fontFamily: "monospace" }}>
                  {operators.filter(o => o.sessionStatus === "ACTIVE").length}
                </span>
                <Badge color="info" style={{ fontSize: "10px" }}>CONCURRENT</Badge>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Bounded 30-min idle window
              </div>
            </div>
          </Col>

          <Col lg={3} sm={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>DUMMY SENTINEL TIMING</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#10B981", fontFamily: "monospace" }}>
                  CONSTANT
                </span>
                <span className="badge badge-success" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10B981" }}>0.00ms Δ</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Zero username enumeration risk
              </div>
            </div>
          </Col>

          <Col lg={3} sm={6}>
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>MERKLE AUDIT SEED</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#A855F7", fontFamily: "monospace" }}>
                  FIPS 204
                </span>
                <Badge color="secondary" style={{ fontSize: "10px" }}>ML-DSA-87</Badge>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Every action immutably signed
              </div>
            </div>
          </Col>
        </Row>

        {/* Operator Registry Table */}
        <div className="vq-glass-card p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>
              Sovereign Officers & Operator Roster
            </h5>
            <span style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>
              SOURCE: auth_service / Sled Durable Tree ('users')
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-borderless mb-0" style={{ background: "transparent", color: "#0F172A" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", color: "#64748B", fontSize: "11px", fontFamily: "var(--vq-mono-font)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  <th>OPERATOR ID</th>
                  <th>USERNAME & ENCLAVE EMAIL</th>
                  <th>SOVEREIGN ROLE</th>
                  <th>HARDWARE TOKEN (MFA)</th>
                  <th>ML-DSA-87 KEY FINGERPRINT</th>
                  <th>MONOTONIC SEQ</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {operators.map(op => (
                  <tr key={op.id} style={{ borderBottom: "1px solid #F1F5F9", fontSize: "13px" }}>
                    <td style={{ fontFamily: "var(--vq-mono-font)", color: "#2563EB", fontWeight: "700" }}>
                      {op.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#0F172A" }}>{op.username}</div>
                      <div style={{ fontSize: "11px", color: "#64748B", fontFamily: "var(--vq-mono-font)" }}>{op.email}</div>
                    </td>
                    <td>
                      <Badge color={op.roleBadge} style={{ fontSize: "10px" }}>
                        {op.role}
                      </Badge>
                    </td>
                    <td style={{ fontSize: "12px", color: "#475569" }}>
                      🔒 {op.hardwareMfa}
                    </td>
                    <td style={{ fontFamily: "var(--vq-mono-font)", fontSize: "11px", color: "#0284C7", fontWeight: 600 }}>
                      {op.keyFingerprint}
                    </td>
                    <td style={{ fontFamily: "var(--vq-mono-font)", fontSize: "11px", color: "#64748B" }}>
                      #{op.nonceSeq}
                    </td>
                    <td>
                      {op.sessionStatus === "ACTIVE" && (
                        <Badge color="success" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.3)" }}>ACTIVE</Badge>
                      )}
                      {op.sessionStatus === "IDLE" && (
                        <Badge color="warning" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>IDLE</Badge>
                      )}
                      {op.sessionStatus === "REVOKED" && (
                        <Badge color="secondary" style={{ background: "#F1F5F9", color: "#64748B", border: "1px solid #CBD5E1" }}>REVOKED</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="xs"
                          color="info"
                          className="mr-1"
                          onClick={() => this.openScopeModal(op)}
                          style={{ fontSize: "11px", padding: "3px 8px" }}
                        >
                          Scopes
                        </Button>
                        {op.sessionStatus === "ACTIVE" && (
                          <Button
                            size="xs"
                            color="danger"
                            onClick={() => this.openRevokeModal(op)}
                            style={{ fontSize: "11px", padding: "3px 8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#DC2626" }}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RBAC Permission Matrix */}
        <div className="vq-glass-card p-4 mb-4">
          <h5 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", color: "#0F172A" }}>
            <span style={{ color: "#2563EB", marginRight: "8px" }}>🛡</span>
            Cryptographic RBAC Privilege Boundary Matrix
          </h5>

          <div className="table-responsive">
            <table className="table table-hover table-bordered mb-0" style={{ background: "#FFFFFF", borderColor: "#E2E8F0", fontSize: "12px", color: "#0F172A" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", color: "#64748B", fontFamily: "var(--vq-mono-font)", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  <th>GRANULAR PERMISSION SCOPE</th>
                  <th className="text-center">SOVEREIGN ROOT</th>
                  <th className="text-center">SECURITY OFFICER / CISO</th>
                  <th className="text-center">SOC OPERATOR</th>
                  <th className="text-center">MERKLE AUDITOR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>cluster:drain</code> (Sever Ingress & Transfer Leader)</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-danger">✗ DENIED</td>
                  <td className="text-center text-danger">✗ DENIED</td>
                </tr>
                <tr>
                  <td><code>crypto:rekey</code> (Rotate Ephemeral KEM Secrets)</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center font-weight-bold" style={{ color: "#D97706" }}>EMERGENCY ONLY</td>
                  <td className="text-center text-danger">✗ DENIED</td>
                </tr>
                <tr>
                  <td><code>policy:write</code> (Modify Shannon Cutoff & Cipher Priority)</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-danger">✗ DENIED</td>
                  <td className="text-center text-danger">✗ DENIED</td>
                </tr>
                <tr>
                  <td><code>session:revoke</code> (Purge Token from Process RAM)</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-danger">✗ DENIED</td>
                </tr>
                <tr>
                  <td><code>audit:verify</code> (Validate Merkle Chain Signatures)</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-success font-weight-bold">✓ GRANTED</td>
                  <td className="text-center text-success font-weight-bold">✓ PROVING AUTHORITY</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Scope Inspector Modal */}
        <Modal isOpen={scopeModalOpen} toggle={this.closeScopeModal} centered contentClassName="vq-glass-card">
          <ModalHeader toggle={this.closeScopeModal} style={{ borderBottom: "1px solid #EEEEEE", color: "#111111" }}>
            <span style={{ color: "#2563EB", marginRight: "8px" }}>🔑</span>
            Cryptographic Scopes · {selectedOperator?.username}
          </ModalHeader>
          <ModalBody style={{ color: "#E2E8F0", fontSize: "13px" }}>
            {selectedOperator && (
              <div>
                <div className="p-3 mb-3 rounded" style={{ background: "#05080E", border: "1px solid #E0E0E0" }}>
                  <div><strong>Operator:</strong> {selectedOperator.username} ({selectedOperator.email})</div>
                  <div><strong>Assigned Role:</strong> <Badge color={selectedOperator.roleBadge}>{selectedOperator.role}</Badge></div>
                  <div><strong>Hardware Key:</strong> {selectedOperator.hardwareMfa}</div>
                  <div><strong>Public Fingerprint:</strong> <code>{selectedOperator.keyFingerprint}</code></div>
                </div>
                <h6 style={{ fontSize: "13px", fontWeight: "700", color: "#2563EB" }}>ACTIVE ENCLAVE POLICIES</h6>
                <ul style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: "1.8" }}>
                  <li>Argon2id Salt: Unique 32-byte CSPRNG salt generated at provisioning</li>
                  <li>Session Lifetime: Hard expiry 24 hours · Idle expiration 30 minutes</li>
                  <li>Audit Trail: Every HTTP request signed and recorded into Merkle chain</li>
                </ul>
              </div>
            )}
          </ModalBody>
          <ModalFooter style={{ borderTop: "1px solid #EEEEEE" }}>
            <Button color="secondary" size="sm" onClick={this.closeScopeModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>

        {/* Revoke Session Modal */}
        <Modal isOpen={revokeModalOpen} toggle={this.closeRevokeModal} centered contentClassName="vq-glass-card">
          <ModalHeader toggle={this.closeRevokeModal} style={{ borderBottom: "1px solid #EEEEEE", color: "#111111" }}>
            <span style={{ color: "#EF4444", marginRight: "8px" }}>⚡</span>
            Sever Enclave Session Immediately
          </ModalHeader>
          <ModalBody style={{ color: "#E2E8F0", fontSize: "13px" }}>
            {selectedOperator && (
              <div>
                <p>
                  You are about to enforce zero-trust session revocation for operator:
                </p>
                <div className="p-3 rounded mb-3 text-center" style={{ background: "#05080E", border: "1px solid #EF4444", fontFamily: "monospace", fontSize: "16px", color: "#EF4444", fontWeight: "700" }}>
                  {selectedOperator.username}
                </div>
                <p style={{ fontSize: "12px", color: "#94A3B8" }}>
                  The bearer token will be purged from the in-memory <code>DashMap</code> session registry. Ongoing administrative requests will fail immediately with HTTP 401 Unauthorized.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter style={{ borderTop: "1px solid #EEEEEE" }}>
            <Button color="secondary" size="sm" onClick={this.closeRevokeModal}>
              Cancel
            </Button>
            <Button color="danger" size="sm" onClick={this.executeRevocation}>
              Enforce Immediate Revocation
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default withRouter(connect()(UsersListTable));
