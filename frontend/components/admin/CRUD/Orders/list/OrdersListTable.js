import * as dataFormat from "components/admin/CRUD/Orders/list/OrdersDataFormatters";

import * as productsDataFormat from "components/admin/CRUD/Products/list/ProductsDataFormatters";
import * as usersDataFormat from "components/admin/CRUD/Users/list/UsersDataFormatters";

import actions from "actions/orders/ordersListActions";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { push } from "connected-react-router";

import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

import Widget from "components/admin/Widget";

class OrdersListTable extends Component {
  state = {
    modalOpen: false,
    idToDelete: null,
  };

  handleDelete() {
    const id = this.props.idToDelete;
    this.props.dispatch(actions.doDelete(id));
  }

  openModal(cell) {
    const id = cell;
    this.props.dispatch(actions.doOpenConfirm(id));
  }

  closeModal() {
    this.props.dispatch(actions.doCloseConfirm());
  }

  actionFormatter(cell) {
    return (
      <div>
        {null && (
          <Button
            color="default"
            size="xs"
            onClick={() => this.props.dispatch(push(`/admin/orders/${cell}`))}
          >
            View
          </Button>
        )}
        <Button
          color="info"
          size="xs"
          onClick={() =>
            this.props.dispatch(push(`/admin/orders/${cell}/edit`))
          }
        >
          Edit
        </Button>
        &nbsp;&nbsp;
        <Button color="danger" size="xs" onClick={() => this.openModal(cell)}>
          Delete
        </Button>
      </div>
    );
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actions.doFetch({}));
  }

  renderSizePerPageDropDown = (props) => {
    const limits = [];
    props.sizePerPageList.forEach((limit) => {
      limits.push(
        <DropdownItem
          key={limit}
          onClick={() => props.changeSizePerPage(limit)}
        >
          {limit}
        </DropdownItem>
      );
    });

    return (
      <Dropdown isOpen={props.open} toggle={props.toggleDropDown}>
        <DropdownToggle color="default" caret>
          {props.currSizePerPage}
        </DropdownToggle>
        <DropdownMenu>{limits}</DropdownMenu>
      </Dropdown>
    );
  };

  render() {
    const { rows } = this.props;

    const options = {
      sizePerPage: 10,
      paginationSize: 5,
      sizePerPageDropDown: this.renderSizePerPageDropDown,
    };

    return (
      <div>
        <Widget title={<h4>Orders</h4>} collapse close>
          <Link to="/admin/orders/new">
            <button className="btn btn-primary" type="button">
              New
            </button>
          </Link>
          <BootstrapTable
            bordered={false}
            data={rows}
            version="4"
            pagination
            options={options}
            search
            tableContainerClass={`table-responsive table-striped table-hover`}
          >
            <TableHeaderColumn
              dataField="order_date"
              dataSort
              dataFormat={dataFormat.dateTimeFormatter}
            >
              <span className="fs-sm">Order date</span>
            </TableHeaderColumn>

            <TableHeaderColumn
              dataField="product"
              dataSort
              dataFormat={productsDataFormat.listFormatter}
            >
              <span className="fs-sm">Product</span>
            </TableHeaderColumn>

            <TableHeaderColumn
              dataField="user"
              dataSort
              dataFormat={usersDataFormat.listFormatter}
            >
              <span className="fs-sm">User</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="amount" dataSort>
              <span className="fs-sm">Amount</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="status" dataSort>
              <span className="fs-sm">Status</span>
            </TableHeaderColumn>

            <TableHeaderColumn
              isKey
              dataField="id"
              dataFormat={this.actionFormatter.bind(this)}
            >
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
        </Widget>

        <Modal
          size="sm"
          isOpen={this.props.modalOpen}
          toggle={() => this.closeModal()}
        >
          <ModalHeader toggle={() => this.closeModal()}>
            Confirm delete
          </ModalHeader>
          <ModalBody className="bg-white">
            Are you sure you want to delete this item?
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => this.closeModal()}>
              Cancel
            </Button>
            <Button color="primary" onClick={() => this.handleDelete()}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    loading: store.orders.list.loading,
    rows: store.orders.list.rows,
    modalOpen: store.orders.list.modalOpen,
    idToDelete: store.orders.list.idToDelete,
  };
}

export default connect(mapStateToProps)(OrdersListTable);
