import React, { useEffect, useRef, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { Button, Table, Tag, Pagination, Badge } from "antd";
import colors, { EmptyState } from "@codedrops/react-ui";
import NoteCard from "./NoteCard";
import _ from "lodash";
import {
  setNoteToEdit,
  deleteNote,
  setFilter,
  setKey,
} from "../../store/actions";
import { extractTagCodes } from "../../lib/utils";
import config from "../../config";
import moment from "moment";

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
      background: ${colors.iron};
      font-size: 1rem;
      color: white;
    }
    &:after {
      content: "";
      z-index: -1;
      display: block;
      width: 100%;
      height: 1px;
      position: absolute;
      top: 50%;
      background: ${colors.iron};
    }
  }
  .notes-wrapper {
    padding: 0 28px;
    /* columns: 240px; */
    /* column-gap: 12px; */
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    grid-gap: 16px;
  }
`;

const scrollToPosition = (ref, offset) => {
  let position = 0;
  const increment = offset / 10;
  const interval = setInterval(() => {
    ref.scrollTop = position;
    position += increment;
    if (position >= offset) clearInterval(interval);
  }, 50);
};

const Notes = ({
  displayType,
  appLoading,
  history,
  notes,
  dispatch,
  filters,
  hasCollections,
  ...others
}) => {
  const scrollRef = useRef();

  useEffect(() => {
    dispatch(setFilter());
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    const offset = sessionStorage.getItem("scroll");
    if (!offset) return;
    scrollToPosition(scrollRef.current, offset);
    sessionStorage.clear();
  }, [scrollRef]);

  const handleClick = (event, _id) => {
    event.stopPropagation();
    history.push(`/note/${_id}`);
    sessionStorage.setItem("scroll", scrollRef.current.scrollTop);
    dispatch(setKey({ retainPage: { postId: _id, page: filters.page } }));
  };

  const onEdit = (_id) => dispatch(setNoteToEdit(_id));

  const onDelete = (_id) => dispatch(deleteNote(_id));

  return (
    <section ref={scrollRef} style={{ paddingBottom: "30px" }}>
      {hasCollections ? (
        <EmptyState input={notes}>
          {displayType === "CARD" ? (
            <CardView
              notes={notes}
              handleClick={handleClick}
              onEdit={onEdit}
              onDelete={onDelete}
              scrollRef={scrollRef}
              dispatch={dispatch}
              filters={filters}
              appLoading={appLoading}
              {...others}
            />
          ) : (
            <TableView
              notes={notes}
              handleClick={handleClick}
              onEdit={onEdit}
              onDelete={onDelete}
              dispatch={dispatch}
              filters={filters}
              scrollRef={scrollRef}
              {...others}
            />
          )}
        </EmptyState>
      ) : (
        <p style={{ textAlign: "center" }}>Create a new collection.</p>
      )}
    </section>
  );
};

const CardView = ({
  notes,
  handleClick,
  onEdit,
  onDelete,
  tagsCodes,
  meta,
  filters,
  appLoading,
  dispatch,
}) => {
  const noteChunks = Array(Math.ceil(notes.length / config.LIMIT))
    .fill(null)
    .map((_, index) =>
      notes.slice(index * config.LIMIT, index * config.LIMIT + config.LIMIT)
    );

  return (
    <Fragment>
      {noteChunks.map((chunk, index) => (
        <PageWrapper key={index}>
          <div className="notes-wrapper">
            {chunk.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                handleClick={handleClick}
                onEdit={onEdit}
                onDelete={onDelete}
                tagsCodes={tagsCodes}
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
        <div className="fcc">
          <Button
            disabled={appLoading}
            onClick={() =>
              dispatch(setFilter({ page: filters.page + 1 }, false))
            }
          >
            Load
          </Button>
        </div>
      )}
    </Fragment>
  );
};

const TableView = ({
  notes,
  handleClick,
  onEdit,
  onDelete,
  tagsCodes,
  meta,
  dispatch,
  filters,
  scrollRef,
}) => {
  const onPageChange = (page) => {
    dispatch(setFilter({ page }, false));
    scrollRef.current.scrollTop = 0;
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "index",
      key: "index",
      width: "50px",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "50%",
      render: (title, row) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {title}&nbsp;
          {row.status === "POSTED" && <Badge status="success" />}
        </div>
      ),
    },
    // {
    //   title: "Content",
    //   dataIndex: "content",
    //   key: "content",
    // },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      align: "center",
      width: "150px",
      render: (tags) => (
        <Fragment>
          {tags.map((tag) => (
            <Tag color={tagsCodes[tag]} style={{ marginBottom: "4px" }}>
              {tag}
            </Tag>
          ))}
        </Fragment>
      ),
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      align: "center",
      render: (status) => <Tag>{status}</Tag>,
    },
    {
      title: "Created",
      key: "createdAt",
      dataIndex: "createdAt",
      align: "center",
      render: (createdAt) => {
        const addedDays = moment().diff(moment(createdAt), "days");
        return <Tag>{addedDays ? `${addedDays}d ago` : "Today"}</Tag>;
      },
    },
  ];
  return (
    <div
      style={{
        width: "90%",
        margin: "0 auto",
        background: "white",
        paddingBottom: "10px",
      }}
    >
      <Table
        size="middle"
        tableLayout="fixed"
        // bordered
        columns={columns}
        dataSource={notes}
        onRow={(record) => ({
          onClick: (e) => handleClick(e, record._id),
        })}
        pagination={false}
        rowClassName="table-row"
      />
      <br />
      <Pagination
        current={filters.page}
        onChange={onPageChange}
        size="small"
        total={meta.count}
        pageSize={config.LIMIT}
      />
    </div>
  );
};

const mapStateToProps = ({
  notes,
  meta,
  appLoading,
  filters,
  settings,
  displayType,
  session,
}) => ({
  notes,
  appLoading,
  filters,
  meta,
  tagsCodes: extractTagCodes(settings.tags),
  displayType,
  hasCollections: _.get(session, "notebase.length", false),
});

export default withRouter(connect(mapStateToProps)(Notes));
