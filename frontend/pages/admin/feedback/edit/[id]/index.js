import React, { Component } from "react";
import FeedbackForm from "./FeedbackForm";
import actions from "redux/actions/feedback/feedbackFormActions";
import { connect } from "react-redux";
import {withRouter} from 'next/router';
import Head from 'next/head';

class Index extends Component {
  state = {
    dispatched: false,
  };

  componentDidMount() {
    const { dispatch, router } = this.props;
    if (this.isEditing()) {
      dispatch(actions.doFind(router.query.id));
    } else {
      if (this.isProfile()) {
        const currentUser = typeof window !== 'undefined' && JSON.parse(localStorage.getItem("user"));
        const currentUserId = currentUser.user.id;
        dispatch(actions.doFind(currentUserId));
      } else {
        dispatch(actions.doNew());
      }
    }
    this.setState({ dispatched: true });
  }

  doSubmit = (id, data) => {
    const { dispatch } = this.props;
    if (this.isEditing() || this.isProfile()) {
      dispatch(actions.doUpdate(id, data, this.isProfile()));
    } else {
      dispatch(actions.doCreate(data));
    }
  };

  isEditing = () => {
    const { router } = this.props;
    return !!router.query.id;
  };

  isProfile = () => {
    const { router } = this.props;
    return router.pathname === "/app/profile";
  };

  render() {
    return (
      <React.Fragment>
        <Head>
          <title>Edit Feedback</title>
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
        {this.state.dispatched && (
          <FeedbackForm
            saveLoading={this.props.saveLoading}
            findLoading={this.props.findLoading}
            currentUser={this.props.currentUser}
            record={
              this.isEditing() || this.isProfile() ? this.props.record : {}
            }
            isEditing={this.isEditing()}
            isProfile={this.isProfile()}
            onSubmit={this.doSubmit}
            onCancel={() => this.props.router.push("/admin/feedback")}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(store) {
  return {
    findLoading: store.feedback.form.findLoading,
    saveLoading: store.feedback.form.saveLoading,
    record: store.feedback.form.record,
    currentUser: store.auth.currentUser,
  };
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default withRouter(connect(mapStateToProps)(Index))
