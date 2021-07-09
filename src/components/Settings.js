import React, { useState, useEffect } from "react";
import { Drawer, Tag, Input, Button } from "antd";
import { connect } from "react-redux";
import _ from "lodash";
import short from "short-uuid";
import { toggleSettingsDrawer, saveSettings } from "../store/actions";
import SelectCollection from "./SelectCollection";
import JSONEditor from "../lib/JSONEditor";

const { TextArea } = Input;

const DEFAULT_SETTING_STATE = {
  name: "Untitled",
  caption: "",
  index: 1,
  liveId: 1,
  tags: [],
  postTypes: [
    {
      label: "POST",
      value: "POST",
      fields: ["TITLE", "CONTENT"],
      required: ["TITLE", "CONTENT"],
    },
    {
      label: "DROP",
      value: "DROP",
      required: ["TITLE"],
    },
  ],
  fields: [
    {
      label: "TITLE",
      value: "TITLE",
      type: "TEXT",
      defaultValue: "",
    },
    {
      label: "CONTENT",
      value: "CONTENT",
      type: "RICH_TEXT",
      defaultValue: "",
    },
    {
      label: "URL",
      value: "URL",
      type: "TEXT",
      defaultValue: "",
    },
  ],
  socialPlatforms: [
    {
      label: "FB",
      value: "facebook",
    },
    {
      label: "Instagram",
      value: "instagram",
    },
    {
      label: "Twitter",
      value: "twitter",
    },
    {
      label: "Dev.to",
      value: "dev",
    },
    {
      label: "Hashnode",
      value: "hashnode",
    },
    {
      label: "Linkedin",
      value: "linkedin",
    },
  ],
  pageLimit: 25,
  cardSmStyles: {},
  defaultDisplayType: "CARD",
  defaultCollectionId: "", // collection to load on siginin
};

const Settings = ({
  settingsDrawerVisibility,
  session,
  activeCollection,
  toggleSettingsDrawer,
  saveSettings,
}) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(activeCollection);
  const [showJSON, setShowJSON] = useState(true);

  useEffect(() => {
    if (!session.notesApp) return;
    setCollections(Object.entries(session.notesApp));
  }, [session.notesApp]);

  const [settingId = "", settingData = {}] =
    collections.find(([id]) => id === active) || [];

  const handleClose = () => toggleSettingsDrawer(false);

  const handleSave = (data) => {
    try {
      setLoading(true);
      saveSettings({ data, settingId });
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      width={400}
      title="Settings"
      className="react-ui"
      placement="right"
      closable={true}
      onClose={handleClose}
      visible={settingsDrawerVisibility}
    >
      <Header
        setCollections={setCollections}
        active={active}
        setActive={setActive}
        showJSON={showJSON}
        setShowJSON={setShowJSON}
      />
      {showJSON ? (
        <JSONEditor
          data={settingData}
          handleSave={handleSave}
          loading={loading}
        />
      ) : (
        <CollectionInfo
          settingData={settingData}
          handleSave={handleSave}
          loading={loading}
        />
      )}
    </Drawer>
  );
};

const Header = ({
  setCollections,
  active,
  setActive,
  showJSON,
  setShowJSON,
}) => {
  const addNewCollection = () => {
    const id = short.generate();
    setCollections((prev) => [...prev, [id, DEFAULT_SETTING_STATE]]);
    setActive(id);
  };

  return (
    <div className="flex space-between mb">
      <SelectCollection collection={active} setCollection={setActive} />
      <div className="fcc">
        <Button
          type={showJSON ? "primary" : "dashed"}
          className="mr"
          onClick={() => setShowJSON((prev) => !prev)}
        >
          JSON
        </Button>
        <Button onClick={addNewCollection} icon="plus"></Button>
      </div>
    </div>
  );
};

const CollectionInfo = ({ settingData, handleSave, loading }) => {
  const [data, setData] = useState({});
  const [newTag, setNewTag] = useState({ label: "", color: "" });

  useEffect(() => {
    if (!settingData) return;
    setData({ ...settingData });
  }, [settingData]);

  const handleChange = (update) => setData((prev) => ({ ...prev, ...update }));

  const addNewTag = () => {
    const tags = _.get(data, "tags");
    handleChange({ tags: [...tags, newTag] });
    setNewTag({ label: "", color: "" });
  };

  const { name = "", tags = [] } = data;
  return (
    <div className="settings-content">
      <div className="setting-group">
        <h6>Name</h6>
        <Input
          placeholder="title"
          value={name}
          onChange={(e) => handleChange({ name: e.target.value })}
        />
      </div>
      <div className="setting-group">
        <h6>Tags</h6>
        <div>
          {tags.map(({ label, color }) => (
            <Tag style={{ marginBottom: "6px" }} key={label} color={color}>
              {label}
            </Tag>
          ))}
        </div>
        <div className="add-tag">
          <div className="add-tag-form">
            <Input
              size="small"
              placeholder="Tag name"
              value={newTag.label}
              onChange={({ target: { value } }) =>
                setNewTag((prev) => ({ ...prev, label: value }))
              }
            />
            <input
              type="color"
              className="color-input"
              value={newTag.color}
              onChange={({ target: { value } }) =>
                setNewTag((prev) => ({ ...prev, color: value }))
              }
            />
          </div>
          <Button size="small" onClick={addNewTag}>
            Add
          </Button>
        </div>
      </div>
      <div className="setting-group">
        <h6>Caption</h6>
        <TextArea
          rows={6}
          placeholder="Caption"
          value={data.caption}
          onChange={(e) => handleChange({ caption: e.target.value })}
        />
      </div>
      <Button
        disabled={loading}
        type="primary"
        style={{ marginTop: "20px" }}
        onClick={() => handleSave(data)}
      >
        Save
      </Button>
    </div>
  );
};

const mapStateToProps = ({
  session,
  settingsDrawerVisibility,
  activeCollection,
}) => ({
  session: session || {},
  settingsDrawerVisibility,
  activeCollection,
});

export default connect(mapStateToProps, {
  toggleSettingsDrawer,
  saveSettings,
})(Settings);
