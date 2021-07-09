import React from "react";
import { Card } from "antd";
import styled from "styled-components";
import _ from "lodash";
import colors from "@codedrops/react-ui";

const StyledCard = styled(Card)`
  display: flex;
  height: 300px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  img {
    max-width: 100%;
  }
  h3 {
    position: absolute;
    bottom: 4px;
    left: 8px;
    font-size: 1rem;
    color: ${colors.steel};
  }
`;

const ImageCard = ({ raw, media }) => {
  const src = _.get(media, "url") ? _.get(media, "url") : raw;
  const fileName = _.get(media, "original_filename");

  return (
    <StyledCard size="small">
      <img alt="resource" src={src} />
      <h3>{fileName}</h3>
    </StyledCard>
  );
};

export default ImageCard;
