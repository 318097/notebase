import React from "react";
import { Icon as AntIcon, Checkbox, Popover } from "antd";
import moment from "moment";
import { Card, Icon, Tag } from "@codedrops/react-ui";
import _ from "lodash";
import classnames from "classnames";
// import Dropdown from "../lib/Dropdown";
import { md, getDomain } from "../../lib/utils";
import { StyledNoteCard } from "./styled";
import NoteMeta from "./NoteMeta";
import { toggleSelectedItems } from "../../store/actions";

const NoteCard = ({
  note,
  handleClick,
  onEdit,
  onDelete,
  tagsCodes,
  settings,
  selectedItems,
  dispatch,
}) => {
  const {
    title = "",
    content = "",
    type = "DROP",
    tags = [],
    _id,
    status,
    visible,
    index,
    liveId,
    url,
    createdAt,
    rating,
    chainedPosts = [],
    chainedItems = [],
    chainedTo = [],
    sourceInfo,
  } = note;

  // const [showDropdown, setShowDropdown] = useState(false);
  const onlyTitleAndURL = title && url && !content;
  const isCreatedToday = moment().isSame(moment(createdAt), "day");
  const createdTimeAgo = moment(createdAt).fromNow();
  const postStatus =
    status === "POSTED"
      ? `Live Id: ${liveId}`
      : status.replace("_", " ").toLowerCase();

  const isSelected = _.includes(selectedItems, _id);

  const cardClasses = classnames("card", {
    today: !!isCreatedToday,
    selected: !!isSelected,
  });

  const titleClasses = classnames("title", {
    "post-title": type !== "DROP",
  });

  const goToLink = () => window.open(url);

  return (
    <StyledNoteCard size={settings?.cardSize}>
      <Card onClick={(e) => handleClick(e, _id)} className={cardClasses}>
        <h3
          className={titleClasses}
          dangerouslySetInnerHTML={{ __html: md.renderInline(title) }}
        />
        {["DROP", "QUIZ"].includes(type) && content && (
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: md.render(content) }}
          ></div>
        )}
        {onlyTitleAndURL && <div>{getDomain(url)}</div>}

        {!!index && (
          <div className="index-wrapper">
            <span className="index">{`#${index}`}</span>
          </div>
        )}
        <span className="select-item">
          <Checkbox
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => dispatch(toggleSelectedItems({ _id }))}
          />
        </span>
        {/* <Dropdown
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          onEdit={() => onEdit(_id)}
          onDelete={() => onDelete(_id)}
        /> */}
      </Card>
      <Card className={classnames("action-row", { today: !!isCreatedToday })}>
        <div className="status-row">
          <div className="tags">
            {tags.map((tag) => (
              <Tag key={tag} color={tagsCodes[tag]}>
                {tag}
              </Tag>
            ))}
          </div>

          <Tag
            className="status-tag"
            color={status === "POSTED" ? "cdGreen" : "watermelon"}
          >
            {postStatus}
          </Tag>
        </div>

        <div className="status-row">
          <div className="flex center">
            {!!rating && (
              <Tag>
                {rating}
                <AntIcon
                  type="star"
                  style={{
                    fontSize: "12px",
                  }}
                />
              </Tag>
            )}

            {type === "CHAIN" ? (
              <Tag
                color={
                  chainedItems.length !== chainedPosts.length ? "red" : "steel"
                }
              >{`${chainedItems.length} posts`}</Tag>
            ) : !_.isEmpty(chainedTo) ? (
              <Tag>{`In ${chainedTo.length} chains`}</Tag>
            ) : null}

            {onlyTitleAndURL && (
              <Popover placement="bottomLeft" content={url}>
                <AntIcon type="link" onClick={goToLink} />
              </Popover>
            )}

            <NoteMeta sourceInfo={sourceInfo} inPopup={true} />
            {!visible && <AntIcon type="eye-invisible" />}

            {type === "DROP" ? (
              <Icon type="bulb" size={12} />
            ) : type === "CHAIN" ? (
              <AntIcon type="deployment-unit" size={12} />
            ) : null}
          </div>

          <Tag>{createdTimeAgo}</Tag>
        </div>
      </Card>
    </StyledNoteCard>
  );
};

export default NoteCard;
