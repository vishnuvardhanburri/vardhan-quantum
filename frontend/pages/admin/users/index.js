import React, { Component } from "react";
import UsersListTable from "./UsersListTable";
import Head from 'next/head';

class Index extends Component {
  render() {
    return (
      <div>
        <Head>
          <title>Identity & RBAC Officers | Vardhan Quantum</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content="High-Assurance Post-Quantum Cryptographic Operating System & Ingress Platform powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="keywords" content="vardhan-quantum, rbac, security-officers, identity, fips-204" />
          <meta name="author" content="Vardhan Quantum Inc." />
          <meta charSet="utf-8" />

          <meta property="og:title" content="Identity & RBAC Officers | Vardhan Quantum"/>
          <meta property="og:type" content="website"/>
          <meta property="og:description" content="High-Assurance Post-Quantum Cryptographic Operating System & Ingress Platform powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA."/>
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="og:site_name" content="Vardhan Quantum"/>
          <meta name="twitter:site" content="@vardhan-quantum" />
        </Head>
        <UsersListTable />
      </div>
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

export default Index;
