import * as dataFormat from "./BlogsDataFormatters";

import * as categoriesDataFormat from "../categories/CategoriesDataFormatters";
import { withRouter } from "next/router"
import actions from "redux/actions/blogs/blogsListActions";
import React, { Component } from "react";
import Link from 'next/link'
import { connect } from "react-redux";

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

class BlogsListTable extends Component {
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
        <Button
          size="xs"
          onClick={() => this.props.router.push(`/admin/blogs/${cell}`)}
          style={{ background: "#2563EB", color: "#000000", border: "none", fontWeight: "700" }}
        >
          View
        </Button>
        &nbsp;&nbsp;
        <Button
          size="xs"
          onClick={() =>
            this.props.router.push(`/admin/blogs/edit/${cell}`)
          }
          style={{ background: "transparent", color: "#111111", border: "1px solid #E0E0E0" }}
        >
          Edit
        </Button>
        &nbsp;&nbsp;
        <Button
          size="xs"
          onClick={() => this.openModal(cell)}
          style={{ background: "rgba(239, 68, 68, 0.2)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.4)" }}
        >
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
        <Widget
          title={
            <div className="d-flex align-items-center">
              <span className="vq-pulse-beacon mr-2" />
              <h4 className="mb-0 font-weight-bold">Security Bulletins & Research Publications</h4>
            </div>
          }
          collapse
          close
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span style={{ color: "#666666", fontSize: "13px" }}>
              Peer-reviewed cryptographic research, formal verification papers, and Post-Quantum transition advisories.
            </span>
            <span className="badge" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563EB", border: "1px solid #2563EB", fontFamily: "monospace", padding: "6px 12px" }}>
              6 RESEARCH PAPERS PUBLISHED
            </span>
          </div>
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
              dataField="hero_image"
              dataSort
              dataFormat={dataFormat.imageFormatter}
            >
              <span className="fs-sm">Figure</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="title" dataSort>
              <span className="fs-sm">Bulletin / Paper Title</span>
            </TableHeaderColumn>

            <TableHeaderColumn
              dataField="author_avatar"
              dataSort
              dataFormat={dataFormat.imageFormatter}
            >
              <span className="fs-sm">Researcher</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="author_name" dataSort>
              <span className="fs-sm">Lead Author</span>
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
          <ModalHeader toggle={() => this.closeModal()} style={{ background: "#FFFFFF", color: "#111111", borderBottom: "1px solid #EEEEEE" }}>
            Confirm delete
          </ModalHeader>
          <ModalBody style={{ background: "#FFFFFF", color: "#111111" }}>
            Are you sure you want to delete this bulletin?
          </ModalBody>
          <ModalFooter style={{ background: "#FFFFFF", borderTop: "1px solid #EEEEEE" }}>
            <Button color="secondary" onClick={() => this.closeModal()} style={{ background: "#222222", border: "none" }}>
              Cancel
            </Button>
            <Button onClick={() => this.handleDelete()} style={{ background: "#EF4444", border: "none", color: "#111111" }}>
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
    loading: store.blogs.list.loading,
    rows: store.blogs.list.rows,
    modalOpen: store.blogs.list.modalOpen,
    idToDelete: store.blogs.list.idToDelete,
  };
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/blogs");
  // const blogs = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default connect(mapStateToProps)(withRouter(BlogsListTable));
