import React, { Component } from "react";
import ChangePasswordForm from "./ChangePasswordForm";
import actions from "redux/actions/password";
import { withRouter } from 'next/router';
import { connect } from "react-redux";
import Head from 'next/head';

class Index extends Component {
  state = {
    dispatched: false,
  };

  doSubmit = (data) => {
    const { dispatch } = this.props;
    dispatch(actions.doChangePassword(data));
  };

  render() {
    return (
      <React.Fragment>
        <Head>
          <title>Rotate Master Key & Credential | Vardhan Quantum</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content="High-Assurance Post-Quantum Cryptographic Operating System & Key Rotation powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="keywords" content="vardhan-quantum, rotate-key, argon2id, fips-204" />
          <meta name="author" content="Vardhan Quantum Inc." />
          <meta charSet="utf-8" />

          <meta property="og:title" content="Rotate Master Key & Credential | Vardhan Quantum"/>
          <meta property="og:type" content="website"/>
          <meta property="og:description" content="High-Assurance Post-Quantum Cryptographic Operating System & Key Rotation powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA."/>
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="og:site_name" content="Vardhan Quantum"/>
          <meta name="twitter:site" content="@vardhan-quantum" />
        </Head>
        <ChangePasswordForm
          saveLoading={this.props.saveLoading}
          findLoading={this.props.findLoading}
          onSubmit={this.doSubmit}
          onCancel={() => this.props.router.push("/admin/dashboard")}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(store) {
  return {
    findLoading: store.users.form.findLoading,
    saveLoading: store.users.form.saveLoading,
  };
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default connect(mapStateToProps)(withRouter(Index));
