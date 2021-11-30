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
  const [active, setActive] = useState(activeCollectionId);
  const [showJSON, setShowJSON] = useState(true);

  useEffect(() => {
    if (!session.notebase) return;
    setCollectionList(session.notebase);
  }, [session.notebase]);

  const { _id: settingId, ...settingData } =
    _.find(collectionList, { _id: active }) || [];

  const handleClose = () => toggleSettingsDrawer(false);

  const handleSave = (data) => {
    try {
      setLoading(true);
      saveSettings({ ...data, _id: settingId });
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
  setCollectionList,
  active,
  setActive,
  showJSON,
  setShowJSON,
}) => {
  const addNewCollection = () => {
    const _id = "NEW_COLLECTION";
    setCollectionList((prev) => [...prev, { _id, ...DEFAULT_SETTING_STATE }]);
    setActive(_id);
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
