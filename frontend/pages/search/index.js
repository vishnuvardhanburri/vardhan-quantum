import React, { useState } from "react";
import { useRouter } from 'next/router';
import { Container, Row, Col, Label, Input, FormGroup } from "reactstrap";

import Header from "components/e-commerce/Header";
import Head from "next/head";

const Index = () => {
  const router = useRouter()
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        router.push({
          pathname: '/search-results',
          query: { searchValue: value },
        })
    }
  }
  const handleClick = () => {
    if (value && value.length >= 3) {
        router.push({
          pathname: '/search-results',
          query: { searchValue: value },
        })
    }
  }
  const [value, setValue] = useState('');
  return (
    <div className={"h-100"}>
      <Head>
        <title>Search</title>
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
      <Container style={{ height: "100vh" }}>
        <Row
          className={
            "d-flex justify-content-center align-items-center flex-column"
          }
          style={{ height: "100vh" }}
        >
          <FormGroup style={{ width: 880 }}>
            <Input
              onKeyDown={handleKeyDown}
              onClick={handleClick}
              type="text"
              value={value}
              onChange={event => setValue(event.target.value)}
              name="text"
              id="exampleEmail"
              className="search w-100"
              placeholder={"Index For ..."}
            />
          </FormGroup>
        </Row>
        <p className={"text-muted"} style={{ marginTop: -50 }}>
          © 2020-21 powered by Vardhan Quantum
        </p>
      </Container>
    </div>
  );
};

export async function getServerSideProps(context) {
    // const res = await axios.get("/products");
    // const products = res.data.rows;

    return {
        props: {  }, // will be passed to the page component as props
    };
}

export default Index;
