/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from "react";
import { Button, message, Tag, Select, Divider, Modal } from "antd";
import { Card, Icon, EmptyState } from "@codedrops/react-ui";
import { connect } from "react-redux";
import styled from "styled-components";
import uuid from "uuid";
import _ from "lodash";
import SelectCollection from "../SelectCollection";
import { setModalMeta, setUploadingData, addNote } from "../../store/actions";
import { initialUploadingDataState } from "../../store/reducer";
import { md } from "../../lib/utils";
import axios from "axios";
import ImageCard from "../../lib/ImageCard";
import UploadButton from "../../lib/UploadButton";

const config = {
  POST: {
    itemSeperator: "---[\r\n]",
    itemSplitter: "\n",
    titleRegex: /###/gi,
    contentRegex: "\n",
    accept: ".md",
  },
  DROP: {
    itemSeperator: "\n",
    itemSplitter: "=>",
    titleRegex: /-/,
    accept: ".md",
  },
  RESOURCES: {
    accept: ".png",
  },
  TOBY: {
    accept: ".json",
  },
};

const { Option, OptGroup } = Select;

const StyledPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
  gap: 12px;
  padding: 0 28px;
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

const UploadContent = ({
  setModalMeta,
  uploadingData: {
    rawData,
    data,
    dataType,
    status,
    fileName,
    tags,
    sourceFiles,
  },
  setUploadingData,
  addNote,
  activeCollection,
  settings,
}) => {
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

  const parseItem = (item, { isCustomSource, collection } = {}) => {
    const parsed = {
      tags,
      type: "POST",
      status: "QUICK_ADD",
      tempId: uuid(),
      viewed: false,
      sourceInfo: {
        // cloudinary url is added later
        fileName,
        type: dataType,
      },
    };

    const { itemSplitter, titleRegex, contentRegex } = _.get(config, dataType);

    switch (dataType) {
      case "POST": {
        let [title, ...content] = item.split(itemSplitter);
        parsed.title = title.replace(titleRegex, "");
        parsed.content = content.join(contentRegex);
        break;
      }
      case "DROP": {
        let [title, content] = item.split(itemSplitter);
        parsed.title = title.replace(titleRegex, "");
        parsed.content = `${title} - ${content}`;
        break;
      }
      case "TOBY": {
        parsed.title = item.title;
        parsed.url = item.url;
        parsed.sourceInfo["collection"] = collection;
        break;
      }
      default:
        break;
    }
    return parsed;
  };

  const processData = () => {
    if (!rawData) return;

    const isCustomSource = _.includes(["POST", "DROP"], dataType);
    let parsedContent = [];

    if (isCustomSource) {
      const dataSplit = rawData.split(
        new RegExp(_.get(config, [dataType, "itemSeperator"]))
      );
      parsedContent = dataSplit.map((item) =>
        parseItem(item.trim(), { isCustomSource })
      );
    } else {
      const json = JSON.parse(rawData);
      json.lists.forEach((collection) => {
        const { title, cards } = collection;

        const collectionParsed = cards.map((item) =>
          parseItem(item, { isCustomSource, collection: title })
        );
        parsedContent.push(...collectionParsed);
      });
    }

    setUploadingData({
      data: parsedContent.filter((item) => item.title || item.content),
      status: "PROCESSED",
    });
    setRequireParsing(false);
  };

  const addData = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("type", dataType);
      formData.append(
        "storeExactFileName",
        dataType === "RESOURCES" ? "TRUE" : "FALSE"
      );

      for (let i = 0; i < sourceFiles.length; i++)
        formData.append(`files`, sourceFiles[i]);

      const transactionResponse = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (dataType !== "RESOURCES") {
        await addNote(
          data.map((item) => ({
            ...item,
            sourceInfo: {
              ...item.sourceInfo,
              id: _.get(transactionResponse, "data.0.url"),
            },
          })),
          collection
        );
      }
      message.success(`${data.length} items added.`);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setUploadingData(initialUploadingDataState);
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

  const onFileRead = (files) => {
    if (dataType === "RESOURCES")
      setUploadingData({
        ...files,
        data: [...files.data, ...data],
      });
    else
      setUploadingData({
        ...files,
        status: "PROCESS_DATA",
      });
  };

  const clearData = () =>
    setUploadingData({ data: [], rawData: null, status: "DEFAULT" });

  const isResourceUpload = dataType === "RESOURCES";
  const controls = [
    {
      id: "base",
      visible: !isResourceUpload,
      component: (
        <Fragment>
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
        </Fragment>
      ),
    },
    {
      id: "type",
      visible: true,
      component: (
        <Select
          placeholder="Post type"
          value={dataType}
          style={{ width: "100px" }}
          onChange={(value) => setUploadingData({ dataType: value })}
        >
          <OptGroup label="Custom">
            {_.get(settings, "postTypes", []).map(({ label, value }) => (
              <Option key={label} value={label}>
                {label}
              </Option>
            ))}
          </OptGroup>
          <OptGroup label="External">
            <Option value={"TOBY"}>TOBY</Option>
            <Option value={"CHROME"}>CHROME</Option>
          </OptGroup>
          <OptGroup label="Assets">
            <Option value={"RESOURCES"}>RESOURCES</Option>
          </OptGroup>
        </Select>
      ),
    },
    {
      id: "action-files",
      visible: !isResourceUpload,
      component: rawData ? (
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
          <Button onClick={addData} loading={loading} disabled={requireParsing}>
            {`Upload ${data.length} ${(dataType || "").toLowerCase()}`}
          </Button>
        </Fragment>
      ) : (
        <UploadButton
          label="Select File"
          accept={_.get(config, [dataType, "accept"])}
          onFileRead={onFileRead}
        />
      ),
    },
    {
      id: "action-resources",
      visible: isResourceUpload,
      component: (
        <Fragment>
          <Divider type="vertical" />
          <UploadButton
            label="Add files"
            accept={_.get(config, [dataType, "accept"])}
            onFileRead={onFileRead}
          />

          <Button type="link" onClick={clearData}>
            Clear
          </Button>
          <Divider type="vertical" />
          <Button onClick={addData} loading={loading} disabled={!data.length}>
            {`Upload ${data.length} ${(dataType || "").toLowerCase()}`}
          </Button>
        </Fragment>
      ),
    },
  ];

  return (
    <section>
      <StyledPageHeader>
        <h3>File Upload</h3>
        <div className="actions">
          {controls
            .filter((item) => item.visible)
            .map((item) => (
              <Fragment key={item.id}>{item.component}</Fragment>
            ))}

          {/* <Input
            key="file-splitter"
            style={{ width: "110px" }}
            placeholder="File splitter"
            value={JSON.stringify(fileParsing)}
            onChange={({ target: { value } }) =>
              setFileParsing(JSON.parse(value))
            }
          /> */}
        </div>
      </StyledPageHeader>

      <EmptyState input={data}>
        <Wrapper>
          {data.map((item, i) => {
            if (dataType === "RESOURCES") {
              // const title = _.get(item, "file.name", "");
              return <ImageCard key={i} {...item} />;
            }
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
            wrapClassName="react-ui"
            visible={viewRawData}
            footer={null}
            onCancel={() => setViewRawData(false)}
          >
            <div dangerouslySetInnerHTML={{ __html: rawData }} />
          </Modal>
        </Wrapper>
      </EmptyState>
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
