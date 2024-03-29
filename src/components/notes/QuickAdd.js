import React, { useState } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Modal, Input, Button, Tag, Tabs, Checkbox, Popconfirm } from "antd";
import { addNote, setQuickAddModalMeta } from "../../store/actions";
import SelectCollection from "../SelectCollection";
import _ from "lodash";

const { TabPane } = Tabs;

const StyledQuickAdd = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  .quick-add-header {
    display: flex;
  }
  .tag-group {
    padding: 10px 4px;
  }
  .quick-add-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    .ant-tag {
      margin: 0 10px 10px 0;
    }
  }
`;

const StyledQuickGroup = styled.div`
  padding: 0 8px;
  overflow-y: auto;
  .tag-group {
    padding: 20px 4px;
  }
  .quick-add-row {
    display: grid;
    grid-auto-flow: column;
    column-gap: 8px;
    margin-bottom: 8px;
  }
`;

const INITIAL_STATE = [
  {
    title: "",
    content: "",
    url: "",
  },
];

const QuickAdd = ({
  addNote,
  modalVisibility,
  appLoading,
  activeCollectionId,
  setQuickAddModalMeta,
  session,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeId, setActiveId] = useState(activeCollectionId);
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState("TITLE_ONLY");

  const activeSettings = _.find(session.notebase, { _id: activeId }, {});
  const tagList = _.map(activeSettings.tags, ({ label }) => ({
    label,
    value: label,
  }));

  const handleClose = async () => {
    setQuickAddModalMeta();
    clearData();
  };

  const clearData = () => {
    setData([]);
    setTags([]);
    setInput(INITIAL_STATE);
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      const inputData = (
        activeTab === "TITLE_ONLY"
          ? data.map((item) => ({
              ...item,
              status: "QUICK_ADD",
            }))
          : input.slice(0, input.length - 1)
      ).map((item) => ({
        ...item,
        status: "QUICK_ADD",
        tags,
      }));
      const sourceInfo = {
        collectionType: activeTab,
        method: "QUICK_ADD",
      };

      await addNote(inputData, { collectionId: activeId, sourceInfo });
      clearData();
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleURLParsing = ({ value, index }) => {
    // generate title when a valid url is entered
    try {
      if (value) {
        const { host } = new URL(value);
        const title = host.replace(/www\./, "").split(".").shift();
        handleInputChange({ key: "title", value: _.capitalize(title), index });
      }
    } catch (err) {}
  };

  const handleInputChange = ({ key, value, index, addNewRow = false }) => {
    const updatedInput = _.map(input, (data, i) =>
      index === i ? { ...data, [key]: value } : data
    );

    if (
      addNewRow ||
      (key === "title" &&
        value &&
        activeTab === "DETAILS" &&
        updatedInput.length - 1 === index)
    ) {
      updatedInput.push(INITIAL_STATE);
    }

    setInput(updatedInput);
  };

  const handleKeyDown = (e) => {
    if (e.which === 188) addTagToInput();
  };

  const addTagToInput = () => {
    const tag = _.get(input, "0.title").trim().replace(",", "");
    if (!tag) return;
    setData((prev) => [...prev, { title: tag }]);
    setTimeout(() => setInput(INITIAL_STATE));
  };

  const removeTag = (removedTag) =>
    setData((prev) => prev.filter((obj) => obj.title !== removedTag));

  const totalItems =
    activeTab === "TITLE_ONLY" ? data.length : input.length - 1;

  return (
    <Modal
      wrapClassName="react-ui"
      title="Quick Add"
      centered={true}
      maskClosable={false}
      destroyOnClose={true}
      style={{ padding: "0" }}
      visible={modalVisibility}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={handleClose}
      footer={[
        <Button key="cancel-button" onClick={handleClose} className="mr">
          Cancel
        </Button>,
        <Popconfirm
          title={`Add ${totalItems} item(s) to '${activeSettings.name}'`}
          onConfirm={handleOk}
          // onCancel={cancel}
          okText="Yes"
          key="add-button"
          cancelText="No"
        >
          <Button
            style={{ marginLeft: "0" }}
            type="primary"
            disabled={appLoading || !totalItems}
          >
            {totalItems ? `Add ${totalItems} items` : "Add"}
          </Button>
        </Popconfirm>,
      ]}
    >
      <Tabs
        activeKey={activeTab}
        type={"card"}
        tabBarExtraContent={
          <SelectCollection
            value={activeId}
            handleChange={(value) => {
              setActiveId(value);
              setTags([]);
            }}
            style={{ marginRight: "8px" }}
          />
        }
        onChange={(value) => setActiveTab(value)}
      >
        <TabPane tab="Title only" key="TITLE_ONLY">
          <StyledQuickAdd>
            <div className="quick-add-header">
              <Input
                autoFocus
                placeholder="Items"
                value={_.get(input, "0.title", "")}
                onKeyDown={handleKeyDown}
                onBlur={addTagToInput}
                onChange={({ target: { value } }) =>
                  handleInputChange({ key: "title", value, index: 0 })
                }
              />
            </div>
            <div className="tag-group">
              <Checkbox.Group
                options={tagList}
                value={tags}
                onChange={(value) => setTags(value)}
              />
            </div>
            <div className="quick-add-tags">
              {data.map(({ title }) => (
                <Tag closable key={title} onClose={() => removeTag(title)}>
                  {title}
                </Tag>
              ))}
            </div>
          </StyledQuickAdd>
        </TabPane>
        <TabPane tab="Detailed" key="DETAILS">
          <StyledQuickGroup>
            {_.map(input, ({ title, content, url }, index) => {
              return (
                <div className="quick-add-row" key={index}>
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={({ target: { value } }) =>
                      handleInputChange({ key: "title", value, index })
                    }
                  />
                  <Input
                    placeholder="Content"
                    value={content}
                    onChange={({ target: { value } }) =>
                      handleInputChange({ key: "content", value, index })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={url}
                    onChange={({ target: { value } }) =>
                      handleInputChange({ key: "url", value, index })
                    }
                    onBlur={({ target: { value } }) =>
                      handleURLParsing({ value, index })
                    }
                    onKeyDown={({ which, target: { value } }) =>
                      which === 13 && handleURLParsing({ value, index })
                    }
                  />
                </div>
              );
            })}
            <div className="tag-group">
              <Checkbox.Group
                options={tagList}
                value={tags}
                onChange={(value) => setTags(value)}
              />
            </div>
          </StyledQuickGroup>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

const mapStateToProps = ({
  quickAddModalMeta: { visibility } = {},
  session,
  activeCollectionId,
  appLoading,
}) => ({
  modalVisibility: visibility,
  session,
  activeCollectionId,
  appLoading,
});

const mapDispatchToProps = { setQuickAddModalMeta, addNote };

export default connect(mapStateToProps, mapDispatchToProps)(QuickAdd);
