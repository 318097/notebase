import React, { useState, useEffect } from "react";
import { Button, message, Input } from "antd";

const { TextArea } = Input;

const JSONEditor = ({ data, saveCollectionSettings, loading }) => {
  const [localData, setLocalData] = useState({});

  useEffect(() => {
    if (!data) return;
    setLocalData(JSON.stringify(data, undefined, 2));
  }, [data]);

  const validateJSON = () => {
    try {
      JSON.parse(localData);
    } catch (err) {
      message.error("Invalid JSON");
    }
  };

  return (
    <div className="settings-content">
      <TextArea
        rows={24}
        value={localData}
        onChange={(e) => setLocalData(e.target.value)}
        onBlur={validateJSON}
      />
      <Button
        disabled={loading}
        type="primary"
        className="mt"
        onClick={() => saveCollectionSettings(JSON.parse(localData))}
      >
        Save
      </Button>
    </div>
  );
};

export default JSONEditor;
