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
  activeCollection,
  setQuickAddModalMeta,
  session,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [collection, setCollection] = useState(activeCollection);
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState("TITLE_ONLY");

  const { name: activeCollectionName, tags: activeCollectionTags } = _.find(
    session.notebase,
    { _id: collection },
    {}
  );
  const tagList = _.map(activeCollectionTags, ({ label }) => ({
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

      await addNote(inputData, collection);
      clearData();
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleChange = ({ key, value, index }) => {
    let addNewRow = false;
    const updatedInput = _.map(input, (data, i) => {
      if (index === i) {
        const updatedData = { ...data, [key]: value };
        if (key === "url" && value && !data.title) {
          const { host } = new URL(value);
          const title = host.replace(/www\./, "").split(".").shift();
          if (title) {
            addNewRow = true;
            updatedData["title"] = `${title[0].toUpperCase()}${title.slice(1)}`;
          }
        }
        return updatedData;
      }
      return data;
    });

    if (
      addNewRow ||
      (key === "title" &&
        activeTab === "DETAILS" &&
        value &&
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
      title="QUICK ADD"
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
          title={`Add ${totalItems} item(s) to '${activeCollectionName}'`}
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
            collection={collection}
            setCollection={(value) => {
              setCollection(value);
              setTags([]);
            }}
            style={{ marginRight: "8px" }}
          />
        }
        onChange={(value) => setActiveTab(value)}
      >
        <TabPane tab="Quick Add" key="TITLE_ONLY">
          <StyledQuickAdd>
            <div className="quick-add-header">
              <Input
                autoFocus
                placeholder="Items"
                value={_.get(input, "0.title", "")}
                onKeyDown={handleKeyDown}
                onBlur={addTagToInput}
                onChange={({ target: { value } }) =>
                  handleChange({ key: "title", value, index: 0 })
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
        <TabPane tab="Quick Add Info" key="DETAILS">
          <StyledQuickGroup>
            {_.map(input, ({ title, content, url }, index) => {
              return (
                <div className="quick-add-row" key={index}>
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={({ target: { value } }) =>
                      handleChange({ key: "title", value, index })
                    }
                  />
                  <Input
                    placeholder="Content"
                    value={content}
                    onChange={({ target: { value } }) =>
                      handleChange({ key: "content", value, index })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={url}
                    onChange={({ target: { value } }) =>
                      handleChange({ key: "url", value, index })
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
  activeCollection,
  appLoading,
}) => ({
  modalVisibility: visibility,
  session,
  activeCollection,
  appLoading,
});

const mapDispatchToProps = { setQuickAddModalMeta, addNote };

export default connect(mapStateToProps, mapDispatchToProps)(QuickAdd);
