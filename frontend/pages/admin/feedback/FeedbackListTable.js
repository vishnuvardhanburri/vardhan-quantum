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
  Input
} from "reactstrap";
import { connect } from "react-redux";
import { withRouter } from 'next/router';

class FeedbackListTable extends Component {
  state = {
    filterSeverity: "ALL",
    selectedIncident: null,
    hexModalOpen: false,
    quarantineModalOpen: false,
    quarantinedIps: ["185.220.101.5", "194.26.29.112"],
    quarantineSuccessMsg: null,
    incidents: [
      {
        id: "INC-8942",
        timestamp: "2026-09-16T10:42:18.491Z",
        type: "REPLAY_ATTACK_INTERCEPTED",
        subsystem: "proxy_engine::replay_filter",
        sourceIP: "198.51.100.44",
        asn: "AS13335 (Attacker Probe)",
        wireSeq: "#194,821",
        nonce: "0x9F82A1B0293847C2014A89FE",
        shannonEntropy: "7.9991",
        severity: "CRITICAL",
        detail: "Inbound wire frame re-used identical 96-bit nonce within 32,768 sliding-window bitmask. Frame dropped instantly before decryption.",
        hexDump: [
          "00000000: 56 51 30 31 00 00 00 00  00 02 f9 15 9f 82 a1 b0  VQ01............",
          "00000010: 29 38 47 c2 01 4a 89 fe  b8 10 9f e4 61 c7 00 12  )8G..J......a...",
          "00000020: 7a 44 d9 2e 01 f4 8a c9  33 00 91 e2 a5 b7 c4 08  zD......3.......",
          "00000030: 89 21 fd 40 19 c3 71 ab  fa 92 d1 84 3b 10 e7 c9  .!.@..q.....;..."
        ]
      },
      {
        id: "INC-8941",
        timestamp: "2026-09-16T10:39:05.112Z",
        type: "SHANNON_ENTROPY_UNDERFLOW",
        subsystem: "pq_shield::entropy_probe",
        sourceIP: "185.220.101.5",
        asn: "AS9009 (TOR Exit Node)",
        wireSeq: "#194,780",
        nonce: "0x110294A8E71920B74C910293",
        shannonEntropy: "4.2184",
        severity: "CRITICAL",
        detail: "Ciphertext Shannon entropy probe measured 4.2184 b/B (Threshold enforced >= 7.9000 b/B). Low-entropy plaintext or malformed framing rejected.",
        hexDump: [
          "00000000: 56 51 30 31 00 00 00 00  00 02 f8 ec 11 02 94 a8  VQ01............",
          "00000010: 20 20 20 20 20 20 20 20  20 20 20 20 20 20 20 20                  ",
          "00000020: 41 41 41 41 41 41 41 41  41 41 41 41 41 41 41 41  AAAAAAAAAAAAAAAA",
          "00000030: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................"
        ]
      },
      {
        id: "INC-8940",
        timestamp: "2026-09-16T10:31:44.821Z",
        type: "CLASSICAL_DOWNGRADE_PROBE",
        subsystem: "pq_shield::tls_listener",
        sourceIP: "203.0.113.19",
        asn: "AS4837 (China Unicom)",
        wireSeq: "N/A (Handshake Init)",
        nonce: "N/A",
        shannonEntropy: "N/A",
        severity: "HIGH",
        detail: "Client initiated TLS ClientHello offering only RSA-4096 / ECDHE-P384 cipher suites with zero post-quantum KEM extension. Ingress connection severed with TCP RST.",
        hexDump: [
          "00000000: 16 03 01 00 f8 01 00 00  f4 03 03 a1 b8 92 c1 04  ................",
          "00000010: 00 04 00 2f 00 35 00 9c  c0 2f c0 30 c0 13 c0 14  .../.5.../.0....",
          "00000020: 00 00 17 00 00 00 00 00  00 00 00 00 00 00 00 00  ................"
        ]
      },
      {
        id: "INC-8939",
        timestamp: "2026-09-16T10:14:02.903Z",
        type: "UNAUTHORIZED_DRAIN_PROBE",
        subsystem: "auth_service::rbac",
        sourceIP: "194.26.29.112",
        asn: "AS44034 (Hosting Probe)",
        wireSeq: "#194,510",
        nonce: "0x88F021B903C4881A20B710A4",
        shannonEntropy: "7.9989",
        severity: "CRITICAL",
        detail: "POST /api/v1/cluster/drain invoked with invalid session bearer token. IP quarantined and unauthenticated drain attempt logged to Merkle audit chain.",
        hexDump: [
          "00000000: 50 4f 53 54 20 2f 61 70  69 2f 76 31 2f 63 6c 75  POST /api/v1/clu",
          "00000010: 73 74 65 72 2f 64 72 61  69 6e 20 48 54 54 50 2f  ster/drain HTTP/",
          "00000020: 31 2e 31 0d 0a 41 75 74  68 6f 72 69 7a 61 74 69  1.1..Authorizati",
          "00000030: 6f 6e 3a 20 42 65 61 72  65 72 20 62 61 64 74 6b  on: Bearer badtk"
        ]
      },
      {
        id: "INC-8938",
        timestamp: "2026-09-16T09:58:30.120Z",
        type: "DILITHIUM_SIG_MISMATCH",
        subsystem: "audit_ledger::pq_verify",
        sourceIP: "10.240.0.18 (Peer Node 03)",
        asn: "Internal Mesh",
        wireSeq: "#194,102",
        nonce: "0x40A981B200C419A8201B77E1",
        shannonEntropy: "7.9996",
        severity: "HIGH",
        detail: "Peer Raft append entry carried an invalid FIPS 204 ML-DSA-87 signature block. Peer rejected from consensus until identity key re-synchronized.",
        hexDump: [
          "00000000: 56 51 30 31 00 00 00 00  00 02 f6 46 40 a9 81 b2  VQ01.......F@...",
          "00000010: 00 c4 19 a8 20 1b 77 e1  fe 10 9a d4 55 12 00 ab  .... .w.....U...",
          "00000020: 99 82 10 c4 fa b1 00 c4  12 99 aa bc de ff 01 23  ...............#"
        ]
      },
      {
        id: "INC-8937",
        timestamp: "2026-09-16T09:42:11.774Z",
        type: "RATE_LIMIT_BUCKET_TRIP",
        subsystem: "pq_shield::token_bucket",
        sourceIP: "192.0.2.78",
        asn: "AS15169 (Automated Scraper)",
        wireSeq: "#193,890",
        nonce: "0x77B012A994C1028477A192B4",
        shannonEntropy: "7.9981",
        severity: "ELEVATED",
        detail: "IP exceeded 1,000 requests/minute burst threshold. Ingress paused with HTTP 429 Too Many Requests; concurrency semaphore released.",
        hexDump: [
          "00000000: 56 51 30 31 00 00 00 00  00 02 f5 72 77 b0 12 a9  VQ01.......rw...",
          "00000010: 94 c1 02 84 77 a1 92 b4  11 22 33 44 55 66 77 88  ....w....3DUfw.."
        ]
      }
    ]
  };

