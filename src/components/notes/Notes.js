import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { Button, Icon as AntIcon } from "antd";
import marked from "marked";
import colors, { Card, Icon, Tag } from "@codedrops/react-ui";
import Dropdown from "./Dropdown";
import Filters from "../Filters";
import { MessageWrapper } from "../../styled";
import { setNoteToEdit, deleteNote, setFilter } from "../../store/actions";

const PageWrapper = styled.div`
  margin-bottom: 25px;
  .page-splitter {
    display: block;
    width: 80%;
    margin: 20px 30px 25px;
    position: relative;
    span {
      padding: 0 12px;
      display: inline-block;
      position: relative;
      left: 20px;
      background: ${colors.strokeOne};
      font-size: 1rem;
    }
    &:after {
      content: "";
      z-index: -1;
      display: block;
      width: 100%;
      height: 1px;
      position: absolute;
      top: 50%;
      background: ${colors.strokeOne};
    }
  }
  .notes-wrapper {
    columns: 220px;
    padding: 0 28px;
    column-gap: 12px;
  }
  .card-wrapper {
    margin-bottom: 8px;
    .card {
      break-inside: avoid-column;
      position: relative;
      height: 115px;
      margin: 0;
      min-height: unset;
      cursor: pointer;
      width: 100%;
      font-size: 1.4rem;
      overflow: visible;
      padding: 20px 8px;
      &:hover {
        background: ${colors.shade3};
      }
      .title {
        font-size: inherit;
        text-align: center;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .content {
        font-size: inherit;
        width: 100%;
        overflow-x: auto;
        padding: 0;
      }
    }
    .action-row {
      position: relative;
      padding: 6px;
      height: 53px;
      min-height: unset;
      overflow: visible;
      width: 100%;
      top: -5px;
      .tags {
        text-align: left;
        .tag {
          cursor: pointer;
          padding: 0px 4px;
          font-size: 0.8rem;
        }
      }
      .status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .anticon {
          margin: 0 2px;
        }
        .state {
          color: white;
          margin: 0 2px;
          border-radius: 4px;
          display: inline-block;
          width: max-content;
          font-size: 0.8rem;
          padding: 1px 4px;
        }
      }
      .index {
        font-style: italic;
        color: ${colors.bar};
        margin-right: 3px;
      }
    }
  }
`;

const Notes = ({ notes, history, dispatch, meta, filters }) => {
  useEffect(() => {
    dispatch(setFilter({}));
  }, [dispatch]);

  const noteChunks = Array(Math.floor(notes.length / 25))
    .fill(null)
    .map((_, index) => notes.slice(index * 25, index * 25 + 25));

  return (
    <section>
      <Filters className="filters" />
      {notes.length ? (
        <div
          style={{ overflow: "auto", height: "100%", paddingBottom: "30px" }}
        >
          {noteChunks.map((chunk, index) => (
            <PageWrapper key={index}>
              <div className="notes-wrapper">
                {chunk.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    history={history}
                    dispatch={dispatch}
                  />
                ))}
              </div>
              {index < noteChunks.length - 1 && (
                <div className="page-splitter">
                  <span>{`Page: ${index + 2}`}</span>
                </div>
              )}
            </PageWrapper>
          ))}
          {notes.length && notes.length < meta.count && (
            <div className="flex center">
              <Button
                type="danger"
                onClick={() =>
                  dispatch(setFilter({ page: filters.page + 1 }, false))
                }
              >
                Load
              </Button>
            </div>
          )}
        </div>
      ) : (
        <MessageWrapper>Empty</MessageWrapper>
      )}
    </section>
  );
};

const NoteCard = ({
  note: {
    title = "",
    content = "",
    type = "DROP",
    tags = [],
    _id,
    status,
    visible,
    socialStatus,
    index,
  },
  history,
  dispatch,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleClick = (_id) => (event) => {
    event.stopPropagation();
    history.push(`/note/${_id}`);
  };

  const onEdit = () => {
    dispatch(setNoteToEdit(_id));
  };

  const onDelete = () => {
    dispatch(deleteNote(_id));
  };

  return (
    <div className="card-wrapper">
      <Card
        onClick={handleClick(_id)}
        style={{ height: type === "DROP" ? "auto" : "115px" }}
      >
        {type === "POST" && <h3 className="title">{title}</h3>}
        {type === "DROP" && (
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: marked(content) }}
          ></div>
        )}
        <Dropdown
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Card>
      <Card className="action-row">
        <div className="tags">
          {tags.map((tag) => (
            <Tag key={tag}>{tag.toUpperCase()}</Tag>
          ))}
        </div>
        <div className="status-row">
          <div>
            <div
              className="state"
              style={{
                background: status === "POSTED" ? colors.green : colors.bar,
              }}
            >
              STATUS
            </div>
            <div
              className="state"
              style={{
                background:
                  socialStatus === "POSTED" ? colors.green : colors.bar,
              }}
            >
              SOCIAL
            </div>
          </div>

          <div>
            {!!index && <span className="index">{`#${index}`}</span>}
            {type === "DROP" && (
              <Icon className="bulb-icon" type="bulb" size={12} />
            )}
            <AntIcon type={`${visible ? "eye" : "eye-invisible"}`} />
          </div>
        </div>
      </Card>
    </div>
  );
};

const mapStateToProps = ({ notes, meta, appLoading, session, filters }) => ({
  notes,
  appLoading,
  session,
  filters,
  meta,
});

export default withRouter(connect(mapStateToProps)(Notes));
