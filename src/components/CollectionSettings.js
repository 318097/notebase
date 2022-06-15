import React, { useState, useEffect } from "react";
import { Input, Button } from "antd";
import { NestedNodes } from "@codedrops/react-ui";
import Tags from "./notes/Tags";
import _ from "lodash";

const { TextArea } = Input;

const CollectionSetting = ({
  data,
  saveCollectionSettings,
  loading,
  updateTagSettings,
  activeId,
}) => {
  const [localData, setLocalData] = useState({});

  useEffect(() => {
    if (!data) return;
    setLocalData({ ...data });
  }, [data]);

  const handleChange = (update) =>
    setLocalData((prev) => ({ ...prev, ...update }));

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
        <div className="mb">
          <Tags tags={_.map(tags, "value")} />
        </div>

        <NestedNodes
          nodes={tags}
          onChange={(data, value) => updateTagSettings(data, value, activeId)}
        />
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
        onClick={() => saveCollectionSettings(localData)}
      >
        Save
      </Button>
    </div>
  );
};

export default CollectionSetting;
