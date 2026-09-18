import React from 'react';
import { Container, Col, Row } from 'reactstrap';

import car from "public/images/e-commerce/home/car.svg";
import call from "public/images/e-commerce/home/headphones.svg";
import moneyBack from "public/images/e-commerce/home/Sync.svg";
import s from './InfoBlock.module.scss';

const InfoBlock = () => (
    <>
        <hr />
        <div className={s.info}>
            <Container className={"h-100"}>
            <Row
                className={
                "h-100 justify-content-between flex-column flex-md-row align-items-center"
                }
            >
                <Col
                xs={12}
                md={4}
                className={`h-100 d-flex align-items-center ${s.info__item} justify-content-center`}
                >
                <section className={"d-flex align-items-center"}>
                    <img src={car} className={"mr-3"} />
                    <div>
                    <h5 className={"fw-bold text-uppercase"}>free shipping</h5>
                    <p className={"text-muted mb-0"}>On all orders of $ 150</p>
                    </div>
                </section>
                </Col>
                <Col
                xs={12}
                md={4}
                className={`h-100 d-flex align-items-center ${s.info__item} justify-content-center`}
                >
                <section className={"d-flex align-items-center"}>
                    <img src={call} className={"mr-3"} />
                    <div>
                    <h5 className={"fw-bold text-uppercase"}>24/7 support</h5>
                    <p className={"text-muted mb-0"}>Get help when you need it</p>
                    </div>
                </section>
                </Col>
                <Col
                xs={12}
                md={4}
                className={`h-100 d-flex align-items-center ${s.info__item} justify-content-center`}
                >
                <section className={"d-flex align-items-center"}>
                    <img src={moneyBack} className={"mr-3"} />
                    <div>
                    <h5 className={"fw-bold text-uppercase"}>100% money back</h5>
                    <p className={"text-muted mb-0"}>
                        30 day money back guarantee
                    </p>
                    </div>
                </section>
                </Col>
            </Row>
            </Container>
        </div>
        <hr />
    </>
)

export default InfoBlock;