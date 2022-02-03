import React, { useState, Fragment, useEffect } from "react";
import {
  Radio,
  Switch,
  Input,
  Rate,
  Select,
  Popover,
  Checkbox,
  Card,
  Empty,
  Drawer,
  Button,
} from "antd";
import axios from "axios";
import styled from "styled-components";
import { connect } from "react-redux";
import moment from "moment";
import _ from "lodash";
import colors, { Icon, Tag, EmptyState } from "@codedrops/react-ui";
import { saveSettings, setAppLoading, updateNote } from "../../store/actions";
import { copyToClipboard, generateFormData } from "../../lib/utils";
import short from "short-uuid";
import { STATUS_OPTIONS } from "../../constants";
import ImageCard from "../../lib/ImageCard";
import UploadButton from "../../lib/UploadButton";
import NoteMeta from "./NoteMeta";

const { TextArea } = Input;
const { Option } = Select;

const ControlsWrapper = styled.div`
  background: white;
  margin-bottom: 8px;
  width: 218px;
  padding: 14px 12px;
  border-radius: 4px;
  border: 1px solid ${colors.shade2};
  box-shadow: 3px 3px 3px ${colors.shade2};
  position: relative;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .hashtag {
    font-size: 1rem;
    font-family: Cascadia-SemiBold;
  }
  .name-id {
    background: ${colors.strokeThree};
    color: white;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    font-size: 1.2rem;
    margin: 0 4px 4px 0;
    cursor: pointer;
    transition: 0.4s;
    &:hover {
      background: ${colors.steel};
    }
  }
  .notes-container {
    padding: 8px 0px;
    .note {
      background: ${colors.feather};
      border-radius: 4px;
      padding: 8px;
      margin-bottom: 4px;
      overflow-wrap: break-word;
    }
  }
  .ant-radio-wrapper {
    font-size: 12px;
  }
  .chain-title {
    margin-bottom: 4px;
    span {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  &.social-platforms {
    position: relative;
    .blocker {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      opacity: 0.6;
      z-index: 1;
    }
  }
  .caption-modal-button {
    position: absolute;
    right: -50px;
    bottom: 21px;
    transform: rotate(-90deg);
    z-index: 10;
  }
`;

