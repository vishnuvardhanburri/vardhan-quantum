import React, { Component } from "react";
import ProductsListTable from "./ProductsListTable";
import Head from 'next/head';


class Index extends Component {
  render() {
    return (
      <div>
        <Head>
          <title>Cluster Nodes & Ingress Appliances | Vardhan Quantum</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content="High-Assurance Post-Quantum Cryptographic E-Commerce & Ingress Platform powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA." />
          <meta name="keywords" content="vardhan-quantum, react templates" />
          <meta name="author" content="Vardhan Quantum Inc." />
          <meta charSet="utf-8" />


          <meta property="og:title" content="Vardhan Quantum - Post-Quantum Cryptographic Commerce & Ingress Gateway"/>
          <meta property="og:type" content="website"/>
          <meta property="og:url" content="https://vardhan-quantum-ecommerce.herokuapp.com/"/>
          <meta property="og:image" content="https://vardhan-quantum-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"/>
          <meta property="og:description" content="High-Assurance Post-Quantum Cryptographic E-Commerce & Ingress Platform powered by FIPS 203 ML-KEM and FIPS 204 ML-DSA."/>
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="fb:app_id" content="712557339116053" />

          <meta property="og:site_name" content="Vardhan Quantum"/>
          <meta name="twitter:site" content="@vardhan-quantum" />
        </Head>
        <ProductsListTable />
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
