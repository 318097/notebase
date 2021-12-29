import React from "react";
import { Popover } from "antd";
import { Icon } from "@codedrops/react-ui";
import _ from "lodash";

const NoteMeta = ({ sourceInfo, inPopup }) => {
  const obj = _.pick(sourceInfo || {}, [
    "fileName",
    "fileType",
    "tobyCollectionName",
    "batchSize",
    "batchId",
  ]);
  const entries = Object.entries(obj);
  const entriesLength = entries.length;

  const SourceInfo = (
    <div>
      {entries.map(([key, value]) => {
        return (
          <div className="mb">
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
