import React from "react";
import PropTypes from "prop-types";
import {withRouter} from 'next/router'
import Link from 'next/link'
import { connect } from "react-redux";
import { Alert, Button, Container } from "reactstrap";
import Widget from "components/admin/Widget";
import Head from 'next/head';
import { sendPasswordResetEmail } from "redux/actions/auth";

class Index extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      email: "",
    };

    this.changeEmail = this.changeEmail.bind(this);
    this.doSendResetEmail = this.doSendResetEmail.bind(this);
  }

  changeEmail(event) {
    this.setState({ email: event.target.value });
  }

  doSendResetEmail(e) {
    e.preventDefault();
    this.props.dispatch(sendPasswordResetEmail(this.state.email));
  }

  render() {
    return (
      <>
        <Head>
          <title>Reset Credential & Recovery | Vardhan Quantum</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content="High-Assurance Post-Quantum Cryptographic Operating System & Key Recovery powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="keywords" content="vardhan-quantum, recovery, reset, fips-204" />
          <meta name="author" content="Vardhan Quantum Inc." />
          <meta charSet="utf-8" />

          <meta property="og:title" content="Reset Credential & Recovery | Vardhan Quantum" />
          <meta property="og:type" content="website"/>
          <meta property="og:description" content="High-Assurance Post-Quantum Cryptographic Operating System & Key Recovery powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="og:site_name" content="Vardhan Quantum" />
          <meta name="twitter:site" content="@vardhan-quantum" />
        </Head>
        <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", color: "#111111", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <Container style={{ maxWidth: "480px" }}>
            <div className="text-center mb-4">
              <Link href={"/"}>
                <a className="text-decoration-none">
                  <span style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "0.08em", color: "#111111" }}>
                    VARDHAN <span style={{ color: "#2563EB" }}>QUANTUM</span>
                  </span>
                </a>
              </Link>
            </div>

            <div style={{
              background: "#FFFFFF",
              border: "1px solid #E0E0E0",
              borderRadius: "16px",
              padding: "36px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.85)"
            }}>
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center gap-2 mb-2">
                  <span className="vq-pulse-beacon mr-2" />
                  <span style={{ fontSize: "11px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", fontWeight: "700" }}>
                    CREDENTIAL RECOVERY
                  </span>
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#111111", marginTop: "8px" }}>
                  Recover Master Key
                </h3>
                <p style={{ color: "#666666", fontSize: "13px", marginTop: "8px", lineHeight: "1.6" }}>
                  Provide your registered principal email to transmit an out-of-band recovery challenge.
                </p>
              </div>

              <form onSubmit={this.doSendResetEmail}>
                {this.props.errorMessage && (
                  <div
                    className="py-2 px-3 text-center text-xs mb-3 font-weight-bold"
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid #EF4444",
                      borderRadius: "8px",
                      color: "#FCA5A5",
                      fontSize: "12px"
                    }}
                  >
                    {this.props.errorMessage}
                  </div>
                )}

                <div className="form-group mb-4">
                  <label className="font-weight-bold" style={{ fontSize: "12px", color: "#111111" }}>Principal Email</label>
                  <input
                    className="form-control"
                    value={this.state.email}
                    onChange={this.changeEmail}
                    type="email"
                    required
                    name="email"
                    placeholder="operator@organization.gov"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E0E0E0",
                      color: "#111111",
                      borderRadius: "8px",
                      height: "46px"
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-100 font-weight-bold text-uppercase py-2 mb-3"
                  style={{
                    background: "#2563EB",
                    border: "none",
                    borderRadius: "8px",
                    color: "#000000",
                    fontSize: "13px",
                    letterSpacing: "0.05em",
                    boxShadow: "0 0 15px rgba(37, 99, 235, 0.12)"
                  }}
                >
                  {this.props.isFetching ? "Transmitting..." : "Send Recovery Token"}
                </Button>
              </form>

              <div className="text-center mt-4 pt-3" style={{ borderTop: "1px solid #EEEEEE" }}>
                <span style={{ fontSize: "13px", color: "#666666" }}>Remember passphrase? </span>
                <Link href="/login">
                  <a style={{ color: "#2563EB", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}>
                    Return to Ingress
                  </a>
                </Link>
              </div>
            </div>

            <footer className="text-center mt-4" style={{ fontSize: "12px", color: "#888888" }}>
              {new Date().getFullYear()} &copy; Vardhan Quantum Inc. FIPS 203/204 Sovereign Enclave.
            </footer>
          </Container>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    isFetching: state.auth.isFetching,
    errorMessage: state.auth.errorMessage,
  };
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default withRouter(connect(mapStateToProps)(Index));
