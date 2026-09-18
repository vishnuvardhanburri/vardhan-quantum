import * as dataFormat from "./ProductsDataFormatters";
import * as categoriesDataFormat from "../categories/CategoriesDataFormatters";
import { withRouter } from "next/router";
import actions from "redux/actions/products/productsListActions";
import React, { Component } from "react";
import Link from 'next/link';
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
  Row,
  Col,
  Badge
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import Widget from "components/admin/Widget";

class ProductsListTable extends Component {
  state = {
    viewMode: "chassis", // chassis | table
    modalOpen: false,
    idToDelete: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actions.doFetch({}));
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
        <Button
          color="default"
          size="xs"
          onClick={() => this.props.router.push(`/admin/products/${cell}`)}
        >
          Inspect
        </Button>
        &nbsp;&nbsp;
        <Button
          color="info"
          size="xs"
          onClick={() =>
            this.props.router.push(`/admin/products/edit/${cell}`)
          }
        >
          Configure
        </Button>
      </div>
    );
  }

  render() {
    const { rows } = this.props;
    const { viewMode } = this.state;

    return (
      <div>
        <Widget 
          title={
            <div className="d-flex align-items-center">
              <span className="vq-pulse-beacon mr-2" />
              <h4 className="mb-0 font-weight-bold">Ingress Fleet & Cryptographic Hardware Appliances</h4>
            </div>
          } 
          collapse 
          close
        >
          {/* Header Controls & View Toggle */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
            <div>
              <div className="text-muted small">
                Bare-metal 19-inch rack-mount chassis modules and high-assurance AVX-512 SIMD NTT hardware accelerators.
              </div>
              <span className="badge badge-success mt-1">3 APPLIANCES ONLINE & SYNCHRONIZED</span>
            </div>

            <div className="vq-segmented-control mt-2 mt-sm-0">
              <button
                className={`vq-segmented-btn ${viewMode === "chassis" ? "active" : ""}`}
                onClick={() => this.setState({ viewMode: "chassis" })}
              >
                19" Server Rack View
              </button>
              <button
                className={`vq-segmented-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => this.setState({ viewMode: "table" })}
              >
                Telemetry Data Table
              </button>
            </div>
          </div>

          {/* CHASSIS RACK VIEW */}
          {viewMode === "chassis" ? (
            <div style={{
              background: "#03060C",
              border: "2px solid #1E293B",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.9)"
            }}>
              <div className="d-flex justify-content-between text-muted small mb-3 px-2">
                <span>RACK 01 // SOVEREIGN CLUSTER (42U ENCLOSURE)</span>
                <span>COOLING: ACTIVE // POWER: DUAL 1200W PLATINUM</span>
              </div>

              {rows && rows.map((node, index) => (
                <div key={node.id || index} style={{
                  background: "linear-gradient(180deg, #141414 0%, #080808 100%)",
                  border: "1px solid #E0E0E0",
                  borderLeft: index === 0 ? "4px solid #2563EB" : "4px solid #FFFFFF",
                  borderRadius: "8px",
                  padding: "16px 20px",
                  marginBottom: "16px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.6)"
                }}>
                  <Row className="align-items-center">
                    {/* Front Panel LED Indicators */}
                    <Col lg={4} md={5} className="mb-3 mb-md-0">
                      <div className="d-flex align-items-center">
                        <div className="mr-3" style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "10px", color: "#666666", fontFamily: "var(--vq-mono-font)" }}>UNIT</div>
                          <div className="h5 font-weight-bold text-white mb-0">U0{index + 1}</div>
                        </div>
                        <div>
                          <div className="d-flex align-items-center">
                            <span className="vq-pulse-beacon mr-2" />
                            <strong className="text-white h6 mb-0">{node.title}</strong>
                          </div>
                          <div className="text-muted small mt-1 font-family-monospace">
                            ID: <span style={{ color: "#2563EB" }}>{node.id}</span> // AVX-512 SIMD
                          </div>
                        </div>
                      </div>
                    </Col>

                    {/* Telemetry Meters */}
                    <Col lg={5} md={4} className="mb-3 mb-md-0">
                      <Row>
                        <Col xs={4}>
                          <div className="text-muted small">CONSENSUS</div>
                          <span className={index === 0 ? "vq-badge-yellow" : "vq-badge-white"}>
                            {node.status}
                          </span>
                        </Col>
                        <Col xs={4}>
                          <div className="text-muted small">THROUGHPUT</div>
                          <strong className="text-white small font-family-monospace">{node.price || "10 Gbps"}</strong>
                        </Col>
                        <Col xs={4}>
                          <div className="text-muted small">ENTROPY</div>
                          <strong style={{ color: "#2563EB" }} className="small font-family-monospace">7.999 b/B</strong>
                        </Col>
                      </Row>
                    </Col>

                    {/* Action Controls */}
                    <Col lg={3} md={3} className="text-md-right">
                      <Button
                        size="sm"
                        color="outline-light"
                        className="mr-2"
                        onClick={() => this.props.router.push(`/admin/products/${node.id}`)}
                        style={{ fontSize: "11px", borderColor: "rgba(255,255,255,0.25)" }}
                      >
                        Chassis Telemetry
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        className="text-dark font-weight-bold"
                        onClick={() => this.props.router.push(`/admin/products/edit/${node.id}`)}
                        style={{ fontSize: "11px", background: "#2563EB", border: "none", color: "#000000", fontWeight: "700" }}
                      >
                        Configure
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          ) : (
            /* DATA TABLE VIEW */
            <BootstrapTable
              bordered={false}
              data={rows}
              version="4"
              pagination
              search
              tableContainerClass="table-responsive table-hover"
            >
              <TableHeaderColumn isKey dataField="id" dataSort>
                <span className="fs-sm">Appliance ID</span>
              </TableHeaderColumn>

              <TableHeaderColumn dataField="title" dataSort>
                <span className="fs-sm">Node Identifier & Hostname</span>
              </TableHeaderColumn>

              <TableHeaderColumn dataField="price" dataSort>
                <span className="fs-sm">Wire Bandwidth / Latency</span>
              </TableHeaderColumn>

              <TableHeaderColumn dataField="rating" dataSort>
                <span className="fs-sm">Assurance Tier</span>
              </TableHeaderColumn>

              <TableHeaderColumn dataField="status" dataSort>
                <span className="fs-sm">Consensus Role</span>
              </TableHeaderColumn>

              <TableHeaderColumn
                dataField="id"
                dataFormat={this.actionFormatter.bind(this)}
              >
                <span className="fs-sm">Actions</span>
              </TableHeaderColumn>
            </BootstrapTable>
          )}
        </Widget>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    loading: store.products.list.loading,
    rows: store.products.list.rows,
    modalOpen: store.products.list.modalOpen,
    idToDelete: store.products.list.idToDelete,
  };
}

export default connect(mapStateToProps)(withRouter(ProductsListTable));
