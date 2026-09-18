import React from "react";
import { Container, Row, Col } from "reactstrap";
import Link from 'next/link';
import headerImg from "public/images/e-commerce/blog/article/header.png";
import articleImg from "public/images/e-commerce/blog/article/article-image.png";
import person from "public/images/e-commerce/blog/article/person.svg";
import s from "./Article.module.scss";
import article1 from "public/images/e-commerce/home/article1.jpg";
import article2 from "public/images/e-commerce/home/article2.jpg";
import article3 from "public/images/e-commerce/home/article3.jpg";
import Head from "next/head";

const Blog = () => {
  return (
    <>
      <Head>
        <title>Blog Article</title>
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
      <img
        src={headerImg}
        alt={"header"}
        className={"w-100"}
        style={{ marginTop: 32, maxHeight: 440 }}
      />
      <Container className={"mb-5 mt-5 d-flex flex-column align-items-center"}>
        <Row style={{ maxWidth: 700 }}>
          <Col md={12}>
            <h1 className={`${s.title} fw-bold mb-0`}>
              The beauty of astronomy is that anybody can do it
            </h1>
            <blockquote
              className={"d-flex"}
              style={{ marginTop: 35, marginBottom: 40 }}
            >
              <div className={"d-flex flex-column"}>
                <div
                  className={"d-flex align-items-center"}
                  style={{ marginBottom: 35 }}
                >
                  <img src={person} alt="person" className={"mr-3"} />
                  <p className={`${s.author_name} text-uppercase fw-bold text-primary mb-0`}>
                    By James Lee Cooper
                  </p>
                </div>
                <h5 className={`${s.epigraph} fw-bold mb-0`}>
                  The universe is a constantly changing and moving. Some would say
                  it’s a living thing because you never know what you are going to
                  see on any given night of stargazing.
                </h5>
              </div>
            </blockquote>
            <p className={s.paragraph}>
              There is a lot of exciting stuff going on in the stars above us that
              makes astronomy so much fun. The universe is constantly changing and
              moving. Some would say it’s a living thing because you never know
              what you are going to see on any given night of stargazing. Of the
              many celestial phenomenons, there is probably none as exciting as
              when you see your first asteroid on the move in the heavens. To call
              asteroids the “rock stars” of astronomy is both a bad joke and an
              accurate depiction of how astronomy fans view them. Unlike suns,
              planets, and moons, asteroids are on the move, ever changing and, if
              they appear in the night sky, they are exciting and dynamic.
            </p>
          </Col>
        </Row>
        <Row className={"mt-5"}>
          <Col xs={12}>
            <img src={articleImg} alt={"article"} />
            <p className={"text-muted mt-3"}>
              There is a lot of exciting stuff going on in the stars
            </p>
          </Col>
        </Row>
        <Row style={{ maxWidth: 700 }} className={"mt-5"}>
          <Col md={12}>
            <p className={s.paragraph}>
              There is a lot of exciting stuff going on in the stars above us that
              makes astronomy so much fun. The universe is constantly changing and
              moving. Some would say it’s a living thing because you never know
              what you are going to see on any given night of stargazing. Of the
              many celestial phenomenons, there is probably none as exciting as
              when you see your first asteroid on the move in the heavens. To call
              asteroids the “rock stars” of astronomy is both a bad joke and an
              accurate depiction of how astronomy fans view them. Unlike suns,
              planets, and moons, asteroids are on the move, ever changing and, if
              they appear in the night sky, they are exciting and dynamic.
            </p>
            <hr className={"mt-5"} />
            <div className={`${s.bulletPoints} d-flex flex-column w-100`}>
              <div className={"d-flex justify-content-center mt-4"}>
                <div className={s.number}>1</div>
                <div style={{ maxWidth: 600 }}>
                  <h6 className={"fw-bold mb-4"}>
                    Unmatched Toner Cartridge Quality
                  </h6>
                  <p>
                    There is a lot of exciting stuff going on in the stars above
                    us that makes astronomy so much fun. The universe is
                    constantly changing and moving. Some would say it’s a “living”
                    thing because you never know what you are going to see on any
                    given night of stargazing.
                  </p>
                </div>
              </div>
              <div className={"d-flex justify-content-center mt-5"}>
                <div className={s.number}>2</div>
                <div style={{ maxWidth: 600 }}>
                  <h6 className={"fw-bold mb-4"}>
                    Unmatched Toner Cartridge Quality
                  </h6>
                  <p>
                    There is a lot of exciting stuff going on in the stars above
                    us that makes astronomy so much fun. The universe is
                    constantly changing and moving. Some would say it’s a “living”
                    thing because you never know what you are going to see on any
                    given night of stargazing.
                  </p>
                </div>
              </div>
            </div>
            <hr />
          </Col>
        </Row>
      </Container>
      <Container style={{ marginTop: 80, marginBottom: 80 }}>
        <h3 className={"text-center fw-bold mb-4"}>More From Our Blog</h3>
        <Row className={"justify-content-center mb-2"}>
          <Col sm={8}>
            <p className={"text-center text-muted mb-4"}>
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout. The
              point of using Lorem Ipsum
            </p>
          </Col>
        </Row>
        <Row>
          <Col
            xs={12}
            md={4}
            className={"mb-4 d-flex flex-column align-items-center"}
          >
            <Link href="/blog/article/07aeff53-31e5-4276-8307-f855b22b6436">
              <img src={article1} className={"img-fluid"} />
            </Link>
            <p className={"mt-3 text-muted mb-0"}>March 12, 2020</p>
            <h6
              className={"fw-bold font-size-base mt-1"}
              style={{ fontSize: 16 }}
            >
              What is Shabby Chic? 
            </h6>
            <h6 style={{ fontSize: 16 }} className={"fw-bold text-primary"}>
              <Link href="/blog/article/07aeff53-31e5-4276-8307-f855b22b6436">Read More</Link>
            </h6>
          </Col>
          <Col
            xs={12}
            md={4}
            className={"mb-4 d-flex flex-column align-items-center"}
          >
            <Link href="/blog/article/c4245ff9-6a53-4b13-8539-0b69b442cfd1">
              <img src={article2} className={"img-fluid"} />
            </Link>
            <p className={"mt-3 text-muted mb-0"}>March 12, 2020</p>
            <h6
              className={"fw-bold font-size-base mt-1"}
              style={{ fontSize: 16 }}
            >
              Best Examples of Maximalism
            </h6>
            <h6 style={{ fontSize: 16 }} className={"fw-bold text-primary"}>
              <Link href="/blog/article/c4245ff9-6a53-4b13-8539-0b69b442cfd1">Read More</Link>
            </h6>
          </Col>
          <Col
            xs={12}
            md={4}
            className={"mb-4 d-flex flex-column align-items-center"}
          >
            <Link href="/blog/article/57fbad3f-528a-43b2-83e8-32ba30708194"><img src={article3} className={"img-fluid"} /></Link>
            <p className={"mt-3 text-muted mb-0"}>March 12, 2020</p>
            <h6
              className={"fw-bold font-size-base mt-1"}
              style={{ fontSize: 16 }}
            >
              What is Lorem Ipsum?
            </h6>
            <h6 style={{ fontSize: 16 }} className={"fw-bold text-primary"}>
              <Link href="/blog/article/57fbad3f-528a-43b2-83e8-32ba30708194">Read More</Link>
            </h6>
          </Col>
        </Row>
      </Container>
      <Container
        style={{ marginTop: 80, marginBottom: 80 }}
        className={"d-flex flex-column align-items-center"}
      >
        <Row style={{ maxWidth: 700 }}>
          <Col md={12}>
            <p className={s.paragraph}>
              There is a lot of exciting stuff going on in the stars above us that
              makes astronomy so much fun. The universe is constantly changing and
              moving. Some would say it’s a living thing because you never know
              what you are going to see on any given night of stargazing. Of the
              many celestial phenomenons, there is probably none as exciting as
              when you see your first asteroid on the move in the heavens. To call
              asteroids the “rock stars” of astronomy is both a bad joke and an
              accurate depiction of how astronomy fans view them. Unlike suns,
              planets, and moons, asteroids are on the move, ever changing and, if
              they appear in the night sky, they are exciting and dynamic.
            </p>

            <p className={`${s.paragraph} mt-5`}>
              There is a lot of exciting stuff going on in the stars above us that
              makes astronomy so much fun. The universe is constantly changing and
              moving. Some would say it’s a living thing because you never know
              what you are going to see on any given night of stargazing. Of the
              many celestial phenomenons, there is probably none as exciting as
              when you see your first asteroid on the move in the heavens. To call
              asteroids the “rock stars” of astronomy is both a bad joke and an
              accurate depiction of how astronomy fans view them. Unlike suns,
              planets, and moons, asteroids are on the move, ever changing and, if
              they appear in the night sky, they are exciting and dynamic.
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default Blog;
