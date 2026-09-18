import React from "react";
import PropTypes from "prop-types";
import Link from 'next/link'
import {withRouter} from 'next/router'
import { connect } from "react-redux";
import {
  Container,
  Button,
  Col,
  Row,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { registerUser, authError } from "redux/actions/auth";
import { loginUser } from "redux/actions/auth";
import microsoft from "public/images/microsoft.png";
import img from "public/images/e-commerce/register/bg.png";
import logo from "public/images/e-commerce/logo.svg";
import eye from 'public/images/e-commerce/login/eye.png';
import eyeOff from 'public/images/e-commerce/login/eye-off.png';
import Head from 'next/head';

import s from './Register.module.scss';

class Index extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      viewPassword: false,
      viewCopyPassword: false,
    };

    this.doRegister = this.doRegister.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    this.microsoftLogin = this.microsoftLogin.bind(this);
    this.changeEmail = this.changeEmail.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.changeConfirmPassword = this.changeConfirmPassword.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
    this.isPasswordValid = this.isPasswordValid.bind(this);
  }

  changeEmail(event) {
    this.setState({ email: event.target.value });
  }

  changePassword(event) {
    this.setState({ password: event.target.value });
  }

  changeConfirmPassword(event) {
    this.setState({ confirmPassword: event.target.value });
  }

  checkPassword() {
    if (!this.isPasswordValid()) {
      if (!this.state.password) {
        this.props.dispatch(authError("Password field is empty"));
      } else {
        this.props.dispatch(authError("Passwords are not equal"));
      }
      setTimeout(() => {
        this.props.dispatch(authError());
      }, 3 * 1000);
    }
  }

  isPasswordValid() {
    return (
      this.state.password && this.state.password === this.state.confirmPassword
    );
  }

  doRegister(e) {
    e.preventDefault();
    if (!this.isPasswordValid()) {
      this.checkPassword();
    } else {
      console.log('registre')
      this.props.dispatch(
        registerUser({
          email: this.state.email,
          password: this.state.password,
        })
      );
    }
  }

  googleLogin() {
    this.props.dispatch(loginUser({ social: "google" }));
  }

  microsoftLogin() {
    this.props.dispatch(loginUser({ social: "microsoft" }));
  }

  render() {
    return (
      <>
        <Head>
          <title>Operator Enrollment & Key Provisioning | Vardhan Quantum</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content="High-Assurance Post-Quantum Cryptographic Operating System & Key Provisioning powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="keywords" content="vardhan-quantum, registration, enrollment, fips-204" />
          <meta name="author" content="Vardhan Quantum Inc." />
          <meta charSet="utf-8" />

          <meta property="og:title" content="Operator Enrollment & Key Provisioning | Vardhan Quantum" />
          <meta property="og:type" content="website"/>
          <meta property="og:description" content="High-Assurance Post-Quantum Cryptographic Operating System & Key Provisioning powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
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
                        <span style={{ fontSize: "11px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
                          PROVISIONING CONSOLE
                        </span>
                      </div>
                      <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#111111", letterSpacing: "-0.02em" }}>
                        Enroll Sovereign Operator
                      </h2>
                      <p style={{ fontSize: "13px", color: "#666666", lineHeight: "1.6" }}>
                        Generate high-entropy credentials bound to NIST FIPS 203 ML-KEM and FIPS 204 ML-DSA trust roots.
                      </p>
                    </div>

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
                        role="alert"
                      >
                        {typeof this.props.errorMessage === 'string' ? this.props.errorMessage : 'Validation failed'}
                      </div>
                    )}

                    <Form className={"w-100"} onSubmit={this.doRegister}>
                      <FormGroup>
                        <Label for="exampleEmail" className="font-weight-bold" style={{ fontSize: "12px", color: "#111111" }}>
                          Principal Email
                        </Label>
                        <Input
                          type="email"
                          name="text"
                          id="exampleEmail"
                          className="w-100"
                          placeholder={"operator@organization.gov"}
                          value={this.state.email}
                          onChange={this.changeEmail}
                          required
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E0E0E0",
                            color: "#111111",
                            borderRadius: "8px",
                            height: "46px"
                          }}
                        />
                      </FormGroup>

                      <FormGroup className={s.formGroup}>
                        <Label for="examplePassword" className="font-weight-bold" style={{ fontSize: "12px", color: "#111111" }}>
                          Master Passphrase
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
                              border: "1px solid #E0E0E0",
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
                              filter: "invert(1)",
                              opacity: 0.7
                            }}
                            alt="toggle password visibility"
                          />
                        </div>
                      </FormGroup>

                      <FormGroup className={s.formGroup}>
                        <Label for="exampleConfirmPassword" className="font-weight-bold" style={{ fontSize: "12px", color: "#111111" }}>
                          Confirm Passphrase
                        </Label>
                        <div style={{ position: "relative" }}>
                          <Input
                            type={this.state.viewCopyPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            id="exampleConfirmPassword"
                            className="w-100"
                            placeholder={"Confirm Passphrase"}
                            value={this.state.confirmPassword}
                            onChange={this.changeConfirmPassword}
                            required
                            style={{
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #E0E0E0",
                              color: "#111111",
                              borderRadius: "8px",
                              height: "46px",
                              paddingRight: "40px"
                            }}
                          />
                          <img
                            className={s.viewPassword}
                            src={this.state.viewCopyPassword ? eye : eyeOff}
                            onClick={() => this.setState({ viewCopyPassword: !this.state.viewCopyPassword })}
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "13px",
                              cursor: "pointer",
                              filter: "invert(1)",
                              opacity: 0.7
                            }}
                            alt="toggle password visibility"
                          />
                        </div>
                      </FormGroup>

                      <div className={"d-flex justify-content-between align-items-center mt-4"}>
                        <Link href={"/login"}>
                          <a style={{ color: "#2563EB", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
                            Existing operator? Ingress
                          </a>
                        </Link>
                        <Button
                          type="submit"
                          className={"fw-bold text-uppercase px-4 py-2"}
                          style={{
                            background: "#2563EB",
                            border: "none",
                            color: "#000000",
                            borderRadius: "8px",
                            fontSize: "13px",
                            letterSpacing: "0.05em",
                            boxShadow: "0 0 15px rgba(37, 99, 235, 0.12)"
                          }}
                        >
                          PROVISION KEY
                        </Button>
                      </div>
                    </Form>

                    <footer className="d-flex justify-content-between mt-5 pt-3" style={{ borderTop: "1px solid #EEEEEE", fontSize: "12px" }}>
                      <Link href={"/security"}>
                        <a style={{ color: "#888888", textDecoration: "none" }}>Terms & Conditions</a>
                      </Link>
                      <Link href={"/architecture"}>
                        <a style={{ color: "#888888", textDecoration: "none" }}>Privacy Policy</a>
                      </Link>
                      <Link href={"/faq"}>
                        <a style={{ color: "#888888", textDecoration: "none" }}>Help & Support</a>
                      </Link>
                    </footer>
                  </Col>
                </Row>
              </Container>
            </Col>

            {/* Right Side Panel */}
            <Col
              md={6}
              className={"d-none d-md-flex flex-column justify-content-center p-5"}
              style={{
                backgroundColor: "#F9F9F9",
                backgroundImage: "radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.12) 0%, rgba(0, 0, 0, 0) 70%)"
              }}
            >
              <div style={{ maxWidth: "520px", margin: "0 auto", width: "100%" }}>
                <div style={{
                  background: "#FFFFFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "14px",
                  padding: "28px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(37, 99, 235, 0.12)"
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #EEEEEE" }}>
                    <span style={{ fontSize: "11px", color: "#2563EB", fontFamily: "monospace", textTransform: "uppercase", fontWeight: "700" }}>
                      KEY GENERATION PROTOCOL
                    </span>
                    <span className="badge" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563EB", border: "1px solid #2563EB", fontFamily: "monospace", fontSize: "10px" }}>
                      STRICT ISOLATION
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#666666", lineHeight: "1.6" }}>
                    Each operator account generates an ephemeral cryptographic keypair registered with the sovereign cluster Raft log.
                  </p>

                  <div style={{ fontFamily: "monospace", fontSize: "12px", lineHeight: "1.8", color: "#333333" }}>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#888888" }}>KDF Memory Cost:</span>
                      <span style={{ color: "#111111", fontWeight: "700" }}>65,536 KiB</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#888888" }}>KDF Time Cost:</span>
                      <span style={{ color: "#111111", fontWeight: "700" }}>3 Iterations</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#888888" }}>Entropy Guarantee:</span>
                      <span style={{ color: "#2563EB", fontWeight: "700" }}>100% CSPRNG (OsRng)</span>
                    </div>
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
    errorMessage: state.auth.errorMessage,
  };
}

export default withRouter(connect(mapStateToProps)(Index));