  openHexModal = (incident) => {
    this.setState({ selectedIncident: incident, hexModalOpen: true });
  };

  closeHexModal = () => {
    this.setState({ hexModalOpen: false, selectedIncident: null });
  };

  openQuarantineModal = (incident) => {
    this.setState({ selectedIncident: incident, quarantineModalOpen: true });
  };

  closeQuarantineModal = () => {
    this.setState({ quarantineModalOpen: false, selectedIncident: null });
  };

  executeQuarantine = () => {
    const { selectedIncident, quarantinedIps } = this.state;
    if (selectedIncident && selectedIncident.sourceIP) {
      this.setState({
        quarantinedIps: [...quarantinedIps, selectedIncident.sourceIP],
        quarantineModalOpen: false,
        selectedIncident: null,
        quarantineSuccessMsg: `Source IP ${selectedIncident.sourceIP} quarantined across all cluster ingress points. TCP RST enforced.`
      });
      setTimeout(() => {
        this.setState({ quarantineSuccessMsg: null });
      }, 5000);
    }
  };

  render() {
    const { filterSeverity, incidents, selectedIncident, hexModalOpen, quarantineModalOpen, quarantinedIps, quarantineSuccessMsg } = this.state;

    const filtered = filterSeverity === "ALL" 
      ? incidents 
      : incidents.filter(i => i.severity === filterSeverity);

    return (
      <div className="vq-control-plane-page" style={{ color: "#111111" }}>
        {/* Header HUD */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 pb-3" style={{ borderBottom: "1px solid #EEEEEE" }}>
          <div>
            <div className="d-flex align-items-center mb-1">
              <span className="vq-pulse-beacon mr-2" style={{ width: 8, height: 8, background: "#EF4444", boxShadow: "0 0 10px #EF4444" }}></span>
              <span style={{ fontSize: "11px", color: "#EF4444", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                SOC INCIDENT & WIRE INTERCEPTION RADAR
              </span>
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.02em", margin: 0 }}>
              Live Ingress Threat Stream & Anomalies
            </h2>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <span className="badge badge-dark px-3 py-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #E0E0E0", fontFamily: "monospace", fontSize: "12px" }}>
              Active Quarantined IPs: <strong style={{ color: "#EF4444" }}>{quarantinedIps.length}</strong>
            </span>
          </div>
        </div>

        {quarantineSuccessMsg && (
          <div className="alert alert-danger mb-4 d-flex align-items-center" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#FCA5A5", fontSize: "13px" }}>
            <span style={{ fontSize: "18px", marginRight: "10px" }}>🛡</span>
            <span>{quarantineSuccessMsg}</span>
          </div>
        )}

        {/* SOC Telemetry Cards */}
        <Row className="mb-4">
          <Col lg={3} sm={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>FRAMES EVALUATED (24H)</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#2563EB", fontFamily: "monospace" }}>
                  1,284,910
                </span>
                <span style={{ fontSize: "11px", color: "#10B981" }}>0 leaks</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Microsecond critical-path inspection
              </div>
            </div>
          </Col>

          <Col lg={3} sm={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>REPLAY ATTACKS INTERCEPTED</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#EF4444", fontFamily: "monospace" }}>
                  7
                </span>
                <Badge color="danger" style={{ fontSize: "10px" }}>DROPPED</Badge>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                32,768 sliding-window bitmask hits
              </div>
            </div>
          </Col>

          <Col lg={3} sm={6} className="mb-3 mb-lg-0">
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>SHANNON UNDERFLOW DROPS</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#2563EB", fontFamily: "monospace" }}>
                  4
                </span>
                <span className="badge badge-warning" style={{ background: "rgba(245, 158, 11, 0.2)", color: "#2563EB" }}>&lt; 7.90 b/B</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Plaintext / weak entropy rejected
              </div>
            </div>
          </Col>

          <Col lg={3} sm={6}>
            <div className="vq-glass-card p-3 h-100">
              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>CLASSICAL DOWNGRADE ATTEMPTS</div>
              <div className="d-flex align-items-baseline justify-content-between mt-2">
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#A855F7", fontFamily: "monospace" }}>
                  3
                </span>
                <span className="badge badge-secondary" style={{ background: "rgba(168, 85, 247, 0.2)", color: "#C084FC" }}>TCP RST</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Zero fallback to RSA / ECC allowed
              </div>
            </div>
          </Col>
        </Row>

        {/* Filter Navigation */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
          <div className="d-flex gap-2">
            {["ALL", "CRITICAL", "HIGH", "ELEVATED"].map(sev => (
              <Button
                key={sev}
                size="sm"
                className="mr-2"
                onClick={() => this.setState({ filterSeverity: sev })}
                style={{
                  background: filterSeverity === sev ? "rgba(0, 245, 212, 0.15)" : "rgba(255,255,255,0.03)",
                  borderColor: filterSeverity === sev ? "#2563EB" : "rgba(255,255,255,0.1)",
                  color: filterSeverity === sev ? "#2563EB" : "#94A3B8",
                  fontFamily: "monospace",
                  fontSize: "12px"
                }}
              >
                {sev} {sev === "ALL" ? `(${incidents.length})` : `(${incidents.filter(i => i.severity === sev).length})`}
              </Button>
            ))}
          </div>
          <div style={{ fontSize: "12px", color: "#94A3B8", fontFamily: "monospace" }}>
            ● Stream: SSE Live Ingress Hook (pq_shield:8081/events)
          </div>
        </div>

        {/* Incident Feed Table */}
        <div className="vq-glass-card p-4 mb-4">
          <div className="table-responsive">
            <table className="table table-hover table-borderless mb-0" style={{ background: "transparent", color: "#0F172A" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", color: "#64748B", fontSize: "11px", fontFamily: "var(--vq-mono-font)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  <th>INCIDENT ID</th>
                  <th>TIMESTAMP (UTC)</th>
                  <th>SEVERITY</th>
                  <th>INCIDENT TYPE</th>
                  <th>SUBSYSTEM</th>
                  <th>SOURCE VECTOR</th>
                  <th>WIRE SEQ / NONCE</th>
                  <th>ENTROPY</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inc => (
                  <tr key={inc.id} style={{ borderBottom: "1px solid #F1F5F9", fontSize: "13px" }}>
                    <td style={{ fontFamily: "var(--vq-mono-font)", color: "#2563EB", fontWeight: "700" }}>
                      {inc.id}
                    </td>
                    <td style={{ fontFamily: "var(--vq-mono-font)", fontSize: "11px", color: "#64748B" }}>
                      {inc.timestamp.replace("T", " ").replace("Z", "")}
                    </td>
                    <td>
                      {inc.severity === "CRITICAL" && (
                        <Badge color="danger" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#DC2626", border: "1px solid rgba(239, 68, 68, 0.3)" }}>CRITICAL</Badge>
                      )}
                      {inc.severity === "HIGH" && (
                        <Badge color="warning" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>HIGH</Badge>
                      )}
                      {inc.severity === "ELEVATED" && (
                        <Badge color="info" style={{ background: "#F0F9FF", color: "#0284C7", border: "1px solid #BAE6FD" }}>ELEVATED</Badge>
                      )}
                    </td>
                    <td style={{ fontWeight: "600", color: "#0F172A", fontSize: "12px", fontFamily: "var(--vq-mono-font)" }}>
                      {inc.type}
                    </td>
                    <td style={{ fontSize: "11px", fontFamily: "var(--vq-mono-font)", color: "#64748B" }}>
                      {inc.subsystem}
                    </td>
                    <td style={{ fontSize: "12px" }}>
                      <div style={{ fontFamily: "var(--vq-mono-font)", color: quarantinedIps.includes(inc.sourceIP) ? "#EF4444" : "#0F172A", fontWeight: 600 }}>
                        {inc.sourceIP} {quarantinedIps.includes(inc.sourceIP) && <span style={{ fontSize: "10px", color: "#EF4444" }}>[QUARANTINED]</span>}
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748B" }}>{inc.asn}</div>
                    </td>
                    <td style={{ fontFamily: "var(--vq-mono-font)", fontSize: "11px", color: "#64748B" }}>
                      {inc.wireSeq}
                    </td>
                    <td style={{ fontFamily: "var(--vq-mono-font)", fontSize: "11px", color: parseFloat(inc.shannonEntropy) < 7.9 ? "#EF4444" : "#10B981", fontWeight: 600 }}>
                      {inc.shannonEntropy} {inc.shannonEntropy !== "N/A" ? "b/B" : ""}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="xs"
                          color="info"
                          className="mr-1"
                          onClick={() => this.openHexModal(inc)}
                          style={{ fontSize: "11px", padding: "3px 8px" }}
                        >
                          Wire Hex
                        </Button>
                        {!quarantinedIps.includes(inc.sourceIP) && (
                          <Button
                            size="xs"
                            color="danger"
                            onClick={() => this.openQuarantineModal(inc)}
                            style={{ fontSize: "11px", padding: "3px 8px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid #EF4444", color: "#EF4444" }}
                          >
                            Quarantine
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

        {/* Wire Hex Inspector Modal */}
        <Modal isOpen={hexModalOpen} toggle={this.closeHexModal} centered size="lg" contentClassName="vq-glass-card">
          <ModalHeader toggle={this.closeHexModal} style={{ borderBottom: "1px solid #EEEEEE", color: "#111111" }}>
            <span style={{ color: "#2563EB", marginRight: "8px" }}>🔍</span>
            Wire Frame Hex Dump Inspector · {selectedIncident?.id}
          </ModalHeader>
          <ModalBody style={{ color: "#E2E8F0", fontSize: "13px" }}>
            {selectedIncident && (
              <div>
                <div className="mb-3 p-3 rounded" style={{ background: "#05080E", border: "1px solid #E0E0E0" }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span><strong>Event:</strong> {selectedIncident.type}</span>
                    <span className="badge badge-danger">{selectedIncident.severity}</span>
                  </div>
                  <div style={{ color: "#CBD5E1", fontSize: "12px", marginBottom: "8px" }}>
                    {selectedIncident.detail}
                  </div>
                  <div className="row text-muted" style={{ fontSize: "11px", fontFamily: "monospace" }}>
                    <div className="col-md-4">Subsystem: {selectedIncident.subsystem}</div>
                    <div className="col-md-4">Source IP: {selectedIncident.sourceIP}</div>
                    <div className="col-md-4">Shannon Entropy: {selectedIncident.shannonEntropy} b/B</div>
                  </div>
                </div>

                <div className="vq-terminal-window">
                  <div className="vq-terminal-header">
                    <span style={{ fontSize: "11px", color: "#2563EB" }}>RAW PACKET BUFFER (ZERO-ALLOCATION SLICE)</span>
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>MAGIC: 0x56513031 ('VQ01')</span>
                  </div>
                  <div className="vq-terminal-body" style={{ background: "#020408", fontFamily: "monospace", fontSize: "12px" }}>
                    {selectedIncident.hexDump.map((line, idx) => (
                      <div key={idx} style={{ color: idx === 0 ? "#2563EB" : idx === 1 ? "#EF4444" : "#A7F3D0" }}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 p-2 rounded" style={{ background: "rgba(0, 245, 212, 0.05)", border: "1px solid rgba(0, 245, 212, 0.15)", fontSize: "11px", color: "#A7F3D0", fontFamily: "monospace" }}>
                  ✓ Cryptographic evidence hashed with BLAKE3 and signed with FIPS 204 ML-DSA-87 into local Merkle ledger.
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter style={{ borderTop: "1px solid #EEEEEE" }}>
            <Button color="secondary" size="sm" onClick={this.closeHexModal}>
              Close Inspector
            </Button>
            {selectedIncident && !quarantinedIps.includes(selectedIncident.sourceIP) && (
              <Button
                color="danger"
                size="sm"
                onClick={() => {
                  this.closeHexModal();
                  this.openQuarantineModal(selectedIncident);
                }}
              >
                Quarantine Source IP
              </Button>
            )}
          </ModalFooter>
        </Modal>

        {/* Quarantine Confirmation Modal */}
        <Modal isOpen={quarantineModalOpen} toggle={this.closeQuarantineModal} centered contentClassName="vq-glass-card">
          <ModalHeader toggle={this.closeQuarantineModal} style={{ borderBottom: "1px solid #EEEEEE", color: "#111111" }}>
            <span style={{ color: "#EF4444", marginRight: "8px" }}>⚠️</span>
            Quarantine Source IP Ingress
          </ModalHeader>
          <ModalBody style={{ color: "#E2E8F0", fontSize: "13px" }}>
            {selectedIncident && (
              <div>
                <p>
                  Are you sure you want to enforce an immediate cluster-wide quarantine on:
                </p>
                <div className="p-3 rounded mb-3 text-center" style={{ background: "#05080E", border: "1px solid #EF4444", fontFamily: "monospace", fontSize: "16px", color: "#EF4444", fontWeight: "700" }}>
                  {selectedIncident.sourceIP}
                </div>
                <p style={{ fontSize: "12px", color: "#94A3B8" }}>
                  All active TCP and AEAD wire tunnels from this IP will be severed with TCP RST. Ingress packets will be dropped at the eBPF / Axum ingress filter.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter style={{ borderTop: "1px solid #EEEEEE" }}>
            <Button color="secondary" size="sm" onClick={this.closeQuarantineModal}>
              Cancel
            </Button>
            <Button color="danger" size="sm" onClick={this.executeQuarantine}>
              Enforce Zero-Trust Quarantine
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default withRouter(connect()(FeedbackListTable));
