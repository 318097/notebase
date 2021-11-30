import React, { useState, useEffect, Fragment, useRef } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Modal, Input, Radio, Checkbox, Button, Divider } from "antd";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import _ from "lodash";
import {
  addNote,
  updateNote,
  setModalMeta,
  updateUploadNote,
  setNextNoteForEditing,
} from "../../store/actions";
import colors, { Icon } from "@codedrops/react-ui";
import SelectCollection from "../SelectCollection";
import { md } from "../../lib/utils";
import { generateSlug } from "@codedrops/lib";
import { POST_TYPE_OPTIONS } from "../../constants";
import axios from "axios";

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 100%;
  overflow: auto;
  padding: 10px 0 10px 10px;
  .post-form {
    flex: 1 0 0%;
    overflow-x: auto;
    padding-right: 8px;
    .title-container {
      position: relative;
      .arrow-icon {
        position: absolute;
        top: 4px;
        right: 8px;
      }
      .search-results {
        position: absolute;
        background: ${colors.bg};
        border-radius: 2px;
        display: flex;
        z-index: 1000;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        top: calc(100% + 4px);
        left: 0;
        width: 100%;
        overflow: auto;
        max-height: 150px;
        border: 1px solid ${colors.strokeTwo};
        .empty {
          padding: 12px 0;
          text-align: center;
          width: 100%;
        }
        .item {
          border-bottom: 1px solid ${colors.feather};
          padding: 8px;
          width: 100%;
          box-sizing: border-box;
        }
      }
    }
  }
  div.preview {
    background: ${colors.shade1};
    border-radius: 4px;
    flex: 0 0 40%;
    padding: 8px;
    margin-left: 8px;
    margin-right: 10px;
    overflow-x: auto;
    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  @media (max-width: 1024px) {
    div.preview {
      display: none;
    }
  }
`;

const INITIAL_STATE = {
  type: "DROP",
  title: "",
  content: "```js\n\n```",
  url: "",
  tags: [],
};

const AddNote = ({
  session,
  addNote,
  updateNote,
  setModalMeta,
  modalVisibility,
  mode,
  selectedNote,
  tags,
  updateUploadNote,
  setNextNoteForEditing,
  appLoading,
  activeCollectionId,
}) => {
  const searchDbDebounced = useRef();

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [createAnotherPost, setCreateAnotherPost] = useState(false);
  const [previewMode, setPreviewMode] = useState("PREVIEW");
  const [collection, setCollection] = useState();
  const [note, setNote] = useState(INITIAL_STATE);

  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    searchDbDebounced.current = _.debounce(searchDb, 500);
  }, []);

  useEffect(() => {
    if (modalVisibility) {
      if (mode === "add") {
        setCollection(activeCollectionId);
      } else {
        const clone = { ...selectedNote };
        delete clone.updatedAt;
        delete clone.createdAt;
        setNote(clone);

        setCollection(selectedNote.collectionId);
      }
    }
  }, [mode, selectedNote, modalVisibility]);

  const clear = () => setNote(INITIAL_STATE);

  const handleClose = async (srcEvent) => {
    if (createAnotherPost && mode === "add" && srcEvent === "add-event")
      return clear();

    setModalMeta();
  };

  const setData = (update) => setNote((data) => ({ ...data, ...update }));

  const handleOk = async () => {
    setLoading(true);
    try {
      if (mode === "edit") await updateNote({ ...note });
      else if (mode === "add") {
        const isContentEmpty = note.content === "```js\n\n```";
        await addNote(
          {
            ...note,
            userId: session.uid,
            content: isContentEmpty ? "" : note.content,
          },
          collection
        );
      } else await updateUploadNote({ ...note, viewed: true });
    } finally {
      setLoading(false);
      handleClose("add-event");
    }
  };

  const handleUpdateAndNext = () =>
    setNextNoteForEditing({ ...note, viewed: true });

  const updateSlug = (e) => {
    if (note.status === "POSTED") return;
    const newSlug = generateSlug({
      title: e.target.value,
      prevSlug: note.slug,
    });
    setData({ slug: newSlug });
    setShowSearchResults(false);
  };

  const searchDb = async (value) => {
    try {
      //  setAppLoading(true);
      const result = await axios.get(
        `/posts?collectionId=${activeCollectionId}`,
        {
          params: {
            search: value,
          },
        }
      );
      setSearchResults(result.data.posts);
      setShowSearchResults(true);
    } catch (err) {
      console.log(err);
    } finally {
      //  setAppLoading(false);
    }
  };

  const getSearchResults = () => {
    if (showSearchResults && !!note.title)
      return (
        <div className="search-results">
          {searchResults.length ? (
            searchResults.map(({ index, title, _id }) => (
              <div className="flex item" key={_id}>{`${index}. ${title}`}</div>
            ))
          ) : (
            <div className="empty">No search result.</div>
          )}
        </div>
      );
    else return null;
  };

  const footerItems = [
    {
      visible: mode === "add",
      comp: (
        <Button key="clear" type="ghost" onClick={clear}>
          Clear
        </Button>
      ),
    },
    {
      visible: true,
      comp: (
        <Button
          key="preview-button"
          type="ghost"
          onClick={() => setShowPreview((prev) => !prev)}
        >
          Preview
        </Button>
      ),
    },
    {
      visible: mode === "add",
      comp: (
        <Fragment>
          <Divider key="divider-1" type="vertical" />
          <Checkbox
            key={"create-another-post"}
            checked={createAnotherPost}
            onChange={(e) => setCreateAnotherPost(e.target.checked)}
          >
            Create another
          </Checkbox>
        </Fragment>
      ),
    },
    {
      visible: true,
      comp: (
        <Fragment>
          <Divider key="divider-2" type="vertical" />
          <Button key="cancel-button" onClick={handleClose}>
            Cancel
          </Button>
          {mode !== "add" && (
            <Button
              key="update-and-next-button"
              type="danger"
              onClick={handleUpdateAndNext}
            >
              Update and next
            </Button>
          )}
          <Button
            type="primary"
            key="add-button"
            onClick={handleOk}
            disabled={appLoading || !note.title}
          >
            {mode === "add" ? "Add" : "Update"}
          </Button>
        </Fragment>
      ),
    },
  ];

  return (
    <Modal
      title={mode === "add" ? "Add Note" : "Edit Note"}
      centered={true}
      maskClosable={false}
      wrapClassName="react-ui"
      destroyOnClose={true}
      style={{ padding: "0" }}
      visible={modalVisibility}
      width="60vw"
      confirmLoading={loading}
      okText={mode === "add" ? "Add" : "Update"}
      onOk={handleOk}
      onCancel={handleClose}
      footer={footerItems
        .filter((item) => item.visible)
        .map((item) => item.comp)}
    >
      <StyledContainer>
        <div className="post-form">
          <div className="flex space-between mb">
            <Radio.Group
              buttonStyle="solid"
              value={note.type}
              onChange={({ target: { value } }) =>
                setData({
                  type: value,
                  title: value === "QUIZ" ? "Quiz" : _.get(note, "title", ""),
                })
              }
            >
              {POST_TYPE_OPTIONS.map(({ value }) => (
                <Radio.Button key={value} value={value}>
                  {value}
                </Radio.Button>
              ))}
            </Radio.Group>

            <SelectCollection
              value={collection}
              handleChange={(value) => {
                setCollection(value);
                // if (mode !== "add") setData({ collectionId: value });
              }}
            />
          </div>
          <div className="mb title-container">
            <Input
              autoFocus
              placeholder="Title"
              value={note.title}
              onBlur={updateSlug}
              onChange={({ target: { value } }) => {
                setData({ title: value });
                searchDbDebounced.current(value);
              }}
            />
            <span className="arrow-icon">
              {!!note.title && (
                <Icon
                  type="arrow"
                  direction={showSearchResults ? "up" : "down"}
                  size={14}
                  fill={colors.strokeOne}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSearchResults((prev) => !prev);
                  }}
                />
              )}
            </span>
            {getSearchResults()}
          </div>
          <Input
            className="mb"
            placeholder="Slug"
            value={note.slug}
            disabled={note.status === "POSTED"}
            onChange={({ target: { value } }) => setData({ slug: value })}
          />
          {note.type !== "CHAIN" && (
            <SimpleMDE
              className="mb"
              value={note.content}
              onChange={(value) => setData({ content: value })}
              options={{
                spellChecker: false,
                placeholder: "Content...",
                hideIcons: ["guide", "preview", "fullscreen", "side-by-side"],
              }}
            />
          )}
          <Input
            className="mb"
            placeholder="URL"
            value={note.url}
            onChange={({ target: { value } }) => setData({ url: value })}
          />
          {note.type === "QUIZ" && (
            <SimpleMDE
              className="mb"
              value={note.solution}
              onChange={(value) => setData({ solution: value })}
              options={{
                spellChecker: false,
                placeholder: "Solution",
                hideIcons: ["guide", "preview", "fullscreen", "side-by-side"],
              }}
            />
          )}
          <div className="mt">
            <Checkbox.Group
              options={tags}
              value={note.tags}
              onChange={(value) => setData({ tags: value })}
            />
          </div>
        </div>
        {showPreview && (
          <div className="preview">
            <div className="preview-header">
              <h4>Preview</h4>
              <Radio.Group
                defaultValue={previewMode}
                buttonStyle="solid"
                onChange={({ target: { value } }) => setPreviewMode(value)}
              >
                <Radio.Button value="PREVIEW">PREVIEW</Radio.Button>
                <Radio.Button value="CODE">CODE</Radio.Button>
              </Radio.Group>
            </div>
            <div className="divider"></div>
            {previewMode === "PREVIEW" ? (
              <Fragment>
                <h3
                  dangerouslySetInnerHTML={{
                    __html: md.render(note.title || ""),
                  }}
                ></h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: md.render(note.content || ""),
                  }}
                ></div>
              </Fragment>
            ) : (
              <div className="preview">
                {md.render(note.title || "")}
                <br />
                <div className="preview-body">
                  {md.render(note.content || "")}
                </div>
              </div>
            )}
          </div>
        )}
      </StyledContainer>
    </Modal>
  );
};

const mapStateToProps = ({
  modalMeta: { visibility, mode, selectedNote },
  session,
  activeCollectionId,
  settings,
  appLoading,
}) => ({
  modalVisibility: visibility,
  selectedNote,
  mode,
  session,
  tags: _.map(_.get(settings, "tags", []), ({ label }) => ({
    label,
    value: label,
  })),
  activeCollectionId,
  appLoading,
});

const mapDispatchToProps = {
  addNote,
  updateNote,
  setModalMeta,
  updateUploadNote,
  setNextNoteForEditing,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddNote);
