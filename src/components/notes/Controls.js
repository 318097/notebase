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
  Modal,
  Empty,
} from "antd";
import styled from "styled-components";
import { connect } from "react-redux";
import moment from "moment";
import _ from "lodash";
import colors, { Icon, Tag } from "@codedrops/react-ui";
import { saveSettings, updateNote } from "../../store/actions";
import { copyToClipboard } from "../../utils";
import short from "short-uuid";
import { statusFilter } from "../../constants";
import EmptyState from "../EmptyState";

const { TextArea } = Input;
const { Option } = Select;

const ControlsWrapper = styled.div`
  background: white;
  margin-bottom: 8px;
  width: 218px;
  padding: 14px 12px;
  border-radius: 12px;
  border: 1px solid ${colors.shade2};
  box-shadow: 3px 3px 3px ${colors.shade2};
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
  .slug {
    background: ${colors.yellow};
    width: 100%;
    color: white;
    padding: 4px;
    border-radius: 2px;
    font-size: 0.9rem;
    transition: 0.4s;
    cursor: pointer;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover {
      background: ${colors.blue};
    }
  }
  .name-id {
    background: ${colors.strokeOne};
    border-radius: 50%;
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
      background: ${colors.strokeTwo};
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
  .resources-title {
    &:hover {
      cursor: pointer;
      text-decoration: underline;
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
`;

