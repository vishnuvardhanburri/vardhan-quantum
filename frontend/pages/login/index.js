import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "next/router";
import Link from 'next/link'
import { connect } from "react-redux";
import {
  Container,
  Button,
  Col,
  Row,
  FormGroup,
  Label,
  Input,
  Form,
} from "reactstrap";
import Head from 'next/head';
import { loginUser } from "redux/actions/auth";
import jwt from "jsonwebtoken";
import logo from "public/images/e-commerce/logo.svg";
import eye from 'public/images/e-commerce/login/eye.png';
import eyeOff from 'public/images/e-commerce/login/eye-off.png';

import s from './Login.module.scss';

class Login extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    viewPassword: false,
  };

  static isAuthenticated() {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) return;
    const date = new Date().getTime() / 1000;
    const data = jwt.decode(token);
    if (!data) return;
    return date < data.exp;
  }

  constructor(props) {
    super(props);

    this.state = {
      email: "admin@vardhan-quantum.com",
      password: "password",
    };

    this.doLogin = this.doLogin.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    this.microsoftLogin = this.microsoftLogin.bind(this);
    this.changeEmail = this.changeEmail.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.signUp = this.signUp.bind(this);
  }

  changeEmail(event) {
    this.setState({ email: event.target.value });
  }

  changePassword(event) {
    this.setState({ password: event.target.value });
  }

  doLogin(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    this.props.dispatch(
      loginUser({ email: this.state.email, password: this.state.password })
    );
  }

  googleLogin() {
    this.props.dispatch(loginUser({ social: "google" }));
  }

  microsoftLogin() {
    this.props.dispatch(loginUser({ social: "microsoft" }));
  }

  componentDidMount() {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      this.props.router.push("/admin/dashboard");
    }
  }

  signUp() {
    this.props.router.push("/register");
  }

  render() {

    return (
      <>
        <Head>
          <title>Officer Ingress & Authentication | Vardhan Quantum</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content="High-Assurance Post-Quantum Cryptographic Operating System & Control Plane Ingress powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="keywords" content="vardhan-quantum, authentication, argon2id, ingress, fips-204" />
          <meta name="author" content="Vardhan Quantum Inc." />
          <meta charSet="utf-8" />

          <meta property="og:title" content="Officer Ingress & Authentication | Vardhan Quantum" />
          <meta property="og:type" content="website"/>
          <meta property="og:description" content="High-Assurance Post-Quantum Cryptographic Operating System & Control Plane Ingress powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="og:site_name" content="Vardhan Quantum" />
          <meta name="twitter:site" content="@vardhan-quantum" />
        </Head>
        <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", color: "#111111", fontFamily: "Inter, sans-serif" }}>
          <Row className={"no-gutters"} style={{ minHeight: "100vh" }}>
            <Col
              xs={12}
              md={6}
              className={
                "d-flex flex-column justify-content-center align-items-center p-4 p-md-5"
              }
              style={{ background: "#FFFFFF", borderRight: "1px solid #E0E0E0" }}
            >
              <Container>
                <Row className={"d-flex justify-content-center"}>
                  <Col lg={9} xs={12}>
                    <div className="mb-4">
                      <Link href={"/"}>
                        <a className="d-inline-flex align-items-center text-decoration-none">
                          <img src={logo} alt={"logo"} style={{ height: "32px", marginRight: "12px" }} />
                          <span style={{ fontSize: "16px", fontWeight: "800", letterSpacing: "0.08em", color: "#111111" }}>
                            VARDHAN <span style={{ color: "#2563EB" }}>QUANTUM</span>
                          </span>
                        </a>
                      </Link>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="vq-pulse-beacon mr-2" />
                        <span style={{ fontSize: "11px", color: "#1E40AF", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
                          RESTRICTED INGRESS ENCLAVE
                        </span>
                      </div>
                      <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#111111", letterSpacing: "-0.02em" }}>
                        Officer Authentication
                      </h2>
                      <p style={{ fontSize: "13px", color: "#666666", lineHeight: "1.6" }}>
                        Enter authorized administrative credentials. Sessions are cryptographically sealed with FIPS 204 ML-DSA-87 signatures.
                      </p>
                    </div>

                    {this.props.errorMessage && (
                      <div
                        className="py-2 px-3 text-center text-xs mb-3 font-weight-bold"
                        style={{
                          background: "rgba(239, 68, 68, 0.08)",
                          border: "1px solid #EF4444",
                          borderRadius: "8px",
                          color: "#DC2626",
                          fontSize: "12px"
                        }}
                        role="alert"
                      >
                        {typeof this.props.errorMessage === 'string' ? this.props.errorMessage : 'Invalid credentials'}
                      </div>
                    )}

                    <Form className={"w-100"} onSubmit={this.doLogin}>
                      <FormGroup>
                        <Label for="exampleEmail" className="font-weight-bold" style={{ fontSize: "12px", color: "#333333" }}>
                          Operator Principal Email
                        </Label>
                        <Input
                          type="email"
                          name="text"
                          id="exampleEmail"
                          className="w-100"
                          placeholder={"admin@vardhan-quantum.com"}
                          value={this.state.email}
                          onChange={this.changeEmail}
                          required
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: "1.5px solid #DDDDDD",
                            color: "#111111",
                            borderRadius: "8px",
                            height: "46px"
                          }}
                        />
                      </FormGroup>

                      <FormGroup className={s.formGroup}>
                        <Label for="examplePassword" className="font-weight-bold" style={{ fontSize: "12px", color: "#333333" }}>
                          Master Key Passphrase
                        </Label>
                        <div style={{ position: "relative" }}>
                          <Input
                            type={this.state.viewPassword ? 'text' : 'password'}
                            name="password"
                            id="examplePassword"
                            className="w-100"
                            placeholder={"Passphrase"}
                            value={this.state.password}
                            onChange={this.changePassword}
                            required
                            style={{
                              backgroundColor: "#FFFFFF",
                              border: "1.5px solid #DDDDDD",
                              color: "#111111",
                              borderRadius: "8px",
                              height: "46px",
                              paddingRight: "40px"
                            }}
                          />
                          <img
                            className={s.viewPassword}
                            src={this.state.viewPassword ? eye : eyeOff}
                            onClick={() => this.setState({ viewPassword: !this.state.viewPassword })}
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "13px",
                              cursor: "pointer",
                              filter: "none",
                              opacity: 0.5
                            }}
                            alt="toggle password visibility"
                          />
                        </div>
                      </FormGroup>

                      <div className={"d-flex justify-content-between align-items-center mt-4"}>
                        <Link href={"/forgot"}>
                          <a style={{ color: "#1E40AF", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
                            Forgot passphrase?
                          </a>
                        </Link>
                        <Button
                          type="submit"
                          disabled={this.props.isFetching}
                          className={"fw-bold text-uppercase px-4 py-2"}
                          style={{
                            background: "#2563EB",
                            border: "none",
                            color: "#000000",
                            borderRadius: "8px",
                            fontSize: "13px",
                            letterSpacing: "0.05em",
                            fontWeight: "700",
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.12)"
                          }}
                        >
                          {this.props.isFetching ? "Authenticating..." : "Authorize Ingress"}
                        </Button>
                      </div>

                      <div className="mt-4 pt-3 text-center" style={{ borderTop: "1px solid #EEEEEE" }}>
                        <span style={{ fontSize: "13px", color: "#666666" }}>Require sovereign access? </span>
                        <Link href={"/register"}>
                          <a style={{ color: "#1E40AF", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}>
                            Enroll Operator
                          </a>
                        </Link>
                      </div>
                    </Form>

                    <footer className="d-flex justify-content-between mt-5 pt-3" style={{ borderTop: "1px solid #EEEEEE", fontSize: "12px" }}>
                      <Link href={"/security"}>
                        <a style={{ color: "#999999", textDecoration: "none" }}>Security Policy</a>
                      </Link>
                      <Link href={"/architecture"}>
                        <a style={{ color: "#999999", textDecoration: "none" }}>Compliance Attestation</a>
                      </Link>
                      <Link href={"/faq"}>
                        <a style={{ color: "#999999", textDecoration: "none" }}>Architecture FAQ</a>
                      </Link>
                    </footer>
                  </Col>
                </Row>
              </Container>
            </Col>

            {/* Right Telemetry Panel */}
            <Col
              md={6}
              className={"d-none d-md-flex flex-column justify-content-center p-5"}
              style={{
                backgroundColor: "#F9F9F9",
                backgroundImage: "radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.12) 0%, rgba(255,255,255,0) 70%)"
              }}
            >
              <div style={{ maxWidth: "520px", margin: "0 auto", width: "100%" }}>
                <div style={{
                  background: "#FFFFFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "14px",
                  padding: "28px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #EEEEEE" }}>
                    <span style={{ fontSize: "11px", color: "#1E40AF", fontFamily: "monospace", textTransform: "uppercase", fontWeight: "700" }}>
                      SOVEREIGN TELEMETRY DAEMON
                    </span>
                    <span className="badge" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#1E40AF", border: "1px solid #E0E0E0", fontFamily: "monospace", fontSize: "10px" }}>
                      ONLINE · FIPS 203/204
                    </span>
                  </div>

                  <div style={{ fontFamily: "monospace", fontSize: "12px", lineHeight: "1.8", color: "#333333" }}>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#888888" }}>KEM Standard:</span>
                      <span style={{ color: "#111111", fontWeight: "700" }}>ML-KEM-1024 (FIPS 203)</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#888888" }}>DSA Standard:</span>
                      <span style={{ color: "#111111", fontWeight: "700" }}>ML-DSA-87 (FIPS 204)</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#888888" }}>KDF Algorithm:</span>
                      <span style={{ color: "#111111", fontWeight: "700" }}>Argon2id (m=64MB, t=3, p=4)</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#888888" }}>Anti-Replay Window:</span>
                      <span style={{ color: "#1E40AF", fontWeight: "700" }}>32,768 Bit Sliding Monotonic</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#888888" }}>Entropy Cutoff:</span>
                      <span style={{ color: "#1E40AF", fontWeight: "700" }}>7.90 b/B (Shannon Minimum)</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#888888" }}>Tamper Defense:</span>
                      <span style={{ color: "#111111", fontWeight: "700" }}>Continuous Merkle BLAKE3</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3" style={{ borderTop: "1px solid #EEEEEE", fontSize: "11px", color: "#888888" }}>
                    <span style={{ color: "#1E40AF", fontWeight: "700" }}>SECURITY ADVISORY: </span>
                    Ingress connections without authentic cryptographic credentials will be dropped immediately at the L4 socket boundary without error response.
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

function mapStateToProps(state) {
  return {
    isFetching: state.auth.isFetching,
    isAuthenticated: state.auth.isAuthenticated,
    errorMessage: state.auth.errorMessage,
  };
}

export default withRouter(connect(mapStateToProps)(Login));
