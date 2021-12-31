/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from "react";
import {
  Button,
  message,
  Tag,
  Select,
  Divider,
  Modal,
  Icon as AntIcon,
} from "antd";
import { Card, Icon, EmptyState } from "@codedrops/react-ui";
import { connect } from "react-redux";
import styled from "styled-components";
import uuid from "uuid";
import _ from "lodash";
import SelectCollection from "../SelectCollection";
import {
  setModalMeta,
  setUploadingData,
  addNote,
  setActiveCollection,
} from "../../store/actions";
import { INITIAL_UPLOADING_DATA_STATE } from "../../store/reducer";
import { extractTagCodes, md, getDomain } from "../../lib/utils";
import axios from "axios";
import ImageCard from "../../lib/ImageCard";
import UploadButton from "../../lib/UploadButton";
import classnames from "classnames";
import { StyledNoteCard } from "./styled";
import NoteMeta from "./NoteMeta";

const config = {
  POST: {
    itemSeperator: "---[\r\n]",
    itemSplitter: "\n",
    titleRegex: /###/gi,
    contentRegex: "\n",
    accept: ".md",
    collectionType: "POST_FILE",
  },
  DROP: {
    itemSeperator: "\n",
    itemSplitter: "=>",
    titleRegex: /-/,
    accept: ".md",
    collectionType: "DROP_FILE",
  },
  RESOURCES: {
    accept: ".png",
  },
  TOBY: {
    accept: ".json",
    collectionType: "TOBY",
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
`;

const UploadContent = ({
  setModalMeta,
  history,
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
  activeCollectionId,
  settings,
  setActiveCollection,
  tagsCodes,
}) => {
  const [viewRawData, setViewRawData] = useState(false);
  const [requireParsing, setRequireParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [fileParsing, setFileParsing] = useState();
  const currentDataTypeConfig = _.get(config, dataType, {});
  const isCustomSource = _.includes(["POST", "DROP"], dataType);

  useEffect(() => {
    if (status === "PROCESS_DATA") processData();
  }, [status]);

  useEffect(() => {
    if (status === "PROCESSED") setRequireParsing(true);
  }, [activeCollectionId, tags, dataType]);

  const parseItem = (item, metaInfo = {}) => {
    const parsed = {
      tags,
      type: "POST",
      status: "QUICK_ADD",
      tempId: uuid(),
      viewed: false,
      collectionId: activeCollectionId,
      sourceInfo: metaInfo,
    };

    const { itemSplitter, titleRegex, contentRegex } = currentDataTypeConfig;

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
        parsed.type = "DROP";
        break;
      }
      case "TOBY": {
        parsed.title = item.title;
        parsed.url = item.url;
        break;
      }
      default:
        break;
    }
    return parsed;
  };

  const processData = () => {
    if (!rawData) return;

    let parsedContent = [];

    if (isCustomSource) {
      const dataSplit = rawData.split(
        new RegExp(_.get(currentDataTypeConfig, "itemSeperator"))
      );
      parsedContent = dataSplit.map((item) => parseItem(item.trim()));
    } else {
      // TOBY
      const json = JSON.parse(rawData);
      json.lists.forEach((collection) => {
        const { title, cards } = collection;
        const metaInfo = {
          collectionName: title,
          collectionSize: cards.length,
        };
        const parsedCollection = cards.map((item) => parseItem(item, metaInfo));
        parsedContent.push(...parsedCollection);
      });
    }

    setUploadingData({
      data: parsedContent.filter((item) => item.title || item.content),
      status: "PROCESSED",
    });
    setRequireParsing(false);
  };

  const onFileRead = (files) => {
    if (dataType === "RESOURCES")
      setUploadingData({
        ...files,
        data: [...files.data, ...data],
      });
    // uploaded 'md' files
    else
      setUploadingData({
        ...files,
        status: "PROCESS_DATA",
      });
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
        const uploadedFileInfo = _.get(transactionResponse, "data.0");
        const sourceInfo = {
          uploadedFileURL: _.get(uploadedFileInfo, "url"),
          uploadedFileOn: _.get(uploadedFileInfo, "created_at"),
          uploadedFileId: _.get(uploadedFileInfo, "asset_id"),
          fileName,
          collectionType: currentDataTypeConfig.collectionType,
          method: "FILE_UPLOAD",
        };

        await addNote(data, { collectionId: activeCollectionId, sourceInfo });
      }
      message.success(`${data.length} items added.`);
      history.push("/");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setUploadingData(INITIAL_UPLOADING_DATA_STATE);
    }
  };

  const editItem = (selectedNote) =>
    setModalMeta({
      selectedNote,
      mode: "edit-upload",
      visibility: true,
    });

  const removeItem = (e, tempId) => {
    e.stopPropagation();
    setUploadingData({ data: data.filter((item) => item.tempId !== tempId) });
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
            value={activeCollectionId}
            handleChange={setActiveCollection}
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
              <Option key={value} value={value}>
                {label}
              </Option>
            ))}
          </OptGroup>
          <OptGroup label="External">
            <Option value={"TOBY"}>Toby</Option>
            <Option value={"CHROME"}>Chrome</Option>
          </OptGroup>
          <OptGroup label="Assets">
            <Option value={"RESOURCES"}>Resources</Option>
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
          accept={_.get(currentDataTypeConfig, "accept")}
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
            accept={_.get(currentDataTypeConfig, "accept")}
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
        </div>
      </StyledPageHeader>

      <EmptyState input={data}>
        <Wrapper>
          {data.map((item, idx) => {
            idx++;
            switch (dataType) {
              case "RESOURCES":
                // const title = _.get(item, "file.name", "");
                return <ImageCard key={idx} {...item} />;
              default:
                return (
                  <UploadCard
                    key={item.tempId}
                    item={item}
                    editItem={editItem}
                    removeItem={removeItem}
                    idx={idx}
                    tagsCodes={tagsCodes}
                    dataType={dataType}
                  />
                );
            }
          })}
        </Wrapper>
      </EmptyState>
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
    </section>
  );
};

const UploadCard = ({
  item,
  editItem,
  removeItem,
  idx,
  tagsCodes,
  dataType,
}) => {
  const { title = "", content = "", tags = [], viewed, sourceInfo, url } = item;
  const cardClasses = classnames("card", {
    today: !!viewed,
  });
  const onlyTitleAndURL = dataType === "TOBY";
  const collectionName = `Collection: ${_.get(
    sourceInfo,
    "tobyCollectionName"
  )}`;
  const goToLink = () => window.open(url);
  return (
    <StyledNoteCard>
      <Card className={cardClasses} onClick={() => editItem(item)}>
        <h3 className="title">{title}</h3>
        {!!content && (
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: md.render(content) }}
          ></div>
        )}

        {onlyTitleAndURL && (
          <>
            <div>{getDomain(url)}</div>
            <div>---</div>
            <div className="mt">{collectionName}</div>
          </>
        )}
        {!!idx && (
          <div className="index-wrapper">
            <span className="index">{`#${idx}`}</span>
          </div>
        )}
      </Card>
      <Card className={classnames("action-row", { today: !!viewed })}>
        <div className="status-row">
          <div className="tags">
            {tags.map((tag) => (
              <Tag key={tag} color={tagsCodes[tag]}>
                {tag}
              </Tag>
            ))}
            {onlyTitleAndURL && <AntIcon type="link" onClick={goToLink} />}
          </div>

          <div className="fcc">
            <NoteMeta sourceInfo={sourceInfo} inPopup={true} />
            <Icon
              hover
              size={12}
              onClick={(e) => removeItem(e, item.tempId)}
              className="icon"
              type="delete"
            />
          </div>
        </div>
      </Card>
    </StyledNoteCard>
  );
};

const mapStateToProps = ({ uploadingData, activeCollectionId, settings }) => ({
  uploadingData,
  activeCollectionId,
  settings,
  tagsCodes: extractTagCodes(settings.tags),
});

const mapDispatchToProps = {
  setModalMeta,
  setUploadingData,
  addNote,
  setActiveCollection,
};

export default connect(mapStateToProps, mapDispatchToProps)(UploadContent);
