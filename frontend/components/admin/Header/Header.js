import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withRouter } from "next/router";
import { NavbarTypes } from "../../../redux/reducers/layout";
import {
  Navbar,
  Nav,
  Dropdown,
  NavItem,
  NavLink,
  NavbarText,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
  InputGroupAddon,
  InputGroup,
  Input,
  Form,
  FormGroup,
} from "reactstrap";
import chroma from "chroma-js";
import cx from "classnames";
import { logoutUser } from "redux/actions/auth";
import {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  changeActiveSidebarItem,
} from "redux/actions/navigation";

import s from "./Header.module.scss";

class Header extends React.Component {
  static propTypes = {
    sidebarOpened: PropTypes.bool,
    sidebarStatic: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.toggleMenu = this.toggleMenu.bind(this);
    this.switchSidebar = this.switchSidebar.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.doLogout = this.doLogout.bind(this);

    this.state = {
      menuOpen: false,
      focus: false,
      showNewMessage: false,
      hideMessage: true,
      run: true,
    };
  }

  toggleFocus = () => {
    this.setState({ focus: !this.state.focus });
  };

  doLogout() {
    this.props.dispatch(logoutUser());
    this.props.router.push('/login');
  }

  // collapse/uncolappse
  switchSidebar() {
    if (this.props.sidebarOpened) {
      this.props.dispatch(closeSidebar());
      this.props.dispatch(changeActiveSidebarItem(null));
    } else {
      const paths = this.props.router.pathname.split("/");
      paths.pop();
      this.props.dispatch(openSidebar());
      this.props.dispatch(changeActiveSidebarItem(paths.join("/")));
    }
  }

  // static/non-static
  toggleSidebar() {
    this.props.dispatch(toggleSidebar(!this.props.sidebarStatic));
    if (this.props.sidebarStatic) {
      typeof window !== 'undefined' && localStorage.setItem("staticSidebar", "false");
      this.props.dispatch(changeActiveSidebarItem(null));
    } else {
      typeof window !== 'undefined' && localStorage.setItem("staticSidebar", "true");
      const paths = this.props.router.pathname.split("/");
      paths.pop();
      this.props.dispatch(changeActiveSidebarItem(paths.join("/")));
    }
  }

  toggleMenu() {
    this.setState({
      menuOpen: !this.state.menuOpen,
    });
  }
  render() {
    const { focus } = this.state;
    const { navbarType, navbarColor, openUsersList } = this.props;

    const user = this.props.currentUser;
    const displayName = (user && (user.firstName || user.email)) || "admin@vardhan-quantum.com";
    const avatar =
      user && user.avatar && user.avatar.length && user.avatar[0].publicUrl;
    const firstUserLetter = displayName[0].toUpperCase();

    return (
      <Navbar
        className={`${s.root} d-print-none ${
          navbarType === NavbarTypes.FLOATING ? s.navbarFloatingType : ""
        }`}
        style={{
          backgroundColor: navbarColor,
          zIndex: !openUsersList ? 100 : 0,
        }}
      >
        <Nav>
          <NavItem>
            <NavLink
              className="d-md-down-none ml-2"
              id="toggleSidebar"
              onClick={this.toggleSidebar}
            >
              <i
                className={`la la-bars ${
                  chroma(navbarColor).luminance() < 0.4 ? "text-white" : ""
                }`}
              />
            </NavLink>
            <UncontrolledTooltip placement="bottom" target="toggleSidebar">
              Turn on/off
              <br />
              sidebar
              <br />
              collapsing
            </UncontrolledTooltip>
            <NavLink className="fs-lg d-lg-none" onClick={this.switchSidebar}>
              <span className={`rounded rounded-lg d-md-none d-sm-down-block`}>
                <i
                  className="la la-bars"
                  style={{
                    fontSize: 30,
                    color:
                      navbarColor === "#ffffff"
                        ? "#ffffff"
                        : chroma(navbarColor).luminance() < 0.4
                        ? "#ffffff"
                        : "",
                  }}
                />
              </span>
              <i
                className={`la la-bars ml-2 d-sm-down-none ${
                  chroma(navbarColor).luminance() < 0.4 ? "text-white" : ""
                }`}
              />
            </NavLink>
          </NavItem>
        </Nav>

        <Form className={`d-sm-down-none ml-3 ${s.headerSearchInput}`} inline>
          <FormGroup>
            <InputGroup
              onFocus={this.toggleFocus}
              onBlur={this.toggleFocus}
              className={cx("input-group-no-border", { focus: !!focus })}
            >
              <InputGroupAddon addonType="prepend">
                <i className="la la-search" />
              </InputGroupAddon>
              <Input
                id="search-input"
                placeholder="Search Merkle blocks, nodes, or cryptographic identities..."
                className={cx({ focus: !!focus })}
              />
            </InputGroup>
          </FormGroup>
        </Form>

        <div className="d-none d-lg-flex align-items-center ml-auto mr-3" style={{ flexShrink: 0 }}>
          <div className="d-flex align-items-center px-3 py-1" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', whiteSpace: 'nowrap' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', boxShadow: '0 0 8px rgba(37, 99, 235, 0.4)', display: 'inline-block', marginRight: 8, flexShrink: 0 }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1D4ED8', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              FIPS 203/204 • RAFT LEADER • DORA SEALED
            </span>
          </div>
        </div>

        <NavLink
          className={`${s.navbarBrand} d-md-none ${
            chroma(navbarColor).luminance() < 0.4 ? "text-white" : ""
          }`}
        >
          <i className="la la-circle text-primary mr-n-sm" />
          <i className="la la-circle text-danger" />
          &nbsp; Vardhan Quantum &nbsp;
          <i className="la la-circle text-danger mr-n-sm" />
          <i className="la la-circle text-primary" />
        </NavLink>

        <Nav className="d-flex align-items-center pr-3">
          <NavbarText className="d-flex align-items-center mr-2">
            <span
              className={`${s.avatar} rounded-circle thumb-sm mr-2`}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="..."
                  title={displayName}
                />
              ) : (
                <span title={displayName}>
                  {firstUserLetter}
                </span>
              )}
            </span>
            <span
              className={`d-sm-down-none`}
              style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}
            >
              {displayName}
            </span>
          </NavbarText>
          <Dropdown
            nav
            isOpen={this.state.menuOpen}
            toggle={this.toggleMenu}
            className="tutorial-dropdown pr-4"
          >
            <DropdownToggle nav>
              <i
                className={`la la-cog ${
                  chroma(navbarColor).luminance() < 0.4 ? "text-white" : ""
                }`}
              />
            </DropdownToggle>
            <DropdownMenu right className={`super-colors`}>
              <DropdownItem onClick={() => this.props.router.push('/admin/users')}>
                <i className="la la-user" /> Identity & RBAC
              </DropdownItem>
              <DropdownItem onClick={() => this.props.router.push('/admin/password')}>
                <i className="la la-key" /> Credential & Keys
              </DropdownItem>
              <DropdownItem onClick={this.doLogout}>
                <i className="la la-sign-out" /> Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </Navbar>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    currentUser: store.auth.currentUser,
    navbarType: store.layout.navbarType,
    navbarColor: store.layout.navbarColor,
  };
}

export default withRouter(connect(mapStateToProps)(Header));
