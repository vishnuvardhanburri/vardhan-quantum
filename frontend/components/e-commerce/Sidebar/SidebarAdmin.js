import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import s from "./Sidebar.module.scss";
import LinksGroup from "components/e-commerce/Sidebar/LinksGroup";
import {
    openSidebar,
    closeSidebar,
    changeActiveSidebarItem,
} from "actions/navigation";
import isScreen from "core/screenHelper";
import { logoutUser } from "actions/auth";

import HomeIcon from "images/e-commerce/sidebar/home";
import DownloadIcon from "images/e-commerce/sidebar/download";
import BarIcon from "images/e-commerce/sidebar/bar";
import FileIcon from "images/e-commerce/sidebar/file";
import GiftIcon from "images/e-commerce/sidebar/gift";
import GridIcon from "images/e-commerce/sidebar/grid";
import PersonIcon from "images/e-commerce/sidebar/person";
import PricetagIcon from "images/e-commerce/sidebar/pricetag";
import SettingsIcon from "images/e-commerce/sidebar/settings";
import ShoppingIcon from "images/e-commerce/sidebar/shopping";

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

        this.doLogout = this.doLogout.bind(this);
    }

    doLogout() {
        this.props.dispatch(logoutUser());
    }

    render() {
        return (
            <div
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
                            onActiveSidebarItemChange={(activeItem) =>
                                this.props.dispatch(changeActiveSidebarItem(activeItem))
                            }
                            activeItem={this.props.activeItem}
                            header="Index"
                            link="/app/dashboard"
                            isHeader
                            iconType="node"
                            iconName={<HomeIcon />}
                        />

                        {this.props.currentUser &&
                        this.props.currentUser.role === "admin" && (
                            <LinksGroup
                                onActiveSidebarItemChange={(activeItem) =>
                                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                                }
                                activeItem={this.props.activeItem}
                                header="Orders"
                                link="/admin/orders"
                                isHeader
                                iconType="node"
                                iconName={<DownloadIcon />}
                            />
                        )}

                        {this.props.currentUser &&
                        this.props.currentUser.role === "admin" && (
                            <LinksGroup
                                onActiveSidebarItemChange={(activeItem) =>
                                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                                }
                                activeItem={this.props.activeItem}
                                header="Products"
                                link="/admin/products"
                                isHeader
                                iconType="node"
                                iconName={<PricetagIcon />}
                            />
                        )}

                        {this.props.currentUser &&
                        this.props.currentUser.role === "admin" && (
                            <LinksGroup
                                onActiveSidebarItemChange={(activeItem) =>
                                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                                }
                                activeItem={this.props.activeItem}
                                header="Customers"
                                link="/admin/users"
                                isHeader
                                iconType="node"
                                iconName={<PersonIcon />}
                            />
                        )}

                        {this.props.currentUser &&
                        this.props.currentUser.role === "admin" && (
                            <LinksGroup
                                onActiveSidebarItemChange={(activeItem) =>
                                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                                }
                                activeItem={this.props.activeItem}
                                header="Analytics"
                                link="/admin/analytics"
                                isHeader
                                iconType="node"
                                iconName={<BarIcon />}
                            />
                        )}

                        {this.props.currentUser &&
                        this.props.currentUser.role === "admin" && (
                            <LinksGroup
                                onActiveSidebarItemChange={(activeItem) =>
                                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                                }
                                activeItem={this.props.activeItem}
                                header="Marketing"
                                link="/admin/marketing"
                                isHeader
                                iconType="node"
                                iconName={<FileIcon />}
                            />
                        )}

                        {this.props.currentUser &&
                        this.props.currentUser.role === "admin" && (
                            <>
                            <LinksGroup
                                onActiveSidebarItemChange={(activeItem) =>
                                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                                }
                                activeItem={this.props.activeItem}
                                header="Discounts"
                                link="/admin/discounts"
                                isHeader
                            />
                            <LinksGroup
                            onActiveSidebarItemChange={(activeItem) =>
                            this.props.dispatch(changeActiveSidebarItem(activeItem))
                        }
                            activeItem={this.props.activeItem}
                            header="Apps"
                            link="/admin/apps"
                            isHeader
                            iconType="node"
                            iconName={<GridIcon />}
                            />
                            </>
                            )}

                        {this.props.currentUser &&
                        this.props.currentUser.role === "admin" && (
                            <span className={s.dividerText}>Sales Channels</span>
                        )}

                        {this.props.currentUser &&
                        this.props.currentUser.role === "admin" && (
                            <LinksGroup
                                onActiveSidebarItemChange={(activeItem) =>
                                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                                }
                                activeItem={this.props.activeItem}
                                header="Online Store"
                                link="/admin/store"
                                isHeader
                                iconType="node"
                                iconName={<ShoppingIcon />}
                            />
                        )}

                        {this.props.currentUser &&
                        this.props.currentUser.role === "admin" && (
                            <LinksGroup
                                onActiveSidebarItemChange={(activeItem) =>
                                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                                }
                                activeItem={this.props.activeItem}
                                className={s.sidebarBottomItem}
                                header="Settings"
                                link="/admin/settings"
                                isHeader
                                iconType="node"
                                iconName={<SettingsIcon />}
                            />
                        )}

                        {/* {this.props.currentUser && this.props.currentUser.role === 'admin' &&
            <LinksGroup
              onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
              activeItem={this.props.activeItem}
              header="сategories"
              link="/admin/categories"
              isHeader
              iconName="la-users"
            />
          } */}

                        {/* <LinksGroup
              onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
              activeItem={this.props.activeItem}
              header="My Profile"
              link="/app/profile"
              isHeader
              iconName="la-user"
            /> */}

                        {/* <LinksGroup
              onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
              activeItem={this.props.activeItem}
              header="Change Password"
              link="/app/password"
              isHeader
              iconName="la-key"
            /> */}

                        {/* <LinksGroup
            onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="Documentation"
            link="/documentation"
            isHeader
            iconName="la-book"
            index="documentation"
            labelColor="success"
            target="_blank"
          /> */}
                    </ul>
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
