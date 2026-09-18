import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Badge } from "reactstrap";
import classnames from "classnames";
import Link from 'next/link'
import { withRouter } from 'next/router';

import s from "./LinksGroup.module.scss";

class LinksGroup extends Component {
  /* eslint-disable */
  static propTypes = {
    childrenLinks: PropTypes.array,
    iconName: PropTypes.string,
    className: PropTypes.string,
    badge: PropTypes.string,
    label: PropTypes.string,
    activeItem: PropTypes.string,
    isHeader: PropTypes.bool,
    index: PropTypes.string,
    deep: PropTypes.number,
    onActiveSidebarItemChange: PropTypes.func,
    labelColor: PropTypes.string,
  };
  /* eslint-enable */

  static defaultProps = {
    link: "",
    childrenLinks: null,
    className: "",
    isHeader: false,
    deep: 0,
    activeItem: "",
    label: "",
  };

  constructor(props) {
    super(props);
    this.togglePanelCollapse = this.togglePanelCollapse.bind(this);

    this.state = {
      headerLinkWasClicked: true,
    };
  }

  togglePanelCollapse(link) {
    this.props.onActiveSidebarItemChange(link);
    this.setState({
      headerLinkWasClicked:
        !this.state.headerLinkWasClicked ||
        ((this.props.activeItem || link) &&
          !this.props.activeItem.includes(this.props.index)),
    });
  }

  render() {
    const isOpen =
      this.props.activeItem &&
      this.props.activeItem.includes(this.props.index) &&
      this.state.headerLinkWasClicked;

    if (!this.props.childrenLinks) {
      if (this.props.isHeader) {
        return (
          <li
            className={classnames(
              "link-wrapper",
              s.headerLink,
              this.props.className
            )}
          >
            <Link href={this.props.link}>
              <a>
              {this.props.iconType === "text" ? (
                <span className={classnames("icon", s.icon)}>
                  <i className={`la ${this.props.iconName}`} />
                </span>
              ) : (
                <span className={s.iconWrapper}>{this.props.iconName}</span>
              )}
              {this.props.header}{" "}
              {this.props.label && (
                <sup
                  className={`${s.headerLabel} ${s.headerUpdate} text-${
                    this.props.labelColor || "warning"
                  }`}
                >
                  {this.props.label}
                </sup>
              )}
              {this.props.badge && (
                <Badge className={s.badge} pill>
                  9
                </Badge>
              )}
              </a>
            </Link>
          </li>
        );
      }
      return (
        <li>
          <Link href={this.props.link}
                onClick={(e) => {
                  // able to go to link is not available(for Demo)
                  if (this.props.link.includes("menu")) {
                    e.preventDefault();
                  }
                }}
          >
            <a>
            {this.props.header}{" "}
            {this.props.label && (
              <sup
                className={`${s.headerLabel} text-${
                  this.props.labelColor || "warning"
                }`}
              >
                {this.props.label}
              </sup>
            )}
            </a>
          </Link>
        </li>
      );
    }
    /* eslint-disable */
    return (

            <li
              className={classnames(
                "link-wrapper",
                { [s.headerLink]: this.props.isHeader },
                this.props.className
              )}
            >
              <a
                className={classnames(
                  { [s.headerLinkActive]: false },
                  { [s.collapsed]: isOpen },
                  "d-flex"
                )}
                style={{
                  paddingLeft: `${
                    this.props.deep == 0 ? 24 : 26 + 10 * (this.props.deep - 1)
                  }px`,
                }}
                onClick={() => this.togglePanelCollapse(this.props.link)}
              >
              {this.props.iconType === "text" ? (
                <span className={classnames("icon", s.icon)}>
                  <i className={`la ${this.props.iconName}`} />
                </span>
              ) : (
                <span className={s.iconWrapper}>{this.props.iconName}</span>
              )}
                {this.props.header}{" "}
                {this.props.label && (
                  <sup
                    className={`${s.headerLabel} ${s.headerNode} ml-1 text-${
                      this.props.labelColor || "warning"
                    }`}
                  >
                    {this.props.label}
                  </sup>
                )}
                <b className={["la la-angle-left", s.caret].join(" ")} />
              </a>
              {/* eslint-enable */}
              <Collapse className={s.panel} isOpen={isOpen}>
                <ul>
                  {this.props.childrenLinks &&
                    this.props.childrenLinks.map((child, ind) => (
                      <LinksGroup
                        onActiveSidebarItemChange={
                          this.props.onActiveSidebarItemChange
                        }
                        activeItem={this.props.activeItem}
                        header={child.header}
                        link={child.link}
                        index={child.index}
                        childrenLinks={child.childrenLinks}
                        deep={this.props.deep + 1}
                        key={ind} // eslint-disable-line
                      />
                    ))}
                </ul>
              </Collapse>
            </li>
          );
        }}
      
        <div/>


export default LinksGroup;
