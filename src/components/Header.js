import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import colors from "@codedrops/react-ui";
import _ from "lodash";
import Filters from "./Filters";

const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 16px 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  h3 {
    margin: 0;
    margin-left: 10px;
    a {
      color: ${colors.bar};
      text-transform: uppercase;
      font-family: RobotoMonoSemiBold;
      & > span {
        font-family: RobotoMonoBold;
        text-decoration: underline;
        font-size: 2rem;
        color: ${colors.bar};
      }
    }
  }
`;

const Header = ({ history }) => {
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setShowFilters(_.get(history, "location.pathname") === "/home");
  }, [history.location.pathname]);

  return (
    <Container>
      {/* <h3>
        <Link to="/home">
          <span>N</span>otes App
        </Link>
      </h3> */}
      {showFilters && <Filters />}
    </Container>
  );
};

const mapStateToProps = ({ session }) => ({});

export default withRouter(connect(mapStateToProps)(Header));
