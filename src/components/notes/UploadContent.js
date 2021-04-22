/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, Fragment } from "react";
import {
  Button,
  message,
  Radio,
  Input,
  Tag,
  Select,
  Divider,
  Modal,
} from "antd";
import { Card, Icon } from "@codedrops/react-ui";
import { connect } from "react-redux";
import styled from "styled-components";
import uuid from "uuid";
import _ from "lodash";
import { MessageWrapper } from "../../styled";
import SelectCollection from "../SelectCollection";
import { setModalMeta, setUploadingData, addNote } from "../../store/actions";
import { md } from "../../utils";

const config = {
  POST: {
    itemSeperator: "---[\r\n]",
    itemSplitter: "\n",
    titleRegex: /###/gi,
    contentRegex: "\n",
  },
  DROP: {
    itemSeperator: "\n",
    itemSplitter: "=>",
    titleRegex: /-/,
  },
};

const { Option } = Select;

const StyledPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 28px 12px;
  .actions {
    margin-left: 20px;
    display: grid;
    grid-auto-flow: column;
    grid-column-gap: 4px;
    align-items: center;
  }
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  column-gap: 6px;
  justify-content: center;

  .card-wrapper {
    height: 300px;
    margin: 3px 0;
    position: relative;
    .card {
      height: 100%;
      width: 100%;
      padding: 20px 12px;
      cursor: pointer;
      .title {
        margin-bottom: 10px;
      }
      .content {
        overflow: auto;
      }
    }
    .index-number {
      position: absolute;
      top: 6px;
      left: 6px;
      text-decoration: underline;
      font-style: italics;
      font-size: 1rem;
    }
    .actions {
      position: absolute;
      top: 4px;
      right: 4px;
    }
  }
