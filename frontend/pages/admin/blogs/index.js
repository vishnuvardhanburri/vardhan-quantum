import React, { Component } from "react";
import BlogsListTable from "./BlogsListTable";
import Head from 'next/head';

class Index extends Component {
  render() {
    return (
      <div>
        <Head>
          <title>Security Bulletins & Whitepapers | Vardhan Quantum</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content="High-Assurance Post-Quantum Cryptographic Research & Security Bulletins powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="keywords" content="vardhan-quantum, research, bulletins, whitepapers, fips-204" />
          <meta name="author" content="Vardhan Quantum Inc." />
          <meta charSet="utf-8" />

          <meta property="og:title" content="Security Bulletins & Whitepapers | Vardhan Quantum"/>
          <meta property="og:type" content="website"/>
          <meta property="og:description" content="High-Assurance Post-Quantum Cryptographic Research & Security Bulletins powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA."/>
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="og:site_name" content="Vardhan Quantum"/>
          <meta name="twitter:site" content="@vardhan-quantum" />
        </Head>
        <BlogsListTable />
      </div>
    );
  }
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/blogs");
  // const blogs = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default Index;
