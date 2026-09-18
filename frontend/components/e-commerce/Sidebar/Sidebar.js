import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import Link from "next/link";
import s from "./Sidebar.module.scss";
import LinksGroup from "./LinksGroup";
import {
  closeSidebar,
  changeActiveSidebarItem,
} from "redux/actions/navigation";
import { logoutUser } from "redux/actions/auth";

class Sidebar extends React.Component {
  static propTypes = {
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    activeItem: PropTypes.string,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
  };

  static defaultProps = {
    sidebarOpened: true,
    activeItem: "",
  };

  constructor(props) {
    super(props);
    this.wrapperRef = React.createRef();
    this.doLogout = this.doLogout.bind(this);
  }

  doLogout() {
    this.props.dispatch(logoutUser());
  }

  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target) && this.props.sidebarOpened) {
      this.props.dispatch(closeSidebar());
      this.props.dispatch(changeActiveSidebarItem(null));
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
      document.removeEventListener('mousedown', this.handleClickOutside);
  }

  render() {
    return (
        <div ref={this.wrapperRef}
            className={`${
                !this.props.sidebarOpened && !this.props.sidebarStatic
                    ? s.sidebarClose
                    : ""
            } ${s.sidebarWrapper}`}
        >
          <nav className={s.root}>
            <header className={s.logo}>
            <span className={`${s.logoStyle} mx-1`}>
              Vardhan<i>.Quantum</i>
            </span>
            </header>
            <ul className={s.nav}>
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="Home"
                  link="/"
                  isHeader
              />
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="Platform"
                  link="/platform"
                  isHeader
              />
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="Security"
                  link="/security"
                  isHeader
              />
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="Post-Quantum"
                  link="/post-quantum"
                  isHeader
              />
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="Architecture"
                  link="/architecture"
                  isHeader
              />
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="Topology"
                  link="/topology"
                  isHeader
              />
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="Research"
                  link="/research"
                  isHeader
              />
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="Deployment"
                  link="/pricing"
                  isHeader
              />
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="FAQ"
                  link="/faq"
                  isHeader
              />
              <LinksGroup
                  onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                  activeItem={this.props.activeItem}
                  header="Contact / Ingress"
                  link="/contact"
                  isHeader
              />
            </ul>
            <div className={s.accountBtn}>
              <Link href={"/login"}>
                Control Plane Sign In
              </Link>
            </div>
          </nav>
        </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    activeItem: store.navigation.activeItem,
    currentUser: store.auth.currentUser,
  };
}

export default withRouter(connect(mapStateToProps)(Sidebar));