const Controls = ({
  note,
  view,
  chains = [],
  goToPost,
  socialPlatforms: socialPlatformsList = [],
  saveSettings,
  updateNote,
  session,
}) => {
  const {
    tags = [],
    _id,
    liveId,
    slug = "",
    index,
    createdAt,
    updatedAt,
    publishedAt,
    resources = [],
    fileNames = [],
    visible,
    status,
    socialStatus,
    rating,
    notes: personalNotes = [],
    type,
    chainedTo = [],
    socialPlatforms = [],
  } = note || {};
  const [liveIdEditor, setLiveIdEditor] = useState(false);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [editCaptionId, setEditCaptionId] = useState(null);
  const [suffix, setSuffix] = useState();
  const [personalNote, setPersonalNote] = useState("");
  const [blockSocialPlatforms, setBlockSocialPlatforms] = useState(true);
  const [
    socialPlatformCaptionCheckAll,
    setSocialPlatformCaptionCheckAll,
  ] = React.useState();

  useEffect(() => {
    const allSocialHandlesSelected =
      socialPlatformsList &&
      socialPlatforms?.length === socialPlatformsList?.length;
    setSocialPlatformCaptionCheckAll(allSocialHandlesSelected);
  }, [note._id]);

  const updateProperties = async (update) =>
    await updateNote({ _id, liveId, ...update });

  const copy = (text) => () => {
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
  // const rdySlug = `RDY${index}-${slug}${suffix ? `_${suffix}` : ""}`;
  const slugWithLiveId = `${liveId}-${slug}${suffix ? `_${suffix}` : ""}`;

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

  const SocialStatus = (
    <ControlsWrapper>
      <div className="header">
        <h4>Social status</h4>
      </div>
      <Radio.Group
        onChange={({ target: { value } }) =>
          updateProperties({ socialStatus: value })
        }
        value={socialStatus}
      >
        {["NONE", "READY", "POSTED"].map((state) => (
          <Radio className="block" key={state} value={state}>
            {state}
          </Radio>
        ))}
      </Radio.Group>
    </ControlsWrapper>
  );

  const Rating = (
    <ControlsWrapper>
      <h4>Rating</h4>
      <Rate
        value={rating || 0}
        onChange={(value) => updateProperties({ rating: value })}
      />
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
        <EmptyState input={personalNotes}>
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

  const Chain = (
    <ControlsWrapper>
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
        {statusFilter.map(({ label, value }) => (
          <Radio className="block" key={value} value={value}>
            {label}
          </Radio>
        ))}
      </Radio.Group>
    </ControlsWrapper>
  );

  const Naming = (
    <ControlsWrapper className="naming">
      <div className="header">
        <h4>Naming/Suffix</h4>
        {!_.isEmpty(socialPlatformsList) && (
          <Tag onClick={() => setShowCaptionModal(true)} color="nbPink">
            Caption
          </Tag>
        )}
      </div>
      <div className="fcc mb">
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
      {/* <Popover placement="top" content={rdySlug}>
        <div className="slug" onClick={copy(rdySlug)}>
          {rdySlug}
        </div>
      </Popover> */}

      <div className="divider"></div>
      <div className="header">
        <h4
          className="resources-title"
          onClick={() => setShowResourcesModal(true)}
        >
          Resources
        </h4>
        <Icon
          type="plus"
          hover
          size={10}
          onClick={() => updateNote({ ...note, suffix }, "CREATE_RESOURCE")}
        />
      </div>

      <EmptyState input={resources}>
        {resources.map((resource, index) => (
          <Popover
            key={resource.label}
            placement="bottom"
            content={resource.label}
          >
            <div className="name-id" onClick={copy(resource.label)}>
              {index + 1}
            </div>
          </Popover>
        ))}
      </EmptyState>

      {!!liveId && (
        <Fragment>
          <div className="header">
            <h4>File Names</h4>
            <Icon
              type="plus"
              hover
              size={10}
              onClick={() => updateNote({ ...note, suffix }, "CREATE_FILENAME")}
            />
          </div>

          <EmptyState input={fileNames}>
            {fileNames.map((item, index) => (
              <Popover key={item.label} placement="bottom" content={item.label}>
                <div className="name-id" onClick={copy(item.label)}>
                  {index + 1}
                </div>
              </Popover>
            ))}
          </EmptyState>
        </Fragment>
      )}

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

      <div className="divider"></div>
      <div className="flex center">
        <span className="mr">Visible</span>
        <Switch
          checked={visible}
          onChange={(value) => updateProperties({ visible: value })}
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
    </ControlsWrapper>
  );

  const menuList = [
    {
      view: "LEFT",
      visible: !_.isEmpty(socialPlatformsList),
      component: SocialPlatforms,
      id: "SocialPlatforms",
    },
    {
      view: "LEFT",
      visible: false,
      component: SocialStatus,
      id: "SocialStatus",
    },
    {
      view: "LEFT",
      visible: true,
      component: Rating,
      id: "Rating",
    },
    {
      view: "LEFT",
      visible: true,
      component: Notes,
      id: "Notes",
    },
    {
      view: "LEFT",
      visible: type !== "CHAIN",
      component: Chain,
      id: "Chain",
    },
    {
      view: "RIGHT",
      visible: true,
      component: Status,
      id: "Status",
    },
    {
      view: "RIGHT",
      visible: true,
      component: Naming,
      id: "Naming",
    },
    {
      view: "RIGHT",
      visible: true,
      component: PublishDates,
      id: "PublishDates",
    },
  ];

  const ResourcesModal = (
    <Modal
      title={"Resources"}
      centered={true}
      width={"50vw"}
      wrapClassName="react-ui resource-modal"
      visible={showResourcesModal}
      footer={null}
      onCancel={() => setShowResourcesModal(false)}
    >
      {resources.map((resource) => {
        const url = `https://res.cloudinary.com/codedropstech/image/upload/v1619358326/staging/notes_app/${session._id}/${resource}.png`;
        return (
          <Card className="resource-wrapper">
            <img src={url} />
          </Card>
        );
      })}
    </Modal>
  );

  const CaptionModal = (
    <Modal
      title={"Social Plaform Captions"}
      centered={true}
      width={"50vw"}
      wrapClassName="react-ui caption-modal"
      visible={showCaptionModal}
      footer={null}
      onCancel={() => setShowCaptionModal(false)}
    >
      {_.isEmpty(socialPlatformsList) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="social-platform-caption-container">
          {_.map(socialPlatformsList, ({ value, label, caption }) => (
            <div className="social-caption-item-wrapper">
              {editCaptionId === value ? (
                <TextArea
                  defaultValue={caption}
                  onBlur={(e) => {
                    const updatedCaptions = _.map(socialPlatformsList, (item) =>
                      item.value === editCaptionId
                        ? { ...item, caption: e.target.value }
                        : item
                    );
                    saveSettings({
                      data: { socialPlatforms: updatedCaptions },
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
    </Modal>
  );

  return (
    <div className={`controls ${view}`}>
      {menuList
        .filter((item) => item.view.toLowerCase() === view && item.visible)
        .map((item) => (
          <Fragment key={item.id}>{item.component}</Fragment>
        ))}
      {CaptionModal}
      {ResourcesModal}
    </div>
  );
};

const mapStateToProps = ({ settings, session }) => ({
  session,
  ..._.pick(settings, ["socialPlatforms"]),
});

export default connect(mapStateToProps, { saveSettings, updateNote })(Controls);
