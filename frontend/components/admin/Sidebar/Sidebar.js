import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import Link from "next/link";
import s from "./Sidebar.module.scss";
import {
  openSidebar,
  closeSidebar,
  changeActiveSidebarItem,
} from "redux/actions/navigation";
import isScreen from "core/screenHelper";
import { logoutUser } from "redux/actions/auth";

class Sidebar extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    activeItem: PropTypes.string,
    router: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    sidebarStatic: false,
    sidebarOpened: true,
    activeItem: "",
  };

  constructor(props) {
    super(props);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.doLogout = this.doLogout.bind(this);
  }

  onMouseEnter() {
    if (!this.props.sidebarStatic && (isScreen("lg") || isScreen("xl"))) {
      this.props.dispatch(openSidebar());
    }
  }

  onMouseLeave() {
    if (!this.props.sidebarStatic && (isScreen("lg") || isScreen("xl"))) {
      this.props.dispatch(closeSidebar());
    }
  }

  doLogout() {
    this.props.dispatch(logoutUser());
  }

  render() {
    const currentPath = this.props.router.pathname || "";

    const navSections = [
      {
        kicker: "// CORE OPERATIONS",
        items: [
          {
            title: "Command Center",
            link: "/admin/dashboard",
            badge: null,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
                <path d="M7 8l3 3-3 3"></path>
                <line x1="13" y1="14" x2="17" y2="14"></line>
              </svg>
            ),
          },
          {
            title: "Nodes & Appliances",
            link: "/admin/products",
            badge: { text: "3 ONLINE", type: "success" },
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
            ),
          },
          {
            title: "Global Topology",
            link: "/topology",
            badge: null,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            ),
          },
        ],
      },
      {
        kicker: "// CRYPTOGRAPHIC MESH",
        items: [
          {
            title: "Merkle Audit Ledger",
            link: "/admin/orders",
            badge: { text: "BLAKE3", type: "purple" },
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            ),
          },
          {
            title: "Security Alerts",
            link: "/admin/feedback",
            badge: { text: "2 ALERTS", type: "alert" },
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            ),
          },
          {
            title: "Cryptographic Suite",
            link: "/admin/categories",
            badge: { text: "FIPS 204", type: "info" },
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            ),
          },
        ],
      },
      {
        kicker: "// ACCESS & SOVEREIGNTY",
        items: [
          {
            title: "Identity & RBAC",
            link: "/admin/users",
            badge: null,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            ),
          },
          {
            title: "Credential & Keys",
            link: "/admin/password",
            badge: { text: "HSM", type: "info" },
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7.5" cy="15.5" r="5.5"></circle>
                <path d="m21 2-9.6 9.6"></path>
                <path d="m15.5 7.5 3 3L22 7l-3-3"></path>
              </svg>
            ),
          },
        ],
      },
    ];

    const isClosed = !this.props.sidebarOpened && !this.props.sidebarStatic;

    return (
      <div className={`${isClosed ? s.sidebarClose : ""} ${s.sidebarWrapper}`}>
        <nav
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          className={s.root}
        >
          {/* Header */}
          <header className={s.brandHeader}>
            <div className={s.brandRow}>
              <Link href="/admin/dashboard">
                <a className={s.brandLogo}>
                  Vardhan<span className={s.brandAccent}>.Quantum</span>
                </a>
              </Link>
              <span className={s.brandVersion}>v2.4</span>
            </div>
            <div className={s.brandSubRow}>
              <span className={s.statusPulse} />
              <span className={s.statusLabel}>ENCLAVE LEADER // ONLINE</span>
            </div>
          </header>

          {/* Navigation Body */}
          <div className={s.navBody}>
            {navSections.map((sec, secIdx) => (
              <div key={secIdx}>
                <div className={s.sectionKicker}>{sec.kicker}</div>
                {sec.items.map((item, itemIdx) => {
                  const isActive = currentPath === item.link || (item.link !== "/admin/dashboard" && currentPath.startsWith(item.link));

                  return (
                    <Link href={item.link} key={itemIdx}>
                      <a className={`${s.navItem} ${isActive ? s.active : ""}`}>
                        <div className={s.itemLeft}>
                          <span className={s.itemIcon}>{item.icon}</span>
                          <span className={s.itemText}>{item.title}</span>
                        </div>

                        <div className={s.itemRight}>
                          {item.badge && (
                            <span
                              className={
                                item.badge.type === "success"
                                  ? s.badgeSuccess
                                  : item.badge.type === "alert"
                                  ? s.badgeAlert
                                  : item.badge.type === "purple"
                                  ? s.badgePurple
                                  : s.badgeInfo
                              }
                            >
                              {item.badge.type === "alert" && <span className={s.alertDot} />}
                              {item.badge.text}
                            </span>
                          )}
                          <span className={s.activeArrow}>→</span>
                        </div>
                      </a>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom HSM Enclave Widget */}
          <div className={s.bottomDock}>
            <div className={s.hsmStatusCard}>
              <div className={s.hsmHeader}>
                <span className={s.hsmTitle}>HSM ENCLAVE</span>
                <span className={s.hsmStatusPill}>ACTIVE</span>
              </div>
              <div className={s.hsmMeta}>
                <div>Token: Nitrokey HSM2</div>
                <div>Raft Quorum: 3/3 Leader</div>
              </div>
            </div>

            <div className={s.operatorRow}>
              <div className={s.operatorInfo}>
                <span className={s.operatorAvatar}>C</span>
                <div>
                  <div className={s.operatorName}>admin</div>
                  <div className={s.operatorRole}>CISO Root Officer</div>
                </div>
              </div>
              <button
                type="button"
                onClick={this.doLogout}
                className={s.logoutBtn}
                title="Sign Out of Enclave"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    activeItem: store.navigation.activeItem,
    currentUser: store.auth.currentUser,
  };
}

export default withRouter(connect(mapStateToProps)(Sidebar));