`;

const parseItem = (item, type = "POST") => {
  let title, content;
  const { itemSplitter, titleRegex, contentRegex } = _.get(config, type);

  switch (type) {
    case "POST":
      [title, ...content] = item.split(itemSplitter);
      title = title.replace(titleRegex, "");
      content = content.join(contentRegex);
      break;
    case "DROP":
      [title, content] = item.split(itemSplitter);
      title = title.replace(titleRegex, "");
      content = `${title} - ${content}`;
      break;
    default:
      return;
  }
  return {
    title,
    content,
  };
};

const UploadContent = ({
  setModalMeta,
  uploadingData: { rawData, data, dataType, status, fileName, tags },
  setUploadingData,
  addNote,
  activeCollection,
  settings,
}) => {
  const inputEl = useRef(null);
  const [viewRawData, setViewRawData] = useState(false);
  const [requireParsing, setRequireParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collection, setCollection] = useState(activeCollection);
  // const [fileParsing, setFileParsing] = useState();

  useEffect(() => {
    if (status === "PROCESS_DATA") processData();
  }, [status]);

  useEffect(() => {
    if (status === "PROCESSED") setRequireParsing(true);
  }, [collection, tags, dataType]);

  const readFileContent = (event) => {
    const [document] = event.target.files;

    if (!document) return;

    const reader = new FileReader();
    reader.readAsText(document);

    reader.onload = () =>
      setUploadingData({
        rawData: reader.result,
        status: "PROCESS_DATA",
        fileName: document.name,
      });

    // event.target.value = null;
  };

  const processData = () => {
    if (!rawData) return;

    const fileContent = rawData
      .split(new RegExp(_.get(config, [dataType, "itemSeperator"])))
      .map((item) => {
        let { title = "", content = "" } = parseItem(item.trim(), dataType);
        return {
          tags,
          type: dataType,
          title,
          content,
          tempId: uuid(),
          viewed: false,
          fileName,
        };
      })
      .filter((item) => item.title || item.content);
    setUploadingData({ data: fileContent, status: "PROCESSED" });
    setRequireParsing(false);
  };

  const addData = async () => {
    try {
      setLoading(true);
      await addNote(data, collection);
      message.success(`${data.length} notes added successfully.`);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setUploadingData({ rawData: null, data: [], status: "DEFAULT" });
    }
  };

  const editItem = (item) => () =>
    setModalMeta({
      selectedNote: item,
      mode: "edit-upload",
      visibility: true,
    });

  const removeItem = (tempId) => (e) => {
    e.stopPropagation();
    setUploadingData({ data: data.filter((item) => item.tempId !== tempId) });
  };

  const clearData = () =>
    setUploadingData({ data: [], rawData: null, status: "DEFAULT" });

  return (
    <section>
      <StyledPageHeader>
        <h3>File Upload</h3>
        <div className="actions">
          <SelectCollection
            collection={collection}
            setCollection={setCollection}
          />

          <Select
            style={{ minWidth: "80px" }}
            mode="multiple"
            placeholder="Tags"
            value={tags}
            onChange={(list) => setUploadingData({ tags: list })}
          >
            {_.get(settings, "tags", []).map(({ label }) => (
              <Option key={label} value={label}>
                {label}
              </Option>
            ))}
          </Select>

          {/* <Input
            key="file-splitter"
            style={{ width: "110px" }}
            placeholder="File splitter"
            value={JSON.stringify(fileParsing)}
            onChange={({ target: { value } }) =>
              setFileParsing(JSON.parse(value))
            }
          /> */}

          <Select
            placeholder="Post type"
            value={dataType}
            onChange={(value) => setUploadingData({ dataType: value })}
          >
            {_.get(settings, "postTypes", []).map(({ label, value }) => (
              <Option key={label} value={label}>
                {label}
              </Option>
            ))}
          </Select>

          {rawData ? (
            <Fragment>
              <Divider type="vertical" />
              <Button
                type={requireParsing ? "danger" : "default"}
                onClick={() => setUploadingData({ status: "PROCESS_DATA" })}
              >
                Parse
              </Button>
              <Button type="link" onClick={clearData}>
                Clear
              </Button>
              <Divider type="vertical" />
              <Button type="link" onClick={() => setViewRawData(true)}>
                Raw
              </Button>
              <Button
                onClick={addData}
                loading={loading}
                disabled={requireParsing}
              >
                {`Upload ${data.length} ${(dataType || "").toLowerCase()}`}
              </Button>
            </Fragment>
          ) : (
            <Button type="dashed" onClick={() => inputEl.current.click()}>
              Select File
            </Button>
          )}
        </div>
      </StyledPageHeader>

      {data.length ? (
        <Wrapper>
          {data.map((item, i) => {
            const { title = "", content = "", tags = [], viewed } = item;
            return (
              <div
                className={`card-wrapper${viewed ? " viewed" : ""}`}
                key={item.tempId}
                onClick={editItem(item)}
              >
                <Card>
                  <h3 className="title">{title}</h3>
                  <div
                    className="content"
                    dangerouslySetInnerHTML={{ __html: md.render(content) }}
                  ></div>
                  <div className="tags">
                    {tags.map((tag) => (
                      <Tag key={tag}>{tag.toUpperCase()}</Tag>
                    ))}
                  </div>
                </Card>

                <span className="index-number">#{i + 1}</span>
                <div className="actions">
                  <Icon
                    hover
                    size={12}
                    onClick={removeItem(item.tempId)}
                    className="icon"
                    type="delete"
                  />
                </div>
              </div>
            );
          })}
          <Modal
            title={"Raw data"}
            centered={true}
            // width={"50vw"}
            wrapClassName="react-ui caption-modal"
            visible={viewRawData}
            footer={null}
            onCancel={() => setViewRawData(false)}
          >
            <div dangerouslySetInnerHTML={{ __html: rawData }} />
          </Modal>
        </Wrapper>
      ) : (
        <MessageWrapper>EMPTY</MessageWrapper>
      )}
      <input
        ref={inputEl}
        type="file"
        style={{ visibility: "hidden" }}
        onChange={readFileContent}
      />
    </section>
  );
};

const mapStateToProps = ({ uploadingData, activeCollection, settings }) => ({
  uploadingData,
  activeCollection,
  settings,
});

const mapDispatchToProps = { setModalMeta, setUploadingData, addNote };

export default connect(mapStateToProps, mapDispatchToProps)(UploadContent);
