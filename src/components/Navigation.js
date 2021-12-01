import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { Divider } from "antd";
import colors from "@codedrops/react-ui";
import { Icon as AntIcon } from "antd";
import { withRouter } from "react-router-dom";
import {
  logout,
  toggleSettingsDrawer,
  setModalMeta,
  setQuickAddModalMeta,
} from "../store/actions";
import classnames from "classnames";

const StyledNavigation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: ${colors.bar};
  padding: 10px;
  .app-name {
    color: ${colors.cdGreen};
    font-size: 2.6rem;
    position: relative;
    top: -6px;
    left: 1px;
    transition: 0.6s;
  }
  nav {
    display: flex;
    flex-direction: column;
    .icon.icon-bg {
      color: ${colors.white};
      font-size: 20px;
      margin: 10px 0 0 0;
      &.active {
        color: ${colors.cdGreen};
      }
      &:hover {
        border-radius: 4px !important;
        background: ${colors.cdGreen} !important;
        color: ${colors.white} !important;
      }
    }
  }
`;

const navItems = [
  {
    type: "home",
    key: "home",
  },
  {
    type: "line-chart",
    key: "stats",
  },
  {
    type: "divider",
  },
  {
    type: "plus",
    key: "add",
  },
  {
    type: "fire",
    key: "quick-add",
  },
  {
    type: "upload",
    key: "upload",
  },
  {
    type: "divider",
  },
  {
    type: "setting",
    key: "setting",
  },
  {
    type: "logout",
    key: "logout",
  },
];

const Navigation = ({
  logout,
  toggleSettingsDrawer,
  setModalMeta,
  setQuickAddModalMeta,
  history,
  session,
  activePage,
}) => {
  if (!session) return null;

  const handleNavigation = (key) => {
    switch (key) {
      case "home":
      case "stats":
      case "upload":
        history.push(`/${key}`);
        break;
      case "add":
        setModalMeta({ visibility: true });
        break;
      case "quick-add":
        setQuickAddModalMeta({ visibility: true });
        break;
      case "setting":
        toggleSettingsDrawer(true);
        break;
      case "logout":
        logout();
        break;
      default:
        return;
    }
  };

  return (
    <StyledNavigation>
      <div className="app-name">N</div>
      <nav>
        {navItems.map(({ type, key }, idx) => {
          if (type === "divider") return <Divider key={`divider-${idx}`} />;
          return (
            <AntIcon
              className={classnames("icon", "icon-bg", {
                active: activePage === key,
              })}
              type={type}
              key={key}
              onClick={() => handleNavigation(key)}
            />
          );
        })}
      </nav>
    </StyledNavigation>
  );
};

const mapStateToProps = ({ session, activePage }) => ({
  session,
  activePage,
});

const mapDispatchToProps = {
  logout,
  toggleSettingsDrawer,
  setModalMeta,
  setQuickAddModalMeta,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Navigation)
);
