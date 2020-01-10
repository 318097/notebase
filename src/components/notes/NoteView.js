/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import styled from "styled-components";
import { Popover, Icon } from "antd";

import Card from "./Card";
import Controls from "./Controls";

import { getNoteById } from "../../store/actions";
import { copyToClipboard } from "../../utils";
import { StyledIcon } from "../../styled";

const Wrapper = styled.div`
  max-width: 350px;
  width: 100%;
  height: 70%;
  padding: 0px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .card {
    .title {
      margin: 10px;
    }
    .content {
      overflow: auto;
    }
  }
  .copy-header-icon {
    position: absolute;
    top: 3px;
    right: 1px;
    z-index: 999;
  }
  .copy-content-icon {
    position: absolute;
    bottom: 3px;
    right: 1px;
    z-index: 999;
  }
  .back-icon {
    position: absolute;
    background: lightgrey;
    top: -7px;
    left: -9px;
    z-index: 10;
    padding: 5px;
    border-radius: 30px;
    transition: 1s;
    &:hover {
      color: grey;
      transform: scale(1.2);
    }
  }
`;

const NoteView = ({ dispatch, match, selectedNote, session, history }) => {
  useEffect(() => {
    if (session) dispatch(getNoteById(match.params.id));
  }, [match.params]);

  return (
    <Wrapper>
      <Icon
        className="back-icon"
        onClick={() => history.push("/home")}
        type="caret-left"
      />
      <Card view="EXPANDED" note={selectedNote} />
      <Popover placement="bottom" content="Copy to clipboard">
        <StyledIcon
          className="copy-header-icon"
          type="copy"
          onClick={() => copyToClipboard(selectedNote.title)}
        />
      </Popover>
      <Popover placement="bottom" content="Copy to clipboard">
        <StyledIcon
          className="copy-content-icon"
          type="copy"
          onClick={() => copyToClipboard(selectedNote.content)}
        />
      </Popover>
      <Controls note={selectedNote} />
    </Wrapper>
  );
};

const mapStateToProps = ({ selectedNote, session }) => ({
  selectedNote,
  session
});

export default withRouter(connect(mapStateToProps)(NoteView));
