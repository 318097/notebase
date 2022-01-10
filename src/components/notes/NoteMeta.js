import React from "react";
import { Popover } from "antd";
import { Icon } from "@codedrops/react-ui";

const NoteMeta = ({ sourceInfo = {}, inPopup }) => {
  const entries = Object.entries(sourceInfo || {});
  const entriesLength = entries.length;

  const SourceInfo = (
    <div>
      {entries
        .filter(
          ([key]) =>
            !["uploadedFileURL", "uploadedFileOn", "uploadedFileId"].includes(
              key
            )
        )
        .map(([key, value]) => {
          return (
            <div key={key}>
              {key}:<span className="bold">{value}</span>
            </div>
          );
        })}
    </div>
  );

  if (!entriesLength) return null;

  return inPopup ? (
    <Popover content={SourceInfo} trigger="click">
      <Icon hover size={12} className="icon" type="circle" />
    </Popover>
  ) : (
    SourceInfo
  );
};

export default NoteMeta;
