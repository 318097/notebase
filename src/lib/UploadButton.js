import React, { useRef, Fragment } from "react";
import { Button } from "antd";
import { readFileContent } from "./utils";

const UploadButton = ({
  accept,
  onFileRead,
  multiple,
  customButton,
  label,
  ...others
}) => {
  const inputEl = useRef(null);

  const openFileExplorer = () => inputEl.current.click();

  const handleChange = (event) => {
    readFileContent(event, { onFileRead });
  };

  return (
    <Fragment>
      {customButton ? (
        customButton({ openFileExplorer })
      ) : (
        <Button type="dashed" onClick={openFileExplorer}>
          {label}
        </Button>
      )}
      <input
        ref={inputEl}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ visibility: "hidden", position: "absolute" }}
        onChange={handleChange}
        {...others}
      />
    </Fragment>
  );
};

UploadButton.defaultProps = {
  multiple: true,
};

export default UploadButton;
