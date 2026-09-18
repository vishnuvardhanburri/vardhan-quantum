<?xml version="2.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:strip-space elements="*" />
<xsl:output method="text" />
<xsl:template match="/opt">

import * as dataFormat from 'components/CRUD/Blogs/list/BlogsDataFormatters';

<xsl:for-each-group select="./entities[@name='blogs']/fields[@type='relation_one' or @type='relation_many']" group-by="@ref" >
import * as <xsl:value-of select="{current-grouping-key()}"/>DataFormat from 'components/CRUD/<xsl:value-of select="{current-grouping-key()}"/>/list/<xsl:value-of select="{current-grouping-key()}"/>DataFormatters';
</xsl:for-each-group>

import actions from 'actions/blogs/blogsListActions';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

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
} from 'reactstrap';

import {
  BootstrapTable,
  TableHeaderColumn,
} from 'react-bootstrap-table';

import Widget from 'components/Widget';

class BlogsListTable extends Component {
  state = {
    modalOpen: false,
    idToDelete: null
  }

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
{ null && <Button
          color="default"
          size="xs"
          onClick={() => this.props.dispatch(push(`/admin/blogs/${cell}`))}
        >
      View
      </Button>
}
        <Button
          color="info"
          size="xs"
          onClick={() => this.props.dispatch(push(`/admin/blogs/${cell}/edit`))}
        >
        Edit
      </Button>
      &nbsp;&nbsp;
      <Button
          color="danger"
          size="xs"
          onClick={() => this.openModal(cell)}
        >
        Delete
        </Button>
        </div>
     )
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actions.doFetch({}));
  }

  renderSizePerPageDropDown = (props) => {
    const limits = [];
    props.sizePerPageList.forEach((limit) => {
      limits.push(<DropdownItem key={limit} onClick={() => props.changeSizePerPage(limit)}>{ limit }</DropdownItem>);
    });

    return (
      <Dropdown isOpen={props.open} toggle={props.toggleDropDown}>
        <DropdownToggle color="default" caret>
          { props.currSizePerPage }
        </DropdownToggle>
        <DropdownMenu>
          { limits }
        </DropdownMenu>
      </Dropdown>
    );
  };

  render() {
    const {
      rows
    } = this.props;

    const options = {
      sizePerPage: 10,
      paginationSize: 5,
      sizePerPageDropDown: this.renderSizePerPageDropDown,
    };

    return (
        <div>
          <Widget title={<h4>Blogs</h4>} collapse close>
            <Link to="/admin/blogs/new">
              <button
                className="btn btn-primary"
                type="button"
              >
                New
              </button>
            </Link>
            <BootstrapTable bordered={false} data={rows} version="4" pagination options={options} search tableContainerClass={`table-responsive table-striped table-hover`}>
<xsl:for-each select="./entities[@name='blogs']/fields[@show_in_table = 'yes']">
              <TableHeaderColumn dataField="{|@name|}" dataSort
                <xsl:if test="@type='datetime'">
                dataFormat={dataFormat.dateTimeFormatter}
                </xsl:if>
                <xsl:if test="@type='boolean'">
                dataFormat={dataFormat.booleanFormatter}
                </xsl:if>
                <xsl:if test="@type='images'">
                dataFormat={dataFormat.imageFormatter}
                </xsl:if>
                <xsl:if test="@type='files'">
                dataFormat={dataFormat.filesFormatter}
                </xsl:if>
                <xsl:if test="@type='relation_one' or @type='relation_many'">
                dataFormat={<xsl:value-of select="./@ref"/>DataFormat.listFormatter}
                </xsl:if>
              >
                <span className="fs-sm">{|@title|}</span>
              </TableHeaderColumn>
</xsl:for-each>
              <TableHeaderColumn isKey dataField="id" dataFormat={this.actionFormatter.bind(this)}>
                <span className="fs-sm">Actions</span>
              </TableHeaderColumn>
            </BootstrapTable>
          </Widget>

          <Modal size="sm" isOpen={this.props.modalOpen} toggle={() => this.closeModal()}>
            <ModalHeader toggle={() => this.closeModal()}>Confirm delete</ModalHeader>
            <ModalBody className="bg-white">
              Are you sure you want to delete this item?
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => this.closeModal()}>Cancel</Button>
              <Button color="primary" onClick={() => this.handleDelete()}>Delete</Button>
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

export default connect(mapStateToProps)(BlogsListTable);
</xsl:template>
</xsl:stylesheet>
