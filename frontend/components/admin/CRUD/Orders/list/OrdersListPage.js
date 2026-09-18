import React, { Component } from "react";
import OrdersListTable from "components/admin/CRUD/Orders/list/OrdersListTable";

class OrdersListPage extends Component {
  render() {
    return (
      <div>
        <OrdersListTable />
      </div>
    );
  }
}

export default OrdersListPage;
