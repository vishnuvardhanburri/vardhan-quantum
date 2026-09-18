import React, { Component } from "react";
import OrdersView from "components/admin/CRUD/Orders/view/OrdersView";
import actions from "actions/orders/ordersFormActions";
import { connect } from "react-redux";

class OrdersPage extends Component {
  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch(actions.doFind(match.params.id));
  }

  render() {
    return (
      <React.Fragment>
        <OrdersView loading={this.props.loading} record={this.props.record} />
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

export default connect(mapStateToProps)(OrdersPage);
