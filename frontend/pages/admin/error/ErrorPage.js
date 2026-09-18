import React from "react";
import { Container, Form, FormGroup, Input, Button } from "reactstrap";

import s from "./ErrorPage.module.scss";

class ErrorPage extends React.Component {
  render() {
    return (
      <div className={s.errorPage}>
        <Container>
          <div className={`${s.errorContainer} mx-auto`}>
            <h1 className={s.errorCode}>404</h1>
            <p className={s.errorInfo}>
              Opps, it seems that this page does not exist.
            </p>
            <p className={[s.errorHelp, "mb-3"].join(" ")}>
              If you are sure it should, search for it.
            </p>
            <Form method="get">
              <FormGroup>
                <Input
                  className="input-no-border"
                  type="text"
                  placeholder="Index Pages"
                />
              </FormGroup>
              <a href="/admin/dashboard" className="btn btn-primary mt-3">
                Return to Command Center
              </a>
            </Form>
          </div>
          <footer className={s.pageFooter}>
            {new Date().getFullYear()} &copy; Vardhan Quantum Inc. All rights reserved.
          </footer>
        </Container>
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

export default ErrorPage;
