import React, { Fragment } from "react";
import styled from "styled-components";
import { Button } from "antd";
import colors from "@codedrops/react-ui";
import NoteCard from "./NoteCard";
import { setFilter } from "../../store/actions";

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

const CardView = ({
  notes,
  handleClick,
  onEdit,
  onDelete,
  meta,
  filters,
  appLoading,
  dispatch,
  settings,
  pageSize,
  selectedItems,
}) => {
  const noteChunks = Array(Math.ceil(notes.length / pageSize))
    .fill(null)
    .map((_, index) =>
      notes.slice(index * pageSize, index * pageSize + pageSize)
    );

  return (
    <Fragment>
      {noteChunks.map((chunk, index) => (
        <PageWrapper key={index}>
          <div className="notes-wrapper">
            {chunk.map((note) => (
              <NoteCard
                settings={settings}
                key={note._id}
                note={note}
                handleClick={handleClick}
                onEdit={onEdit}
                onDelete={onDelete}
                dispatch={dispatch}
                selectedItems={selectedItems}
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

export default CardView;
