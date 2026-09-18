import React, { Component } from "react";
import CategoriesListTable from "./CategoriesListTable";
import Head from 'next/head';

class Index extends Component {
  render() {
    return (
      <div>
        <Head>
          <title>Cryptographic Policy Suites | Vardhan Quantum Control Plane</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta name="description" content="Cryptographic policy enforcer, cipher suite priority hierarchy, and wire transport controls powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="keywords" content="vardhan-quantum, cryptographic-policy, fips-203, fips-204, ml-kem, ml-dsa, cipher-suite" />
          <meta name="author" content="Vardhan Quantum Inc." />
          <meta charSet="utf-8" />
        </Head>
        <CategoriesListTable />
      </div>
    );
  }
}

export async function getServerSideProps(context) {
  return {
    props: { },
  };
}

export default Index;
