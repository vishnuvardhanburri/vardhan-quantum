import React from 'react';
import { Row, Col } from 'reactstrap';
import Link from 'next/link';
import { withRouter } from 'next/router';
import Head from 'next/head';

import screenshot from 'public/images/screenshot.png';
import Widget from 'components/admin/Widget/Widget';

const Overview = () => (
  <Row>
    <Head>
      <title>Ecommerce Overview</title>
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
    <Col lg={10}>
      <Widget id="Overview">
        <h1>Overview</h1>
        <p className="lead">
          Vardhan Quantum Ecommerce is an online store template built with React and NextJS.
          If you need to develop brand new application it's a good idea to use a template as a head start.
          This app can be used either as a blueprint for your new project or can serve you and your company as a components library.
          There are considerable amoutn of ready-mage components that wil be listed in a list below.
        </p>
        <p className="lead">
            Moreover, there is a backend <a rel="noreferrer noopener" href="https://github.com/vardhan-quantum/ecommerce-backend" target="_blank">Vardhan Quantum E-commerce backend</a>, enhanced with working node.js
            backend with authentication, login strategies, access management, user roles and CRUD. Please refer to <a
            href="https://github.com/vardhan-quantum/ecommerce-backend" rel="noopener noreferrer" target="_blank">backend documentation</a> for details
        </p>
        <img className="img-responsive w-100 border" src={screenshot} alt="screenshot" />
        <Link href="/">Live demo</Link>
      </Widget>
      <Widget id="Features">
        <h3 className="">Features</h3>
        <ul className="mt">
          <li className="lead"><i className="la la-check" /> Products listing</li>
          <li className="lead"><i className="la la-check" /> Filter</li>
          <li className="lead"><i className="la la-check" /> SSR (seo friendly)</li>
          <li className="lead"><i className="la la-check" /> SEO module</li>
          <li className="lead"><i className="la la-check" /> 2 Dashboards (for admin and customer)</li>
          <li className="lead"><i className="la la-check" /> Blog</li>
          <li className="lead"><i className="la la-check" /> Content moderation</li>
          <li className="lead"><i className="la la-check" /> Stripe integration</li>
          <li className="lead"><i className="la la-check" /> Static & Hover Sidebar</li>
          <li className="lead"><i className="la la-check" /> PostgersSQL</li>
          <li className="lead"><i className="la la-check" /> And even more coming soon!</li>
        </ul>
      </Widget>
      <Widget id="Support">
        <h2>Support forum</h2>
        <p className="lead">For any additional information please go to our support forum and raise your questions or feedback provide there. We highly appreciate your participation!</p>
        <a href="https://vardhan-quantum.com/forum" target="_blank" rel="noopener noreferrer" className="btn btn-default text-gray fw-semi-bold">
          Support forum
        </a>
      </Widget>
      <Row>
        <Col md={5}>
          <Widget title="Continue with">
            <Link href="/admin/documentation/licences" >
              <h4 style={{ cursor: 'pointer' }}>Licences <i className="la la-arrow-right"/></h4>
            </Link>
          </Widget>
        </Col>
        <Col md={5}>
          <Widget title="Or learn about">
            <Link href="/admin/documentation/quick-start">
              <h4 style={{ cursor: 'pointer' }}>How to start project <i className="la la-arrow-right"/></h4>
            </Link>
          </Widget>
        </Col>
      </Row>
    </Col>
  </Row>
);

export default withRouter(Overview);
