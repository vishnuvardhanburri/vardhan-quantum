import React from 'react';
import Head from 'next/head';
import {
    Container,
    Row,
    Col,
  } from "reactstrap";

import InstagramWidget from 'components/e-commerce/Instagram';
import s from './SearchResults.module.scss';

const SearchResults = ({ searchValue }) => {
    return (
        <>
            <Head>
                <title>Search Results: {searchValue}</title>
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
            <Container className={s.rootContainer}>
                <Row>
                    <Col lg={7} md={10} sm={12}>
                        <h1 className={s.title}>Search results for: <span>{searchValue}</span></h1>

                        <div className={s.resultItem}>
                            <span className={s.categoryTitle}>company policies</span>
                            <h3 className={s.resultTitle}>Differentiate Yourself And Attract More Attention, Sales, And Profits</h3>
                            <p className={s.resultDescription}>There is no denying that the <strong>{searchValue}</strong> of an advertisement lies mostly in the headline. The headline should catch the reader’s attention and make him read the rest of the advertisement. the reader’s attention and make him read the rest of the advertisement. </p>
                        </div>

                        <div className={s.resultItem}>
                            <span className={s.categoryTitle}>company policies</span>
                            <h3 className={s.resultTitle}>Differentiate Yourself And Attract More Attention, Sales, And Profits</h3>
                            <p className={s.resultDescription}>There is no denying that the <strong>{searchValue}</strong> of an advertisement lies mostly in the headline. The headline should catch the reader’s attention and make him read the rest of the advertisement. the reader’s attention and make him read the rest of the advertisement. </p>
                        </div>

                        <div className={s.resultItem}>
                            <span className={s.categoryTitle}>company policies</span>
                            <h3 className={s.resultTitle}>Differentiate Yourself And Attract More Attention, Sales, And Profits</h3>
                            <p className={s.resultDescription}>There is no denying that the <strong>{searchValue}</strong> of an advertisement lies mostly in the headline. The headline should catch the reader’s attention and make him read the rest of the advertisement. the reader’s attention and make him read the rest of the advertisement. </p>
                        </div>
                    </Col>
                </Row>
            </Container>
            <InstagramWidget/>
        </>
    )
}

export async function getServerSideProps(context) {
    // const res = await axios.get(`/products/${context.query.id}`);
    // const product = res.data;
  
    return {
      props: { searchValue: context.query.searchValue || 'Hello' }, // will be passed to the page component as props
    };
  }
  

export default SearchResults;