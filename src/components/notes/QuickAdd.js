import React, { useState } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Modal, Input, Button, Tag, Tabs, Checkbox } from "antd";
import { addNote, setQuickAddModalMeta } from "../../store/actions";
import SelectCollection from "../SelectCollection";
import _ from "lodash";
import { generateSlug } from "../../utils";

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
    link: "",
  },
];

const QuickAdd = ({
  addNote,
  modalVisibility,
  appLoading,
  activeCollection,
  setQuickAddModalMeta,
  tagList,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [collection, setCollection] = useState(activeCollection);
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState("DETAILS");

  const handleClose = async () => {
    setQuickAddModalMeta();
    clearData();
  };

  const clearData = () => {
    setData([]);
    setInput(INITIAL_STATE);
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      const inputData = (activeTab === "TITLE_ONLY"
        ? data
        : input.slice(0, input.length - 1)
      ).map((item) => ({
        ...item,
        status: "QUICK_ADD",
        slug: generateSlug(item.title),
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
    const updatedInput = _.map(input, (data, i) =>
      index === i ? { ...data, [key]: value } : data
    );

    if (
      key === "title" &&
      activeTab === "DETAILS" &&
      value &&
      updatedInput.length - 1 === index
    ) {
      updatedInput.push(INITIAL_STATE);
    }

    setInput(updatedInput);
  };

  const handleKeyDown = (e) => {
    if (e.which === 188) {
      const tag = _.get(input, "0.title").trim().replace(",", "");
      setData((prev) => [...prev, { title: tag }]);
      setTimeout(() => setInput(INITIAL_STATE));
    }
  };

  const removeTag = (removedTag) =>
    setData((prev) => prev.filter((obj) => obj.title !== removedTag));

  const totalItems =
    activeTab === "TITLE_ONLY" ? data.length : input.length - 1;

  return (
    <Modal
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
        <Button key="cancel-button" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          type="primary"
          key="add-button"
          onClick={handleOk}
          disabled={appLoading}
        >
          {totalItems ? `Add ${totalItems} items` : "Add"}
        </Button>,
      ]}
    >
      <Tabs
        activeKey={activeTab}
        type={"card"}
        tabBarExtraContent={
          <SelectCollection
            collection={collection}
            setCollection={setCollection}
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
            {_.map(input, ({ title, content, link }, index) => {
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
                    placeholder="Link"
                    value={link}
                    onChange={({ target: { value } }) =>
                      handleChange({ key: "link", value, index })
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
  settings,
}) => ({
  modalVisibility: visibility,
  session,
  activeCollection,
  appLoading,
  tagList: _.map(_.get(settings, "tags", []), ({ label }) => ({
    label,
    value: label,
  })),
});

const mapDispatchToProps = { setQuickAddModalMeta, addNote };

export default connect(mapStateToProps, mapDispatchToProps)(QuickAdd);
