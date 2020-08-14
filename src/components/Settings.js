import React, { useState, useEffect } from "react";
import { Drawer, Tag, Input, Button, Select, Divider, message } from "antd";
import { connect } from "react-redux";
import _ from "lodash";
import short from "short-uuid";
import { toggleSettingsDrawer, setSession } from "../store/actions";
import colors from "@codedrops/react-ui";
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;

const Settings = ({
  settingsDrawerVisibility,
  settings,
  session,
  activeCollection,
  toggleSettingsDrawer,
  setSession,
}) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(activeCollection);

  useEffect(() => {
    if (!session.notesApp) return;
    setCollections(Object.entries(session.notesApp));
  }, [session.notesApp]);

  const [settingId = "", settingData = {}] =
    collections.find(([id]) => id === active) || [];

  const handleClose = () => toggleSettingsDrawer(false);

  const saveSettings = async (data) => {
    setLoading(true);
    try {
      const updatedSettings = {
        ..._.get(session, "notesApp", {}),
        [settingId]: data,
      };
      const newSettings = {
        notesApp: updatedSettings,
      };
      await axios.put(`/users/${session._id}`, newSettings);
      await setSession(newSettings);
      message.success(`Settings updated.`);
      toggleSettingsDrawer();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Settings"
      placement="right"
      closable={true}
      onClose={handleClose}
      visible={settingsDrawerVisibility}
    >
      <Header
        collections={collections}
        setCollections={setCollections}
        activeCollection={active}
        setActive={setActive}
      />
      <CollectionInfo
        settingData={settingData}
        saveSettings={saveSettings}
        loading={loading}
      />
    </Drawer>
  );
};

const Header = ({
  collections,
  setCollections,
  activeCollection,
  setActive,
}) => {
  const addNewCollection = () => {
    const id = short.generate();
    const details = {
      tags: [],
      name: "Untitled",
      caption: "",
      index: 1,
    };
    setCollections((prev) => [...prev, [id, details]]);
    setActive(id);
  };

  return (
    <div className="flex space-between">
      <Select
        onChange={setActive}
        style={{ width: 120 }}
        placeholder="Collections"
        value={activeCollection}
      >
        {collections.map(([id, config]) => (
          <Option key={id} value={id}>
            {_.get(config, "name", "")}
          </Option>
        ))}
      </Select>
      <Button onClick={addNewCollection} icon="plus"></Button>
    </div>
  );
};

const CollectionInfo = ({ settingData, saveSettings, loading }) => {
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
    <div>
      <Divider />
      <div>
        <h6>Name</h6>
        <Input
          placeholder="title"
          value={name}
          onChange={(e) => handleChange({ name: e.target.value })}
        />
      </div>
      <div>
        <h6>Tags</h6>
        {tags.map(({ label, color }) => (
          <Tag key={label} color={color}>
            {label}
          </Tag>
        ))}
        <div
          style={{
            margin: "12px 0",
            padding: "8px",
            background: colors.feather,
          }}
        >
          <div style={{ display: "flex" }}>
            <Input
              placeholder="Tag name"
              value={newTag.label}
              onChange={({ target: { value } }) =>
                setNewTag((prev) => ({ ...prev, label: value }))
              }
            />
            <Input
              placeholder="Color code"
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
      <div>
        <h6>Caption</h6>
        <TextArea
          placeholder="Caption"
          value={data.caption}
          onChange={(e) => handleChange({ caption: e.target.value })}
        />
      </div>
      <Button
        loading={loading}
        type="primary"
        style={{ marginTop: "20px" }}
        onClick={() => saveSettings(data)}
      >
        Save
      </Button>
    </div>
  );
};

const mapStateToProps = ({
  session,
  settingsDrawerVisibility,
  settings,
  activeCollection,
}) => ({
  session: session || {},
  settingsDrawerVisibility,
  settings,
  activeCollection,
});

export default connect(mapStateToProps, {
  toggleSettingsDrawer,
  setSession,
})(Settings);
