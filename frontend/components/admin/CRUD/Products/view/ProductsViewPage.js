import React, { Component } from "react";
import ProductsView from "components/admin/CRUD/Products/view/ProductsView";
import actions from "actions/products/productsFormActions";
import { connect } from "react-redux";

class ProductsPage extends Component {
  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch(actions.doFind(match.params.id));
  }

  render() {
    return (
      <React.Fragment>
        <ProductsView loading={this.props.loading} record={this.props.record} />
      </React.Fragment>
    );
  }
}

function mapStateToProps(store) {
  return {
    loading: store.users.form.loading,
    record: store.users.form.record,
  };
}

export default connect(mapStateToProps)(ProductsPage);
