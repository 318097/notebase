import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { EmptyState } from "@codedrops/react-ui";
import _ from "lodash";
import {
  setNoteToEdit,
  deleteNote,
  setFilter,
  setKey,
} from "../../store/actions";
import { extractTagCodes, scrollToPosition } from "../../lib/utils";
import config from "../../config";
import CardView from "./CardView";
import NotesTable from "./NotesTable";

const Notes = ({
  displayType,
  appLoading,
  history,
  notes,
  dispatch,
  filters,
  hasCollections,
  settings,
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

  const pageSize = filters?.limit || config.LIMIT;

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
              pageSize={pageSize}
              settings={settings}
              {...others}
            />
          ) : (
            <NotesTable
              notes={notes}
              handleClick={handleClick}
              onEdit={onEdit}
              onDelete={onDelete}
              dispatch={dispatch}
              filters={filters}
              scrollRef={scrollRef}
              pageSize={pageSize}
              settings={settings}
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

const mapStateToProps = ({
  notes,
  meta,
  appLoading,
  filters,
  settings,
  displayType,
  session,
  selectedItems,
}) => ({
  notes,
  appLoading,
  filters,
  meta,
  tagsCodes: extractTagCodes(settings.tags),
  displayType,
  hasCollections: _.get(session, "notebase.length", false),
  settings,
  selectedItems,
});

export default withRouter(connect(mapStateToProps)(Notes));
