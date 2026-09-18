import React, { Component } from "react";
import ProductsForm from "components/admin/CRUD/Products/form/ProductsForm";
import { push } from "connected-react-router";
import actions from "actions/products/productsFormActions";
import { connect } from "react-redux";

class ProductsFormPage extends Component {
  state = {
    dispatched: false,
  };

  componentDidMount() {
    const { dispatch, match } = this.props;
    if (this.isEditing()) {
      dispatch(actions.doFind(match.params.id));
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
    const { match } = this.props;
    return !!match.params.id;
  };

  isProfile = () => {
    const { match } = this.props;
    return match.url === "/app/profile";
  };

  render() {
    console.log(this.props.record);
    return (
      <React.Fragment>
        {this.state.dispatched && (
          <ProductsForm
            saveLoading={this.props.saveLoading}
            findLoading={this.props.findLoading}
            currentUser={this.props.currentUser}
            record={
              this.isEditing() || this.isProfile() ? this.props.record : {}
            }
            isEditing={this.isEditing()}
            isProfile={this.isProfile()}
            onSubmit={this.doSubmit}
            onCancel={() => this.props.dispatch(push("/admin/products"))}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(store) {
  return {
    findLoading: store.products.form.findLoading,
    saveLoading: store.products.form.saveLoading,
    record: store.products.form.record,
    currentUser: store.auth.currentUser,
  };
}

export default connect(mapStateToProps)(ProductsFormPage);
