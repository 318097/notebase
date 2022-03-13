import React, { useState, useEffect } from "react";
import { Drawer, Tag, Input, Button } from "antd";
import { connect } from "react-redux";
import _ from "lodash";
import { toggleSettingsDrawer, saveSettings } from "../store/actions";
import SelectCollection from "./SelectCollection";
import JSONEditor from "../lib/JSONEditor";
import { DEFAULT_SETTING_STATE } from "../constants";

const { TextArea } = Input;

const Settings = ({
  settingsDrawerVisibility,
  session,
  activeCollectionId,
  toggleSettingsDrawer,
  saveSettings,
}) => {
  const [collectionList, setCollectionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState();
  const [showJSON, setShowJSON] = useState(true);

  useEffect(() => {
    if (activeCollectionId) setActiveId(activeCollectionId);
  }, [activeCollectionId]);

  useEffect(() => {
    if (!session.notebase) return;
    setCollectionList(session.notebase);
  }, [session.notebase]);

  const activeSettings = _.find(collectionList, { _id: activeId }) || [];

  const handleClose = () => toggleSettingsDrawer(false);

  const handleSave = (data) => {
    try {
      setLoading(true);
      saveSettings(data);
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
        setCollectionList={setCollectionList}
        activeId={activeId}
        setActiveId={setActiveId}
        showJSON={showJSON}
        setShowJSON={setShowJSON}
      />
      {showJSON ? (
        <JSONEditor
          data={activeSettings}
          handleSave={handleSave}
          loading={loading}
        />
      ) : (
        <CollectionSetting
          data={activeSettings}
          handleSave={handleSave}
          loading={loading}
        />
      )}
    </Drawer>
  );
};

const Header = ({
  setCollectionList,
  activeId,
  setActiveId,
  showJSON,
  setShowJSON,
}) => {
  const addNewCollection = () => {
    const _id = "NEW_COLLECTION";
    setCollectionList((prev) => [...prev, { _id, ...DEFAULT_SETTING_STATE }]);
    setActiveId(_id);
  };

  return (
    <div className="flex space-between mb">
      <SelectCollection value={activeId} handleChange={setActiveId} />
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

const CollectionSetting = ({ data, handleSave, loading }) => {
  const [localData, setLocalData] = useState({});
  const [newTag, setNewTag] = useState({ label: "", color: "" });

  useEffect(() => {
    if (!data) return;
    setLocalData({ ...data });
  }, [data]);

  const handleChange = (update) =>
    setLocalData((prev) => ({ ...prev, ...update }));

  const addNewTag = () => {
    const tags = _.get(localData, "tags");
    handleChange({ tags: [...tags, newTag] });
    setNewTag({ label: "", color: "" });
  };

  const { name = "", tags = [] } = localData;
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
        {/* <div className="add-tag">
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
        </div> */}
      </div>
      <div className="setting-group">
        <h6>Caption</h6>
        <TextArea
          rows={6}
          placeholder="Caption"
          value={localData.caption}
          onChange={(e) => handleChange({ caption: e.target.value })}
        />
      </div>
      <Button
        disabled={loading}
        type="primary"
        style={{ marginTop: "20px" }}
        onClick={() => handleSave(localData)}
      >
        Save
      </Button>
    </div>
  );
};

const mapStateToProps = ({
  session,
  settingsDrawerVisibility,
  activeCollectionId,
}) => ({
  session: session || {},
  settingsDrawerVisibility,
  activeCollectionId,
});

export default connect(mapStateToProps, {
  toggleSettingsDrawer,
  saveSettings,
})(Settings);
