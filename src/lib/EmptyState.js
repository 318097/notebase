/** EmptyState.js */
import React from "react";
import _ from "lodash";
import styled from "styled-components";

const StyledContainer = styled.div`
  text-align: center;
  width: 100%;
  font-size: 1.4rem;
  color: lightgrey;
`;

const EmptyState = ({ input, children, message }) => {
  const isEmpty = _.isEmpty(input); // matches falsy values, empty arrays & objects

  return isEmpty ? (
    <StyledContainer className="empty-container">
      {message ? message : "Empty"}
    </StyledContainer>
  ) : (
    children
  );
};

export default EmptyState;
