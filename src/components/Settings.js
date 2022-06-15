import React, { useState, useEffect } from "react";
import { Drawer, Button } from "antd";
import { connect } from "react-redux";
import _ from "lodash";
import {
  toggleSettingsDrawer,
  saveSettings,
  updateTagSettings,
} from "../store/actions";
import SelectCollection from "./SelectCollection";
import JSONEditor from "../lib/JSONEditor";
import { DEFAULT_SETTING_STATE } from "../constants";
import CollectionSetting from "./CollectionSettings";

const Settings = ({
  settingsDrawerVisibility,
  session,
  activeCollectionId,
  toggleSettingsDrawer,
  saveSettings,
  updateTagSettings,
}) => {
  const [collectionList, setCollectionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState();
  const [showJSON, setShowJSON] = useState(false);

  useEffect(() => {
    if (activeCollectionId) setActiveId(activeCollectionId);
  }, [activeCollectionId]);

  useEffect(() => {
    if (!session.notebase) return;
    setCollectionList(session.notebase);
  }, [session.notebase]);

  const activeSettings = _.find(collectionList, { _id: activeId }) || [];

  const handleClose = () => toggleSettingsDrawer(false);

  const saveCollectionSettings = (data) => {
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
          data={_.omit(activeSettings, "tags")}
          saveCollectionSettings={saveCollectionSettings}
          loading={loading}
        />
      ) : (
        <CollectionSetting
          data={activeSettings}
          saveCollectionSettings={saveCollectionSettings}
          loading={loading}
          activeId={activeId}
          updateTagSettings={updateTagSettings}
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
  updateTagSettings,
})(Settings);