const Controls = ({
  note,
  view,
  chains = [],
  goToPost,
  socialPlatforms: socialPlatformsList = [],
  saveSettings,
  updateNote,
  setAppLoading,
}) => {
  const {
    tags = [],
    _id,
    liveId,
    createdAt,
    updatedAt,
    publishedAt,
    resources = [],
    fileNames = [],
    visible,
    status,
    rating,
    notes: personalNotes = [],
    type,
    chainedTo = [],
    socialPlatforms = [],
    directUpload = [],
    sourceInfo,
  } = note || {};
  const [liveIdEditor, setLiveIdEditor] = useState(false);
  const [showCaptionDrawer, setCaptionDrawerVisibility] = useState(false);
  const [showMediaDrawer, setMediaDrawer] = useState(false);
  const [editCaptionId, setEditCaptionId] = useState(null);
  const [suffix, setSuffix] = useState();
  const [personalNote, setPersonalNote] = useState("");
  const [files, setFiles] = useState({});
  const [blockSocialPlatforms, setBlockSocialPlatforms] = useState(true);
  const [uploadingStatus, setUploading] = useState(false);
  const [socialPlatformCaptionCheckAll, setSocialPlatformCaptionCheckAll] =
    React.useState();

  useEffect(() => {
    const allSocialHandlesSelected =
      socialPlatformsList &&
      socialPlatforms?.length === socialPlatformsList?.length;
    setSocialPlatformCaptionCheckAll(allSocialHandlesSelected);
  }, [note._id]);

  const updateProperties = async (update) =>
    await updateNote({ _id, liveId, ...update });

  const copy = (text) => {
    copyToClipboard(text);
  };

  const onCheckAllChange = ({ target: { checked } }) => {
    updateProperties({
      socialPlatforms: checked ? _.map(socialPlatformsList, "value") : [],
    });
    setSocialPlatformCaptionCheckAll(checked);
  };

  const handleAddPersonalNote = () => {
    const newNote = [
      ...personalNotes,
      { _id: short.generate(), content: personalNote },
    ];
    updateProperties({ notes: newNote });
    setTimeout(() => setPersonalNote(""));
  };

  const updateLiveId = (e) => {
    const { value: id } = e.target;
    if (!/^\d+$/.test(id)) return;
    updateProperties({ liveId: id });
    setLiveIdEditor(false);
  };

  const updateSuffix = (e) => {
    setSuffix(e.target.value);
  };

  const toggleChain = (value) =>
    updateProperties({ updatedChainedTo: value, chainedTo });

  const hashtags = tags.map((tag) => `#${tag}`).join(" ");

  const createdAtFormatted = moment(createdAt).format("DD MMM, YY");
  const updatedAtFormatted = moment(updatedAt).format("DD MMM, YY");

  const createdTimeAgo = moment(createdAt).fromNow();
  const updatedTimeAgo = moment(updatedAt).fromNow();

  const publishedOn = publishedAt
    ? moment(publishedAt).format("DD MMM, YY")
    : "-";
  const chainedPosts = chains.filter((chain) =>
    chain.chainedItems.includes(_id)
  );

  // const SocialStatus = (
  //   <ControlsWrapper>
  //     <div className="header">
  //       <h4>Social status</h4>
  //     </div>
  //     <Radio.Group
  //       onChange={({ target: { value } }) =>
  //         updateProperties({ socialStatus: value })
  //       }
  //       value={socialStatus}
  //     >
  //       {["NONE", "READY", "POSTED"].map((state) => (
  //         <Radio className="block" key={state} value={state}>
  //           {state}
  //         </Radio>
  //       ))}
  //     </Radio.Group>
  //   </ControlsWrapper>
  // );

  const uploadFiles = async () => {
    setUploading(true);
    try {
      const formData = generateFormData({
        type: "RESOURCES",
        storeExactFileName: "TRUE",
        files: files.sourceFiles,
      });

      const transactionResponse = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedData = {
        resources: [...resources],
        fileNames: [...fileNames],
      };

      _.forEach(_.get(transactionResponse, "data"), (upload) => {
        let resourceMatch = false;
        updatedData["resources"] = updatedData["resources"].map((item) => {
          if (item.label === upload.original_filename) {
            resourceMatch = true;
            return { ...item, media: upload };
          }
          return item;
        });

        if (!resourceMatch) {
          updatedData["fileNames"] = updatedData["fileNames"].map((item) =>
            item.label === upload.original_filename
              ? { ...item, media: upload }
              : item
          );
        }
      });

      updateProperties({
        ...updatedData,
        directUpload: [
          ...directUpload,
          ..._.get(transactionResponse, "data", []),
        ],
      });

      setFiles({});
    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  const Misc = (
    <ControlsWrapper>
      <div className="flex center">
        <h4 className="mr">Visible</h4>
        <Switch
          checked={visible}
          onChange={(value) => updateProperties({ visible: value })}
        />
      </div>
      <div className="divider"></div>

      <div className="flex center" style={{ alignItems: "baseline" }}>
        <h4 className="m-0 pr">Rating</h4>
        <Rate
          value={rating || 0}
          onChange={(value) => updateProperties({ rating: value })}
        />
      </div>
      <div className="divider"></div>

      <div className="header">
        <h4>Chained In</h4>
      </div>
      <Select
        mode="multiple"
        className="w-100"
        placeholder="Chains"
        value={chainedTo}
        onChange={toggleChain}
      >
        {chains.map(({ _id, title, status }) => (
          <Option key={_id} value={_id} disabled={status === "POSTED"}>
            {title}
          </Option>
        ))}
      </Select>
      {chainedTo && !!chainedTo.length && (
        <Fragment>
          <br />
          <br />
          <div className="header">
            <h4>Chains</h4>
          </div>
          <div>
            {chainedPosts.map((chain) => (
              <div key={chain.title} className="chain-title">
                &#9679;{" "}
                <span onClick={() => goToPost(chain._id, _id)}>
                  {chain.title}
                </span>
              </div>
            ))}
          </div>
        </Fragment>
      )}
    </ControlsWrapper>
  );

  const Notes = (
    <ControlsWrapper>
      <div className="header">
        <h4>Notes</h4>
        {personalNotes.length ? (
          <Tag>{`Total: ${personalNotes.length}`}</Tag>
        ) : null}
      </div>
      <div className="notes-container">
        <EmptyState input={personalNotes} size="sm">
          {personalNotes.map((note, index) => (
            <div key={note._id} className="note">
              {`${index + 1}. ${note.content}`}
            </div>
          ))}
        </EmptyState>
      </div>
      <div className="add-note-container">
        <TextArea
          rows={1}
          placeholder="Add Note.."
          value={personalNote}
          onChange={({ target: { value } }) => setPersonalNote(value)}
          onPressEnter={handleAddPersonalNote}
        />
      </div>
    </ControlsWrapper>
  );

  const PublishDates = (
    <ControlsWrapper>
      <div className="mb">
        Added:
        <span className="bold">{createdAtFormatted}</span>
        <br />
        <span>{createdTimeAgo}</span>
      </div>
      <div className="mb">
        Last Updated:
        <span className="bold">{updatedAtFormatted}</span>
        <br />
        <span>{updatedTimeAgo}</span>
      </div>
      {status === "POSTED" && (
        <div>
          Published: <span className="bold">{publishedOn}</span>
        </div>
      )}

      <NoteMeta sourceInfo={sourceInfo} />
    </ControlsWrapper>
  );

  const Naming = (
    <ControlsWrapper className="naming">
      <div className="header">
        <h4>Naming/Suffix</h4>
      </div>
      <div className="fcc mb-4">
        <Select
          allowClear
          size="small"
          style={{ width: "50%" }}
          className="mr"
          placeholder="Suffix Options"
          value={suffix}
          onChange={(value) => setSuffix(value)}
        >
          {socialPlatformsList.map(({ label, value }) => (
            <Option key={label} value={value}>
              {label}
            </Option>
          ))}
        </Select>

        <Input
          style={{ width: "50%" }}
          size="small"
          allowClear
          placeholder="Suffix"
          value={suffix}
          autoComplete={"off"}
          onChange={updateSuffix}
        />
      </div>

      <div className="header">
        <h4>Resources</h4>
        <Icon
          type="plus"
          hover
          size={10}
          onClick={() => updateNote({ ...note, suffix }, "CREATE_RESOURCE")}
        />
      </div>

      <EmptyState input={resources} size="sm">
        {resources.map((resource, index) => {
          const hasFile = _.get(resource, "media");

          const styles = hasFile ? { background: colors.green } : {};

          return (
            <Popover
              key={resource.label}
              placement="top"
              content={resource.label}
            >
              <div
                className="name-id"
                style={styles}
                onClick={() => (hasFile ? null : copy(resource.label))}
              >
                {index + 1}
              </div>
            </Popover>
          );
        })}
      </EmptyState>

      {!!liveId && (
        <Fragment>
          <div className="header">
            <h4>Files</h4>
            <Icon
              type="plus"
              hover
              size={10}
              onClick={() => updateNote({ ...note, suffix }, "CREATE_FILENAME")}
            />
          </div>

          <EmptyState input={fileNames} size="sm">
            {fileNames.map((item, index) => {
              const hasFile = _.get(item, "media");

              const styles = hasFile ? { background: colors.green } : {};
              return (
                <Popover
                  key={item.label}
                  placement="bottom"
                  content={item.label}
                >
                  <div
                    className="name-id"
                    style={styles}
                    onClick={() => copy(item.label)}
                  >
                    {index + 1}
                  </div>
                </Popover>
              );
            })}
          </EmptyState>
        </Fragment>
      )}

      <div className="divider" />

      <div className="flex center gap-8">
        <UploadButton
          accept={".png"}
          onFileRead={setFiles}
          customButton={({ openFileExplorer }) => {
            const status = _.get(files, "data.length") ? "selected" : "empty";
            return (
              <Button
                loading={uploadingStatus}
                size="small"
                onClick={status === "selected" ? uploadFiles : openFileExplorer}
              >
                {status === "selected"
                  ? `Upload ${_.get(files, "data.length", 0)} files`
                  : "Upload Files"}
              </Button>
            );
          }}
        />
        <Button size="small" onClick={() => setMediaDrawer(true)}>
          Media
        </Button>
      </div>

      {!!hashtags && (
        <Fragment>
          <div className="divider"></div>
          <div className="header">
            <h4>Hashtags</h4>
            <Icon type="copy" hover onClick={() => copyToClipboard(hashtags)} />
          </div>
          <div className="hashtag">{hashtags}</div>
        </Fragment>
      )}

      {!_.isEmpty(socialPlatformsList) && (
        <Button
          className="caption-modal-button"
          size="small"
          onClick={() => setCaptionDrawerVisibility(true)}
        >
          Caption
        </Button>
      )}
    </ControlsWrapper>
  );

  const SocialPlatforms = (
    <ControlsWrapper className="social-platforms">
      <div className="header">
        <h4>Social Platforms</h4>
        <Checkbox
          onChange={onCheckAllChange}
          checked={socialPlatformCaptionCheckAll}
        >
          All
        </Checkbox>
      </div>
      <Checkbox.Group
        onChange={(list) => {
          setSocialPlatformCaptionCheckAll(
            list.length === socialPlatforms.length
          );
          updateProperties({ socialPlatforms: list });
        }}
        value={socialPlatforms}
        options={socialPlatformsList}
      />
      {blockSocialPlatforms && (
        <div
          className="blocker"
          onDoubleClick={() => setBlockSocialPlatforms(false)}
        ></div>
      )}
    </ControlsWrapper>
  );

  const Status = (
    <ControlsWrapper>
      <div className="header">
        <h4>Status</h4>
        {liveId && (
          <Fragment>
            {liveIdEditor ? (
              <Input
                style={{ width: "30px", height: "18px", fontSize: "1rem" }}
                size="small"
                defaultValue={liveId}
                onBlur={updateLiveId}
              />
            ) : (
              <Tag
                color={colors.green}
                onDoubleClick={() => setLiveIdEditor(true)}
              >{`Live Id: ${liveId}`}</Tag>
            )}
          </Fragment>
        )}
      </div>
      <Radio.Group
        onChange={({ target: { value } }) =>
          updateProperties({ status: value })
        }
        value={status}
      >
        {STATUS_OPTIONS.map(({ label, value }) => (
          <Radio className="block status-tag" key={value} value={value}>
            {label.toLowerCase()}
          </Radio>
        ))}
      </Radio.Group>
    </ControlsWrapper>
  );

  const menuList = [
    // {
    //   view: "LEFT",
    //   visible: false,
    //   component: SocialStatus,
    //   id: "SocialStatus",
    // },
    {
      view: "LEFT",
      visible: type !== "CHAIN",
      component: Misc,
      id: "Misc",
    },
    {
      view: "LEFT",
      visible: true,
      component: Notes,
      id: "Notes",
    },
    {
      view: "LEFT",
      visible: true,
      component: PublishDates,
      id: "PublishDates",
    },
    {
      view: "RIGHT",
      visible: true,
      component: Naming,
      id: "Naming",
    },
    {
      view: "RIGHT",
      visible: !_.isEmpty(socialPlatformsList),
      component: SocialPlatforms,
      id: "SocialPlatforms",
    },
    {
      view: "RIGHT",
      visible: true,
      component: Status,
      id: "Status",
    },
  ];

  const ImagesModal = (
    <Drawer
      title={"Media"}
      width={600}
      closable={true}
      className="react-ui media-drawer"
      visible={showMediaDrawer}
      onClose={() => setMediaDrawer(false)}
    >
      <h5 className="mt mb">Files</h5>
      <div className="image-container">
        {fileNames
          .filter((item) => item.media)
          .map((item, i) => (
            <ImageCard key={i} {...item} />
          ))}
      </div>
      <h5 className="mb">Resources</h5>
      <div className="image-container">
        {resources
          .filter((item) => item.media)
          .map((item, i) => (
            <ImageCard key={i} {...item} />
          ))}
      </div>
    </Drawer>
  );

  const CaptionModal = (
    <Drawer
      title={"Social Plaform Captions"}
      width={400}
      closable={true}
      className="react-ui caption-drawer"
      visible={showCaptionDrawer}
      onClose={() => setCaptionDrawerVisibility(false)}
    >
      {_.isEmpty(socialPlatformsList) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="social-platform-caption-container">
          {_.map(socialPlatformsList, ({ value, label, caption }) => (
            <div key={value} className="social-caption-item-wrapper">
              {editCaptionId === value ? (
                <TextArea
                  rows={8}
                  defaultValue={caption}
                  onBlur={(e) => {
                    const updatedCaptions = _.map(socialPlatformsList, (item) =>
                      item.value === editCaptionId
                        ? { ...item, caption: e.target.value }
                        : item
                    );
                    saveSettings({
                      socialPlatforms: updatedCaptions,
                      _id: note.collectionId,
                    });
                    setEditCaptionId(null);
                  }}
                />
              ) : (
                <Card
                  size="small"
                  title={label}
                  key={value}
                  extra={
                    <Icon
                      type="edit"
                      hover
                      size={12}
                      onClick={() => setEditCaptionId(value)}
                    />
                  }
                >
                  {caption ? (
                    <p onClick={() => copyToClipboard(caption)}>{caption}</p>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );

  return (
    <div className={`controls ${view}`}>
      {menuList
        .filter((item) => item.view.toLowerCase() === view && item.visible)
        .map((item) => (
          <Fragment key={item.id}>{item.component}</Fragment>
        ))}
      {CaptionModal}
      {ImagesModal}
    </div>
  );
};

const mapStateToProps = ({ settings }) => ({
  ..._.pick(settings, ["socialPlatforms"]),
});

export default connect(mapStateToProps, {
  saveSettings,
  updateNote,
  setAppLoading,
})(Controls);
